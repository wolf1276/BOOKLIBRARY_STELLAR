"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import BookCard from "@/components/BookCard";
import { useContractBooks } from "@/app/hooks/useContractBooks";

// Removed static ALL_BOOKS array
// We will fetch from the backend instead.

const GENRES = ["All", "Sci-Fi", "Fiction", "Cyberpunk", "Fantasy", "Dystopia"];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [onlyVerified, setOnlyVerified] = useState(false);
  
  const { books, loading, refetch } = useContractBooks();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync/all", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      console.log("Sync complete:", data);
      await refetch();
      alert(`Sync Complete!\n\nBlockchain records: ${data.details.total_on_chain}\nVerified in DB: ${data.details.matches_found}`);
    } catch (err) {
      console.error("Sync error:", err);
      alert("Blockchain synchronization failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase());
      const matchGenre = genre === "All" || b.genre === genre;
      const matchVerified = !onlyVerified || b.verified;
      return matchSearch && matchGenre && matchVerified;
    });
  }, [search, genre, onlyVerified, books]);

  return (
    <div className="min-h-screen bg-off-black pt-28 pb-20 px-6 md:px-16">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div
            className="text-xs font-bold text-yellow mb-3 uppercase tracking-widest"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            ✦ Browse Collection
          </div>
          <h1
            className="text-5xl md:text-7xl font-black text-white uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            The Library
          </h1>
          <p className="text-gray-400 text-lg max-w-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            {books.length} books · {books.filter((b) => b.verified).length} on-chain verified
          </p>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSyncAll}
          disabled={loading || isSyncing}
          className={`brut-btn ${isSyncing ? "bg-gray-400" : "brut-btn-yellow"} flex items-center gap-2 text-sm`}
        >
          {isSyncing ? (
            <span className="w-4 h-4 border-2 border-off-black border-t-white animate-spin rounded-full" />
          ) : (
            "🔄"
          )}
          {isSyncing ? "Syncing..." : "Sync On-Chain"}
        </button>
      </div>

      {/* Filters */}
      <div className="border-4 border-off-black bg-mid-gray p-5 mb-8 flex flex-wrap gap-4 items-center" style={{ boxShadow: "6px 6px 0px #0A0A0A" }}>
        {/* Search */}
        <div className="flex-1 min-w-52">
          <input
            type="text"
            placeholder="Search title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-4 border-off-black bg-white px-4 py-3 text-off-black focus:outline-none focus:border-yellow"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        {/* Genre Filter */}
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-4 py-2 text-sm font-bold border-4 border-off-black uppercase transition-all ${
                genre === g
                  ? "bg-yellow text-off-black shadow-brut-sm translate-x-[2px] translate-y-[2px]"
                  : "bg-white text-off-black hover:bg-yellow/50"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Verified Toggle */}
        <button
          onClick={() => setOnlyVerified(!onlyVerified)}
          className={`flex items-center gap-2 px-4 py-3 border-4 border-off-black font-bold text-sm uppercase transition-all ${
            onlyVerified ? "bg-green text-off-black" : "bg-white text-off-black"
          }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif", boxShadow: "4px 4px 0px #0A0A0A" }}
        >
          <span className={`w-4 h-4 border-2 border-off-black flex items-center justify-center text-xs ${onlyVerified ? "bg-off-black text-white" : ""}`}>
            {onlyVerified && "✓"}
          </span>
          On-Chain Only
        </button>
      </div>

      {/* Results */}
      <div className="text-xs text-gray-500 mb-6" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        Showing {filtered.length} of {books.length} books
      </div>

      {loading ? (
        <div className="text-center py-20 text-yellow text-2xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          LOADING BOOKS...
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-4 border-off-black bg-yellow p-12 text-center"
          style={{ boxShadow: "8px 8px 0px #0A0A0A" }}
        >
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-2xl font-black text-off-black uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No books found
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
