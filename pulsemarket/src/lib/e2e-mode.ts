const MIN_SECRET_LENGTH = 16;

type EnvLike = Readonly<Record<string, string | undefined>>;

/**
 * The E2E test login exists only so Playwright can obtain a session: Google
 * and GitHub block automated logins (CAPTCHA, 2FA). It must never be reachable
 * in production, so it requires an explicit flag, a long shared secret, and it
 * is always off on the Vercel production environment.
 */
export function isE2ETestModeEnabled(env: EnvLike = process.env): boolean {
  if (env.E2E_TEST_MODE !== "true") {
    return false;
  }

  if (env.VERCEL_ENV === "production") {
    return false;
  }

  const secret = env.E2E_TEST_SECRET;
  return typeof secret === "string" && secret.length >= MIN_SECRET_LENGTH;
}
