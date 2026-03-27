// frontend/src/app/api/contract/return/route.ts
// POST /api/contract/return - Return a book on-chain

import { NextRequest, NextResponse } from "next/server";
import { returnBook } from "@/lib/stellar";

export async function POST(request: NextRequest) {
  try {
    const { book_id } = await request.json();

    if (!book_id) {
      return NextResponse.json({ error: "book_id is required" }, { status: 400 });
    }

    const result = await returnBook(parseInt(book_id, 10));
    return NextResponse.json({
      success: true,
      message: `Book #${book_id} returned`,
      tx_hash: result.txHash,
      explorer_url: `https://stellar.expert/explorer/testnet/tx/${result.txHash}`,
    });
  } catch (err: any) {
    console.error("Return error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
