// backend/routes/contract.js
import express from "express";
import { invokeContract } from "../utils/stellar.js"; // placeholder utility

const router = express.Router();

// POST /api/contract/invoke
router.post("/invoke", async (req, res) => {
  const { method, args } = req.body;
  try {
    const result = await invokeContract(method, args);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Contract invocation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
