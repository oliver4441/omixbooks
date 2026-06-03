export const dynamic = "force-dynamic";

import { getActiveBooks } from "@/lib/books";
import { isDbConfigured } from "@/lib/db";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { BookOpen, Gift, Database } from "lucide-react";

export default async function Home() {
  let books: any[] = [];
  let dbOk = false;

  try {
    dbOk = await isDbConfigured();
    if (dbOk) {
      books = await getActiveBooks();
    }
  } catch {
    dbOk = false;
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-5xl font-bold mb-4">OmixBooks</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-4">
            Your digital bookstore. Discover and download books instantly.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <Gift className="w-5 h-5" />
            <span className="font-medium">All books are currently free!</span>
          </div>
          <div>
            <Link href="/books" className="inline-block bg-white text-emerald-700 font-semibold px-8 py-3 rounded-lg hover:bg-emerald-50 transition-colors">
              Browse Books
            </Link>
          </div>
        </div>
      </section>

      {!dbOk && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-4">
            <Database className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-semibold text-amber-800 mb-1">Database not configured</h2>
              <p className="text-sm text-amber-600 mb-3">
                The database connection is not set up yet. Books will appear here once the database is connected and initialized.
              </p>
              <Link href="/admin" className="text-sm font-medium text-amber-700 hover:underline">
                Go to Admin Dashboard →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">Latest Books</h2>
        {books && books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No books yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
