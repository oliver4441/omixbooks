import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(z.object({ book_id: z.string().uuid(), price_kes: z.number().int().min(0), price_usd: z.number().int().min(0) })).min(1),
  buyer_name: z.string().min(1),
  buyer_email: z.string().email(),
  payment_method: z.enum(["mpesa", "stripe"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = orderSchema.parse(body);
    const item = data.items[0];
    const { data: order, error } = await supabaseAdmin!.from("orders").insert({
      book_id: item.book_id, buyer_name: data.buyer_name, buyer_email: data.buyer_email,
      amount: data.payment_method === "mpesa" ? item.price_kes : item.price_usd,
      currency: data.payment_method === "mpesa" ? "KES" : "USD",
      payment_method: data.payment_method, status: "pending",
    }).select().single();
    if (error) throw error;

    if (data.payment_method === "stripe") {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price_data: { currency: "usd", product_data: { name: `Book #${item.book_id}` }, unit_amount: item.price_usd }, quantity: 1 }],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        metadata: { order_id: order.id },
      });
      await supabaseAdmin!.from("orders").update({ payment_ref: session.id }).eq("id", order.id);
      return NextResponse.json({ checkout_url: session.url, order_id: order.id });
    }
    return NextResponse.json({ order_id: order.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
