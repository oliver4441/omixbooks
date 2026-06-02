import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, basename } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TELEGRAM_DIR = "/home/oliver/Downloads/Telegram Desktop";

// Curated list of books to upload first
const BOOKS_TO_UPLOAD = [
  { file: "100_go_mistakes.pdf", title: "100 Go Mistakes", author: "Teiva Harsanyi", description: "Common mistakes Go developers make and how to avoid them." },
  { file: "Adam_Freeman_Pro_Angular_Build_Powerful_and_Dynamic_Web_Apps_Apress.pdf", title: "Pro Angular", author: "Adam Freeman", description: "Build powerful and dynamic web applications with Angular." },
  { file: "advanced-javascript-unleashed (2).pdf", title: "Advanced JavaScript Unleashed", author: "Unknown", description: "Deep dive into advanced JavaScript concepts and patterns." },
  { file: "advanced_concurrency_golang.pdf", title: "Advanced Concurrency in Go", author: "Unknown", description: "Master concurrent programming patterns in Go." },
  { file: "Americanah.pdf", title: "Americanah", author: "Chimamanda Ngozi Adichie", description: "A powerful story of race, identity, and love spanning three continents." },
  { file: "Angels &Demons.pdf", title: "Angels & Demons", author: "Dan Brown", description: "A thrilling mystery involving ancient secrets and modern science." },
  { file: "01-digital-documentation-advanced.pdf", title: "Digital Documentation Advanced", author: "Unknown", description: "Advanced digital documentation course." },
  { file: "02-electronic-spreadsheet-advanced.pdf", title: "Electronic Spreadsheet Advanced", author: "Unknown", description: "Advanced spreadsheet and data management course." },
  { file: "03-database-management-system.pdf", title: "Database Management System", author: "Unknown", description: "Comprehensive database management course." },
  { file: "04-web-applications-and-security.pdf", title: "Web Applications & Security", author: "Unknown", description: "Build secure web applications." },
];

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").trim();
}

async function uploadBook(book) {
  const filePath = join(TELEGRAM_DIR, book.file);
  
  try {
    const stats = statSync(filePath);
    if (stats.size === 0) {
      console.log(`⏭️ Skipping "${book.title}" (empty file)`);
      return;
    }

    const slug = slugify(book.title);
    const fileBuffer = readFileSync(filePath);
    const fileName = `books/${slug}-${Date.now()}.pdf`;

    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("book-files")
      .upload(fileName, fileBuffer, { contentType: "application/pdf" });

    if (uploadError) {
      // If bucket doesn't exist or RLS issue, try service role
      if (uploadError.message?.includes("row-level security") || uploadError.message?.includes("not found")) {
        console.log(`⚠️ Storage issue for "${book.title}": ${uploadError.message}`);
      } else {
        throw uploadError;
      }
    }

    // Insert book record
    const { data, error: dbError } = await supabase.from("books").insert({
      title: book.title,
      slug,
      author: book.author,
      description: book.description,
      price_kes: 0,
      price_usd: 0,
      cover_url: "",
      file_url: fileName,
      file_type: "pdf",
      file_size: stats.size,
      is_active: true,
    }).select().single();

    if (dbError) {
      if (dbError.message?.includes("duplicate")) {
        console.log(`⏭️ "${book.title}" already exists`);
        return;
      }
      throw dbError;
    }

    console.log(`✅ Uploaded: "${book.title}" by ${book.author} (${(stats.size / 1048576).toFixed(1)} MB)`);
  } catch (err) {
    console.error(`❌ Failed "${book.title}":`, err.message);
  }
}

async function main() {
  console.log(`Uploading ${BOOKS_TO_UPLOAD.length} books to OmixBooks...\n`);
  
  for (const book of BOOKS_TO_UPLOAD) {
    await uploadBook(book);
  }

  console.log("\nDone!");
}

main();
