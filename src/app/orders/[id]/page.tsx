import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Download, Mail } from "lucide-react";

interface Props { params: Promise<{ id: string }>; }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order, error } = await supabase.from("orders").select("*, book:books(*)").eq("id", id).single();
  if (error || !order) notFound();
  const isCompleted = order.status === "completed";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {isCompleted ? (
        <>
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Thank you for your order!</h1>
          <p className="text-gray-500 mb-8">Your payment was successful. Download your book below.</p>
          <div className="bg-white rounded-lg shadow-sm p-6 text-left mb-6">
            <div className="flex justify-between items-start mb-4">
              <div><h2 className="font-semibold text-lg">{order.book?.title}</h2><p className="text-gray-500">{order.book?.author}</p></div>
              <span className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">{order.status}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>{order.payment_method === "mpesa" ? "M-Pesa" : "Card"}</span><span>·</span><span>{formatPrice(order.amount, order.currency)}</span>
            </div>
            <a href={`/api/download/${order.id}`} className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition-colors">
              <Download className="w-5 h-5" />Download {order.book?.file_type?.toUpperCase()}
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500"><Mail className="w-4 h-4" /><span>Receipt sent to {order.buyer_email}</span></div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 border-4 border-yellow-400 rounded-full mx-auto mb-6 flex items-center justify-center"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
          <h1 className="text-3xl font-bold mb-2">Processing your order</h1>
          <p className="text-gray-500">We're confirming your payment. This page will update automatically.</p>
        </>
      )}
    </div>
  );
}
