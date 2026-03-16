"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

export interface FloatingBook {
  id: string;
  title: string;
  author: string;
  color: string;
  textColor: string;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  scale: number;
}

const BOOK_COLORS = [
  { color: "#FFE500", textColor: "#0A0A0A" },
  { color: "#0047FF", textColor: "#FAFAFA" },
  { color: "#FF2E00", textColor: "#FAFAFA" },
  { color: "#00E061", textColor: "#0A0A0A" },
  { color: "#FAFAFA", textColor: "#0A0A0A" },
];

const SAMPLE_BOOKS = [
  { id: "1", title: "The Midnight Library", author: "M. Haig" },
  { id: "2", title: "Dune", author: "F. Herbert" },
  { id: "3", title: "1984", author: "G. Orwell" },
  { id: "4", title: "Neuromancer", author: "W. Gibson" },
  { id: "5", title: "Hyperion", author: "D. Simmons" },
  { id: "6", title: "Foundation", author: "I. Asimov" },
  { id: "7", title: "Snow Crash", author: "N. Stephenson" },
];

function SingleFloatingBook({
  book,
  mouseX,
  mouseY,
}: {
  book: FloatingBook;
  mouseX: number;
  mouseY: number;
}) {
  const [hovered, setHovered] = useState(false);

  // Repel from mouse
  const repelX = hovered ? 0 : (book.x - mouseX) * 0.015;
  const repelY = hovered ? 0 : (book.y - mouseY) * 0.015;

  return (
    <motion.div
      key={book.id}
      style={{
        position: "absolute",
        left: `${book.x}%`,
        top: `${book.y}%`,
        translateX: "-50%",
        translateY: "-50%",
        zIndex: 10,
        cursor: "pointer",
      }}
      animate={{
        y: [0, -15 * book.speed, -8 * book.speed, 0],
        rotate: [book.rotation, book.rotation + 3, book.rotation - 2, book.rotation],
        x: repelX,
      }}
      transition={{
        y: { duration: 5 + book.speed * 2, ease: "easeInOut", repeat: Infinity },
        rotate: { duration: 7 + book.speed, ease: "easeInOut", repeat: Infinity },
        x: { duration: 0.5, ease: "easeOut" },
      }}
      whileHover={{
        scale: 1.15,
        rotate: book.rotation + 8,
        zIndex: 20,
        transition: { type: "spring", stiffness: 300, damping: 15 },
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        style={{
          width: `${80 * book.scale}px`,
          height: `${110 * book.scale}px`,
          background: book.color,
          border: "4px solid #0A0A0A",
          boxShadow: hovered ? "8px 8px 0px #0A0A0A" : "5px 5px 0px #0A0A0A",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "8px",
          position: "relative",
          overflow: "hidden",
          transition: "box-shadow 0.15s ease",
        }}
      >
        {/* Spine accent */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "8px",
            background: "rgba(0,0,0,0.25)",
          }}
        />
        <div
          style={{
            fontSize: "9px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            color: book.textColor,
            opacity: 0.7,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            paddingLeft: "6px",
          }}
        >
          {book.author}
        </div>
        <div
          style={{
            fontSize: "11px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            color: book.textColor,
            lineHeight: 1.2,
            paddingLeft: "6px",
          }}
        >
          {book.title}
        </div>
      </div>
    </motion.div>
  );
}

export default function FloatingBookGrid() {
  const [mouseX, setMouseX] = useState(50);
  const [mouseY, setMouseY] = useState(50);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouseX((e.clientX / window.innerWidth) * 100);
    setMouseY((e.clientY / window.innerHeight) * 100);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const books: FloatingBook[] = SAMPLE_BOOKS.map((b, i) => {
    const scheme = BOOK_COLORS[i % BOOK_COLORS.length];
    return {
      ...b,
      ...scheme,
      x: 10 + (i % 4) * 25 + (i > 3 ? 12 : 0),
      y: 15 + Math.floor(i / 4) * 40 + (i % 2) * 10,
      rotation: -10 + i * 7,
      speed: 0.6 + (i % 3) * 0.3,
      scale: 0.85 + (i % 3) * 0.1,
    };
  });

  return (
    <section className="relative z-10 py-20 px-6">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div
          className="inline-block bg-yellow border-4 border-off-black px-6 py-3 mb-4"
          style={{ boxShadow: "6px 6px 0px #0A0A0A" }}
        >
          <h2
            className="text-3xl md:text-5xl font-black text-off-black uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Anti-Gravity Shelf
          </h2>
        </div>
        <p
          className="text-gray-400 text-base max-w-lg mx-auto"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Hover over a book to tilt it. They drift away from your cursor.
        </p>
      </div>

      {/* Floating Stage */}
      <div
        className="relative mx-auto border-4 border-off-black"
        style={{
          height: "420px",
          maxWidth: "900px",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)",
          boxShadow: "10px 10px 0px #0A0A0A",
          overflow: "hidden",
        }}
      >
        {/* Grid lines in background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,229,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,229,0,0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {books.map((book) => (
          <SingleFloatingBook
            key={book.id}
            book={book}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}
      </div>
    </section>
  );
}
