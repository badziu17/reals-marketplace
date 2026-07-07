"use client";

import { useMemo } from "react";
import { generateViewingSlots } from "@/lib/viewingSlots";

interface ViewingPickerModalProps {
  open: boolean;
  onClose: () => void;
  onPickSlot: (slot: string) => void;
}

export function ViewingPickerModal({ open, onClose, onPickSlot }: ViewingPickerModalProps) {
  // Hook zawsze wywoływany (Rules of Hooks) — early return dopiero niżej.
  const slots = useMemo(() => generateViewingSlots(), []);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[75] grid place-items-center bg-ink/50 p-[18px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] overflow-hidden rounded-[20px] border border-line bg-bg-app shadow-hero"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-[17px]">
          <h3 className="font-display text-lg font-bold text-ink">📅 Umów oglądanie</h3>
          <button onClick={onClose} aria-label="Zamknij" className="text-lg text-ink-muted">
            ✕
          </button>
        </div>
        <div className="px-5 py-4 pb-5">
          <p className="mb-3.5 text-[13px] text-ink-muted">
            Wybierz proponowany termin — wyślemy go do potwierdzenia.
          </p>
          <div className="flex flex-col gap-2.5">
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => onPickSlot(slot)}
                className="flex w-full items-center gap-2.5 rounded-[14px] border border-line bg-card px-[15px] py-3.5 text-left text-sm font-bold text-ink transition hover:border-terracotta hover:bg-chip-terracotta/40"
              >
                <span className="text-base">🕑</span>
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
