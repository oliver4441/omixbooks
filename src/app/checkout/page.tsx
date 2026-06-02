"use client";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Gift } from "lucide-react";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  if (items.length === 0) { router.push("/cart"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ book_id: i.book.id, price_kes: i.book.price_kes, price_usd: i.book.price_usd })),
          buyer_name: form.name,
          buyer_email: form.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      clearCart();
      router.push(`/orders/${data.order_id}`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-8 flex items-center gap-3">
        <Gift className="w-6 h-6 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-emerald-800">All books are currently free!</p>
          <p className="text-sm text-emerald-600">Just enter your details below and download instantly.</p>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-8">Get Your Books</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          {items.map((item) => (
            <div key={item.book.id} className="flex justify-between py-2 text-sm">
              <span className="text-gray-600 mr-2">{item.book.title}</span>
              <span className="font-medium flex-shrink-0 text-emerald-600">Free</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-emerald-600">Free</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-4">Your Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="john@example.com" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full mt-6 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Processing..." : "Get Books — Free"}
          </button>
        </form>
      </div>
    </div>
  );
}
