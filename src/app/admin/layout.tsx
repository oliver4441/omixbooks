import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, Package, ShoppingCart, LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const handleLogout = async () => { "use server"; const supabase = await createClient(); await supabase.auth.signOut(); redirect("/admin/login"); };
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-sm p-6 flex flex-col">
        <Link href="/admin" className="flex items-center gap-2 mb-8"><BookOpen className="w-8 h-8 text-emerald-600" /><span className="text-xl font-bold">OmixBooks</span></Link>
        <nav className="space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"><Package className="w-5 h-5" />Dashboard</Link>
          <Link href="/admin/books" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"><BookOpen className="w-5 h-5" />Books</Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"><ShoppingCart className="w-5 h-5" />Orders</Link>
        </nav>
        <form action={handleLogout} className="mt-auto pt-8"><button type="submit" className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-gray-700 w-full"><LogOut className="w-5 h-5" />Sign Out</button></form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
