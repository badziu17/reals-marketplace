# REALS — marketplace mieszkaniowy (Trójmiasto)

Rebuild prototypu hi-fi (`/design-reference`) w docelowym stacku: **Next.js 14 (App
Router) + TypeScript + Tailwind + Prisma/PostgreSQL**.

Specyfikacja designu (kolory, typografia, ekrany, interakcje, model danych) znajduje
się w [`design-reference/DESIGN_SPEC.md`](./design-reference/DESIGN_SPEC.md) —
to dokument wiążący dla wartości pikselowych i zachowań UI. Oryginalne prototypy
HTML (`REALS.dc.html` i warianty) służą jako żywa, interaktywna referencja —
**nie kopiujemy ich logiki 1:1**, tylko odtwarzamy w komponentach Next.js/React.

## Stack

- **Next.js 14** (App Router, React Server Components)
- **TypeScript**
- **Tailwind CSS** — `tailwind.config.ts` mapuje tokeny design 1:1 z `DESIGN_SPEC.md`
- **Prisma + PostgreSQL** — `prisma/schema.prisma`
- **NextAuth** (email/hasło + Google OAuth) — od iteracji 1
- **MapLibre GL** — od iteracji 5

## Setup lokalny

```bash
npm install
cp .env.example .env       # uzupełnij DATABASE_URL (i dalsze zmienne w kolejnych iteracjach)
npx prisma migrate dev     # utworzy bazę wg schema.prisma
npm run dev                # http://localhost:3000
```

Wymaga lokalnego PostgreSQL (lub np. `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`).

## Struktura

```
src/
  app/            # routing Next.js (App Router)
  components/     # komponenty UI (rozbudowywane per iteracja)
  lib/            # logika domenowa (AVM, kalkulator rat, prisma client...)
  styles/         # globals.css
prisma/
  schema.prisma   # model danych
design-reference/ # oryginalny prototyp hi-fi + spec — punkt odniesienia, nie do edycji
```

## Roadmapa iteracji

Każda iteracja = osobny PR, z jasnym kryterium odbioru. Kolejność uwzględnia, że
auth i mapa (MapLibre) są fundamentem dla późniejszych ekranów, więc idą wcześniej
niż w "naturalnej" kolejności ekranów z prototypu.

| # | Iteracja | Zakres | Kryterium odbioru |
|---|---|---|---|
| 0 | Fundament | Next.js + Tailwind (tokeny) + Prisma schema + layout/fonty | `npm run dev` działa, tokeny renderują się poprawnie |
| 1 | Auth | NextAuth: email/hasło + Google OAuth, middleware, ekran logowania | Rejestracja/logowanie obiema metodami, trwała sesja |
| 2 | Chrome + routing | Header, wszystkie trasy jako puste shell'e, stan sesji w headerze | Pełna nawigacja, header reaguje na zalogowanie |
| 3 | Dane ofert + API | Model `Listing`/`District`, `GET /api/listings` (filtry), seed 21 ofert | API zwraca dane zgodnie z modelem |
| 4 | Landing | Hero, trust strip, pillars, wyróżnione oferty z API | Landing 1:1 z prototypem, dane live |
| 5 | MapLibre setup | Integracja mapy, geokodowanie `District`, pinezki statyczne | Mapa Trójmiasta renderuje się z pinezkami |
| 6 | Search — filtry + lista | Pasek filtrów, karty z AVM, fav, porównanie, sync z URL | Filtrowanie/sortowanie działa, linkowalne URL |
| 7 | Search — split + mapa + mobile | Lista + mapa (hover↔highlight), rysowanie obszaru, mobile | Pełny ekran Search, desktop + mobile |
| 8 | Detail overlay | Sheet, galeria, AVM bar, kalkulator kosztów, CTA | Detal otwiera się poprawnie, obliczenia zgodne |
| 9 | Viewing picker + Compare | Oba modale | Działają end-to-end z Detail |
| 10 | Onboarding | 4 kroki, zapis preferencji, wpływ na rekomendacje | Pełny flow, realny wpływ na wyniki |
| 11 | Sell | Kreator ogłoszenia, wskaźnik kompletności, zapis draftu | Ogłoszenie w DB, widoczne na koncie |
| 12 | Business | Taby Agencja/Deweloper, plany | Statyczny, kompletny ekran |
| 13 | Messages | Wątki, okno rozmowy, szablony, polling | Czat działa między dwoma kontami testowymi |
| 14+ | Później | WebSocket realtime, silnik dedup, AVM v2, RODO, płatności | — |

## Uwagi projektowe

- **Tokeny Tailwind** (`tailwind.config.ts`) są wprost wycenione z sekcji "Design
  Tokens" w `DESIGN_SPEC.md`. Jeśli coś nie zgadza się wizualnie z prototypem,
  źródłem prawdy jest `design-reference/REALS.dc.html`, nie pamięć/intuicja.
- **AVM, dedup, rata kredytu** docelowo żyją jako czyste funkcje w `src/lib/`
  (możliwe do testowania bez UI), nie wymieszane z komponentami.
- **Filtry search** muszą być zsynchronizowane z URL query params — to świadomy
  wyróżnik produktowy z `DESIGN_SPEC.md`, nie tylko detal implementacyjny.
