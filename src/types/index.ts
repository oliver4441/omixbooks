export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  price_kes: number;
  price_usd: number;
  cover_url: string;
  file_url: string;
  file_type: "pdf" | "epub";
  file_size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  book_id: string;
  buyer_email: string;
  buyer_name: string;
  amount: number;
  currency: "KES" | "USD";
  payment_method: "free";
  payment_ref: string;
  status: "pending" | "completed" | "failed";
  download_count: number;
  created_at: string;
  book?: Book;
}

export interface CartItem {
  book: Book;
  quantity: number;
}
