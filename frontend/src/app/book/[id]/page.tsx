"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import VerificationBadge from "@/components/VerificationBadge";
import WalletConnect from "@/components/WalletConnect";
import BookCard, { Book } from "@/components/BookCard";
import { borrowBook } from "@/utils/stellar";

const CONTRACT_ID = "CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM";

// Removed static BOOKS_DB

const RELATED: Book[] = [];


export default function BookDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [book, setBook] = useState<Book & { description?: string; pages?: number; year?: number; language?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookDetail() {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "";
        const endpoint = API ? `${API}/api/books/${id}` : `/api/books/${id}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Book not found");
        const result = await res.json();
        setBook({ ...result, id: String(result.id) });
      } catch (err) {
        console.error("Book fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookDetail();
  }, [id]);

  const coverColors = ["#FFE500", "#0047FF", "#FF2E00", "#00E061", "#FAFAFA"];
  const coverBg = coverColors[parseInt(id || "1") % coverColors.length] || "#0047FF";
  const coverText = coverBg === "#FFE500" || coverBg === "#00E061" || coverBg === "#FAFAFA" ? "#0A0A0A" : "#FAFAFA";

  if (loading) {
    return (
      <div className="min-h-screen bg-off-black pt-28 pb-20 px-6 md:px-16 flex items-center justify-center">
        <div className="text-yellow text-2xl font-black font-space">LOADING BOOK...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-off-black pt-28 pb-20 px-6 md:px-16 flex items-center justify-center">
        <div className="text-red text-2xl font-black font-space">BOOK NOT FOUND</div>
      </div>
    );
  }

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
            {book.ipfs_hash ? (
              <a 
                href={`https://ipfs.io/ipfs/${book.ipfs_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="brut-btn brut-btn-yellow text-base"
              >
                📖 Read Book
              </a>
            ) : (
              <button disabled className="brut-btn bg-gray-400 text-base opacity-50 cursor-not-allowed">
                📖 No File Found
              </button>
            )}

            {!book.contract_book_id ? (
              <button
                className="brut-btn brut-btn-green text-base animate-pulse"
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  try {
                    btn.innerHTML = "Initializing Registration...";
                    // We call the same logic as the upload modal
                    // Importing it via a helper might be cleaner, but for now we'll use the window.addBook logic if available or the utility
                    const { addBook } = await import("@/utils/stellar");
                    const result = await addBook(book.title, book.author);
                    
                    // Update the DB
                    await fetch(`/api/books/${book.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        verified: true,
                        contract_book_id: result.bookId,
                      }),
                    });

                    alert("Successfully registered on Stellar! Refreshing...");
                    window.location.reload();
                  } catch (err: any) {
                    alert(`Registration failed: ${err.message}`);
                    btn.innerHTML = "Register On-Chain";
                  }
                }}
              >
                + Register On-Chain
              </button>
            ) : (
              <button
                className="brut-btn brut-btn-blue text-base relative overflow-hidden group"
                disabled={loading}
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalText = btn.innerHTML;
                  try {
                    const contractId = (book as any).contract_book_id;
                    if (!contractId) { alert("This book has no on-chain ID."); return; }
                    
                    btn.innerHTML = "Signing Transaction...";
                    btn.style.opacity = "0.7";
                    
                    const result = await borrowBook(Number(contractId));
                    
                    btn.innerHTML = "Success! ✓";
                    btn.style.backgroundColor = "#00E061";
                    
                    setTimeout(() => {
                      alert(`Book borrowed successfully!\n\nStellar Transaction Hash:\n${result.txHash}`);
                      btn.innerHTML = originalText;
                      btn.style.opacity = "1";
                      btn.style.backgroundColor = "";
                    }, 500);
                  } catch (err: any) {
                    alert(`Borrow failed: ${err.message}`);
                    btn.innerHTML = originalText;
                    btn.style.opacity = "1";
                  }
                }}
              >🔖 Borrow</button>
            )}
            
            <a
              href={`https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="brut-btn brut-btn-white text-base"
            >
              🔗 View Contract ↗
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
