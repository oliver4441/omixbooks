"use client";
import Link from "next/link";
import { ShoppingCart, BookOpen } from "lucide-react";
import { useCart } from "./CartContext";

export default function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          <span className="text-2xl font-bold text-gray-900">Omix<span className="text-emerald-600">Books</span></span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/books" className="text-gray-600 hover:text-gray-900 font-medium">Books</Link>
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-gray-900" />
            {itemCount > 0 && <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{itemCount}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
