"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

export default function NewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", description: "", price_kes: "", price_usd: "", file_type: "pdf" as "pdf" | "epub" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFile) { toast.error("Please upload a book file"); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const slug = slugify(form.title);
      let coverUrl = "";
      if (coverFile) {
        const coverPath = `covers/${slug}-${Date.now()}.${coverFile.name.split(".").pop()}`;
        const { error: coverError } = await supabase.storage.from("book-covers").upload(coverPath, coverFile);
        if (coverError) throw coverError;
        const { data: { publicUrl } } = supabase.storage.from("book-covers").getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }
      const filePath = `books/${slug}-${Date.now()}.${bookFile.name.split(".").pop()}`;
      const { error: fileError } = await supabase.storage.from("book-files").upload(filePath, bookFile);
      if (fileError) throw fileError;
      const { error: dbError } = await supabase.from("books").insert({ title: form.title, slug, author: form.author, description: form.description, price_kes: parseInt(form.price_kes) || 0, price_usd: parseInt(form.price_usd) || 0, cover_url: coverUrl, file_url: filePath, file_type: form.file_type, file_size: bookFile.size });
      if (dbError) throw dbError;
      toast.success("Book uploaded successfully!"); router.push("/admin/books");
    } catch (err: any) { toast.error(err.message || "Failed to upload book"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/books" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft className="w-4 h-4" />Back to Books</Link>
      <h1 className="text-2xl font-bold mb-8">Upload New Book</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Author *</label><input type="text" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (KES) *</label><input type="number" required min="0" value={form.price_kes} onChange={(e) => setForm({ ...form, price_kes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (USD cents)</label><input type="number" min="0" value={form.price_usd} onChange={(e) => setForm({ ...form, price_usd: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="500" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">File Type</label><select value={form.file_type} onChange={(e) => setForm({ ...form, file_type: e.target.value as "pdf" | "epub" })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"><option value="pdf">PDF</option><option value="epub">EPUB</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label><input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Book File (PDF/EPUB) *</label><input type="file" accept=".pdf,.epub" required onChange={(e) => setBookFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />{bookFile && <p className="text-sm text-gray-500 mt-1">Selected: {bookFile.name} ({(bookFile.size / 1048576).toFixed(1)} MB)</p>}</div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"><Upload className="w-5 h-5" />{loading ? "Uploading..." : "Upload Book"}</button>
      </form>
    </div>
  );
}
