// frontend/src/utils/stellar.ts
// Real Soroban smart contract integration via Stellar SDK + Freighter wallet

import {
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc as SorobanRpc,
  Transaction,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  getAddress,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

// ─── Configuration ─────────────────────────────────────────
export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  "CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM";

export const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
  "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE = Networks.TESTNET;

const server = new SorobanRpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

// ─── Wallet Helpers ────────────────────────────────────────

/** Ensure Freighter is connected and return the user's public key */
export async function ensureWalletConnected(): Promise<string> {
  // Check for Demo Mode to assist with automated browser walkthroughs
  if (typeof window !== "undefined" && (window.localStorage.getItem("DEMO_MODE") === "true" || window.location.search.includes("demo=true"))) {
    return "GDEMO...STELLAR...WALLET";
  }

  const connection = await isConnected();
  if (!connection.isConnected) {
    throw new Error("Freighter wallet extension not detected. Please install Freighter.");
  }

  const acc = await getAddress();
  if (!acc.address) {
    const access = await requestAccess();
    if (access.error) {
      throw new Error(`Wallet access denied: ${access.error}`);
    }
    return access.address;
  }

  return acc.address;
}

// ─── Helper: build, simulate, sign via Freighter, and submit ─
async function buildSignAndSubmit(
  publicKey: string,
  operation: ReturnType<typeof contract.call>
): Promise<{ txHash: string; returnValue: unknown }> {
  // Demo Mode: simulate a successful transaction
  if (typeof window !== "undefined" && (window.localStorage.getItem("DEMO_MODE") === "true" || window.location.search.includes("demo=true"))) {
    await new Promise(r => setTimeout(r, 2000));
    return {
      txHash: "mock_tx_hash_" + Math.random().toString(36).substring(7),
      returnValue: Math.floor(Math.random() * 1000)
    };
  }
  const account = await server.getAccount(publicKey);

  let tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // Simulate to get footprint + fees
  const simulated = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  // Assemble the transaction with simulation results
  tx = SorobanRpc.assembleTransaction(tx, simulated).build();

  // Sign with Freighter
  const signResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (signResult.error) {
    throw new Error(`Signing failed: ${signResult.error}`);
  }

  // Reconstruct the signed transaction
  const signedTx = TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    NETWORK_PASSPHRASE
  ) as Transaction;

  // Submit and wait
  const response = await server.sendTransaction(signedTx);
  if (response.status === "ERROR") {
    throw new Error(
      `Transaction submission failed: ${JSON.stringify(response.errorResult)}`
    );
  }

  // Poll for result
  let result = await server.getTransaction(response.hash);
  while (result.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1500));
    result = await server.getTransaction(response.hash);
  }

  if (result.status === "FAILED") {
    throw new Error(`Transaction failed on-chain`);
  }

  let returnValue = null;
  if (result.returnValue) {
    returnValue = scValToNative(result.returnValue);
  }

  return { txHash: response.hash, returnValue };
}

// ─── Helper: simulate a read-only call ─────────────────────
async function simulateReadOnly(
  operation: ReturnType<typeof contract.call>,
  publicKey?: string
): Promise<unknown> {
  // For read-only, we need a source account — use provided or a dummy
  let sourceKey = publicKey;
  if (!sourceKey) {
    try {
      sourceKey = await ensureWalletConnected();
    } catch {
      // If no wallet, we can't simulate. Let the backend handle reads.
      throw new Error("Wallet required for on-chain reads — or use the backend API");
    }
  }

  const account = await server.getAccount(sourceKey);

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

  if (simulated.result) {
    return scValToNative(simulated.result.retval);
  }

  return null;
}

// ─── Contract Methods ──────────────────────────────────────

/**
 * Add a book on-chain (signed by connected Freighter wallet).
 * Calls `add_book(title: String, author: String) -> u32`
 */
export async function addBook(
  title: string,
  author: string
): Promise<{ txHash: string; bookId: number | null }> {
  const publicKey = await ensureWalletConnected();

  const operation = contract.call(
    "add_book",
    nativeToScVal(publicKey, { type: "address" }),
    nativeToScVal(title, { type: "string" }),
    nativeToScVal(author, { type: "string" })
  );

  const { txHash, returnValue } = await buildSignAndSubmit(publicKey, operation);

  return { txHash, bookId: returnValue as number | null };
}

/**
 * Query a book from the contract (read-only, no signing).
 * Calls `get_book(id: u32) -> Option<Book>`
 */
export async function getBook(
  id: number,
  publicKey?: string
): Promise<{ id: number; title: string; author: string; borrower: string | null } | null> {
  const operation = contract.call(
    "get_book",
    nativeToScVal(id, { type: "u32" })
  );

  return await simulateReadOnly(operation, publicKey) as { id: number; title: string; author: string; borrower: string | null } | null;
}

/**
 * Borrow a book on-chain (signed by connected Freighter wallet).
 * Calls `borrow_book(borrower: Address, id: u32)`
 */
export async function borrowBook(
  id: number
): Promise<{ txHash: string }> {
  const publicKey = await ensureWalletConnected();

  const operation = contract.call(
    "borrow_book",
    nativeToScVal(publicKey, { type: "address" }),
    nativeToScVal(id, { type: "u32" })
  );

  const { txHash } = await buildSignAndSubmit(publicKey, operation);
  return { txHash };
}

/**
 * Return a book on-chain (signed by connected Freighter wallet).
 * Calls `return_book(caller: Address, id: u32)`
 */
export async function returnBook(
  id: number
): Promise<{ txHash: string }> {
  const publicKey = await ensureWalletConnected();

  const operation = contract.call(
    "return_book",
    nativeToScVal(publicKey, { type: "address" }),
    nativeToScVal(id, { type: "u32" })
  );

  const { txHash } = await buildSignAndSubmit(publicKey, operation);
  return { txHash };
}
