import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// One-time setup endpoint — creates tables and storage buckets
// Uses service role key for DDL operations

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const supabase = createClient(url, key, {
    db: { schema: "public" },
  });

  const logs: string[] = [];

  // 1. Create storage buckets via Supabase JS client
  for (const [id, isPublic, sizeLimit, mimeTypes] of [
    ["book-files", false, 52428800, ["application/pdf", "application/epub+zip"]],
    ["book-covers", true, 5242880, ["image/jpeg", "image/png", "image/webp"]],
  ] as const) {
    try {
      const { data: existing } = await supabase.storage.getBucket(id);
      if (existing) {
        logs.push(`✅ Bucket "${id}" already exists`);
        continue;
      }
    } catch {}

    try {
      await supabase.storage.createBucket(id, {
        public: isPublic,
        fileSizeLimit: sizeLimit,
        allowedMimeTypes: mimeTypes,
      });
      logs.push(`✅ Created bucket "${id}"`);
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        logs.push(`✅ Bucket "${id}" already exists`);
      } else {
        logs.push(`❌ Bucket "${id}": ${err.message}`);
      }
    }
  }

  // 2. Test if books table exists
  const { error: booksTest } = await supabase.from("books").select("id").limit(1);
  if (booksTest) {
    logs.push(`⚠️ Table "books" missing: ${booksTest.message}`);
    logs.push("Run this SQL in Supabase SQL Editor:");
    logs.push(`
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  author text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price_kes integer NOT NULL DEFAULT 0,
  price_usd integer NOT NULL DEFAULT 0,
  cover_url text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT 'pdf' CHECK (file_type IN ('pdf', 'epub')),
  file_size bigint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id),
  buyer_email text NOT NULL,
  buyer_name text NOT NULL DEFAULT '',
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES' CHECK (currency IN ('KES', 'USD')),
  payment_method text NOT NULL DEFAULT 'free',
  payment_ref text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active books" ON books;
CREATE POLICY "Anyone can view active books" ON books FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Service role can manage books" ON books;
CREATE POLICY "Service role can manage books" ON books FOR ALL USING (true);
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (true);
    `);
  } else {
    logs.push("✅ Table 'books' exists");
  }

  // 3. Test orders table
  const { error: ordersTest } = await supabase.from("orders").select("id").limit(1);
  if (ordersTest) {
    logs.push(`⚠️ Table "orders" missing: ${ordersTest.message}`);
  } else {
    logs.push("✅ Table 'orders' exists");
  }

  return NextResponse.json({ logs });
}

export async function GET() {
  return NextResponse.json({
    message: "POST to run one-time setup (creates buckets + checks tables)",
  });
}
