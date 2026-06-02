import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/books/
    const uploadDir = join(process.cwd(), "public", "books");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const ext = file.name.split(".").pop() || "pdf";
    const fileName = `${nanoid(12)}.${ext}`;
    const filePath = join(uploadDir, fileName);

    writeFileSync(filePath, buffer);

    return NextResponse.json({
      path: `books/${fileName}`,
      size: buffer.length,
      name: file.name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
