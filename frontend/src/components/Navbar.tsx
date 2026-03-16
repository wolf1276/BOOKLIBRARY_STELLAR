"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "Library",   href: "/library" },
  { label: "Upload",    href: "/upload" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="fixed top-4 left-4 right-4 z-50"
      >
        <nav
          className="border-4 border-off-black bg-yellow flex items-center justify-between px-6 py-3"
          style={{ boxShadow: "6px 6px 0px #0A0A0A" }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span
              className="text-2xl font-bold text-off-black"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em" }}
            >
              📚 BOOKLIB
            </span>
            <span
              className="bg-off-black text-yellow text-xs font-bold px-2 py-0.5 border-2 border-off-black"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              STELLAR
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-bold text-off-black uppercase tracking-wider hover:bg-off-black hover:text-yellow transition-colors duration-150 border-2 border-transparent hover:border-off-black"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/upload"
              className="brut-btn brut-btn-black ml-4 text-sm"
            >
              + Upload Book
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 border-2 border-off-black"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-off-black transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-off-black transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-off-black transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 z-40 border-4 border-off-black bg-white"
            style={{ boxShadow: "6px 6px 0px #0A0A0A" }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-4 text-lg font-bold text-off-black uppercase border-b-4 border-off-black hover:bg-yellow transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
