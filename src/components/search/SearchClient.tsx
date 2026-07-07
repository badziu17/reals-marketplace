"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FilterBar } from "./FilterBar";
import { SearchResults } from "./SearchResults";
import { CompareTray } from "./CompareTray";
import { DetailSheet } from "@/components/detail/DetailSheet";
import { ViewingPickerModal } from "@/components/detail/ViewingPickerModal";
import { CompareModal } from "@/components/compare/CompareModal";
import { filtersToParams, type SearchFilters } from "@/lib/searchFilters";
import type { Listing } from "@/lib/types";

const FAV_KEY = "reals-fav";
const CMP_KEY = "reals-cmp";
const RESULTS_LIMIT = 24;
const HEADER_HEIGHT = 57; // wysokość Chrome — patrz komentarz przy top-[57px] w FilterBar

interface SearchClientProps {
  // Wyliczone po stronie serwera (page.tsx) z prawdziwego `searchParams`
  // requestu — nie z klienckiego useSearchParams(). To jedyne pewne źródło
  // stanu początkowego identycznego na serwerze i przy hydratacji; po
  // stronie klienta hooki routera (useSearchParams + Suspense) potrafiły
  // dawać migawkę o ułamek inną niż to, co realnie wyrenderował serwer.
  initialFilters: SearchFilters;
  /** id z `?id=` w URL — otwiera Detail od razu przy wejściu (linkowalne). */
  initialSelectedId: string | null;
}

