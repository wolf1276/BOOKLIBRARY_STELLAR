// frontend/src/lib/stellar.ts
// Soroban smart contract integration for Vercel serverless functions
// Adapted from backend utils

import {
  Keypair,
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc as SorobanRpc,
} from "@stellar/stellar-sdk";

// ─── Configuration ─────────────────────────────────────────
export const CONTRACT_ID =
  process.env.CONTRACT_ID || "CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM";

export const RPC_URL =
  process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE = Networks.TESTNET;

const server = new SorobanRpc.Server(RPC_URL);

// Use a getter for lazy initialization
function getContract() {
  return new Contract(CONTRACT_ID);
}

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

// ─── Helper: build, simulate, sign, and submit a transaction ─
async function buildAndSubmitTx(sourceKeypair: Keypair, operation: any) {
  const account = await server.getAccount(sourceKeypair.publicKey());

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
  tx.sign(sourceKeypair);

  const response = await server.sendTransaction(tx);
  if (response.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${JSON.stringify(response.errorResult)}`);
  }

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
async function simulateReadOnly(operation: any, sourcePublicKey?: string) {
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

  if (simulated.result) {
    return scValToNative(simulated.result.retval);
  }

  return null;
}

// ─── Contract Methods ──────────────────────────────────────

export async function addBook(title: string, author: string) {
  const keypair = getServerKeypair();
  const operation = getContract().call(
    "add_book",
    nativeToScVal(keypair.publicKey(), { type: "address" }),
    nativeToScVal(title, { type: "string" }),
    nativeToScVal(author, { type: "string" })
  );

  const { txHash, result } = await buildAndSubmitTx(keypair, operation);
  let bookId = null;
  if (result.returnValue) {
    bookId = scValToNative(result.returnValue);
  }

  return { txHash, bookId };
}

export async function getBook(id: number) {
  const operation = getContract().call("get_book", nativeToScVal(id, { type: "u32" }));
  const result = await simulateReadOnly(operation);
  return result;
}

export async function borrowBook(id: number) {
  const keypair = getServerKeypair();
  const operation = getContract().call(
    "borrow_book",
    nativeToScVal(keypair.publicKey(), { type: "address" }),
    nativeToScVal(id, { type: "u32" })
  );

  const { txHash } = await buildAndSubmitTx(keypair, operation);
  return { txHash };
}

export async function returnBook(id: number) {
  const keypair = getServerKeypair();
  const operation = getContract().call(
    "return_book",
    nativeToScVal(keypair.publicKey(), { type: "address" }),
    nativeToScVal(id, { type: "u32" })
  );

  const { txHash } = await buildAndSubmitTx(keypair, operation);
  return { txHash };
}

export async function prepareTransaction(publicKey: string, method: string, args: any[]) {
  const account = await server.getAccount(publicKey);
  const operation = getContract().call(method, ...args);

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
