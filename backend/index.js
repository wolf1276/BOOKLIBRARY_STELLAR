import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import winston from "winston";
import { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { startEventPolling } from "./utils/polling.js";
import booksRouter from "./routes/books.js";
import contractRouter from "./routes/contract.js";

const app = express();
const PORT = process.env.PORT || 4000;
const WS_PORT = process.env.WS_PORT || 4001;

if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL environment variable is required");
  process.exit(1);
}
if (!process.env.STELLAR_SECRET_KEY) {
  console.error("FATAL: STELLAR_SECRET_KEY environment variable is required");
  process.exit(1);
}
if (!process.env.CONTRACT_ID) {
  console.error("FATAL: CONTRACT_ID environment variable is required");
  process.exit(1);
}

let prisma;
try {
  prisma = new PrismaClient();
} catch (err) {
  console.error("PrismaClient initialization failed:", err);
  process.exit(1);
}

export { prisma };

// ─── Logging ──────────────────────────────────────
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

// ─── Rate Limiting ────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// ─── Middleware ────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000" }));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────
app.use("/api/books", booksRouter);
app.use("/api/contract", contractRouter);

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
  logger.error(err.stack);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// ─── Start Server ─────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n📚 BookLibrary Stellar API`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔗 Network: Stellar Testnet`);
  console.log(`📋 Contract: CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM\n`);
});

// ─── WebSocket Server ─────────────────────────────
const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", (ws) => {
  logger.info("New WebSocket connection");
  ws.on("message", (message) => {
    logger.info(`Received: ${message}`);
  });
  ws.send(JSON.stringify({ type: "welcome", message: "Connected to BookLibrary WS" }));
});

// ─── Start Event Polling ──────────────────────────
startEventPolling(wss);

export { wss };
