import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";

export const metadata: Metadata = {
  title: "OmixBooks — Digital Books Store",
  description: "Buy and download digital books. Fiction, non-fiction, and technical books.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
