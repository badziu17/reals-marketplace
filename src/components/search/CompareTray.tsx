"use client";

interface CompareTrayProps {
  count: number;
  onOpen: () => void;
  onClear: () => void;
}

export function CompareTray({ count, onOpen, onClear }: CompareTrayProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-[18px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-3.5 rounded-md bg-ink px-4 py-3 text-white shadow-hero animate-rl-pop">
      <span className="whitespace-nowrap text-sm font-semibold">
        {count} {count === 1 ? "oferta" : "oferty"} do porównania
      </span>
      <button
        onClick={onOpen}
        disabled={count < 2}
        title={count < 2 ? "Wybierz co najmniej 2 oferty" : undefined}
        className={`rounded-[10px] px-4 py-2 text-sm font-bold transition ${
          count < 2 ? "cursor-default bg-ink-secondary/60" : "cursor-pointer bg-terracotta hover:bg-terracotta-hover"
        }`}
      >
        Porównaj
      </button>
      <button
        onClick={onClear}
        aria-label="Wyczyść porównanie"
        className="text-lg leading-none text-white/60 transition hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
