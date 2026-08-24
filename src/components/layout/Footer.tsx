"use client";

import Link from "next/link";
import { requestReopenCookieSettings } from "@/lib/cookieConsent";

export function Footer() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-[22px] py-6 text-[13px] text-ink-faint">
        <span>© {new Date().getFullYear()} REALS Trójmiasto</span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/polityka-prywatnosci" className="font-semibold text-ink-secondary hover:text-terracotta">
            Polityka prywatności
          </Link>
          <Link href="/regulamin" className="font-semibold text-ink-secondary hover:text-terracotta">
            Regulamin
          </Link>
          <button
            onClick={requestReopenCookieSettings}
            className="font-semibold text-ink-secondary hover:text-terracotta"
          >
            Ustawienia cookies
          </button>
        </nav>
      </div>
    </footer>
  );
}
