"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [step, setStep] = useState<"form" | "uploading" | "success">("form");
  const [form, setForm] = useState({ title: "", author: "", genre: "", description: "" });
  const [file, setFile] = useState<File | null>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{ ipfs: string; tx: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author) return;

    setStep("uploading");
    setErrorMsg("");
    
    try {
      const res = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          genre: form.genre,
          description: form.description,
          owner_wallet: "freighter-wallet-placeholder" // In real app, pass the actual connected wallet
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload to API");
      }

      setSuccessData({
        ipfs: data.ipfs.hash,
        tx: data.stellar.tx_hash
      });
      setStep("success");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
      setStep("form");
    }
  };

  const handleClose = () => {
    setStep("form");
    setForm({ title: "", author: "", genre: "", description: "" });
    setFile(null);
    setErrorMsg("");
    setSuccessData(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[100]"
            onClick={handleClose}
          />

          {/* Modal Container to fix centering and scrolling */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              key="modal"
              data-lenis-prevent
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="w-full max-w-[560px] max-h-full border-4 border-off-black bg-white overflow-y-auto pointer-events-auto flex flex-col"
              style={{ boxShadow: "10px 10px 0px #0A0A0A" }}
            >
              {/* Header */}
              <div className="bg-yellow border-b-4 border-off-black p-4 sm:p-5 flex justify-between items-center sticky top-0 z-10">
              <h2
                className="text-2xl font-black text-off-black uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {step === "success" ? "✓ Uploaded!" : "Upload Book"}
              </h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 border-4 border-off-black bg-white font-black text-xl hover:bg-red hover:text-white flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* STEP: form */}
              {step === "form" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: "Book Title *", key: "title", placeholder: "Enter the full title..." },
                    { label: "Author *", key: "author", placeholder: "Author name..." },
                    { label: "Genre", key: "genre", placeholder: "Fiction, Non-fiction, Sci-fi..." },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label
                        className="block text-sm font-bold text-off-black mb-1 uppercase"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {label}
                      </label>
                      <input
                        type="text"
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full border-4 border-off-black px-4 py-3 text-off-black focus:outline-none focus:bg-yellow/20"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required={key === "title" || key === "author"}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-bold text-off-black mb-1 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      placeholder="A brief description of the book..."
                      className="w-full border-4 border-off-black px-4 py-3 text-off-black focus:outline-none focus:bg-yellow/20 resize-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-bold text-off-black mb-1 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Book File (PDF/EPUB)
                    </label>
                    <label className="flex items-center gap-3 border-4 border-off-black border-dashed p-4 cursor-pointer hover:bg-yellow/20 transition-colors">
                      <span className="text-2xl">📄</span>
                      <span className="text-sm text-gray-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {file ? file.name : "Click to choose file..."}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.epub"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {/* IPFS Notice */}
                  <div className="bg-blue/10 border-2 border-blue p-3 text-xs text-blue font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    📡 File will be stored on IPFS → Hash saved to Stellar Soroban contract
                  </div>

                  {errorMsg && (
                    <div className="bg-red/10 border-2 border-red p-3 text-xs text-red font-bold uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      Error: {errorMsg}
                    </div>
                  )}

                  <button type="submit" className="brut-btn brut-btn-black w-full justify-center text-base">
                    Upload & Store On-Chain →
                  </button>
                </form>
              )}

              {/* STEP: uploading */}
              {step === "uploading" && (
                <div className="py-12 flex flex-col items-center gap-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-6 border-off-black border-t-yellow"
                    style={{ borderRadius: 0 }}
                  />
                  <div className="text-center">
                    <p className="text-lg font-bold text-off-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Uploading to IPFS...
                    </p>
                    <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      Then storing hash on Stellar blockchain
                    </p>
                  </div>
                  {[60, 35, 80].map((w, i) => (
                    <motion.div
                      key={i}
                      className="h-2 bg-yellow border-2 border-off-black"
                      initial={{ width: 0 }}
                      animate={{ width: `${w}%` }}
                      transition={{ delay: i * 0.7, duration: 0.8 }}
                      style={{ alignSelf: "flex-start" }}
                    />
                  ))}
                </div>
              )}

              {/* STEP: success */}
              {step === "success" && (
                <div className="py-8 flex flex-col items-center gap-5 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-20 h-20 bg-green border-4 border-off-black flex items-center justify-center text-4xl"
                    style={{ boxShadow: "6px 6px 0px #0A0A0A" }}
                  >
                    ✓
                  </motion.div>
                  <h3 className="text-2xl font-black text-off-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Book Uploaded!
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    <p>IPFS Hash: <span className="text-blue font-bold">{successData?.ipfs.slice(0, 16)}...</span></p>
                    <p>Stellar TX: <span className="text-blue font-bold">{successData?.tx.slice(0, 16)}...</span></p>
                  </div>
                  <button onClick={handleClose} className="brut-btn brut-btn-yellow">
                    Awesome! Close →
                  </button>
                </div>
              )}
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
