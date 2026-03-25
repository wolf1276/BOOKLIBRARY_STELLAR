import express from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../index.js";
import { addBook, CONTRACT_ID } from "../utils/stellar.js";

const router = express.Router();

// Validation schema
const uploadSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  genre: z.string().optional(),
  description: z.string().optional(),
  owner_wallet: z.string().optional(),
});

/**
 * POST /api/upload
 * Upload book metadata → IPFS → Stellar Soroban contract registration
 *
 * Body: { title, author, genre, description, owner_wallet }
 */
router.post("/", async (req, res) => {
  try {
    const data = uploadSchema.parse(req.body);

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
});

export default router;
