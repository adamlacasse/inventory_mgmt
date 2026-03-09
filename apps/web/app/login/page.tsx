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
    <form onSubmit={onSubmit} className="form-stack" style={{ width: "100%" }}>
      {error ? (
        <p
          role="alert"
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            borderLeft: "4px solid #dc2626",
            color: "#b91c1c",
            fontSize: "0.875rem",
            borderRadius: "2px",
            margin: 0,
          }}
        >
          {error}
        </p>
      ) : null}

      <label className="form-label" htmlFor="login-email">
        Email
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
        />
      </label>

      <label className="form-label" htmlFor="login-password">
        Password
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="btn-brand"
        style={{ marginTop: "8px" }}
      >
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="login-wrapper">
      <div className="login-card">
        <Image
          src="/images/GeeBees_4inchRoundLabel_wBleed+copy.webp"
          alt="Organizize"
          width={120}
          height={120}
          style={{ borderRadius: "50%", objectFit: "contain" }}
          priority
        />
        <div style={{ textAlign: "center" }}>
          <h1 className="page-title" style={{ fontSize: "1.5rem" }}>
            Welcome back
          </h1>
          <p style={{ color: "rgba(28,37,44,0.5)", fontSize: "0.875rem", margin: "4px 0 0" }}>
            Sign in to your account
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
