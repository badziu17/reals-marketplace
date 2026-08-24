"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useDevice } from "@/lib/useDevice";
import {
  IconHeart,
  IconMessage,
  IconMonitor,
  IconSmartphone,
  IconUser,
  IconSettings,
  IconLogOut,
  IconMenu,
  IconX,
} from "@/components/ui/icons";

const UNREAD_POLL_MS = 10_000;

const NAV_LINKS = [
  { href: "/", label: "Odkrywaj" },
  { href: "/search", label: "Szukaj" },
  { href: "/sell", label: "Sprzedaj" },
  { href: "/business", label: "Dla biznesu" },
  { href: "/messages", label: "Wiadomości" },
];

export function Chrome() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { device, toggle, mounted } = useDevice();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Liczba nieprzeczytanych wiadomości (iteracja 13) — sumowana z
  // /api/conversations, odpytywana lekko rzadziej niż na samej stronie
  // /messages, bo tu to tylko odznaka w headerze.
  const [unreadMessages, setUnreadMessages] = useState(0);
  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    function poll() {
      fetch("/api/conversations")
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          type ConvSummary = { unreadCount: number };
          const total = (d.conversations ?? []).reduce(
            (sum: number, c: ConvSummary) => sum + c.unreadCount,
            0
          );
          setUnreadMessages(total);
        })
        .catch(() => {});
    }
    poll();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") poll();
    }, UNREAD_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session?.user]);

  // Aktywna trasa — "/" tylko dokładne dopasowanie, reszta prefix
  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="chrome-header px-[22px] py-[13px]">
      <div className="mx-auto flex max-w-7xl items-center gap-[18px]">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="font-display text-2xl font-extrabold tracking-heading text-terracotta">
            REALS
          </span>
          <span className="rounded-pill border border-line bg-chip-warm px-2 py-0.5 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-secondary">
            Trójmiasto
          </span>
        </Link>

        {/* Nav — desktop */}
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-pill px-3 py-1.5 text-sm font-semibold transition ${
                isActive(link.href)
                  ? "bg-chip-warm text-ink"
                  : "text-ink-secondary hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">

          {/* Device toggle — desktop only */}
          {mounted && (
            <div className="hidden items-center rounded-pill bg-chip-warm p-1 md:flex">
              <button
                onClick={() => toggle("desktop")}
                title="Widok desktop"
                aria-label="Przełącz na widok desktop"
                aria-pressed={device === "desktop"}
                className={`flex h-8 w-8 items-center justify-center rounded-pill transition ${
                  device === "desktop"
                    ? "bg-card shadow-sm text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <IconMonitor />
              </button>
              <button
                onClick={() => toggle("mobile")}
                title="Widok telefon"
                aria-label="Przełącz na widok telefon"
                aria-pressed={device === "mobile"}
                className={`flex h-8 w-8 items-center justify-center rounded-pill transition ${
                  device === "mobile"
                    ? "bg-card shadow-sm text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <IconSmartphone />
              </button>
            </div>
          )}

          {/* Messages icon with unread badge */}
          <Link
            href="/messages"
            className="relative flex h-10 w-10 items-center justify-center rounded-pill text-ink-secondary transition hover:border hover:border-terracotta hover:text-terracotta"
          >
            <IconMessage />
            {unreadMessages > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta font-mono text-[9px] font-bold text-white">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>

          {/* Saved */}
          <Link
            href="/saved"
            className="hidden items-center gap-1.5 rounded-pill border border-line bg-card px-3 py-1.5 text-sm font-semibold text-ink-secondary transition hover:border-terracotta hover:text-terracotta md:flex"
          >
            <IconHeart className="h-4 w-4" />
            Zapisane
          </Link>

          {/* User menu / login */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-label="Menu użytkownika"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                className="flex h-10 w-10 items-center justify-center rounded-pill border border-line bg-card text-ink-secondary transition hover:border-terracotta hover:text-terracotta"
              >
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? "avatar"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <IconUser />
                )}
              </button>

              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-card border border-line bg-card p-1 shadow-card animate-rl-pop">
                    <div className="px-3 py-2 text-xs text-ink-muted border-b border-line mb-1">
                      {session.user?.email}
                    </div>
                    <Link
                      href="/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-secondary hover:bg-chip-warm"
                    >
                      <IconHeart className="h-4 w-4" />
                      Zapisane oferty
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-secondary hover:bg-chip-warm"
                    >
                      <IconSettings className="h-4 w-4" />
                      Ustawienia konta
                    </Link>
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-secondary hover:bg-chip-warm"
                    >
                      <IconLogOut className="h-4 w-4" />
                      Wyloguj się
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-pill bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:bg-terracotta-hover"
            >
              Zaloguj się
            </Link>
          )}

          {/* Hamburger — mobile */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-pill border border-line md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <nav className="border-t border-line px-[22px] py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  isActive(link.href)
                    ? "bg-chip-warm text-ink"
                    : "text-ink-secondary hover:bg-chip-warm hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
