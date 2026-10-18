// Next.js 16 renamed "middleware" to "proxy". This is the security middleware
// that gates the dashboard and the internal APIs behind a valid session.
// The `authorized` callback in `src/auth.ts` decides what happens to
// unauthenticated requests (redirect to /login for pages, 401 for APIs).
export { auth as proxy } from "@/auth";

// The matcher must be a static literal. Keep it in sync with
// `src/lib/route-access.ts`.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/sales/:path*",
    "/api/products/:path*",
    "/api/tasks/:path*",
  ],
};
