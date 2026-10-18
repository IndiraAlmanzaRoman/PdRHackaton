import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { isE2ETestModeEnabled } from "@/lib/e2e-mode";
import { isProtectedApiPath } from "@/lib/route-access";

// Production sign-in is exclusively Google and GitHub. Credentials are read
// from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET / AUTH_GITHUB_ID / AUTH_GITHUB_SECRET.
const providers: Provider[] = [Google, GitHub];

// Test-only provider so Playwright can get a session (OAuth providers block
// automation). It is never registered unless E2E_TEST_MODE is explicitly on,
// and never on Vercel production (see `isE2ETestModeEnabled`).
if (isE2ETestModeEnabled()) {
  providers.push(
    Credentials({
      id: "e2e-test",
      name: "E2E Test",
      credentials: {
        email: { label: "Email", type: "email" },
        secret: { label: "Secret", type: "password" },
      },
      authorize(credentials) {
        const expectedSecret = process.env.E2E_TEST_SECRET;
        if (!expectedSecret || credentials.secret !== expectedSecret) {
          return null;
        }

        const email =
          typeof credentials.email === "string" && credentials.email.length > 0
            ? credentials.email
            : "e2e@pulsemarket.test";

        return { id: "e2e-test-user", name: "Usuario E2E", email };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  // Stateless JWT stored in an HttpOnly cookie (Auth.js default cookie flags).
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    // Runs in the proxy (`src/proxy.ts`) for every protected route.
    authorized({ auth: session, request }) {
      if (session?.user) {
        return true;
      }

      if (isProtectedApiPath(request.nextUrl.pathname)) {
        return Response.json({ error: "No autorizado" }, { status: 401 });
      }

      // false => redirect to pages.signIn (/login)
      return false;
    },
  },
});
