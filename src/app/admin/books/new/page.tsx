"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

export default function NewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", description: "", file_type: "pdf" as "pdf" | "epub" });
  const [bookFile, setBookFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFile) { toast.error("Please upload a book file"); return; }
    setLoading(true);
    try {
      // Upload file to our API
      const formData = new FormData();
      formData.append("file", bookFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      // Create book record via API
      const createRes = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: slugify(form.title),
          author: form.author,
          description: form.description,
          file_url: uploadData.path,
          file_type: form.file_type,
          file_size: bookFile.size,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create book");

      toast.success("Book uploaded successfully!");
      router.push("/admin/books");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/books" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4-4" /> Back to Books
      </Link>
      <h1 className="text-2xl font-bold mb-8">Upload New Book</h1>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 mb-6">
        💡 All books are currently free. Prices are set to 0 by default.
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
          <input type="text" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
          <select value={form.file_type} onChange={(e) => setForm({ ...form, file_type: e.target.value as "pdf" | "epub" })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
            <option value="pdf">PDF</option>
            <option value="epub">EPUB</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Book File (PDF/EPUB) *</label>
          <input type="file" accept=".pdf,.epub" required onChange={(e) => setBookFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          {bookFile && <p className="text-sm text-gray-500 mt-1">Selected: {bookFile.name} ({(bookFile.size / 1048576).toFixed(1)} MB)</p>}
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
          <Upload className="w-5 h-5" />{loading ? "Uploading..." : "Upload Book"}
        </button>
      </form>
    </div>
  );
}
