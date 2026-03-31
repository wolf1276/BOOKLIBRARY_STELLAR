// frontend/src/app/api/contract/book/[id]/route.ts
// GET /api/contract/book/:id - Query a book directly from the contract

import { NextResponse } from "next/server";
import { getBook, CONTRACT_ID } from "@/lib/stellar";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid book ID — must be a positive integer" },
        { status: 400 }
      );
    }

    const book = await getBook(id);
    if (!book) {
      return NextResponse.json(
        {
          error: "Book not found on contract",
          contract: CONTRACT_ID,
          queried_id: id,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contract: CONTRACT_ID,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        borrower: book.borrower || null,
      },
    });
  } catch (err: unknown) {
    console.error("Contract query error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 }
    );
  }
}
