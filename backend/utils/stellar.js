// backend/utils/stellar.js
// Real Soroban smart contract integration using @stellar/stellar-sdk

import {
  Keypair,
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
  rpc as SorobanRpc,
} from "@stellar/stellar-sdk";

// ─── Configuration ─────────────────────────────────────────
export const CONTRACT_ID =
  process.env.CONTRACT_ID ||
  "CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM";

export const RPC_URL =
  process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;

const server = new SorobanRpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

// ─── Helper: get a funded keypair for server-side signing ──
function getServerKeypair() {
  const secret = process.env.STELLAR_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "STELLAR_SECRET_KEY environment variable is required for server-side contract calls"
    );
  }
  return Keypair.fromSecret(secret);
}

// ─── Helper: build, simulate, sign, and submit a transaction
async function buildAndSubmitTx(sourceKeypair, operation) {
  const account = await server.getAccount(sourceKeypair.publicKey());

  let tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // Simulate to get the correct footprint + fees
  const simulated = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(
      `Simulation failed: ${simulated.error}`
    );
  }

  // Assemble the transaction with the simulation results
  tx = SorobanRpc.assembleTransaction(tx, simulated).build();

  // Sign
  tx.sign(sourceKeypair);

  // Submit and wait
  const response = await server.sendTransaction(tx);
  if (response.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${JSON.stringify(response.errorResult)}`);
  }

  // Poll for result
  let result = await server.getTransaction(response.hash);
  while (result.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1500));
    result = await server.getTransaction(response.hash);
  }

  if (result.status === "FAILED") {
    throw new Error(`Transaction failed: ${JSON.stringify(result)}`);
  }

  return { txHash: response.hash, result };
}

// ─── Helper: simulate a read-only call (no signing needed) ─
async function simulateReadOnly(operation, sourcePublicKey) {
  // Use a dummy account for simulation if no source provided
  const pubKey = sourcePublicKey || getServerKeypair().publicKey();
  const account = await server.getAccount(pubKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  // Extract the return value
  if (simulated.result) {
    return scValToNative(simulated.result.retval);
  }

  return null;
}

// ─── Contract Methods ──────────────────────────────────────

/**
 * Add a book on-chain (server-side signed).
 * Calls the contract's `add_book(title: String, author: String) -> u32`
 *
 * @param {string} title
 * @param {string} author
 * @returns {{ txHash: string, bookId: number }}
 */
export async function addBook(title, author) {
  const keypair = getServerKeypair();

  const operation = contract.call(
    "add_book",
    nativeToScVal(keypair.publicKey(), { type: "address" }),
    nativeToScVal(title, { type: "string" }),
    nativeToScVal(author, { type: "string" })
  );

  const { txHash, result } = await buildAndSubmitTx(keypair, operation);

  // Extract the returned book ID (u32) from the result
  let bookId = null;
  if (result.returnValue) {
    bookId = scValToNative(result.returnValue);
  }

  return { txHash, bookId };
}

/**
 * Query a book from the contract (read-only simulation).
 * Calls `get_book(id: u32) -> Option<Book>`
 *
 * @param {number} id
 * @returns {Object|null} book data or null if not found
 */
export async function getBook(id) {
  const operation = contract.call(
    "get_book",
    nativeToScVal(id, { type: "u32" })
  );

  const result = await simulateReadOnly(operation);
  return result; // will be null for Option::None, or the Book struct
}

/**
 * Borrow a book on-chain (server-side signed).
 * Calls `borrow_book(borrower: Symbol, id: u32)`
 *
 * @param {string} borrowerSymbol - short symbol string (max 9 chars)
 * @param {number} id
 * @returns {{ txHash: string }}
 */
export async function borrowBook(borrowerSymbol, id) {
  const keypair = getServerKeypair();

  const operation = contract.call(
    "borrow_book",
    nativeToScVal(borrowerSymbol, { type: "symbol" }),
    nativeToScVal(id, { type: "u32" })
  );

  const { txHash } = await buildAndSubmitTx(keypair, operation);
  return { txHash };
}

/**
 * Return a book on-chain (server-side signed).
 * Calls `return_book(id: u32)`
 *
 * @param {number} id
 * @returns {{ txHash: string }}
 */
export async function returnBook(id) {
  const keypair = getServerKeypair();

  const operation = contract.call(
    "return_book",
    nativeToScVal(id, { type: "u32" })
  );

  const { txHash } = await buildAndSubmitTx(keypair, operation);
  return { txHash };
}

/**
 * Get recent events from the contract
 * @returns {Array} list of events
 */
export async function getEvents() {
  const events = await server.getEvents({
    startLedger: 1,
    filters: [
      {
        contractIds: [CONTRACT_ID],
        topics: [
          ["*", "book_add"],
          ["*", "book_brw"],
          ["*", "book_ret"],
        ],
      },
    ],
    limit: 10,
  });
  return events.events.map(event => ({
    event: event.topic[1].value().toString(),
    data: event.data,
  }));
}

/**
 * Prepare a transaction XDR for frontend signing (for Freighter).
 * Builds, simulates, but does NOT sign — returns XDR for the frontend.
 *
 * @param {string} publicKey - the user's Stellar public key
 * @param {string} method - contract method name
 * @param {Array} args - array of xdr.ScVal arguments
 * @returns {string} base64-encoded transaction XDR
 */
export async function prepareTransaction(publicKey, method, args) {
  const account = await server.getAccount(publicKey);

  const operation = contract.call(method, ...args);

  let tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  tx = SorobanRpc.assembleTransaction(tx, simulated).build();

  return tx.toXDR();
}
