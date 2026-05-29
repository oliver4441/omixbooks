"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BookOpen } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); router.push("/admin"); router.refresh(); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">OmixBooks Admin</h1>
          <p className="text-gray-500 mt-1">Sign in to manage your store</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
      </div>
    </div>
  );
}
