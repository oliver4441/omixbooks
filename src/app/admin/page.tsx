import { query } from "@/lib/db";

export default async function AdminPage() {
  let bookCount = 0;
  let orderCount = 0;
  let dbStatus = "unknown";

  try {
    const { rows: books } = await query("SELECT COUNT(*) as count FROM books");
    const { rows: orders } = await query("SELECT COUNT(*) as count FROM orders");
    bookCount = parseInt(books[0]?.count || "0");
    orderCount = parseInt(orders[0]?.count || "0");
    dbStatus = "connected";
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Books</p>
          <p className="text-3xl font-bold text-emerald-600">{bookCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-blue-600">{orderCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500">Database</p>
          <p className={`text-lg font-semibold ${dbStatus === "connected" ? "text-emerald-600" : "text-red-600"}`}>
            {dbStatus === "connected" ? "✅ Connected" : dbStatus}
          </p>
        </div>
      </div>

      {bookCount === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h2 className="font-semibold text-emerald-800 mb-2">First time setup</h2>
          <p className="text-sm text-emerald-600 mb-4">Click below to create database tables and upload the initial books.</p>
          <button
            onClick={async () => {
              const res = await fetch("/api/init", { method: "POST" });
              const data = await res.json();
              alert(JSON.stringify(data, null, 2));
              window.location.reload();
            }}
            className="bg-emerald-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-emerald-700"
          >
            Initialize Database & Upload Books
          </button>
        </div>
      )}
    </div>
  );
}
