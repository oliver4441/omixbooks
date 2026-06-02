import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/books";
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(z.object({
    book_id: z.string().uuid(),
    price_kes: z.number().int().min(0),
    price_usd: z.number().int().min(0),
  })).min(1),
  buyer_name: z.string().min(1),
  buyer_email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = orderSchema.parse(body);
    const item = data.items[0];

    const order = await createOrder({
      book_id: item.book_id,
      buyer_email: data.buyer_email,
      buyer_name: data.buyer_name,
      payment_method: "free",
    });

    return NextResponse.json({ order_id: order.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
