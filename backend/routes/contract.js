import express from "express";
import {
  getBook,
  borrowBook,
  returnBook,
  prepareTransaction,
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
  RPC_URL,
} from "../utils/stellar.js";
import { nativeToScVal } from "@stellar/stellar-sdk";

const router = express.Router();

/**
 * GET /api/contract/info
 * Return contract metadata
 */
router.get("/info", (req, res) => {
  res.json({
    contract_id: CONTRACT_ID,
    network: "Stellar Testnet",
    network_passphrase: NETWORK_PASSPHRASE,
    rpc_url: RPC_URL,
    methods: ["add_book", "get_book", "borrow_book", "return_book"],
  });
});

/**
 * GET /api/contract/book/:id
 * Query a book directly from the on-chain contract
 */
router.get("/book/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: "Invalid book ID — must be a positive integer" });
  }

  try {
    const book = await getBook(id);
    if (!book) {
      return res.status(404).json({
        error: "Book not found on contract",
        contract: CONTRACT_ID,
        queried_id: id,
      });
    }

    res.json({
      success: true,
      contract: CONTRACT_ID,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        borrower: book.borrower || null,
      },
    });
  } catch (err) {
    console.error("Contract query error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/contract/borrow
 * Borrow a book on-chain (server-side signed)
 * Body: { book_id: number, borrower: string }
 */
router.post("/borrow", async (req, res) => {
  const { book_id, borrower } = req.body;

  if (!book_id || !borrower) {
    return res.status(400).json({ error: "book_id and borrower are required" });
  }

  // Borrower symbol must be max 9 chars for Soroban symbol_short!
  if (borrower.length > 9) {
    return res.status(400).json({
      error: "borrower must be 9 characters or fewer (Soroban Symbol limit)",
    });
  }

  try {
    const result = await borrowBook(borrower, parseInt(book_id, 10));
    res.json({
      success: true,
      message: `Book #${book_id} borrowed by "${borrower}"`,
      tx_hash: result.txHash,
      explorer_url: `https://stellar.expert/explorer/testnet/tx/${result.txHash}`,
    });
  } catch (err) {
    console.error("Borrow error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/contract/return
 * Return a book on-chain (server-side signed)
 * Body: { book_id: number }
 */
router.post("/return", async (req, res) => {
  const { book_id } = req.body;

  if (!book_id) {
    return res.status(400).json({ error: "book_id is required" });
  }

  try {
    const result = await returnBook(parseInt(book_id, 10));
    res.json({
      success: true,
      message: `Book #${book_id} returned`,
      tx_hash: result.txHash,
      explorer_url: `https://stellar.expert/explorer/testnet/tx/${result.txHash}`,
    });
  } catch (err) {
    console.error("Return error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/contract/prepare
 * Prepare a transaction XDR for frontend signing via Freighter.
 * Body: { publicKey: string, method: string, args: object }
 *
 * Supported methods: add_book, borrow_book, return_book
 */
router.post("/prepare", async (req, res) => {
  const { publicKey, method, args } = req.body;

  if (!publicKey || !method) {
    return res.status(400).json({ error: "publicKey and method are required" });
  }

  try {
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
        scArgs = [
          nativeToScVal(parseInt(args.book_id, 10), { type: "u32" }),
        ];
        break;
      default:
        return res.status(400).json({ error: `Unsupported method: ${method}` });
    }

    const xdr = await prepareTransaction(publicKey, method, scArgs);

    res.json({
      success: true,
      xdr,
      network_passphrase: NETWORK_PASSPHRASE,
      message: `Transaction prepared for ${method} — sign with Freighter`,
    });
  } catch (err) {
    console.error("Prepare error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/contract/invoke  (legacy endpoint — general-purpose)
 * Now proxies to the appropriate real method
 * Body: { method: string, args: object }
 */
router.post("/invoke", async (req, res) => {
  const { method, args } = req.body;

  try {
    let result;

    switch (method) {
      case "get_book":
        result = await getBook(parseInt(args.id, 10));
        break;
      case "borrow_book":
        result = await borrowBook(args.borrower, parseInt(args.book_id, 10));
        break;
      case "return_book":
        result = await returnBook(parseInt(args.book_id, 10));
        break;
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown method: ${method}. Available: get_book, borrow_book, return_book`,
        });
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error("Contract invocation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
