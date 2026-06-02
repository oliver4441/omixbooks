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

export async function POST() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }

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

      // Check if already exists
      const { data: existing } = await supabaseAdmin.from("books").select("id").eq("slug", slug).single();
      if (existing) {
        results.push({ title: meta.title, status: "already_exists" });
        continue;
      }

      // Read and upload file
      const fileBuffer = readFileSync(filePath);
      const storagePath = `books/${slug}-${Date.now()}.pdf`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("book-files")
        .upload(storagePath, fileBuffer, { contentType: "application/pdf", upsert: true });

      if (uploadError) {
        results.push({ title: meta.title, status: "failed", error: uploadError.message });
        continue;
      }

      // Insert book record
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
  return NextResponse.json({
    message: "Send POST to seed books from public/books folder",
  });
}
