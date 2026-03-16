import express from "express";
import crypto from "crypto";

const router = express.Router();

const CONTRACT_ID = "CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM";

/**
 * POST /api/upload
 * Upload book metadata → IPFS stub → Stellar contract registration stub
 *
 * Body: { title, author, genre, description, owner_wallet }
 */
router.post("/", async (req, res) => {
  const { title, author, genre, description, owner_wallet } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "title and author are required" });
  }

  try {
    // ── Step 1: Fake IPFS Upload ─────────────────────────────────────
    // In production: use Pinata or web3.storage SDK
    // const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT });
    // const upload = await pinata.upload.json({ title, author, ... });
    // const ipfs_hash = upload.IpfsHash;

    const ipfsHash = "Qm" + crypto.randomBytes(22).toString("hex").slice(0, 44);
    console.log(`[IPFS] Simulated upload → ${ipfsHash}`);

    // ── Step 2: Register on Stellar Soroban ─────────────────────────
    // In production: use stellar-sdk to call add_book on the contract
    // const server = new rpc.Server("https://soroban-testnet.stellar.org");
    // const contract = new Contract(CONTRACT_ID);
    // const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    //   .addOperation(contract.call("add_book", nativeToScVal(title, { type: "string" }), ...))
    //   .setTimeout(30).build();

    const stellarTxHash = crypto.randomBytes(32).toString("hex");
    console.log(`[Stellar] Simulated TX → ${stellarTxHash}`);

    const book_id = Date.now().toString();

    const newBook = {
      book_id,
      title,
      author,
      genre: genre || "Unknown",
      description: description || "",
      ipfs_hash: ipfsHash,
      owner_wallet: owner_wallet || "unknown",
      timestamp: Math.floor(Date.now() / 1000),
      verified: true,
      stellar_tx: stellarTxHash,
    };

    res.status(201).json({
      message: "Book uploaded and registered on-chain (testnet)",
      book: newBook,
      ipfs: {
        hash: ipfsHash,
        gateway_url: `https://ipfs.io/ipfs/${ipfsHash}`,
      },
      stellar: {
        tx_hash: stellarTxHash,
        contract: CONTRACT_ID,
        network: "Stellar Testnet",
        explorer_url: `https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", message: err.message });
  }
});

export default router;
