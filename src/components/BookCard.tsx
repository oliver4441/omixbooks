import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/types";
import { Gift } from "lucide-react";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.slug}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="aspect-[3/4] relative bg-gray-100">
          {book.cover_url ? (
            <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><span className="text-6xl">📖</span></div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{book.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{book.author}</p>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
              <Gift className="w-3.5 h-3.5" /> Free
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
