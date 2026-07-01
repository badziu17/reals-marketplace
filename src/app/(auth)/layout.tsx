import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-canvas px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-3">
        <span className="font-display text-2xl font-extrabold tracking-heading text-terracotta">
          REALS
        </span>
        <span className="rounded-pill border border-line bg-chip-warm px-2 py-0.5 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-secondary">
          Trójmiasto
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-card bg-card p-8 shadow-card">{children}</div>
    </div>
  );
}
