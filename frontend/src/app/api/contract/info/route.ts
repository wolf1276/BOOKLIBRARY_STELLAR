// frontend/src/app/api/contract/info/route.ts
// GET /api/contract/info - Return contract metadata

import { NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from "@/lib/stellar";

export async function GET() {
  return NextResponse.json({
    contract_id: CONTRACT_ID,
    network: "Stellar Testnet",
    network_passphrase: NETWORK_PASSPHRASE,
    rpc_url: RPC_URL,
    methods: ["add_book", "get_book", "borrow_book", "return_book"],
  });
}
