// frontend/src/app/hooks/useContractBooks.ts
// Fetches books from the backend API (which maintains the authoritative list).
// The contract stores individual books by ID, so bulk listing comes from the backend.

import { useState, useEffect } from "react";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  verified: boolean;
  ipfs_hash: string;
  owner_wallet?: string;
  stellar_tx?: string;
  contract_book_id?: number | null;
}

export function useContractBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/books`);

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();

      // Map backend book format to frontend Book interface
      const mapped: Book[] = (data.books || []).map((b: any) => ({
        id: b.book_id,
        title: b.title,
        author: b.author,
        genre: b.genre || "Unknown",
        verified: b.verified || false,
        ipfs_hash: b.ipfs_hash || "",
        owner_wallet: b.owner_wallet,
        stellar_tx: b.stellar_tx,
        contract_book_id: b.contract_book_id,
      }));

      setBooks(mapped);
      setError(null);
    } catch (e: any) {
      console.error("Failed to fetch books:", e);
      setError(e.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return { books, loading, error, refetch: fetchBooks };
}
