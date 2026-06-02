import { getActiveBooks } from "@/lib/books";
import BookCard from "@/components/BookCard";

export default async function BooksPage() {
  const books = await getActiveBooks();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">All Books</h1>
      <p className="text-gray-500 mb-8">Browse our collection of digital books.</p>
      {books && books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500"><p className="text-lg">No books available yet.</p></div>
      )}
    </div>
  );
}
