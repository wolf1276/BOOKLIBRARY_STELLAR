"use client";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import VerificationBadge from "@/components/VerificationBadge";
import WalletConnect from "@/components/WalletConnect";
import BookCard, { Book } from "@/components/BookCard";

const CONTRACT_ID = "CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM";

const BOOKS_DB: Record<string, Book & { description: string; pages?: number; year?: number; language?: string }> = {
  "1": { id: "1", title: "The Midnight Library", author: "Matt Haig", genre: "Fiction", verified: true, ipfs_hash: "QmYwAPJzv5CZsnAzt8auV39s9sFpfFBTsDLi", owner_wallet: "GBYN...3PBJM", timestamp: 1700000000, description: "Between life and death there is a library. When Nora Seed finds herself there, she has a chance to make things right.", pages: 288, year: 2020, language: "English" },
  "2": { id: "2", title: "Dune",                 author: "Frank Herbert",   genre: "Sci-Fi",   verified: true,  ipfs_hash: "QmTaVxm4JiEt1VfVbbGAg7DpUq5ahXdHbGKt", owner_wallet: "GBYN...3PBJM", timestamp: 1700100000, description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad'Dib.", pages: 412, year: 1965, language: "English" },
  "3": { id: "3", title: "Neuromancer",           author: "William Gibson", genre: "Cyberpunk", verified: false, ipfs_hash: "QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydH", owner_wallet: "GBYN...3PBJM", timestamp: 1700200000, description: "The Matrix series started here. A groundbreaking novel of the dystopian future of cyberspace.", pages: 271, year: 1984, language: "English" },
};

const RELATED: Book[] = [
  { id: "4",  title: "Foundation",    author: "Isaac Asimov",    genre: "Sci-Fi",  verified: true,  ipfs_hash: "QmRKs2ZfuwvmZ...f6g7" },
  { id: "5",  title: "Snow Crash",    author: "Neal Stephenson", genre: "Cyberpunk", verified: true, ipfs_hash: "QmSn0w...h9i0" },
  { id: "6",  title: "Hyperion",      author: "Dan Simmons",     genre: "Sci-Fi",  verified: false, ipfs_hash: "QmHyp3r...j1k2" },
];

export default function BookDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const book = BOOKS_DB[id] || BOOKS_DB["1"];

  const coverColors = ["#FFE500", "#0047FF", "#FF2E00", "#00E061", "#FAFAFA"];
  const coverBg = coverColors[parseInt(id || "1") % coverColors.length];
  const coverText = coverBg === "#FFE500" || coverBg === "#00E061" || coverBg === "#FAFAFA" ? "#0A0A0A" : "#FAFAFA";

  return (
    <div className="min-h-screen bg-off-black pt-28 pb-20 px-6 md:px-16">
      {/* Breadcrumb */}
      <div className="mb-8 text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <Link href="/library" className="text-yellow hover:underline">Library</Link>
        <span className="text-gray-600 mx-2">/</span>
        <span className="text-gray-400">{book.title}</span>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Book Cover */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="lg:col-span-1"
        >
          <div
            className="relative border-4 border-off-black aspect-[3/4] flex flex-col justify-between p-8"
            style={{ background: coverBg, boxShadow: "12px 12px 0px #0A0A0A" }}
          >
            <div style={{ width: "12px", position: "absolute", left: 0, top: 0, bottom: 0, background: "rgba(0,0,0,0.3)" }} />
            <div>
              <div className="text-xs uppercase font-bold mb-2 opacity-60" style={{ fontFamily: "'IBM Plex Mono', monospace", color: coverText }}>
                {book.genre}
              </div>
              <div className="text-5xl font-black opacity-20" style={{ fontFamily: "'Space Grotesk', sans-serif", color: coverText }}>
                {book.title[0]}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black leading-tight mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: coverText }}>{book.title}</h2>
              <p className="text-sm font-medium opacity-75" style={{ fontFamily: "'Inter', sans-serif", color: coverText }}>{book.author}</p>
            </div>
            {book.verified && (
              <div className="absolute top-4 right-4 bg-green border-2 border-off-black px-2 py-1 text-xs font-black text-off-black" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                ✓ ON-CHAIN
              </div>
            )}
          </div>
        </motion.div>

        {/* Book Info */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="lg:col-span-2 space-y-6"
        >
          <div>
            <span className="brut-tag bg-yellow">{book.genre}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
            {book.title}
          </h1>
          <p className="text-gray-300 text-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            by <strong className="text-white">{book.author}</strong>
          </p>
          <p className="text-gray-400 text-base leading-relaxed max-w-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            {book.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Pages", value: book.pages || "—" },
              { label: "Year", value: book.year || "—" },
              { label: "Language", value: book.language || "English" },
              { label: "Genre", value: book.genre || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="border-4 border-off-black bg-mid-gray p-3" style={{ boxShadow: "4px 4px 0px #0A0A0A" }}>
                <div className="text-xs text-gray-500 uppercase mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{label}</div>
                <div className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Verification */}
          <VerificationBadge verified={book.verified!} txHash={CONTRACT_ID} />

          {/* IPFS Hash */}
          {book.ipfs_hash && (
            <div className="border-4 border-off-black bg-mid-gray p-4">
              <div className="text-xs text-gray-500 uppercase mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>IPFS Hash</div>
              <div className="text-sm text-yellow break-all" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{book.ipfs_hash}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button className="brut-btn brut-btn-yellow text-base">📖 Read Book</button>
            <button className="brut-btn brut-btn-blue text-base">🔖 Borrow</button>
            <a
              href={`https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="brut-btn brut-btn-white text-base"
            >
              🔗 View on Stellar ↗
            </a>
          </div>
        </motion.div>
      </div>

      {/* Related Books */}
      <section>
        <h2 className="text-3xl font-black text-white uppercase mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Related Books
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {RELATED.map((b, i) => (
            <BookCard key={b.id} book={b} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