export function SearchClient({ initialFilters, initialSelectedId }: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const [fav, setFav] = useState<Record<string, boolean>>({});
  const [cmp, setCmp] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [viewingOpen, setViewingOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  // Ref, żeby debounced efekt filtrów (patrz niżej) zawsze widział AKTUALNY
  // selectedId w momencie, gdy jego setTimeout faktycznie odpala — nie ten
  // sprzed 300ms z domknięcia — inaczej otwarcie Detail tuż po zmianie
  // filtra mogłoby zostać nadpisane (usunięte z URL) przez spóźniony efekt.
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  // Origin jest znany tylko w przeglądarce. Czytanie `window` wprost w renderze
  // (np. `typeof window !== "undefined" ? window.location.origin : ""`) daje
  // różny wynik na serwerze i przy pierwszym renderze klienta podczas
  // hydratacji (w przeglądarce window już istnieje) — stąd błąd "Hydration
  // failed". Zamiast tego zaczynamy od "" (identycznie na serwerze i kliencie)
  // i uzupełniamy dopiero w efekcie, już po hydratacji.
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>();
  const copyTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Wysokość paska filtrów mierzona na żywo (zmienia się np. gdy otwarty jest
  // panel "Więcej filtrów") — potrzebna, żeby kolumna mapy/listy w
  // SearchResults poprawnie wyliczyła sticky top / max-height, zamiast na
  // sztywno zgadywać jedną wartość z prototypu.
  const filterBarWrapRef = useRef<HTMLDivElement>(null);
  const [filterBarHeight, setFilterBarHeight] = useState(0);
  useEffect(() => {
    const el = filterBarWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setFilterBarHeight(entries[0].contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // --- Fav / Compare — na razie stan lokalny (localStorage). ---
  // Trwały zapis per-użytkownik (SavedListing w bazie) wraca wraz z auth-gated
  // flow w dalszych iteracjach; tu chodzi o samo doświadczenie fav/porównania.
  useEffect(() => {
    try {
      const savedFav = localStorage.getItem(FAV_KEY);
      const savedCmp = localStorage.getItem(CMP_KEY);
      if (savedFav) setFav(JSON.parse(savedFav));
      if (savedCmp) setCmp(JSON.parse(savedCmp));
    } catch {
      // localStorage niedostępny/uszkodzony — startujemy z pustego stanu
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(FAV_KEY, JSON.stringify(fav));
  }, [fav, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CMP_KEY, JSON.stringify(cmp));
  }, [cmp, hydrated]);

  function showToast(msg: string) {
    setToast(msg);
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(""), 2400);
  }

  function toggleFav(id: string) {
    setFav((s) => ({ ...s, [id]: !s[id] }));
  }

  function toggleCmp(id: string) {
    setCmp((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= 4) {
        showToast("Można porównać maksymalnie 4 oferty");
        return s;
      }
      return [...s, id];
    });
  }

  // --- Filtry -> URL + fetch, z debounce 300ms (slider/pisanie nie strzela za każdym tickiem). ---
  // AbortController żyje na poziomie efektu (nie wewnątrz setTimeout), żeby
  // cleanup mógł realnie anulować zapytanie w locie, a nie tylko nieodpalony
  // jeszcze timeout — inaczej starsza, wolniejsza odpowiedź mogłaby nadpisać
  // wynik nowszego filtrowania.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const handle = setTimeout(() => {
      const params = filtersToParams(filters);
      if (selectedIdRef.current) params.set("id", selectedIdRef.current);

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

      const apiParams = new URLSearchParams(params);
      apiParams.set("limit", String(RESULTS_LIMIT));

      setLoading(true);
      fetch(`/api/listings?${apiParams.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          setListings(data.listings ?? []);
          setTotal(data.total ?? 0);
        })
        .catch((err) => {
          if (err?.name !== "AbortError") console.error("[search] fetch listings", err);
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
          setInitialLoad(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
      controller.abort();
    };
    // pathname/router celowo pominięte w deps — stabilne w obrębie strony
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Detail (?id=) -> URL, natychmiast (bez debounce'u filtrów — to osobne,
  // dyskretne zdarzenie otwórz/zamknij, nie coś co użytkownik "przeciąga").
  useEffect(() => {
    const params = filtersToParams(filters);
    if (selectedId) params.set("id", selectedId);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // filters/pathname/router celowo pominięte — patrz komentarz przy efekcie filtrów wyżej
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function openDetail(id: string) {
    setSelectedId(id);
  }

  function closeDetail() {
    setSelectedId(null);
  }

  const detailListing = listings.find((l) => l.id === selectedId);

  const shareUrl = origin
    ? `${origin}${pathname}${(() => {
        const qs = filtersToParams(filters).toString();
        return qs ? `?${qs}` : "";
      })()}`
    : "";

  const handleCopyLink = useCallback(() => {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  function handleOpenCompare() {
    if (cmp.length < 2) return;
    setCompareOpen(true);
  }

  return (
    <div className="min-h-screen">
      <div ref={filterBarWrapRef}>
        <FilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={total}
          loading={loading && initialLoad}
          shareUrl={shareUrl}
          copied={copied}
          onCopyLink={handleCopyLink}
          onSaveAlert={() => showToast("Zapisywanie alertów pojawi się w kolejnej iteracji ✨")}
        />
      </div>

      <SearchResults
        listings={listings}
        loading={loading}
        initialLoad={initialLoad}
        fav={fav}
        onToggleFav={toggleFav}
        cmp={cmp}
        onToggleCmp={toggleCmp}
        onOpenDetail={openDetail}
        stickyOffset={HEADER_HEIGHT + filterBarHeight}
      />

      <DetailSheet
        listingId={selectedId}
        knownListing={detailListing}
        isFaved={!!(selectedId && fav[selectedId])}
        onToggleFav={toggleFav}
        onClose={closeDetail}
        onBookViewing={() => setViewingOpen(true)}
        onContact={() => showToast("Wiadomości pojawią się w iteracji 13 ✨")}
      />

      <ViewingPickerModal
        open={viewingOpen}
        onClose={() => setViewingOpen(false)}
        onPickSlot={(slot) => {
          setViewingOpen(false);
          showToast(`Wysłano prośbę o termin: ${slot} ✨`);
        }}
      />

      {compareOpen && (
        <CompareModal
          cmpIds={cmp}
          knownListings={listings}
          onClose={() => setCompareOpen(false)}
          onRemove={toggleCmp}
          onOpenDetail={(id) => {
            setCompareOpen(false);
            openDetail(id);
          }}
        />
      )}

      <CompareTray count={cmp.length} onOpen={handleOpenCompare} onClear={() => setCmp([])} />

      {toast && (
        <div className="fixed bottom-[84px] left-1/2 z-[80] -translate-x-1/2 whitespace-nowrap rounded-md bg-bottle px-5 py-3 text-sm font-semibold text-white shadow-hero animate-rl-pop">
          ✨ {toast}
        </div>
      )}
    </div>
  );
}
