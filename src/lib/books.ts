import { query } from "./db";
import type { Book, Order } from "@/types";

// ── Books ──

export async function getActiveBooks(): Promise<Book[]> {
  const { rows } = await query(
    "SELECT * FROM books WHERE is_active = true ORDER BY created_at DESC"
  );
  return rows.map((row: any) => rowToBook(row));
}

export async function getAllBooks(): Promise<Book[]> {
  const { rows } = await query(
    "SELECT * FROM books ORDER BY created_at DESC"
  );
  return rows.map((row: any) => rowToBook(row));
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const { rows } = await query(
    "SELECT * FROM books WHERE slug = $1 AND is_active = true",
    [slug]
  );
  return rows[0] ? rowToBook(rows[0]) : null;
}

export async function createBook(data: {
  title: string;
  slug: string;
  author: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  cover_url?: string;
  price_kes?: number;
  price_usd?: number;
}): Promise<Book> {
  const { rows } = await query(
    `INSERT INTO books (title, slug, author, description, file_url, file_type, file_size, cover_url, price_kes, price_usd)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [data.title, data.slug, data.author, data.description, data.file_url, data.file_type, data.file_size, data.cover_url || "", data.price_kes || 0, data.price_usd || 0]
  );
  return rowToBook(rows[0]);
}

// ── Orders ──

export async function createOrder(data: {
  book_id: string;
  buyer_email: string;
  buyer_name: string;
  payment_method?: string;
}): Promise<Order> {
  const { rows } = await query(
    `INSERT INTO orders (book_id, buyer_email, buyer_name, payment_method, status, amount, currency)
     VALUES ($1, $2, $3, $4, 'completed', 0, 'KES')
     RETURNING *`,
    [data.book_id, data.buyer_email, data.buyer_name, data.payment_method || "free"]
  );
  return rowToOrder(rows[0]);
}

export async function getOrderById(id: string): Promise<(Order & { book?: Book }) | null> {
  const { rows } = await query(
    `SELECT o.*, b.title as book_title, b.author as book_author, b.file_url as book_file_url, b.file_type as book_file_type
     FROM orders o
     LEFT JOIN books b ON o.book_id = b.id
     WHERE o.id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  return {
    ...rowToOrder(rows[0]),
    book: rows[0].book_title ? {
      id: rows[0].book_id,
      title: rows[0].book_title,
      author: rows[0].book_author,
      file_url: rows[0].book_file_url,
      file_type: rows[0].book_file_type,
    } as any : undefined,
  };
}

export async function getOrdersWithBooks(): Promise<(Order & { book?: Book })[]> {
  const { rows } = await query(
    `SELECT o.*, b.title as book_title, b.author as book_author
     FROM orders o
     LEFT JOIN books b ON o.book_id = b.id
     ORDER BY o.created_at DESC`
  );
  return rows.map((row: any) => ({
    ...rowToOrder(row),
    book: row.book_title ? { title: row.book_title, author: row.book_author } as any : undefined,
  }));
}

// ── Helpers ──

function rowToBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    author: row.author,
    description: row.description,
    price_kes: row.price_kes,
    price_usd: row.price_usd,
    cover_url: row.cover_url,
    file_url: row.file_url,
    file_type: row.file_type,
    file_size: row.file_size,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    book_id: row.book_id,
    buyer_email: row.buyer_email,
    buyer_name: row.buyer_name,
    amount: row.amount,
    currency: row.currency,
    payment_method: row.payment_method,
    payment_ref: row.payment_ref,
    status: row.status,
    download_count: row.download_count,
    created_at: row.created_at,
  };
}
