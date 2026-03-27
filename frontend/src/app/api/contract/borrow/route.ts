// frontend/src/app/api/contract/borrow/route.ts
// POST /api/contract/borrow - Borrow a book on-chain

import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

import { borrowBook } from "@/lib/stellar";

export async function POST(request: NextRequest) {
  try {
    const { book_id, borrower } = await request.json();

    if (!book_id || !borrower) {
      return NextResponse.json(
        { error: "book_id and borrower are required" },
        { status: 400 }
      );
    }

    if (borrower.length > 9) {
      return NextResponse.json(
        {
          error: "borrower must be 9 characters or fewer (Soroban Symbol limit)",
        },
        { status: 400 }
      );
    }

    const result = await borrowBook(borrower, parseInt(book_id, 10));
    return NextResponse.json({
      success: true,
      message: `Book #${book_id} borrowed by "${borrower}"`,
      tx_hash: result.txHash,
      explorer_url: `https://stellar.expert/explorer/testnet/tx/${result.txHash}`,
    });
  } catch (err: any) {
    console.error("Borrow error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
