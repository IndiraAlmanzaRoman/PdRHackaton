import { describe, expect, it } from "vitest";
import {
  isProtectedApiPath,
  isProtectedPagePath,
  isProtectedPath,
} from "../src/lib/route-access";

describe("route access rules", () => {
  it("protects the dashboard and everything below it", () => {
    expect(isProtectedPagePath("/dashboard")).toBe(true);
    expect(isProtectedPagePath("/dashboard/products")).toBe(true);
  });

  it("does not protect the login page or lookalike prefixes", () => {
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/dashboard-public")).toBe(false);
    expect(isProtectedPath("/")).toBe(false);
  });

  it("protects internal data APIs", () => {
    expect(isProtectedApiPath("/api/sales")).toBe(true);
    expect(isProtectedApiPath("/api/products/123")).toBe(true);
    expect(isProtectedApiPath("/api/tasks/reorder")).toBe(true);
  });

  it("leaves the Auth.js endpoints and lookalike API prefixes open", () => {
    expect(isProtectedApiPath("/api/auth/session")).toBe(false);
    expect(isProtectedApiPath("/api/auth/callback/google")).toBe(false);
    expect(isProtectedApiPath("/api/salesforce")).toBe(false);
  });
});
