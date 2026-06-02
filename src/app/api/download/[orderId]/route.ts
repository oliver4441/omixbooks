import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/books";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order || order.status !== "completed") {
    return NextResponse.json({ error: "Order not found or not completed" }, { status: 404 });
  }

  if (order.download_count >= 3) {
    return NextResponse.json({ error: "Download limit reached" }, { status: 403 });
  }

  // File is stored locally in public/books/
  const filePath = join(process.cwd(), "public", order.book?.file_url || "");

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = readFileSync(filePath);
  const fileName = `${order.book?.title || "book"}.pdf`;

  // Increment download count
  const { query } = await import("@/lib/db");
  await query("UPDATE orders SET download_count = download_count + 1 WHERE id = $1", [orderId]);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}
