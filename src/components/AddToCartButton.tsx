"use client";
import { useCart } from "./CartContext";
import toast from "react-hot-toast";
import type { Book } from "@/types";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

export default function AddToCartButton({ book }: { book: Book }) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some((item) => item.book.id === book.id);
  const handleAdd = () => { addItem(book); setAdded(true); toast.success(`${book.title} added to cart`); setTimeout(() => setAdded(false), 2000); };
  if (inCart || added) return <button disabled className="flex items-center gap-2 bg-emerald-100 text-emerald-700 font-semibold px-6 py-3 rounded-lg"><Check className="w-5 h-5" />In Cart</button>;
  return <button onClick={handleAdd} className="flex items-center gap-2 bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"><ShoppingCart className="w-5 h-5" />Add to Cart</button>;
}
