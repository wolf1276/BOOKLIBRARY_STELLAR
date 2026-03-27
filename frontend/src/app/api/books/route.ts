// frontend/src/app/api/books/route.ts
// GET /api/books - Fetch all books
// POST /api/books - Upload new book (calls add_book on contract)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addBook, CONTRACT_ID } from "@/lib/stellar";
import { z } from "zod";
import crypto from "crypto";

// Validation schemas
const bookQuerySchema = z.object({
  genre: z.string().optional(),
  verified: z.string().optional(),
  search: z.string().optional(),
});

const uploadSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  genre: z.string().optional(),
  description: z.string().optional(),
  owner_wallet: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = bookQuerySchema.parse({
      genre: searchParams.get("genre") || undefined,
      verified: searchParams.get("verified") || undefined,
      search: searchParams.get("search") || undefined,
    });

    let where: any = {};

    if (query.genre) where.genre = query.genre;
    if (query.verified === "true") where.verified = true;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { author: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const books = await prisma.book.findMany({ where });
    return NextResponse.json({ count: books.length, books });
  } catch (err: any) {
    console.error("GET /api/books error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch books" },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = uploadSchema.parse(body);

    // ── Step 1: Generate IPFS hash (simulated) ──
    const contentHash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ ...data, timestamp: Date.now() }))
      .digest("hex");
    const ipfsHash = "Qm" + contentHash.slice(0, 44);

    // ── Step 2: Register on Stellar Soroban ──
    let stellarTxHash: string | null = null;
    let contractBookId: number | null = null;

    try {
      const result = await addBook(data.title, data.author);
      stellarTxHash = result.txHash;
      contractBookId = result.bookId;
    } catch (stellarErr: any) {
      console.error("[Stellar] Contract call failed:", stellarErr.message);
    }

    // ── Step 3: Save to database ──
    const newBook = await prisma.book.create({
      data: {
        contract_book_id: contractBookId,
        title: data.title,
        author: data.author,
        genre: data.genre || null,
        description: data.description || null,
        ipfs_hash: ipfsHash,
        owner_wallet: data.owner_wallet || "unknown",
        verified: !!stellarTxHash,
      },
    });

    return NextResponse.json(
      {
        message: stellarTxHash
          ? "Book uploaded and registered on-chain (testnet)"
          : "Book uploaded but on-chain registration failed — marked as unverified",
        book: newBook,
        ipfs: {
          hash: ipfsHash,
          gateway_url: `https://ipfs.io/ipfs/${ipfsHash}`,
        },
        stellar: {
          tx_hash: stellarTxHash,
          contract_book_id: contractBookId,
          contract: CONTRACT_ID,
          network: "Stellar Testnet",
          explorer_url: stellarTxHash
            ? `https://stellar.expert/explorer/testnet/tx/${stellarTxHash}`
            : null,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/books error:", err);
    return NextResponse.json(
      { error: "Upload failed", message: err.message },
      { status: 500 }
    );
  }
}
