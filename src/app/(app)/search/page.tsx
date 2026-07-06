import { SearchClient } from "@/components/search/SearchClient";
import { parseFilters } from "@/lib/searchFilters";

// Mapa (iteracja 5) wraca w iteracji 7 jako split widok obok listy —
// na razie /search to w pełni ekran listy z filtrami (kryterium iteracji 6),
// rozszerzony w iteracji 7 (split+mapa) i iteracji 8 (Detail overlay).
//
// Filtry i `id` (Detail) startowe liczymy TU, po stronie serwera, z
// prawdziwego `searchParams` requestu — nie klienckim `useSearchParams()`.
// Ten drugi w połączeniu z Suspense potrafił dać stan o ułamek inny niż to,
// co wyrenderował serwer, co objawiało się błędem "Hydration failed" na
// /search po twardym odświeżeniu strony z aktywnymi filtrami w URL.
export default function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }

  const idParam = searchParams.id;
  const initialSelectedId = typeof idParam === "string" ? idParam : null;

  return (
    <SearchClient initialFilters={parseFilters(params)} initialSelectedId={initialSelectedId} />
  );
}
