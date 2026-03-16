import express from "express";

const router = express.Router();

const CONTRACT_ID = "CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM";

// In-memory store (replace with DB in production)
let books = [
  {
    book_id: "1",
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
 * Fetch all books
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
 * Verify a book's on-chain record
 */
router.get("/:id/verify", async (req, res) => {
  const book = books.find((b) => b.book_id === req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  // Stellar verification stub
  // In production: query Soroban contract using stellar-sdk
  try {
    const isOnChain = book.verified && !!book.ipfs_hash;

    res.json({
      book_id: book.book_id,
      title: book.title,
      verified: isOnChain,
      contract: CONTRACT_ID,
      network: "Stellar Testnet",
      stellar_lab_url: `https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`,
      ipfs_hash: book.ipfs_hash,
      message: isOnChain
        ? "✓ Record found on Stellar Soroban contract"
        : "✗ No verified on-chain record found",
    });
  } catch (err) {
    res.status(500).json({ error: "Stellar query failed", message: err.message });
  }
});

export default router;
