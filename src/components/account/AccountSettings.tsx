"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function AccountSettings() {
  const { data: session, status } = useSession();
  const [exporting, setExporting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("export-failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reals-moje-dane.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Nie udało się pobrać danych. Spróbuj ponownie.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "delete-failed");
      }
      // Sesja NextAuth jest w trybie JWT (bezstanowa) — samo usunięcie po
      // stronie serwera nie czyści ciasteczka klienta. signOut() robi to
      // realnie i przekierowuje na stronę główną.
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Nie udało się usunąć konta. Spróbuj ponownie albo napisz do nas.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <main className="mx-auto max-w-[500px] px-[22px] py-16 text-center">
        <h1 className="mb-2 font-display text-2xl font-bold text-ink">Ustawienia konta</h1>
        <p className="mb-5 text-sm text-ink-muted">Musisz być zalogowany, żeby zobaczyć ustawienia konta.</p>
        <Link href="/login" className="inline-block rounded-pill bg-terracotta px-6 py-3 text-sm font-bold text-white">
          Zaloguj się
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[600px] px-[22px] py-11">
      <h1 className="mb-1.5 font-display text-[28px] font-bold tracking-heading text-ink">Ustawienia konta</h1>
      <p className="mb-8 text-[15px] text-ink-muted">Twoje dane i prawa wynikające z RODO.</p>

      <div className="mb-6 rounded-card border border-line bg-card p-5 shadow-card">
        <h2 className="mb-3 text-sm font-bold text-ink">Profil</h2>
        <div className="text-sm text-ink-secondary">
          <div><b>E-mail:</b> {session?.user?.email}</div>
          {session?.user?.name && <div><b>Nazwa:</b> {session.user.name}</div>}
        </div>
      </div>

      <div className="mb-6 rounded-card border border-line bg-card p-5 shadow-card">
        <h2 className="mb-1.5 text-sm font-bold text-ink">Pobierz moje dane</h2>
        <p className="mb-3.5 text-[13px] text-ink-faint">
          Eksport wszystkich Twoich danych (profil, preferencje, ogłoszenia, wiadomości) w formacie JSON — zgodnie z
          RODO art. 15 i 20.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-pill border border-line bg-bg-app px-5 py-2.5 text-sm font-bold text-ink-secondary transition hover:border-terracotta hover:text-terracotta disabled:opacity-50"
        >
          {exporting ? "Przygotowywanie…" : "Pobierz moje dane (.json)"}
        </button>
      </div>

      <div className="rounded-card border border-terracotta/30 bg-card p-5 shadow-card">
        <h2 className="mb-1.5 text-sm font-bold text-ink">Usuń konto</h2>
        <p className="mb-3.5 text-[13px] text-ink-faint">
          Trwale usuwa Twoje dane osobowe (RODO art. 17). Twoje ogłoszenia zostaną zarchiwizowane, a wiadomości, które
          wysłałeś/-aś, zostaną przypisane do konta anonimowego — druga strona rozmowy zachowuje swoją historię.{" "}
          <b>Tej operacji nie da się cofnąć.</b>
        </p>

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="rounded-pill border border-terracotta px-5 py-2.5 text-sm font-bold text-terracotta transition hover:bg-terracotta hover:text-white"
          >
            Usuń moje konto
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-sm font-bold text-terracotta">Na pewno? To nieodwracalne.</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-pill bg-terracotta px-4 py-2 text-sm font-bold text-white transition hover:bg-terracotta-hover disabled:opacity-50"
            >
              {deleting ? "Usuwanie…" : "Tak, usuń trwale"}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="rounded-pill border border-line bg-bg-app px-4 py-2 text-sm font-bold text-ink-secondary"
            >
              Anuluj
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-[13px] font-bold text-terracotta">{error}</p>}
      </div>
    </main>
  );
}
