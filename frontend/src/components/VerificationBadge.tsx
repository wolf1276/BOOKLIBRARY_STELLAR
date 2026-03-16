"use client";
import { motion } from "framer-motion";

interface VerificationBadgeProps {
  verified: boolean;
  txHash?: string;
  compact?: boolean;
}

export default function VerificationBadge({
  verified,
  txHash,
  compact = false,
}: VerificationBadgeProps) {
  if (compact) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-1 text-xs font-bold uppercase px-2 py-0.5 border-2 border-off-black ${
          verified
            ? "bg-green text-off-black"
            : "bg-gray-200 text-gray-500"
        }`}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {verified ? "✓ Verified" : "✗ Unverified"}
      </motion.span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-4 border-off-black p-4 ${
        verified ? "bg-green" : "bg-gray-100"
      }`}
      style={{ boxShadow: "6px 6px 0px #0A0A0A" }}
    >
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          animate={verified ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl"
        >
          {verified ? "🔗" : "❓"}
        </motion.div>
        <div>
          <div
            className="text-lg font-black text-off-black uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {verified ? "On-Chain Verified" : "Not Verified"}
          </div>
          <div
            className="text-xs text-off-black opacity-70"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {verified ? "Stellar Soroban Contract" : "No blockchain record found"}
          </div>
        </div>
      </div>

      {verified && txHash && (
        <div
          className="border-t-2 border-off-black pt-2 mt-2 text-xs text-off-black opacity-80 break-all"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Contract:{" "}
          <a
            href={`https://lab.stellar.org/r/testnet/contract/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold hover:opacity-70"
          >
            {txHash.slice(0, 20)}...
          </a>
        </div>
      )}
    </motion.div>
  );
}
