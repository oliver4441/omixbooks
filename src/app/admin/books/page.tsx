import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Book } from "@/types";

export default async function AdminBooksPage() {
  const supabase = await createClient();
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Books</h1>
        <Link
          href="/admin/books/new"
          className="flex items-center gap-2 bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          Add Book
        </Link>
      </div>

      {books && books.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50">
                <th className="px-6 py-3">Book</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Added</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(books as Book[]).map((book) => (
                <tr key={book.id} className="border-t">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {book.cover_url ? (
                          <Image
                            src={book.cover_url}
                            alt={book.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">
                            📖
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-gray-500 text-xs">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {book.price_kes > 0 && (
                      <div>{formatPrice(book.price_kes, "KES")}</div>
                    )}
                    {book.price_usd > 0 && (
                      <div className="text-gray-500">
                        {formatPrice(book.price_usd, "USD")}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {book.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(book.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No books yet.</p>
          <Link
            href="/admin/books/new"
            className="text-emerald-600 font-medium hover:underline"
          >
            Upload your first book →
          </Link>
        </div>
      )}
    </div>
  );
}
