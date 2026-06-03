import { NextRequest, NextResponse } from "next/server";
import { createBook, getAllBooks, getActiveBooks } from "@/lib/books";
import { z } from "zod";

const bookSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  author: z.string().default("Unknown"),
  description: z.string().default(""),
  file_url: z.string().min(1),
  file_type: z.enum(["pdf", "epub"]).default("pdf"),
  file_size: z.number().int().min(0).default(0),
  cover_url: z.string().default(""),
  price_kes: z.number().int().min(0).default(0),
  price_usd: z.number().int().min(0).default(0),
});

export async function GET() {
  try {
    const books = await getActiveBooks();
    return NextResponse.json({ books });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = bookSchema.parse(body);
    const book = await createBook(data);
    return NextResponse.json({ book }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
