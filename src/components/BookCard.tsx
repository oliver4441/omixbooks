import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/types";
import { formatPrice } from "@/lib/utils";

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
          <div className="flex items-center gap-2 mt-3">
            {book.price_kes > 0 && <span className="text-sm font-medium text-gray-900">{formatPrice(book.price_kes, "KES")}</span>}
            {book.price_usd > 0 && <span className="text-sm text-gray-500">· {formatPrice(book.price_usd, "USD")}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
