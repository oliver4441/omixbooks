"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Book, CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (book: Book) => void;
  removeItem: (bookId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((book: Book) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) return prev;
      return [...prev, { book, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((bookId: string) => {
    setItems((prev) => prev.filter((item) => item.book.id !== bookId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
