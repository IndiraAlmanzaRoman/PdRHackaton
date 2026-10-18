import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLoginErrorMessage } from "@/lib/auth-errors";
import { isE2ETestModeEnabled } from "@/lib/e2e-mode";
import { signInForE2E, signInWithGitHub, signInWithGoogle } from "./actions";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <section className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          PulseMarket
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Inicia sesión para acceder al panel de analítica.
        </p>

        {/* Reading searchParams and the session is request-time data, so it
            must live inside Suspense when cacheComponents is enabled. */}
        <Suspense fallback={<LoginSkeleton />}>
          <LoginOptions searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

async function LoginOptions({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const rawError = params.error;
  const errorCode = Array.isArray(rawError) ? rawError[0] : rawError;
  const errorMessage = getLoginErrorMessage(errorCode);
  const showE2EForm = isE2ETestModeEnabled();

  return (
    <div className="mt-6 flex flex-col gap-3">
      {errorMessage ? (
        <p
          role="alert"
          data-testid="login-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {errorMessage}
        </p>
      ) : null}

      <form action={signInWithGoogle}>
        <button
          type="submit"
          data-testid="login-google"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
        >
          Continuar con Google
        </button>
      </form>

      <form action={signInWithGitHub}>
        <button
          type="submit"
          data-testid="login-github"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Continuar con GitHub
        </button>
      </form>

      {showE2EForm ? (
        <form
          action={signInForE2E}
          data-testid="e2e-login-form"
          className="mt-4 flex flex-col gap-2 border-t border-dashed border-zinc-300 pt-4 dark:border-zinc-700"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Solo pruebas automatizadas
          </p>
          <input
            name="email"
            type="email"
            defaultValue="e2e@pulsemarket.test"
            aria-label="Correo de prueba"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            name="secret"
            type="password"
            placeholder="Secreto de prueba"
            aria-label="Secreto de prueba"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            data-testid="login-e2e"
            className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950"
          >
            Entrar (pruebas)
          </button>
        </form>
      ) : null}
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="mt-6 flex animate-pulse flex-col gap-3" aria-hidden="true">
      <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
