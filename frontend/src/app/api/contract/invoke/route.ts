// frontend/src/app/api/contract/invoke/route.ts
// POST /api/contract/invoke - General-purpose contract invocation

import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

import { getBook, borrowBook, returnBook } from "@/lib/stellar";

export async function POST(request: NextRequest) {
  try {
    const { method, args } = await request.json();

    if (!method || !args) {
      return NextResponse.json(
        { error: "method and args are required" },
        { status: 400 }
      );
    }

    let result;

    switch (method) {
      case "get_book":
        result = await getBook(parseInt(args.id, 10));
        break;
      case "borrow_book":
        result = await borrowBook(parseInt(args.book_id, 10));
        break;
      case "return_book":
        result = await returnBook(parseInt(args.book_id, 10));
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported method: ${method}. Available: get_book, borrow_book, return_book`,
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      method,
      result,
    });
  } catch (err: unknown) {
    console.error("Invoke error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 }
    );
  }
}
