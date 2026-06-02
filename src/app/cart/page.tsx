"use client";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import CartItemComp from "@/components/CartItem";
import { ShoppingCart, Gift } from "lucide-react";

export default function CartPage() {
  const { items } = useCart();
  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
      <p className="text-gray-500 mb-8">Browse our books and add some to your cart.</p>
      <Link href="/books" className="text-emerald-600 font-medium hover:underline">Browse Books →</Link>
    </div>
  );
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Your Books ({items.length})</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        {items.map((item) => <CartItemComp key={item.book.id} item={item} />)}
        <div className="pt-4 flex items-center justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-xl font-bold text-emerald-600 flex items-center gap-1.5"><Gift className="w-5 h-5" /> Free</span>
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link href="/checkout" className="inline-block bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors">Get Books — Free</Link>
      </div>
    </div>
  );
}
