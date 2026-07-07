"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice, getVerdict, VERDICT_LABEL, VERDICT_COLOR, monthlyMortgage, pricePerM2 } from "@/lib/domain";
import type { Listing } from "@/lib/types";

interface CompareModalProps {
  cmpIds: string[];
  /** Oferty już wczytane w bieżących wynikach wyszukiwania — unikamy refetchu. */
  knownListings: Listing[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onOpenDetail: (id: string) => void;
}

function gradientBg(gradient: string | null): string {
  if (!gradient) return "linear-gradient(135deg, #C8553D, #9e3f2c)";
  const [from, to] = gradient.split("-");
  return `linear-gradient(135deg, ${from}, ${to})`;
}

const ROWS: { label: string; cell: (l: Listing) => { text: string; color?: string } }[] = [
  { label: "Cena", cell: (l) => ({ text: `${formatPrice(l.price)} zł` }) },
  { label: "Cena/m²", cell: (l) => ({ text: `${formatPrice(pricePerM2(l.price, l.area))} zł` }) },
  {
    label: "Wycena REALS",
    cell: (l) => {
      const v = getVerdict(l);
      return { text: v ? VERDICT_LABEL[v] : "—", color: v ? VERDICT_COLOR[v] : "#33271D" };
    },
  },
  { label: "Pokoje / metraż", cell: (l) => ({ text: `${l.rooms} pok · ${l.area} m²` }) },
  {
    label: "Piętro · rok",
    cell: (l) => ({
      text: `${l.floor === 0 || l.floor == null ? "parter" : `${l.floor} p.`} · ${l.year ?? "—"}`,
    }),
  },
  { label: "Rynek", cell: (l) => ({ text: l.market === "WTORNY" ? "wtórny" : "pierwotny" }) },
  { label: "Dojazd do centrum", cell: (l) => ({ text: l.district.commute ? `${l.district.commute} min` : "—" }) },
  {
    label: "Szac. rata/mc",
    cell: (l) => ({
      text:
        l.type === "KUP" ? `${formatPrice(monthlyMortgage(l.price))} zł` : `${formatPrice(l.price)} zł`,
    }),
  },
  { label: "Jakość ogłoszenia", cell: (l) => ({ text: `${l.quality}/100` }) },
];

export function CompareModal({ cmpIds, knownListings, onClose, onRemove, onOpenDetail }: CompareModalProps) {
  const [fetchedById, setFetchedById] = useState<Record<string, Listing>>({});

  const missingIds = useMemo(
    () => cmpIds.filter((id) => !knownListings.some((l) => l.id === id) && !fetchedById[id]),
    [cmpIds, knownListings, fetchedById]
  );

  useEffect(() => {
    if (missingIds.length === 0) return;
    let cancelled = false;
    Promise.all(
      missingIds.map((id) =>
        fetch(`/api/listings/${id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => (data ? ([id, data.listing] as const) : null))
      )
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, Listing> = {};
      for (const r of results) {
        if (r) next[r[0]] = r[1];
      }
      if (Object.keys(next).length) setFetchedById((s) => ({ ...s, ...next }));
    });
    return () => {
      cancelled = true;
    };
  }, [missingIds]);

  const listings = cmpIds
    .map((id) => knownListings.find((l) => l.id === id) ?? fetchedById[id])
    .filter((l): l is Listing => !!l);

  return (
    <div onClick={onClose} className="fixed inset-0 z-[70] grid place-items-center bg-ink/55 p-[18px]">
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[860px] overflow-auto rounded-card border border-line bg-bg-app"
      >
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-line bg-bg-app px-[22px] py-[18px]">
          <h3 className="font-display text-[22px] font-bold text-ink">Porównanie ofert</h3>
          <button onClick={onClose} aria-label="Zamknij" className="text-xl text-ink-muted">
            ✕
          </button>
        </div>

        {cmpIds.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-faint">
            Brak ofert do porównania — dodaj je z listy przyciskiem „+ Porównaj”.
          </div>
        ) : listings.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-faint">Ładowanie ofert do porównania…</div>
        ) : (
          <div className="overflow-x-auto px-2 pb-3">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr>
                  <th className="p-3" />
                  {listings.map((l) => (
                    <th key={l.id} className="min-w-[150px] p-3 text-left align-bottom">
                      <button
                        onClick={() => onOpenDetail(l.id)}
                        className="mb-2 h-[58px] w-full rounded-md"
                        style={{ background: gradientBg(l.gradient) }}
                        aria-label={`Zobacz ofertę: ${l.district.name}`}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => onOpenDetail(l.id)}
                          className="truncate text-left text-[13px] font-bold text-ink hover:text-terracotta"
                        >
                          {l.district.name}
                        </button>
                        <button
                          onClick={() => onRemove(l.id)}
                          aria-label="Usuń z porównania"
                          className="shrink-0 text-ink-faint hover:text-terracotta"
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, ri) => (
                  <tr key={r.label} className={ri % 2 ? "bg-card" : ""}>
                    <td className="whitespace-nowrap p-3 text-xs font-bold text-ink-faint">{r.label}</td>
                    {listings.map((l) => {
                      const cell = r.cell(l);
                      return (
                        <td
                          key={l.id}
                          className="p-3 font-mono text-[13px] font-bold"
                          style={{ color: cell.color ?? "#33271D" }}
                        >
                          {cell.text}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
