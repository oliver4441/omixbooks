"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types";
import { Trash2 } from "lucide-react";

export default function CartItem({ item }: { item: CartItemType }) {
  const { removeItem } = useCart();
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      <Link href={`/books/${item.book.slug}`} className="w-20 h-28 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {item.book.cover_url ? <Image src={item.book.cover_url} alt={item.book.title} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>}
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/books/${item.book.slug}`} className="font-semibold text-gray-900 hover:text-emerald-600 line-clamp-1">{item.book.title}</Link>
        <p className="text-sm text-gray-500">{item.book.author}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2"><span className="font-medium text-emerald-600">Free</span></div>
          <button onClick={() => removeItem(item.book.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
