"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { isE2ETestModeEnabled } from "@/lib/e2e-mode";

export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signInWithGitHub(): Promise<void> {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function signInForE2E(formData: FormData): Promise<void> {
  if (!isE2ETestModeEnabled()) {
    redirect("/login?error=Configuration");
  }

  try {
    await signIn("e2e-test", {
      email: String(formData.get("email") ?? ""),
      secret: String(formData.get("secret") ?? ""),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // Failed credentials surface as an AuthError; anything else (including the
    // NEXT_REDIRECT thrown on success) must propagate untouched.
    if (error instanceof AuthError) {
      redirect(`/login?error=${error.type}`);
    }
    throw error;
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
