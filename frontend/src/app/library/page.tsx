"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import BookCard, { Book } from "@/components/BookCard";

const ALL_BOOKS: Book[] = [
  { id: "1",  title: "The Midnight Library",        author: "Matt Haig",            genre: "Fiction",    verified: true,  ipfs_hash: "QmYwAPJzv5CZ...a8f2" },
  { id: "2",  title: "Dune",                         author: "Frank Herbert",         genre: "Sci-Fi",     verified: true,  ipfs_hash: "QmTaVxm4JiEt...b3c1" },
  { id: "3",  title: "Neuromancer",                  author: "William Gibson",        genre: "Cyberpunk",  verified: false, ipfs_hash: "QmPK1s3pNYLi...d4e5" },
  { id: "4",  title: "Foundation",                   author: "Isaac Asimov",          genre: "Sci-Fi",     verified: true,  ipfs_hash: "QmRKs2ZfuwvmZ...f6g7" },
  { id: "5",  title: "Snow Crash",                   author: "Neal Stephenson",       genre: "Cyberpunk",  verified: true,  ipfs_hash: "QmSn0wCr4sH8...h9i0" },
  { id: "6",  title: "Hyperion",                     author: "Dan Simmons",           genre: "Sci-Fi",     verified: false, ipfs_hash: "QmHyp3r10nC4n...j1k2" },
  { id: "7",  title: "1984",                         author: "George Orwell",         genre: "Dystopia",   verified: true,  ipfs_hash: "QmN1n3t3enth8...l3m4" },
  { id: "8",  title: "Brave New World",              author: "Aldous Huxley",         genre: "Dystopia",   verified: false, ipfs_hash: "QmBr4v3N3wW0rld...n5o6" },
  { id: "9",  title: "The Name of the Wind",         author: "Patrick Rothfuss",      genre: "Fantasy",    verified: true,  ipfs_hash: "QmN4m3W1nd...p7q8" },
  { id: "10", title: "The Way of Kings",             author: "Brandon Sanderson",     genre: "Fantasy",    verified: true,  ipfs_hash: "QmW4yK1ngs...r9s0" },
  { id: "11", title: "Project Hail Mary",            author: "Andy Weir",             genre: "Sci-Fi",     verified: true,  ipfs_hash: "QmPr0j3ctH4il...t1u2" },
  { id: "12", title: "The Three Body Problem",       author: "Liu Cixin",             genre: "Sci-Fi",     verified: false, ipfs_hash: "QmThr33B0dy...v3w4" },
];

const GENRES = ["All", "Sci-Fi", "Fiction", "Cyberpunk", "Fantasy", "Dystopia"];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [onlyVerified, setOnlyVerified] = useState(false);

  const filtered = useMemo(() => {
    return ALL_BOOKS.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase());
      const matchGenre = genre === "All" || b.genre === genre;
      const matchVerified = !onlyVerified || b.verified;
      return matchSearch && matchGenre && matchVerified;
    });
  }, [search, genre, onlyVerified]);

  return (
    <div className="min-h-screen bg-off-black pt-28 pb-20 px-6 md:px-16">
      {/* Page Header */}
      <div className="mb-10">
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
          {ALL_BOOKS.length} books · {ALL_BOOKS.filter((b) => b.verified).length} on-chain verified
        </p>
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
        Showing {filtered.length} of {ALL_BOOKS.length} books
      </div>

      {filtered.length === 0 ? (
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
