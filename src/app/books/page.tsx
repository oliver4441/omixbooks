export const dynamic = "force-dynamic";

import { getActiveBooks } from "@/lib/books";
import { isDbConfigured } from "@/lib/db";
import BookCard from "@/components/BookCard";

export default async function BooksPage() {
  let books: any[] = [];
  try {
    if (await isDbConfigured()) {
      books = await getActiveBooks();
    }
  } catch {
    // DB not ready
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Books</h1>
        <p className="text-gray-500">{books.length} books available — all free to download.</p>
      </div>
      {books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No books available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
