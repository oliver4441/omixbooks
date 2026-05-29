import { createClient } from "@/lib/supabase/server";
import type { LucideIcon } from "lucide-react";
import { BookOpen, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

interface StatCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: books } = await supabase
    .from("books")
    .select("id")
    .eq("is_active", true);
  const { data: orders } = await supabase
    .from("orders")
    .select("id, buyer_email, amount, currency, status, created_at");

  const completed = (orders ?? []).filter((o) => o.status === "completed");
  const totalKes = completed
    .filter((o) => o.currency === "KES")
    .reduce((s, o) => s + o.amount, 0);
  const totalUsd = completed
    .filter((o) => o.currency === "USD")
    .reduce((s, o) => s + o.amount, 0);

  const stats: StatCard[] = [
    {
      label: "Total Books",
      value: books?.length ?? 0,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Orders",
      value: orders?.length ?? 0,
      icon: ShoppingCart,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Revenue (KES)",
      value: `KES ${totalKes.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Revenue (USD)",
      value: `$${(totalUsd / 100).toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/admin/books/new"
          className="bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Add Book
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow-sm p-6">
            <div
              className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}
            >
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((o) => {
                  const amountDisplay =
                    o.currency === "KES"
                      ? `KES ${o.amount.toLocaleString()}`
                      : `$${(o.amount / 100).toFixed(2)}`;
                  const statusClass =
                    o.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : o.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700";
                  return (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-xs">
                        {o.id.slice(0, 8)}...
                      </td>
                      <td className="py-3">{o.buyer_email ?? "—"}</td>
                      <td className="py-3 font-medium">{amountDisplay}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
