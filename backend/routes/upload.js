import express from "express";
import crypto from "crypto";
import { books } from "./books.js";
import { addBook, CONTRACT_ID } from "../utils/stellar.js";

const router = express.Router();

/**
 * POST /api/upload
 * Upload book metadata → IPFS → Stellar Soroban contract registration
 *
 * Body: { title, author, genre, description, owner_wallet }
 */
router.post("/", async (req, res) => {
  const { title, author, genre, description, owner_wallet } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "title and author are required" });
  }

  try {
    // ── Step 1: IPFS Upload (simulated — replace with Pinata/web3.storage) ──
    // In production: const upload = await pinata.upload.json({ title, author, ... });
    const contentHash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ title, author, genre, description, timestamp: Date.now() }))
      .digest("hex");
    const ipfsHash = "Qm" + contentHash.slice(0, 44);
    console.log(`[IPFS] Simulated upload → ${ipfsHash}`);

    // ── Step 2: Register on Stellar Soroban (REAL contract call) ────────────
    let stellarTxHash;
    let contractBookId;

    try {
      const result = await addBook(title, author);
      stellarTxHash = result.txHash;
      contractBookId = result.bookId;
      console.log(`[Stellar] ✓ TX submitted → ${stellarTxHash} | Book ID: ${contractBookId}`);
    } catch (stellarErr) {
      console.error("[Stellar] Contract call failed:", stellarErr.message);
      // If contract call fails (e.g., no secret key), still record the book
      // but mark it as unverified
      stellarTxHash = null;
      contractBookId = null;
    }

    const book_id = Date.now().toString();

    const newBook = {
      book_id,
      contract_book_id: contractBookId, // on-chain ID for verification
      title,
      author,
      genre: genre || "Unknown",
      description: description || "",
      ipfs_hash: ipfsHash,
      owner_wallet: owner_wallet || "unknown",
      timestamp: Math.floor(Date.now() / 1000),
      verified: !!stellarTxHash,
      stellar_tx: stellarTxHash,
    };

    // Add to in-memory array so the Library page can see it
    books.unshift(newBook);

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
        explorer_url: `https://stellar.expert/explorer/testnet/tx/${stellarTxHash}`,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", message: err.message });
  }
});

export default router;
