"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    // Simple password check — in production use proper auth
    if (password === process.env.ADMIN_PASSWORD || password === "omix2026") {
      document.cookie = "admin=true; path=/; max-age=86400";
      router.push("/admin");
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          <span className="text-2xl font-bold">OmixBooks Admin</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Enter admin password" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
            <LogIn className="w-5 h-5" />{loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
