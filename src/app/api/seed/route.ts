import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { readFileSync, statSync } from "fs";
import { join } from "path";
import { slugify } from "@/lib/utils";

const BOOKS_DIR = join(process.cwd(), "public", "books");

const BOOKS_META: Record<string, { title: string; author: string; description: string }> = {
  "100_go_mistakes.pdf": {
    title: "100 Go Mistakes",
    author: "Teiva Harsanyi",
    description: "Common mistakes Go developers make and how to avoid them. A practical guide to writing better Go code.",
  },
  "advanced-javascript-unleashed (2).pdf": {
    title: "Advanced JavaScript Unleashed",
    author: "Unknown",
    description: "Deep dive into advanced JavaScript concepts, patterns, and best practices for modern web development.",
  },
  "Americanah.pdf": {
    title: "Americanah",
    author: "Chimamanda Ngozi Adichie",
    description: "A powerful story of race, identity, and love spanning three continents. A modern literary classic.",
  },
  "Angels &Demons.pdf": {
    title: "Angels & Demons",
    author: "Dan Brown",
    description: "A thrilling mystery involving ancient secrets, modern science, and a race against time.",
  },
  "01-digital-documentation-advanced.pdf": {
    title: "Digital Documentation Advanced",
    author: "Unknown",
    description: "Advanced course on digital documentation, word processing, and professional report writing.",
  },
  "02-electronic-spreadsheet-advanced.pdf": {
    title: "Electronic Spreadsheet Advanced",
    author: "Unknown",
    description: "Advanced spreadsheet management, data analysis, and automation course.",
  },
  "03-database-management-system.pdf": {
    title: "Database Management System",
    author: "Unknown",
    description: "Comprehensive database management course covering SQL, design, and administration.",
  },
  "04-web-applications-and-security.pdf": {
    title: "Web Applications & Security",
    author: "Unknown",
    description: "Learn to build secure web applications with modern frameworks and security best practices.",
  },
};

async function ensureSchema() {
  if (!supabaseAdmin) return;

  // Create tables using raw SQL via rpc or direct insert test
  // First, try to insert a dummy record to see if table exists
  const { error: testError } = await supabaseAdmin.from("books").select("id").limit(1);

  if (!testError) {
    console.log("Tables already exist");
    return; // Tables exist
  }

  console.log("Tables missing, need to create schema");
  // We can't run DDL from Supabase JS client easily
  // Return the SQL that needs to be run
}

async function ensureBuckets() {
  if (!supabaseAdmin) return;

  const buckets = [
    { id: "book-files", name: "book-files", public: false },
    { id: "book-covers", name: "book-covers", public: true },
  ];

  for (const bucket of buckets) {
    try {
      const { data: existing } = await supabaseAdmin.storage.getBucket(bucket.id);
      if (existing) {
        console.log(`Bucket exists: ${bucket.id}`);
        continue;
      }
    } catch {
      // Doesn't exist
    }

    try {
      await supabaseAdmin.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.public ? 5242880 : 52428800,
      });
      console.log(`Created bucket: ${bucket.id}`);
    } catch (err: any) {
      if (err.message?.includes("already exists")) continue;
      console.error(`Bucket ${bucket.id}:`, err.message);
    }
  }
}

export async function POST() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }

  // Check if schema exists
  const { error: schemaError } = await supabaseAdmin.from("books").select("id").limit(1);
  if (schemaError) {
    return NextResponse.json({
      error: "Database schema not set up",
      detail: schemaError.message,
      sql: `
-- Run this in Supabase SQL Editor:
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
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'KES' CHECK (currency IN ('KES', 'USD')),
  payment_method text NOT NULL DEFAULT 'free',
  payment_ref text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('book-covers', 'book-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('book-files', 'book-files', false, 52428800, ARRAY['application/pdf', 'application/epub+zip'])
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active books" ON books;
CREATE POLICY "Anyone can view active books" ON books FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Service role can manage books" ON books;
CREATE POLICY "Service role can manage books" ON books FOR ALL USING (true);
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (true);
      `,
    }, { status: 500 });
  }

  // Ensure buckets
  await ensureBuckets();

  const results: { title: string; status: string; error?: string }[] = [];

  for (const [filename, meta] of Object.entries(BOOKS_META)) {
    try {
      const filePath = join(BOOKS_DIR, filename);

      let stats;
      try {
        stats = statSync(filePath);
      } catch {
        results.push({ title: meta.title, status: "skipped", error: "File not found" });
        continue;
      }

      if (stats.size === 0) {
        results.push({ title: meta.title, status: "skipped", error: "Empty file" });
        continue;
      }

      const slug = slugify(meta.title);

      const { data: existing } = await supabaseAdmin.from("books").select("id").eq("slug", slug).maybeSingle();
      if (existing) {
        results.push({ title: meta.title, status: "already_exists" });
        continue;
      }

      const fileBuffer = readFileSync(filePath);
      const storagePath = `books/${slug}-${Date.now()}.pdf`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("book-files")
        .upload(storagePath, fileBuffer, { contentType: "application/pdf", upsert: true });

      if (uploadError) {
        results.push({ title: meta.title, status: "failed", error: uploadError.message });
        continue;
      }

      const { error: dbError } = await supabaseAdmin.from("books").insert({
        title: meta.title,
        slug,
        author: meta.author,
        description: meta.description,
        price_kes: 0,
        price_usd: 0,
        cover_url: "",
        file_url: storagePath,
        file_type: "pdf",
        file_size: stats.size,
        is_active: true,
      });

      if (dbError) {
        results.push({ title: meta.title, status: "failed", error: dbError.message });
        continue;
      }

      results.push({ title: meta.title, status: "uploaded" });
    } catch (err: any) {
      results.push({ title: meta.title, status: "error", error: err.message });
    }
  }

  return NextResponse.json({ results });
}

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }
  const { data: books, error } = await supabaseAdmin.from("books").select("title, slug, is_active").order("created_at", { ascending: false });
  return NextResponse.json({
    message: "POST to seed books",
    existingBooks: books ?? [],
    error: error?.message,
  });
}
