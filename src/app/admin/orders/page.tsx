export const dynamic = "force-dynamic";

import { getOrdersWithBooks } from "@/lib/books";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

export default async function AdminOrdersPage() {
  const orders = await getOrdersWithBooks();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Orders</h1>
      {orders && orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Book</th>
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const statusClass =
                  order.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                  order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700";
                return (
                  <tr key={order.id} className="border-t">
                    <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4">{order.book?.title ?? "—"}</td>
                    <td className="px-6 py-4">
                      <div><p>{order.buyer_name}</p><p className="text-gray-500 text-xs">{order.buyer_email}</p></div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatPrice(order.amount, order.currency)}</td>
                    <td className="px-6 py-4 capitalize">{order.payment_method === "free" ? "Free" : order.payment_method}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>{order.status}</span></td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center"><p className="text-gray-500">No orders yet.</p></div>
      )}
    </div>
  );
}
