import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) await supabaseAdmin!.from("orders").update({ status: "completed", payment_ref: session.payment_intent as string }).eq("id", orderId);
    }
    return NextResponse.json({ received: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 400 }); }
}
