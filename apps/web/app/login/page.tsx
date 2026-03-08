"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: { message: string } };

      if (!response.ok) {
        setError(payload.error?.message ?? "Login failed.");
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl") ?? "/";
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
      {error ? (
        <p
          role="alert"
          className="px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-sm"
        >
          {error}
        </p>
      ) : null}

      <label
        className="flex flex-col gap-1.5 text-sm font-semibold tracking-wide"
        htmlFor="login-email"
      >
        Email
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-charcoal/20 bg-white px-3 py-2.5 text-base font-serif text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-charcoal focus:ring-1 focus:ring-charcoal/30 rounded-sm transition-colors"
        />
      </label>

      <label
        className="flex flex-col gap-1.5 text-sm font-semibold tracking-wide"
        htmlFor="login-password"
      >
        Password
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-charcoal/20 bg-white px-3 py-2.5 text-base font-serif text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-charcoal focus:ring-1 focus:ring-charcoal/30 rounded-sm transition-colors"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-charcoal text-amber font-bold tracking-widest uppercase text-sm py-3 px-6 hover:bg-amber hover:text-charcoal transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer rounded-sm"
      >
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100svh-4rem)] -my-8 py-12">
      <div className="bg-white shadow-md border border-charcoal/10 rounded-sm p-10 w-full max-w-sm flex flex-col items-center gap-6">
        <Image
          src="/images/GeeBees_4inchRoundLabel_wBleed+copy.webp"
          alt="Organizize"
          width={120}
          height={120}
          className="rounded-full object-contain"
          priority
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wide text-charcoal m-0">Welcome back</h1>
          <p className="text-charcoal/50 text-sm mt-1 m-0">Sign in to your account</p>
        </div>
        <div className="w-full">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
