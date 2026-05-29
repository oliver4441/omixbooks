export function formatPrice(amount: number, currency: "KES" | "USD"): string {
  if (currency === "KES") {
    return `KES ${amount.toLocaleString()}`;
  }
  return `$${(amount / 100).toFixed(2)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
