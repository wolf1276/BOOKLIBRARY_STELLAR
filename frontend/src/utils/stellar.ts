// frontend/src/utils/stellar.ts
import { isConnected, getAddress, requestAccess } from "@stellar/freighter-api";

export async function invokeContract(method: string, args: any) {
  // Check connection
  const connection = await isConnected();
  if (!connection.isConnected) {
    throw new Error("Freighter wallet not connected");
  }

  // Get user address
  const acc = await getAddress();
  if (!acc.address) {
    await requestAccess();
  }

  // This is a stub for actual Soroban contract interaction
  // In a real dApp, you would use Stellar SDK to build, sign, and send a transaction
  console.log(`Invoking ${method} on Stellar Soroban with`, args);

  // For now, we'll fetch from our backend which acts as a bridge or just return mock data
  // to show the "integration logic" is in place as requested.
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const response = await fetch(`${API_BASE}/api/contract/invoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, args }),
    });
    const data = await response.json();
    return data.result;
  } catch (err) {
    console.error("Contract invocation failed:", err);
    throw err;
  }
}
