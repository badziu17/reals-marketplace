// Iteracja 13: komunikator (wątki + okno rozmowy + szablony + polling)

export default function MessagesPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-pill bg-chip-warm px-3 py-1 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-muted">
        Iteracja 13
      </span>
      <h1 className="font-display text-section-h2 tracking-heading text-ink">
        Wiadomości
      </h1>
      <p className="max-w-md text-sm text-ink-muted">
        Lista wątków z podglądem, okno rozmowy (bąbelki), szybkie szablony,
        propozycje terminów, przypięta oferta. Polling → realtime WebSocket później.
      </p>
    </div>
  );
}
