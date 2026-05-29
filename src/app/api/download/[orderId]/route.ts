import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const { data: order } = await supabaseAdmin!.from("orders").select("*, book:books(file_url)").eq("id", orderId).eq("status", "completed").single();
  if (!order) return NextResponse.json({ error: "Order not found or not completed" }, { status: 404 });
  if (order.download_count >= 3) return NextResponse.json({ error: "Download limit reached" }, { status: 403 });
  const { data: signedUrl } = await supabaseAdmin!.storage.from("book-files").createSignedUrl(order.book.file_url, 300);
  if (!signedUrl) return NextResponse.json({ error: "File not found" }, { status: 404 });
  await supabaseAdmin!.from("orders").update({ download_count: order.download_count + 1 }).eq("id", orderId);
  return NextResponse.redirect(signedUrl.signedUrl);
}
