import express from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../index.js";
import { getBook, CONTRACT_ID, addBook } from "../utils/stellar.js";

const router = express.Router();

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

/**
 * GET /api/books
 * Fetch all books from database
 */
router.get("/", async (req, res) => {
  try {
    const query = bookQuerySchema.parse(req.query);
    let where = {};

    if (query.genre) where.genre = query.genre;
    if (query.verified === "true") where.verified = true;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { author: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const books = await prisma.book.findMany({ where });
    res.json({ count: books.length, books });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/books/:id
 * Fetch a single book by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/books/:id/verify
 * Verify a book's on-chain record by querying the Soroban contract
 */
router.get("/:id/verify", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) return res.status(404).json({ error: "Book not found" });

    let onChainBook = null;
    let isOnChain = false;

    // If the book has a contract_book_id, verify it on-chain
    if (book.contract_book_id) {
      onChainBook = await getBook(book.contract_book_id);
      if (onChainBook) {
        isOnChain = true;
        // Compare on-chain data with local data
        const titleMatch = onChainBook.title === book.title;
        const authorMatch = onChainBook.author === book.author;

        res.json({
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
        res.json({
          book_id: book.id,
          verified: false,
          error: "Book not found on-chain",
        });
      }
    } else {
      res.json({
        book_id: book.id,
        verified: false,
        message: "No contract_book_id assigned",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/books
 * Alias for /api/books/upload to match frontend expectations
 */
router.post("/", async (req, res) => {
  return await handleUpload(req, res);
});

/**
 * POST /api/books/upload
 * Upload book metadata → IPFS → Stellar Soroban contract registration
 *
 * Body: { title, author, genre, description, owner_wallet }
 */
const handleUpload = async (req, res) => {
  try {
    const body = req.body;
    const data = uploadSchema.parse(body);

    // ── Step 1: IPFS Upload (simulated — replace with Pinata/web3.storage) ──
    const contentHash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ ...data, timestamp: Date.now() }))
      .digest("hex");
    const ipfsHash = "Qm" + contentHash.slice(0, 44);

    // ── Step 2: Register on Stellar Soroban (REAL contract call) ────────────
    let stellarTxHash;
    let contractBookId;

    try {
      const result = await addBook(data.title, data.author);
      stellarTxHash = result.txHash;
      contractBookId = result.bookId;
    } catch (stellarErr) {
      console.error("[Stellar] Contract call failed:", stellarErr.message);
      stellarTxHash = null;
      contractBookId = null;
    }

    // ── Step 3: Save to database ───────────────────────────────────────────
    const newBook = await prisma.book.create({
      data: {
        contract_book_id: contractBookId,
        title: data.title,
        author: data.author,
        genre: data.genre,
        ipfs_hash: ipfsHash,
        owner_wallet: data.owner_wallet || "unknown",
        verified: !!stellarTxHash,
      },
    });

    res.status(201).json({
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
        explorer_url: stellarTxHash ? `https://stellar.expert/explorer/testnet/tx/${stellarTxHash}` : null,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", message: err.message });
  }
};

router.post("/upload", handleUpload);

export default router;
