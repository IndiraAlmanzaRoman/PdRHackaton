/**
 * Single source of truth for which routes require an authenticated session.
 * The proxy matcher in `src/proxy.ts` must list the same prefixes (Next.js
 * requires the matcher to be a static literal, so it cannot import this list).
 */
const PROTECTED_PAGE_PREFIXES = ["/dashboard"] as const;
const PROTECTED_API_PREFIXES = [
  "/api/sales",
  "/api/products",
  "/api/tasks",
] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPagePath(pathname: string): boolean {
  return PROTECTED_PAGE_PREFIXES.some((prefix) =>
    matchesPrefix(pathname, prefix),
  );
}

export function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some((prefix) =>
    matchesPrefix(pathname, prefix),
  );
}

export function isProtectedPath(pathname: string): boolean {
  return isProtectedPagePath(pathname) || isProtectedApiPath(pathname);
}
