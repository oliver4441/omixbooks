import Link from "next/link";
import { BookOpen, Package, ShoppingCart } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-sm p-6 flex flex-col">
        <Link href="/admin" className="flex items-center gap-2 mb-8">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          <span className="text-xl font-bold">OmixBooks</span>
        </Link>
        <nav className="space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <Package className="w-5 h-5" />Dashboard
          </Link>
          <Link href="/admin/books" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <BookOpen className="w-5 h-5" />Books
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <ShoppingCart className="w-5 h-5" />Orders
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
