"use client";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  cover?: string;
  ipfs_hash?: string;
  owner_wallet?: string;
  timestamp?: number;
  verified?: boolean;
  contract_book_id?: number | null;
  tx_hash?: string | null;
}

const COVER_COLORS = [
  { bg: "#FFE500", text: "#0A0A0A" },
  { bg: "#0047FF", text: "#FAFAFA" },
  { bg: "#FF2E00", text: "#FAFAFA" },
  { bg: "#00E061", text: "#0A0A0A" },
  { bg: "#FAFAFA", text: "#0A0A0A" },
];

export default function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 25,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(nx);
    y.set(ny);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  const colorScheme = COVER_COLORS[index % COVER_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 120, damping: 18 }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: hovered ? -8 : 0,
          boxShadow: hovered
            ? "12px 12px 0px #0A0A0A"
            : "6px 6px 0px #0A0A0A",
        }}
        transition={{ duration: 0.2 }}
        className="border-4 border-off-black bg-white cursor-pointer overflow-hidden w-full max-w-xs mx-auto md:max-w-none"
      >
        <Link href={`/book/${book.id}`} className="no-underline block">
          {/* Book Cover */}
          <div
            className="relative h-52 flex flex-col justify-between p-4 border-b-4 border-off-black"
            style={{ background: colorScheme.bg }}
          >
            {/* Genre Tag */}
            {book.genre && (
              <span
                className="self-start text-xs font-bold uppercase px-2 py-0.5 border-2 border-off-black bg-white text-off-black"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {book.genre}
              </span>
            )}

            {/* Big Letter */}
            <div
              className="text-7xl font-black leading-none opacity-20 self-end"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: colorScheme.text,
              }}
            >
              {book.title[0]}
            </div>

            {/* Verified badge */}
            {book.verified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 bg-green border-2 border-off-black px-2 py-0.5 text-xs font-bold text-off-black"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                ✓ ON-CHAIN
              </motion.div>
            )}
          </div>

          {/* Book Info */}
          <div className="p-4 bg-white">
            <h3
              className="text-lg font-bold text-off-black leading-tight mb-1 line-clamp-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {book.title}
            </h3>
            <p
              className="text-sm text-gray-500 mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {book.author}
            </p>

            {book.ipfs_hash && (
              <div
                className="text-xs border-t-2 border-gray-200 pt-2 text-gray-400 truncate"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                IPFS: {book.ipfs_hash.slice(0, 18)}...
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
