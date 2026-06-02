import { Pool } from "pg";

// Render PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export { pool };

// Helper to run queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("Query executed", { text: text.substring(0, 50), duration, rows: res.rowCount });
  return res;
}

// Initialize database tables
export async function initDb() {
  await query(`
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
      file_type text NOT NULL DEFAULT 'pdf',
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
      currency text NOT NULL DEFAULT 'KES',
      payment_method text NOT NULL DEFAULT 'free',
      payment_ref text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'completed',
      download_count integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
    CREATE INDEX IF NOT EXISTS idx_books_active ON books(is_active);
    CREATE INDEX IF NOT EXISTS idx_orders_book_id ON orders(book_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON orders(buyer_email);
  `);
  console.log("Database tables initialized");
}
