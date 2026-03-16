"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import UploadModal from "@/components/UploadModal";
import WalletConnect from "@/components/WalletConnect";

export default function UploadPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-off-black pt-28 pb-20 px-6 md:px-16">
      {/* Header */}
      <div className="mb-14">
        <div className="text-xs font-bold text-yellow mb-3 uppercase tracking-widest" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          ✦ Contribute to the Library
        </div>
        <h1
          className="text-5xl md:text-7xl font-black text-white uppercase mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
        >
          Upload a Book
        </h1>
        <p className="text-gray-400 text-lg max-w-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
          Upload your book to IPFS and register it on the Stellar Soroban blockchain. Your contribution is permanent and verifiable.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="border-4 border-off-black bg-yellow p-8"
          style={{ boxShadow: "10px 10px 0px #0A0A0A" }}
        >
          <div className="text-6xl mb-6">📤</div>
          <h2 className="text-3xl font-black text-off-black uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Upload & Register
          </h2>
          <p className="text-off-black/80 mb-8 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Your book file is uploaded to IPFS and its content hash is stored on the Stellar blockchain via our deployed Soroban smart contract.
          </p>

          <div className="space-y-3 mb-8">
            {[
              ["1", "Choose your book file (PDF or EPUB)"],
              ["2", "Fill in metadata: title, author, genre"],
              ["3", "File uploaded to IPFS → content hash generated"],
              ["4", "Hash stored on Stellar Soroban contract"],
            ].map(([num, text]) => (
              <div key={num} className="flex items-start gap-3">
                <span className="w-8 h-8 bg-off-black text-yellow flex items-center justify-center text-sm font-black border-2 border-off-black shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {num}
                </span>
                <span className="text-off-black text-sm font-medium mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="brut-btn brut-btn-black w-full justify-center text-lg"
          >
            📚 Upload Book →
          </button>
        </motion.div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Wallet Connect section */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="border-4 border-off-black bg-blue p-6"
            style={{ boxShadow: "8px 8px 0px #0A0A0A" }}
          >
            <h3 className="text-xl font-black text-white uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              🔗 Connect Wallet First
            </h3>
            <p className="text-blue-100 text-sm mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
              A Stellar wallet is required to sign the on-chain transaction.
            </p>
            <WalletConnect />
          </motion.div>

          {/* Contract Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="border-4 border-off-black bg-mid-gray p-6"
            style={{ boxShadow: "8px 8px 0px #0A0A0A" }}
          >
            <h3 className="text-xl font-black text-white uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              📋 Contract Details
            </h3>
            <div className="space-y-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {[
                { label: "Network", value: "Stellar Testnet" },
                { label: "Contract", value: "CBYNK3...SC3PBJM" },
                { label: "Storage", value: "IPFS (Pinata)" },
                { label: "Gas", value: "~0.001 XLM" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm border-b border-gray-700 pb-2">
                  <span className="text-gray-400 uppercase">{label}</span>
                  <span className="text-white font-bold">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
            className="border-4 border-red bg-red/10 p-4"
          >
            <p className="text-red text-xs font-bold uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              ⚠️ Uploads are permanent. Once stored on IPFS and the blockchain, the record cannot be deleted. Make sure you have the right to share the book.
            </p>
          </motion.div>
        </div>
      </div>

      <UploadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
