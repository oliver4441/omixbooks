import { getActiveBooks } from "@/lib/books";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { BookOpen, Gift } from "lucide-react";

export default async function Home() {
  const books = await getActiveBooks();

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
