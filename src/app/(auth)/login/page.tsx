"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Nieprawidłowy email lub hasło.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-bold tracking-heading text-ink">
        Zaloguj się
      </h1>
      <p className="mb-6 text-sm text-ink-muted">
        Nie masz konta?{" "}
        <Link href="/register" className="font-semibold text-terracotta hover:text-terracotta-hover">
          Zarejestruj się
        </Link>
      </p>

      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="mb-4 flex w-full items-center justify-center gap-3 rounded-pill border border-line bg-card py-3 text-sm font-semibold text-ink transition hover:border-terracotta hover:text-terracotta disabled:opacity-60"
      >
        <GoogleIcon />
        Kontynuuj z Google
      </button>

      {/* Divider */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-ink-placeholder">lub emailem</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Credentials form */}
      <form onSubmit={handleCredentials} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink-secondary">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jan@example.com"
            className="rounded-md border border-line bg-bg-app px-4 py-2.5 text-sm text-ink placeholder:text-ink-placeholder focus:border-terracotta focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink-secondary">Hasło</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-md border border-line bg-bg-app px-4 py-2.5 text-sm text-ink placeholder:text-ink-placeholder focus:border-terracotta focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-md bg-chip-terracotta px-3 py-2 text-sm text-terracotta-dark">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-pill bg-terracotta py-3 text-sm font-semibold text-white transition hover:bg-terracotta-hover disabled:opacity-60"
        >
          {loading ? "Logowanie…" : "Zaloguj się"}
        </button>
      </form>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
