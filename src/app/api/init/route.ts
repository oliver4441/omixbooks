import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { query } from "@/lib/db";
import { readdirSync, statSync } from "fs";
import { join } from "path";

interface BookMeta {
  title: string;
  author: string;
  description: string;
}

const BOOKS_META: Record<string, BookMeta> = {
  // === Programming & Tech ===
  "100_go_mistakes.pdf": {
    title: "100 Go Mistakes",
    author: "Teiva Harsanyi",
    description: "Common mistakes Go developers make and how to avoid them.",
  },
  "advanced-javascript-unleashed (2).pdf": {
    title: "Advanced JavaScript Unleashed",
    author: "Unknown",
    description: "Deep dive into advanced JavaScript concepts, patterns, and techniques.",
  },
  "Cracking_the_Coding_Interview_6th_Edition_189_Programming_Questions.pdf": {
    title: "Cracking the Coding Interview (6th Ed)",
    author: "Gayle Laakmann McDowell",
    description: "189 programming questions and solutions for technical interview prep.",
  },
  "Django.5.Cookbook (2).pdf": {
    title: "Django 5 Cookbook",
    author: "Unknown",
    description: "Practical recipes for building web applications with Django 5.",
  },
  "Jeremy_Wilken_Angular_in_Action_Manning_Publications_2018.pdf": {
    title: "Angular in Action",
    author: "Jeremy Wilken",
    description: "A hands-on guide to building Angular applications from scratch.",
  },
  "Manning.React.in.Depth (3).pdf": {
    title: "React in Depth",
    author: "Unknown",
    description: "Master React from fundamentals to advanced patterns including hooks and context.",
  },
  "Python Tutorial .pdf": {
    title: "Python Tutorial",
    author: "Unknown",
    description: "Learn Python programming from basics to advanced topics.",
  },
  "Zhamak_Dehghani_Data_Mesh_Delivering_Data_Driven_Value_at_Scale.pdf": {
    title: "Data Mesh",
    author: "Zhamak Dehghani",
    description: "Delivering data-driven value at scale — a paradigm shift in data architecture.",
  },
  "John_Z_Sonmez_Soft_Skills__The_software.pdf": {
    title: "Soft Skills: The Software Developer's Life Manual",
    author: "John Sonmez",
    description: "Personal branding, career development, fitness, and finance for developers.",
  },
  "Master_Java_in_7_Days_Build_Powerful_Applications_from_Scratch_Jain.epub": {
    title: "Master Java in 7 Days",
    author: "Unknown",
    description: "Fast-track Java learning — build powerful applications from scratch.",
  },
  "The_C_Type_System_Build_Robust,_Performant,_and_Efficient_Programs (2).epub": {
    title: "The C Type System",
    author: "Unknown",
    description: "Build robust, performant and efficient programs by mastering C types.",
  },

  // === Fiction & Self-Help ===
  "Americanah.pdf": {
    title: "Americanah",
    author: "Chimamanda Ngozi Adichie",
    description: "A powerful story of race, identity, and love spanning three continents.",
  },
  "Book Lovers (Emily Henry).pdf": {
    title: "Book Lovers",
    author: "Emily Henry",
    description: "A romantic comedy about a literary agent and an editor crossing paths.",
  },
  "dan_brown_-_origin.pdf": {
    title: "Origin",
    author: "Dan Brown",
    description: "Robert Langdon races to uncover a shocking discovery that will change the world.",
  },
  "Love_Theoretically_-_Ali_Hazelwood.pdf": {
    title: "Love, Theoretically",
    author: "Ali Hazelwood",
    description: "A physicist finds herself caught between love and rivalry in academia.",
  },
  "one-hundred-years-of-solitude.pdf": {
    title: "One Hundred Years of Solitude",
    author: "Gabriel García Márquez",
    description: "The magical realist masterpiece following the Buendía family through generations.",
  },
  "The Midnight Library (Matt Haig).pdf": {
    title: "The Midnight Library",
    author: "Matt Haig",
    description: "Between life and death there is a library — and the books are lives you could have lived.",
  },
  "The Three Musketeers.pdf": {
    title: "The Three Musketeers",
    author: "Alexandre Dumas",
    description: "All for one and one for all — the classic tale of d'Artagnan and the musketeers.",
  },
  "The_7_habits_of_highly_effective_people_restoring_the_character.pdf": {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    description: "A powerful lesson in personal change — the timeless guide to effectiveness.",
  },
};

// WeakMap to track which extra files have been auto-seeded
const autoSeeded = new WeakSet<object>();

export async function POST() {
  try {
    await initDb();

    const booksDir = join(process.cwd(), "public", "books");
    const results: Array<{ title: string; status: string; size?: string }> = [];
    let uploaded = 0;
    let skipped = 0;
    let errors = 0;

    for (const [filename, meta] of Object.entries(BOOKS_META)) {
      const filePath = join(booksDir, filename);
      try {
        const stats = statSync(filePath);
        if (stats.size === 0) {
          results.push({ title: meta.title, status: "empty" });
          skipped++;
          continue;
        }

        const slug = meta.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        const { rows: existing } = await query("SELECT id FROM books WHERE slug = $1", [slug]);
        if (existing.length > 0) {
          results.push({ title: meta.title, status: "already_exists" });
          skipped++;
          continue;
        }

        await query(
          `INSERT INTO books (title, slug, author, description, file_url, file_type, file_size, price_kes, price_usd, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, true)`,
          [
            meta.title,
            slug,
            meta.author,
            meta.description,
            `books/${filename}`,
            filename.endsWith(".epub") ? "epub" : "pdf",
            stats.size,
          ]
        );
        results.push({ title: meta.title, status: "uploaded", size: `${(stats.size / 1048576).toFixed(1)}MB` });
        uploaded++;
      } catch (err: any) {
        results.push({ title: meta.title, status: "error", size: err.message });
        errors++;
      }
    }

    // Auto-seed any unrecognized files in public/books/
    const dirFiles = readdirSync(booksDir);
    for (const file of dirFiles) {
      if (!BOOKS_META[file]) {
        const filePath = join(booksDir, file);
        try {
          const stats = statSync(filePath);
          if (stats.size === 0) continue;

          const ext = (file.split(".").pop() || "pdf").toLowerCase();
          if (!["pdf", "epub"].includes(ext)) continue;

          const baseName = file.replace(/\.\w+$/, "").replace(/[_-]/g, " ").trim();
          const slug = baseName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s]+/g, "-");

          const { rows: existing } = await query("SELECT id FROM books WHERE slug = $1", [slug]);
          if (existing.length > 0) continue;

          await query(
            `INSERT INTO books (title, slug, author, description, file_url, file_type, file_size, price_kes, price_usd, is_active)
             VALUES ($1, $2, 'Unknown', 'Available for free download.', $3, $4, $5, 0, 0, true)`,
            [baseName, slug, `books/${file}`, ext, stats.size]
          );
          results.push({ title: baseName, status: "auto_uploaded", size: `${(stats.size / 1048576).toFixed(1)}MB` });
          uploaded++;
        } catch {
          // skip files that fail
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: { uploaded, skipped, errors },
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { rows } = await query(
      "SELECT id, title, slug, author, file_type, file_size FROM books WHERE is_active = true ORDER BY created_at DESC"
    );
    return NextResponse.json({ count: rows.length, books: rows });
  } catch {
    return NextResponse.json({
      books: [],
      message: "POST to /api/init to create tables and seed books",
    });
  }
}
