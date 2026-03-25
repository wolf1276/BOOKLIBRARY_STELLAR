import express from "express";
import { getBook, CONTRACT_ID } from "../utils/stellar.js";

const router = express.Router();

// In-memory store (replace with DB in production)
export const books = [
  {
    book_id: "1",
    contract_book_id: null,
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    ipfs_hash: "QmYwAPJzv5CZsnAzt8auV39s9sFpfFBTsDLi",
    owner_wallet: "GBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZOOOO3PBJM",
    timestamp: 1700000000,
    verified: true,
  },
  {
    book_id: "2",
    contract_book_id: null,
    title: "Dune",
    author: "Frank Herbert",
    genre: "Sci-Fi",
    ipfs_hash: "QmTaVxm4JiEt1VfVbbGAg7DpUq5ahXdHbGKt",
    owner_wallet: "GBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZOOOO3PBJM",
    timestamp: 1700100000,
    verified: true,
  },
  {
    book_id: "3",
    contract_book_id: null,
    title: "Neuromancer",
    author: "William Gibson",
    genre: "Cyberpunk",
    ipfs_hash: "QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydH",
    owner_wallet: "GCYN...1XYZ",
    timestamp: 1700200000,
    verified: false,
  },
];

/**
 * GET /api/books
 * Fetch all books (from in-memory store)
 */
router.get("/", (req, res) => {
  const { genre, verified, search } = req.query;
  let result = [...books];

  if (genre) result = result.filter((b) => b.genre?.toLowerCase() === genre.toLowerCase());
  if (verified === "true") result = result.filter((b) => b.verified);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }

  res.json({ count: result.length, books: result });
});

/**
 * GET /api/books/:id
 * Fetch a single book by ID
 */
router.get("/:id", (req, res) => {
  const book = books.find((b) => b.book_id === req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

/**
 * GET /api/books/:id/verify
 * Verify a book's on-chain record by querying the Soroban contract
 */
router.get("/:id/verify", async (req, res) => {
  const book = books.find((b) => b.book_id === req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  try {
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
          book_id: book.book_id,
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
          stellar_tx: book.stellar_tx || null,
          stellar_explorer_url: book.stellar_tx
            ? `https://stellar.expert/explorer/testnet/tx/${book.stellar_tx}`
            : null,
          ipfs_hash: book.ipfs_hash,
          message: "✓ Record verified on Stellar Soroban contract",
        });
        return;
      }
    }

    // No on-chain record found
    res.json({
      book_id: book.book_id,
      title: book.title,
      verified: false,
      on_chain_data: null,
      contract: CONTRACT_ID,
      network: "Stellar Testnet",
      stellar_tx: book.stellar_tx || null,
      ipfs_hash: book.ipfs_hash,
      message: "✗ No verified on-chain record found",
    });
  } catch (err) {
    console.error("Stellar verification error:", err.message);
    res.status(500).json({
      error: "Stellar verification failed",
      message: err.message,
      book_id: book.book_id,
      verified: false,
    });
  }
});

export default router;
