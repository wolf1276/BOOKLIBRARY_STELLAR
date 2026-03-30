// frontend/src/app/api/books/[id]/route.ts
// GET /api/books/:id - Fetch single book
// GET /api/books/:id?verify=true - Verify book on-chain

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBook, CONTRACT_ID } from "@/lib/stellar";
// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
interface Params {
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if verify flag is set
    const shouldVerify = request.nextUrl.searchParams.get("verify") === "true";
    if (!shouldVerify) {
      return NextResponse.json(book);
    }

    // ── Verification Mode ──
    let onChainBook = null;
    let isOnChain = false;

    if (book.contract_book_id) {
      try {
        onChainBook = await getBook(book.contract_book_id);
        if (onChainBook) {
          isOnChain = true;
          const titleMatch = onChainBook.title === book.title;
          const authorMatch = onChainBook.author === book.author;

          // ── SYNC: Update database to reflect verified status ──
          if (!book.verified && isOnChain) {
            await prisma.book.update({
              where: { id: book.id },
              data: { verified: true }
            });
          }

          return NextResponse.json({
            book_id: book.id,
            contract_book_id: book.contract_book_id,
            title: book.title,
            verified: isOnChain,
            on_chain_data: {
              title: onChainBook.title,
              author: onChainBook.author,
              borrower: onChainBook.borrower || null,
              title_match: titleMatch,
              author_match: authorMatch,
            },
            contract: CONTRACT_ID,
            network: "Stellar Testnet",
          });
        } else {
          return NextResponse.json({
            book_id: book.id,
            verified: false,
            error: "Book not found on-chain",
          });
        }
      } catch (err: any) {
        console.error("Contract query error:", err);
        return NextResponse.json({
          book_id: book.id,
          verified: false,
          error: err.message,
        });
      }
    } else {
      return NextResponse.json({
        book_id: book.id,
        verified: false,
        message: "No contract_book_id assigned",
      });
    }
  } catch (err: any) {
    console.error("GET /api/books/:id error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch book" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { verified, contract_book_id } = body;

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        verified: verified ?? true,
        contract_book_id: contract_book_id,
      },
    });

    return NextResponse.json(updatedBook);
  } catch (err: any) {
    console.error("PATCH /api/books/:id error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update book" },
      { status: 500 }
    );
  }
}
