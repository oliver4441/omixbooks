import { type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Admin route protection — simple cookie check
  // For now, no auth middleware (admin pages handle their own auth)
}

export const config = {
  matcher: ["/admin/:path*"],
};
