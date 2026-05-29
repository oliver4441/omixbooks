"use client";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", paymentMethod: "mpesa" });
  const totalKes = items.reduce((sum, item) => sum + item.book.price_kes, 0);

  if (items.length === 0) { router.push("/cart"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((i) => ({ book_id: i.book.id, price_kes: i.book.price_kes, price_usd: i.book.price_usd })), buyer_name: form.name, buyer_email: form.email, payment_method: form.paymentMethod }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      if (data.checkout_url) window.location.href = data.checkout_url;
      else if (data.order_id) { clearCart(); router.push(`/orders/${data.order_id}`); }
    } catch (err: any) { toast.error(err.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          {items.map((item) => (
            <div key={item.book.id} className="flex justify-between py-2 text-sm">
              <span className="text-gray-600 mr-2">{item.book.title}</span>
              <span className="font-medium flex-shrink-0">{formatPrice(item.book.price_kes, "KES")}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4 flex justify-between font-bold"><span>Total</span><span>{formatPrice(totalKes, "KES")}</span></div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm({ ...form, paymentMethod: "mpesa" })} className={`p-3 border rounded-lg text-center font-medium transition-colors ${form.paymentMethod === "mpesa" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}>M-Pesa</button>
                <button type="button" onClick={() => setForm({ ...form, paymentMethod: "stripe" })} className={`p-3 border rounded-lg text-center font-medium transition-colors ${form.paymentMethod === "stripe" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}>Card (International)</button>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full mt-6 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Processing..." : `Pay ${formatPrice(totalKes, "KES")}`}</button>
          {form.paymentMethod === "stripe" && <p className="text-sm text-gray-500 mt-3 text-center">You'll be redirected to Stripe for secure payment.</p>}
        </form>
      </div>
    </div>
  );
}
