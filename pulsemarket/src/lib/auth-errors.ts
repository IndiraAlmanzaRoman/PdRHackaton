const DEFAULT_MESSAGE = "No se pudo iniciar sesión. Inténtalo de nuevo.";

const LOGIN_ERROR_MESSAGES = new Map<string, string>([
  [
    "CredentialsSignin",
    "Credenciales inválidas. Verifica los datos e inténtalo de nuevo.",
  ],
  [
    "AccessDenied",
    "Acceso denegado. Tu cuenta no tiene permiso para entrar a PulseMarket.",
  ],
  [
    "OAuthAccountNotLinked",
    "Este correo ya está asociado a otro proveedor. Inicia sesión con el proveedor que usaste originalmente.",
  ],
  [
    "Configuration",
    "Hay un problema de configuración en el servidor de autenticación.",
  ],
]);

/**
 * Maps an Auth.js error code (from the `?error=` query parameter) to a
 * user-facing message. Returns `null` when there is no error to show.
 */
export function getLoginErrorMessage(code: string | undefined): string | null {
  if (!code) {
    return null;
  }

  return LOGIN_ERROR_MESSAGES.get(code) ?? DEFAULT_MESSAGE;
}
