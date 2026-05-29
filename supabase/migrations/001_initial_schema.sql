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
  payment_method text NOT NULL CHECK (payment_method IN ('mpesa', 'stripe')),
  payment_ref text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_updated_at ON books;
CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('book-covers', 'book-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('book-files', 'book-files', false, 52428800, ARRAY['application/pdf', 'application/epub+zip'])
ON CONFLICT (id) DO NOTHING;

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active books" ON books;
CREATE POLICY "Anyone can view active books" ON books
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage books" ON books;
CREATE POLICY "Service role can manage books" ON books
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_active ON books(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_book_id ON orders(book_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON orders(buyer_email);
