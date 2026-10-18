import { describe, expect, it } from "vitest";
import { isE2ETestModeEnabled } from "../src/lib/e2e-mode";

const LONG_SECRET = "a-very-long-test-secret";

describe("isE2ETestModeEnabled", () => {
  it("is enabled only with the flag and a long enough secret", () => {
    expect(
      isE2ETestModeEnabled({
        E2E_TEST_MODE: "true",
        E2E_TEST_SECRET: LONG_SECRET,
      }),
    ).toBe(true);
  });

  it("is disabled when the flag is missing or not exactly 'true'", () => {
    expect(isE2ETestModeEnabled({ E2E_TEST_SECRET: LONG_SECRET })).toBe(false);
    expect(
      isE2ETestModeEnabled({
        E2E_TEST_MODE: "1",
        E2E_TEST_SECRET: LONG_SECRET,
      }),
    ).toBe(false);
  });

  it("is disabled when the secret is missing or too short", () => {
    expect(isE2ETestModeEnabled({ E2E_TEST_MODE: "true" })).toBe(false);
    expect(
      isE2ETestModeEnabled({ E2E_TEST_MODE: "true", E2E_TEST_SECRET: "short" }),
    ).toBe(false);
  });

  it("is always disabled on the Vercel production environment", () => {
    expect(
      isE2ETestModeEnabled({
        E2E_TEST_MODE: "true",
        E2E_TEST_SECRET: LONG_SECRET,
        VERCEL_ENV: "production",
      }),
    ).toBe(false);
  });
});
