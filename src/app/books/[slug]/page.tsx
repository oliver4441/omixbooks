import { getBookBySlug } from "@/lib/books";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { formatFileSize } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";

interface Props { params: Promise<{ slug: string }>; }

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/books" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft className="w-4 h-4" />Back to Books
      </Link>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-[3/4] relative bg-gray-100 rounded-lg overflow-hidden">
          {book.cover_url ? (
            <Image src={book.cover_url} alt={book.title} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><span className="text-9xl">📖</span></div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
          <p className="text-lg text-gray-500 mt-1">by {book.author}</p>
          <div className="flex items-center gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
              <Gift className="w-4 h-4" /> Free
            </span>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="uppercase font-medium">{book.file_type}</span>
            <span>·</span>
            <span>{formatFileSize(book.file_size)}</span>
          </div>
          <div className="mt-8"><AddToCartButton book={book} /></div>
          {book.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">About this book</h2>
              <div className="text-gray-600 whitespace-pre-line leading-relaxed">{book.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
