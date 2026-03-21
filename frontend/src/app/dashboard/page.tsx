"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import BookCard, { Book } from "@/components/BookCard";
import VerificationBadge from "@/components/VerificationBadge";
import { useContractBooks } from "@/app/hooks/useContractBooks";

const CONTRACT_ID = "CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM";


export default function DashboardPage() {
  const { books, loading, error } = useContractBooks();

  const STATS = [
    { label: "Total Books",      value: books.length.toString(),  color: "#FFE500", icon: "📚" },
    { label: "Verified On-Chain",value: books.filter(b => b.verified).length.toString(),   color: "#00E061", icon: "✓" },
    { label: "Books Borrowed",   value: "2",   color: "#0047FF", icon: "🔖" },
    { label: "Your Uploads",     value: books.length > 0 ? "1" : "0",   color: "#FF2E00", icon: "📤" },
  ];

  const ACTIVITY = [
    { action: "Uploaded",  book: "Dune",                 time: "2h ago",  tx: "a3b8d1...e6f7", color: "#FFE500" },
    { action: "Borrowed",  book: "The Midnight Library", time: "1d ago",  tx: "b4c9e2...f7a8", color: "#0047FF" },
    { action: "Borrowed",  book: "Snow Crash",           time: "3d ago",  tx: "c5dae3...g8b9", color: "#0047FF" },
    { action: "Verified",  book: "Foundation",           time: "5d ago",  tx: "d6ebf4...h9c0", color: "#00E061" },
  ];

  return (
    <div className="min-h-screen bg-off-black pt-28 pb-20 px-6 md:px-16">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-6 mb-12">
        <div>
          <div className="text-xs font-bold text-yellow mb-3 uppercase tracking-widest" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            ✦ Your Account
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
        </div>
        <WalletConnect />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
            className="border-4 border-off-black p-6"
            style={{ background: stat.color, boxShadow: "6px 6px 0px #0A0A0A" }}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-4xl font-black text-off-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {stat.value}
            </div>
            <div className="text-xs font-bold text-off-black/70 uppercase mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Borrowed Books */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-white uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                📖 Currently Borrowed
              </h2>
              <Link href="/library" className="brut-btn brut-btn-yellow py-2 text-sm">Browse More</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading ? (
                <p className="text-white">Loading...</p>
              ) : books.length > 0 ? (
                books.slice(0, 2).map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))
              ) : (
                <p className="text-gray-400">No books borrowed yet.</p>
              )}
            </div>
          </section>

          {/* My Uploads */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-white uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                📤 My Uploads
              </h2>
              <Link href="/upload" className="brut-btn brut-btn-white py-2 text-sm">+ Upload</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading ? (
                <p className="text-white">Loading...</p>
              ) : books.length > 0 ? (
                books.map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))
              ) : (
                <p className="text-gray-400">No books uploaded yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contract Info */}
          <div className="border-4 border-off-black bg-mid-gray p-5" style={{ boxShadow: "6px 6px 0px #0A0A0A" }}>
            <h3 className="text-lg font-black text-white uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              🔗 Stellar Contract
            </h3>
            <VerificationBadge verified txHash={CONTRACT_ID} />
          </div>

          {/* Activity Feed */}
          <div className="border-4 border-off-black bg-mid-gray p-5" style={{ boxShadow: "6px 6px 0px #0A0A0A" }}>
            <h3 className="text-lg font-black text-white uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ⚡ Recent Activity
            </h3>
            <div className="space-y-3">
              {ACTIVITY.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 border-l-4 pl-3"
                  style={{ borderColor: item.color }}
                >
                  <div className="flex-1">
                    <p className="text-sm text-white font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span style={{ color: item.color }}>{item.action}</span> · {item.book}
                    </p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.tx}</span>
                      <span className="text-xs text-gray-600" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-4 border-off-black bg-yellow p-5" style={{ boxShadow: "6px 6px 0px #0A0A0A" }}>
            <h3 className="text-lg font-black text-off-black uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/upload" className="brut-btn brut-btn-black w-full justify-center text-sm">📤 Upload Book</Link>
              <Link href="/library" className="brut-btn brut-btn-white w-full justify-center text-sm">📚 Browse Library</Link>
              <a href={`https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`} target="_blank" rel="noopener noreferrer" className="brut-btn brut-btn-blue w-full justify-center text-sm">🔗 View Contract ↗</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
