"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

/* GSAP is dynamically imported to avoid SSR issues */
export default function AnimatedHero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: unknown;

    const initGSAP = async () => {
      const { gsap } = await import("gsap");

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ delay: 0.3 });

        tl.fromTo(
          badgeRef.current,
          { opacity: 0, y: -20, rotation: -5 },
          { opacity: 1, y: 0, rotation: 0, duration: 0.5, ease: "back.out(2)" }
        )
          .fromTo(
            lineRef.current,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.6, ease: "power3.out" },
            "-=0.2"
          )
          .fromTo(
            headlineRef.current,
            { opacity: 0, y: 80, skewY: 5 },
            { opacity: 1, y: 0, skewY: 0, duration: 0.8, ease: "power3.out" },
            "-=0.3"
          )
          .fromTo(
            subRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.4"
          )
          .fromTo(
            ctaRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            "-=0.3"
          );
      });
    };

    initGSAP();

    return () => (ctx as { revert?: () => void })?.revert?.();
  }, []);

  return (
    <section
      className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-16 pt-32 pb-20"
    >
      {/* Ticker / Badge */}
      <div ref={badgeRef} className="opacity-0 mb-6 flex items-center gap-3 flex-wrap">
        <span
          className="bg-green text-off-black border-4 border-off-black px-4 py-1 text-xs font-bold uppercase tracking-widest"
          style={{ fontFamily: "'IBM Plex Mono', monospace", boxShadow: "4px 4px 0px #0A0A0A" }}
        >
          ✦ Powered by Stellar Soroban
        </span>
        <span
          className="bg-blue text-white border-4 border-off-black px-4 py-1 text-xs font-bold uppercase tracking-widest"
          style={{ fontFamily: "'IBM Plex Mono', monospace", boxShadow: "4px 4px 0px #0A0A0A" }}
        >
          🔗 On-Chain Verified
        </span>
      </div>

      {/* Decorative line */}
      <div
        ref={lineRef}
        className="h-2 bg-yellow border-2 border-off-black mb-8 w-24"
        style={{ transformOrigin: "left center" }}
      />

      {/* Main Headline */}
      <h1
        ref={headlineRef}
        className="opacity-0 text-white mb-6 leading-none"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(3.5rem, 10vw, 9rem)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        <span className="block">BOOK</span>
        <span className="block text-yellow">LIBRARY</span>
        <span
          className="block text-off-black"
          style={{
            WebkitTextStroke: "3px #FAFAFA",
            color: "transparent",
          }}
        >
          STELLAR
        </span>
      </h1>

      {/* Sub Headline */}
      <p
        ref={subRef}
        className="opacity-0 text-gray-300 mb-10 max-w-2xl text-lg md:text-xl leading-relaxed"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        The world&apos;s first{" "}
        <strong className="text-yellow">decentralized book library</strong> on the
        Stellar blockchain. Upload, verify, and discover books with on-chain provenance
        powered by Soroban smart contracts and IPFS storage.
      </p>

      {/* CTA buttons */}
      <div ref={ctaRef} className="opacity-0 flex flex-wrap gap-4">
        <Link href="/library" className="brut-btn brut-btn-yellow text-lg">
          Explore Library →
        </Link>
        <Link href="/upload" className="brut-btn brut-btn-white text-lg">
          + Upload Book
        </Link>
        <a
          href="https://lab.stellar.org/r/testnet/contract/CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM"
          target="_blank"
          rel="noopener noreferrer"
          className="brut-btn brut-btn-blue text-lg"
        >
          View Contract ↗
        </a>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <span
          className="text-xs text-white uppercase tracking-widest"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Scroll
        </span>
        <div className="w-0.5 h-12 bg-yellow animate-pulse" />
      </div>
    </section>
  );
}
