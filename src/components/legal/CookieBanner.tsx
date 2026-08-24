"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, saveConsent, onReopenCookieSettings } from "@/lib/cookieConsent";

// Baner zgodny z wymogami 2026 (EDPB Cookie Banner Taskforce): przycisk
// "Odrzuć" jest RÓWNIE widoczny jak "Akceptuj" (nie ukryty w linku/drugim
// kroku), brak domyślnie zaznaczonych opcjonalnych zgód, łatwe wycofanie
// (patrz "Ustawienia cookies" w stopce -> requestReopenCookieSettings()).
export function CookieBanner() {
  // mounted-gate: localStorage nie istnieje podczas SSR, więc decyzję o
  // pokazaniu banera podejmujemy dopiero po zamontowaniu (ten sam wzorzec co
  // wszędzie indziej w projekcie, żeby uniknąć błędu hydratacji).
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getConsent();
    if (!existing) setOpen(true);
  }, []);

  useEffect(() => {
    return onReopenCookieSettings(() => {
      const existing = getConsent();
      setAnalytics(existing?.analytics ?? false);
      setMarketing(existing?.marketing ?? false);
      setShowDetails(true);
      setOpen(true);
    });
  }, []);

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true });
    setOpen(false);
    setShowDetails(false);
  }

  function rejectAll() {
    saveConsent({ analytics: false, marketing: false });
    setOpen(false);
    setShowDetails(false);
  }

  function savePreferences() {
    saveConsent({ analytics, marketing });
    setOpen(false);
    setShowDetails(false);
  }

  if (!mounted || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Ustawienia plików cookie"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-bg-app shadow-hero"
    >
      <div className="mx-auto max-w-4xl px-[18px] py-4">
        <p className="text-[13px] leading-relaxed text-ink-secondary">
          Używamy plików cookie i podobnych technologii niezbędnych do działania serwisu (np. sesja logowania,
          zapisane ulubione). Za Twoją zgodą używamy też cookies analitycznych i marketingowych — możesz je
          zaakceptować, odrzucić albo wybrać samodzielnie. Więcej w{" "}
          <Link href="/polityka-prywatnosci" className="font-semibold text-terracotta underline">
            Polityce prywatności
          </Link>
          .
        </p>

        {showDetails && (
          <div className="mt-3.5 flex flex-col gap-2.5 rounded-md border border-line bg-card p-3.5">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-bold text-ink">Niezbędne</span>
                <span className="block text-xs text-ink-faint">
                  Sesja logowania, ulubione, porównanie — zawsze aktywne
                </span>
              </span>
              <input type="checkbox" checked disabled className="h-4 w-4 accent-ink-faint" />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-bold text-ink">Analityczne</span>
                <span className="block text-xs text-ink-faint">Pomagają nam rozumieć ruch na stronie</span>
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4 accent-terracotta"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-bold text-ink">Marketingowe</span>
                <span className="block text-xs text-ink-faint">Personalizacja reklam i treści</span>
              </span>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="h-4 w-4 accent-terracotta"
              />
            </label>
          </div>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          {!showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              className="rounded-pill border border-line bg-card px-4 py-2 text-sm font-bold text-ink-secondary transition hover:border-terracotta hover:text-terracotta"
            >
              Ustawienia
            </button>
          )}
          {showDetails && (
            <button
              onClick={savePreferences}
              className="rounded-pill border border-line bg-card px-4 py-2 text-sm font-bold text-ink-secondary transition hover:border-terracotta hover:text-terracotta"
            >
              Zapisz wybór
            </button>
          )}
          {/* Odrzuć i Akceptuj mają CELOWO identyczną wagę wizualną — brak dark
              patterns, zgodnie z wytycznymi EDPB Cookie Banner Taskforce. */}
          <button
            onClick={rejectAll}
            className="rounded-pill border border-line bg-card px-5 py-2 text-sm font-bold text-ink transition hover:border-terracotta"
          >
            Odrzuć wszystkie
          </button>
          <button
            onClick={acceptAll}
            className="rounded-pill bg-terracotta px-5 py-2 text-sm font-bold text-white transition hover:bg-terracotta-hover"
          >
            Akceptuj wszystkie
          </button>
        </div>
      </div>
    </div>
  );
}
