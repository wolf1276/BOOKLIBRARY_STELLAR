// frontend/src/app/api/contract/prepare/route.ts
// POST /api/contract/prepare - Prepare transaction XDR for frontend signing

import { NextRequest, NextResponse } from "next/server";
import { prepareTransaction, NETWORK_PASSPHRASE } from "@/lib/stellar";
import { nativeToScVal } from "@stellar/stellar-sdk";

export async function POST(request: NextRequest) {
  try {
    const { publicKey, method, args } = await request.json();

    if (!publicKey || !method) {
      return NextResponse.json(
        { error: "publicKey and method are required" },
        { status: 400 }
      );
    }

    let scArgs = [];

    switch (method) {
      case "add_book":
        scArgs = [
          nativeToScVal(args.title, { type: "string" }),
          nativeToScVal(args.author, { type: "string" }),
        ];
        break;
      case "borrow_book":
        scArgs = [
          nativeToScVal(args.borrower, { type: "symbol" }),
          nativeToScVal(parseInt(args.book_id, 10), { type: "u32" }),
        ];
        break;
      case "return_book":
        scArgs = [nativeToScVal(parseInt(args.book_id, 10), { type: "u32" })];
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported method: ${method}` },
          { status: 400 }
        );
    }

    const xdr = await prepareTransaction(publicKey, method, scArgs);

    return NextResponse.json({
      success: true,
      xdr,
      network_passphrase: NETWORK_PASSPHRASE,
      message: `Transaction prepared for ${method} — sign with Freighter`,
    });
  } catch (err: any) {
    console.error("Prepare error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
