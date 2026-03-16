import express from "express";
import cors from "cors";
import booksRouter from "./routes/books.js";
import uploadRouter from "./routes/upload.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────
app.use("/api/books",  booksRouter);
app.use("/api/upload", uploadRouter);

// ─── Health Check ─────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    name:    "BookLibrary Stellar API",
    version: "1.0.0",
    status:  "running",
    network: "Stellar Testnet",
    contract: "CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM",
    endpoints: [
      "GET  /api/books",
      "GET  /api/books/:id",
      "GET  /api/books/:id/verify",
      "POST /api/books/upload",
    ],
  });
});

// ─── 404 Handler ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ─── Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// ─── Start Server ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n📚 BookLibrary Stellar API`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔗 Network: Stellar Testnet`);
  console.log(`📋 Contract: CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM\n`);
});
