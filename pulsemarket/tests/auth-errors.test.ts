import { describe, expect, it } from "vitest";
import { getLoginErrorMessage } from "../src/lib/auth-errors";

describe("getLoginErrorMessage", () => {
  it("returns null when there is no error code", () => {
    expect(getLoginErrorMessage(undefined)).toBeNull();
    expect(getLoginErrorMessage("")).toBeNull();
  });

  it("returns a specific message for known Auth.js error codes", () => {
    expect(getLoginErrorMessage("CredentialsSignin")).toContain("Credenciales");
    expect(getLoginErrorMessage("AccessDenied")).toContain("Acceso denegado");
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(getLoginErrorMessage("SomethingNew")).toBe(
      "No se pudo iniciar sesión. Inténtalo de nuevo.",
    );
  });

  it("does not leak object prototype properties as messages", () => {
    expect(getLoginErrorMessage("constructor")).toBe(
      "No se pudo iniciar sesión. Inténtalo de nuevo.",
    );
  });
});
