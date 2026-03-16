"use client";
import dynamic from "next/dynamic";
import AnimatedHero from "@/components/AnimatedHero";
import FloatingBookGrid from "@/components/FloatingBookGrid";
import BookCard, { Book } from "@/components/BookCard";
import WalletConnect from "@/components/WalletConnect";
import { motion } from "framer-motion";
import Link from "next/link";

// Heavy 3D component — client only
const ParticleBackground = dynamic(
  () => import("@/components/ParticleBackground"),
  { ssr: false }
);

const FEATURED_BOOKS: Book[] = [
  { id: "1", title: "The Midnight Library", author: "Matt Haig", genre: "Fiction", verified: true, ipfs_hash: "QmYwAPJzv5CZsnAzt8auV39s9sFpfFBTsDLi", owner_wallet: "GBYN...3PBJM" },
  { id: "2", title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", verified: true, ipfs_hash: "QmTaVxm4JiEt1VfVbbGAg7DpUq5ahXdHbGKt", owner_wallet: "GBYN...3PBJM" },
  { id: "3", title: "Neuromancer", author: "William Gibson", genre: "Cyberpunk", verified: false, ipfs_hash: "QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydH", owner_wallet: "GBYN...3PBJM" },
  { id: "4", title: "Foundation", author: "Isaac Asimov", genre: "Sci-Fi", verified: true, ipfs_hash: "QmRKs2ZfuwvmZA3QAWmCqrGUjV9tZR8nrhtzEZmjyB", owner_wallet: "GBYN...3PBJM" },
];

const FEATURES = [
  { icon: "🔗", title: "On-Chain Provenance", desc: "Every book is recorded on Stellar Soroban smart contracts. Immutable, verifiable, permanent.", color: "#FFE500" },
  { icon: "📡", title: "IPFS Storage", desc: "Book files are stored on IPFS with content-addressed hashes. Decentralized and censorship-resistant.", color: "#0047FF" },
  { icon: "🔐", title: "Wallet Verification", desc: "Connect your Stellar wallet to prove ownership and borrow rights on-chain.", color: "#FF2E00" },
  { icon: "⚡", title: "Instant Verification", desc: "Query the deployed Soroban contract in real time to verify any book's authenticity.", color: "#00E061" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-off-black">
      {/* 3D Particle Galaxy Background */}
      <ParticleBackground />

      {/* Hero Section */}
      <AnimatedHero />

      {/* ── Marquee Ticker ── */}
      <div className="relative z-10 overflow-hidden border-y-4 border-off-black bg-yellow py-3">
        <div className="marquee-track">
          {Array(10).fill("📚 BOOKLIBRARY STELLAR · ON-CHAIN BOOKS · STELLAR SOROBAN · IPFS STORAGE · DECENTRALIZED LIBRARY · ").map((text, i) => (
            <span
              key={i}
              className="px-6 text-sm font-black text-off-black uppercase tracking-widest whitespace-nowrap"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Floating Book Shelf ── */}
      <div className="relative z-10 bg-off-black">
        <FloatingBookGrid />
      </div>

      {/* ── Featured Books ── */}
      <section className="relative z-10 px-6 md:px-16 py-20 bg-off-black">
        <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
          <div>
            <div
              className="text-xs font-bold text-yellow mb-2 uppercase tracking-widest"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              ✦ Featured Collection
            </div>
            <h2
              className="text-4xl md:text-6xl font-black text-white uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
            >
              On-Chain Books
            </h2>
          </div>
          <Link href="/library" className="brut-btn brut-btn-yellow">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_BOOKS.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative z-10 px-6 md:px-16 py-20 bg-mid-gray border-y-4 border-off-black">
        <h2
          className="text-4xl md:text-5xl font-black text-white uppercase text-center mb-12"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Why BookLibrary Stellar?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -4 }}
              className="border-4 border-off-black p-6"
              style={{ background: f.color, boxShadow: "6px 6px 0px #0A0A0A" }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3
                className="text-xl font-black text-off-black uppercase mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm text-off-black/80 leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Wallet CTA ── */}
      <section className="relative z-10 px-6 md:px-16 py-24 bg-off-black text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block border-4 border-off-black bg-blue p-10 max-w-xl mx-auto"
          style={{ boxShadow: "12px 12px 0px #FFE500" }}
        >
          <h2
            className="text-3xl md:text-4xl font-black text-white uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Join the Library
          </h2>
          <p className="text-blue-100 mb-8 text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
            Connect your Stellar wallet to upload books, verify ownership, and participate in the decentralized library economy.
          </p>
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t-4 border-off-black bg-yellow px-6 md:px-16 py-8 flex flex-wrap justify-between items-center gap-4">
        <span
          className="text-2xl font-black text-off-black"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          📚 BOOKLIB·STELLAR
        </span>
        <div
          className="text-xs text-off-black font-bold"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          CONTRACT:{" "}
          <a
            href="https://lab.stellar.org/r/testnet/contract/CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            CBYNK3...SC3PBJM
          </a>
        </div>
        <div
          className="text-xs text-off-black"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          © 2026 BookLibrary Stellar. Built on Soroban.
        </div>
      </footer>
    </div>
  );
}
