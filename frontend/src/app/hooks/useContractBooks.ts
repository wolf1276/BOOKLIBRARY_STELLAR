// frontend/src/app/hooks/useContractBooks.ts
import { useState, useEffect } from "react";
import { invokeContract } from "@/utils/stellar"; // placeholder utility

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  verified: boolean;
  ipfs_hash: string;
}

export function useContractBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        // Assuming the contract has a method "list_books" returning array of books
        const result = await invokeContract("list_books", {});
        // result should be an array of book objects; adapt as needed
        setBooks(result?.books || []);
      } catch (e) {
        console.error("Failed to fetch books from contract", e);
        setError("Failed to load books");
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  return { books, loading, error };
}
