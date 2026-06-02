import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { query } from "@/lib/db";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { slugify } from "@/lib/utils";

const BOOKS_META: Record<string, { title: string; author: string; description: string }> = {
  "100_go_mistakes.pdf": { title: "100 Go Mistakes", author: "Teiva Harsanyi", description: "Common mistakes Go developers make and how to avoid them." },
  "advanced-javascript-unleashed (2).pdf": { title: "Advanced JavaScript Unleashed", author: "Unknown", description: "Deep dive into advanced JavaScript concepts and patterns." },
  "Americanah.pdf": { title: "Americanah", author: "Chimamanda Ngozi Adichie", description: "A powerful story of race, identity, and love spanning three continents." },
  "Angels &Demons.pdf": { title: "Angels & Demons", author: "Dan Brown", description: "A thrilling mystery involving ancient secrets and modern science." },
  "01-digital-documentation-advanced.pdf": { title: "Digital Documentation Advanced", author: "Unknown", description: "Advanced digital documentation course." },
  "02-electronic-spreadsheet-advanced.pdf": { title: "Electronic Spreadsheet Advanced", author: "Unknown", description: "Advanced spreadsheet and data management course." },
  "03-database-management-system.pdf": { title: "Database Management System", author: "Unknown", description: "Comprehensive database management course." },
  "04-web-applications-and-security.pdf": { title: "Web Applications & Security", author: "Unknown", description: "Build secure web applications." },
};

export async function POST() {
  try {
    // 1. Create tables
    await initDb();

    // 2. Seed books
    const booksDir = join(process.cwd(), "public", "books");
    const results: any[] = [];

    for (const [filename, meta] of Object.entries(BOOKS_META)) {
      const filePath = join(booksDir, filename);
      try {
        const stats = statSync(filePath);
        if (stats.size === 0) { results.push({ title: meta.title, status: "empty" }); continue; }

        const slug = slugify(meta.title);
        const { rows: existing } = await query("SELECT id FROM books WHERE slug = $1", [slug]);
        if (existing.length > 0) { results.push({ title: meta.title, status: "exists" }); continue; }

        await query(
          `INSERT INTO books (title, slug, author, description, file_url, file_type, file_size, price_kes, price_usd, is_active)
           VALUES ($1, $2, $3, $4, $5, 'pdf', $6, 0, 0, true)`,
          [meta.title, slug, meta.author, meta.description, `books/${filename}`, stats.size]
        );
        results.push({ title: meta.title, status: "uploaded", size: `${(stats.size / 1048576).toFixed(1)}MB` });
      } catch (err: any) {
        results.push({ title: meta.title, status: "error", error: err.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { rows } = await query("SELECT title, slug, is_active FROM books ORDER BY created_at DESC");
    return NextResponse.json({ books: rows });
  } catch {
    return NextResponse.json({ books: [], message: "POST to /api/init to create tables and seed books" });
  }
}
