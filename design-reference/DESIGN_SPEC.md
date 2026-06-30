# Handoff: REALS — marketplace mieszkaniowy (Trójmiasto)

## Overview
REALS to marketplace nieruchomości dla Trójmiasta (Gdańsk / Gdynia / Sopot). Główne wyróżniki produktu:
- **Deduplikacja** — to samo mieszkanie wystawione przez kilka biur scalane jest w jedną ofertę.
- **Uczciwa wycena (AVM)** — przy każdej ofercie sprzedaży pokazujemy, czy cena jest poniżej / w normie / powyżej rynku, z przedziałem wartości.
- **Świeżość** — każda oferta oznaczona datą ostatniej aktywności (koniec z martwymi linkami).
- **Wygoda wyszukiwania** — filtry zapisane w URL, mapa zsynchronizowana z listą, izochrony dojazdu.
- **Bezpłatne wystawianie** dla osób prywatnych; model subskrypcyjny dla agencji i deweloperów.

Prototyp obejmuje pełny przepływ: landing → onboarding preferencji → wyszukiwarka z mapą → szczegóły oferty → porównywarka → umawianie oglądania → wiadomości, plus strony „Sprzedaj" i „Dla biznesu". Zaprojektowany responsywnie (desktop + widok telefonu).

## About the Design Files
Pliki w tym pakiecie to **referencje projektowe wykonane w HTML** — prototypy pokazujące docelowy wygląd i zachowanie, **nie kod produkcyjny do skopiowania 1:1**. Zostały zbudowane jako „Design Component" (lekki framework podglądu) z logiką napisaną w stylu React (klasa `Component` z `state` / `setState` / `renderVals`).

Zadanie: **odtworzyć te designy w docelowym środowisku** (frameworku wybranym dla projektu), używając jego wzorców, systemu komponentów i bibliotek. Nie należy uruchamiać tych plików HTML w produkcji ani kopiować logiki dosłownie — traktuj je jako żywą, interaktywną specyfikację. Cała logika (dane, filtry, AVM, czat) jest tu zamockowana po stronie klienta; w realnej aplikacji trafi do backendu i API.

Aby zobaczyć prototyp: otwórz `REALS.dc.html` w przeglądarce (wymaga `support.js` obok pliku — dołączony). W nagłówku jest przełącznik **Desktop / Telefon**.

## Fidelity
**High-fidelity (hifi).** Finalne kolory, typografia, odstępy, zaokrąglenia, cienie i interakcje. Odtwórz UI pikselowo, mapując wartości na komponenty i tokeny docelowego systemu. Wymiary i wartości w tej dokumentacji są wiążące.

---

## Design Tokens

### Kolory
| Rola | Hex | Użycie |
|---|---|---|
| Terakota (primary / brand) | `#C8553D` | logo, CTA, akcenty, „powyżej rynku" |
| Terakota hover / dark | `#A8432E` / `#9e3f2c` | hover przycisków, gradienty |
| Zieleń butelkowa (secondary) | `#3F5142` | trust strip, „uczciwa cena", taby aktywne |
| Zieleń jasna (akcent) | `#5E7A60` / `#2E7D4F` | tagi dojazdu, „poniżej rynku" |
| Tło aplikacji | `#FBF6EE` | główne tło (kremowe) |
| Tło body / canvas | `#EFE7DA` | tło poza shellem |
| Tekst główny | `#33271D` | nagłówki, ceny |
| Tekst drugorzędny | `#5c4d3f` | etykiety, nawigacja |
| Tekst wyciszony | `#7a6c5d` / `#a8957f` / `#b09a86` | podpisy, placeholdery |
| Linie / obramowania | `#ede1d2` / `#f3ece2` / `#e3d4c2` | bordery kart, separatory |
| Pola tła (pill/chip) | `#f3ece2` / `#f3ddd4` / `#e7ede4` / `#f5e7cc` | chipy, tinty kafli filarów |
| Karta biała | `#ffffff` | karty ofert, pola input |

Gradienty zdjęć ofert (placeholdery, 135°), pary `[from, to]`:
`#C8553D→#9e3f2c`, `#5E7A60→#3a4f3c`, `#B98A2E→#7a5a18`, `#6E8CA0→#3f5566`, `#A05C4A→#6b3a2c`, `#5B7E78→#33504b`, `#8A7B5C→#564a32`, `#7A6A8C→#473c54`, `#4F7A6A→#2c483e`. Nakładka teksturowa: `repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 14px, transparent 14px 28px)`.

### Typografia
Trzy rodziny (Google Fonts):
- **Bricolage Grotesque** (400–800) — nagłówki, ceny, duże liczby. `letter-spacing:-0.6px` na nagłówkach.
- **Hanken Grotesk** (400–800) — UI, treść, body. Font domyślny.
- **Space Mono** (400/700) — etykiety techniczne (np. „TRÓJMIASTO" badge), znaczniki.

Skala (px / weight / line-height):
- H1 hero: ~46–52 / 800 / 1.05 (Bricolage)
- H2 sekcji: 30 / 700 / 1.1 (Bricolage)
- Duża liczba (trust): 34 / 700 / 1 (Bricolage)
- Cena karty: 20 / 700 (Bricolage)
- Body lead: 17 / 400 / 1.55 (Hanken)
- UI / nawigacja: 13–15 / 600–700 (Hanken)
- Podpisy / chipy: 11–13 / 600 (Hanken)
- Badge mono: 9–11 / 700, `letter-spacing:.5px` (Space Mono)

### Spacing, radius, cienie
- Skala odstępów: 6 / 8 / 10 / 12 / 14 / 18 / 22 / 30 / 38 px.
- Border-radius: `999px` (pille, chipy, przyciski), `22–24px` (karty hero/oferty), `42px` (ramka telefonu), `14–18px` (mniejsze karty).
- Cienie: karty `0 14px 34px -22px rgba(80,50,40,.5)`; hero art `0 40px 80px -34px rgba(80,50,40,.65)`; ramka telefonu `0 40px 90px -40px rgba(40,30,22,.7)`; overlaye `rgba(40,30,22,.5)`.
- Sticky header: `background:rgba(251,246,238,.88); backdrop-filter:blur(12px); border-bottom:1px solid #ede1d2`.
- Animacje (keyframes, ~`.cubic`): `rl-fade` (opacity + translateY 10px), `rl-slide` (translateX 40px), `rl-pop` (scale .96→1), `rl-typ` (dots „pisze…").

---

## Screens / Views

Stan ekranu trzyma `state.screen ∈ {landing, onboarding, search, sell, business, messages}`. Nakładki (modale/sheety) są niezależne: `showViewing`, `selectedId` (detal), `showCmp` (porównanie). `state.device ∈ {desktop, mobile}` przełącza layout (mobile = shell 420px w ramce telefonu).

### 1. Chrome (globalny nagłówek)
- Sticky top, z-index 40, blur. Padding `13px 22px`, `gap:18px`.
- Logo „REALS" (Bricolage 24/800, `#C8553D`, `-0.6px`) + badge „TRÓJMIASTO" (Space Mono 9px w pill z obramowaniem).
- Nawigacja: Odkrywaj / Szukaj / Sprzedaj / Dla biznesu / Wiadomości (przyciski tekstowe, aktywny podświetlony).
- Po prawej: przełącznik Desktop/Telefon (segmented w pill `#f3ece2`), ikona wiadomości z badge liczby nieprzeczytanych (`#C8553D`, biały tekst), przycisk „Zapisane {n}" (serce).
- Wszystkie okrągłe przyciski 40px, hover → border/kolor `#C8553D`.

### 2. Landing
- **Hero** (grid 2-kol na desktop): lewa — badge „Premiera w Trójmieście", H1 z akcentem „miejsce" w terakocie, lead, pasek wyszukiwania (input + przycisk „Szukaj" terakota), link „✨ Powiedz co jest dla ciebie ważne" → onboarding. Prawa — dwie nałożone karty ofert pod kątem (placeholder gradient + przykładowa oferta Sopot 1 290 000 zł).
- **Trust strip** (tło `#3F5142`): 3 statystyki — `0` duplikatów, `100%` ofert z cenami, `100%` zadowolonych użytkowników (duża liczba Bricolage 34 biała + opis `#cdd6c9`).
- **Pillars** „Dlaczego REALS": 3 kafle (ikona w kolorowym tincie, tytuł Bricolage, body): „Przejrzystość i czytelność", „Wygoda wyszukiwania", „Przejrzysta cena".
- Sekcja wyróżnionych ofert (6 kart z `featured`).

### 3. Onboarding (kreator preferencji)
- `max-width:620px`, wycentrowany. 4 kroki (`onbStep` 0–3): „Gdzie szukasz?" (chipy dzielnic), „Jaki budżet?" (slider), „Ile pokoi?" (chipy 1–5+), „Co jest must-have?" (chipy udogodnień z ikonami). Pasek postępu, przyciski wstecz/dalej. Wynik dobiera oferty.

### 4. Search (wyszukiwarka)
- Pasek filtrów: typ Kup/Wynajem (toggle), cena/czynsz max (slider), pokoje, metraż min, rynek, udogodnienia, „tylko uczciwa cena", izochrony, sortowanie (`foryou` / cena / metraż / świeżość), „więcej filtrów".
- **Split 50/50**: lewa kolumna lista kart (scroll), prawa kolumna mapa sticky. Na mobile: przełącznik lista/mapa (`mobMap`).
- Karta oferty: zdjęcie-gradient z badge werdyktu ceny, cena, „X pok · Y m² · dzielnica", tagi (dojazd, świeżość), serce (fav), checkbox porównania, hover podświetla pin na mapie.
- Mapa: pinezki ofert (pozycje `cx/cy` z `DIST`), narzędzie rysowania obszaru (`drawing`/`rect`), izochrony.

### 5. Detail (nakładka szczegółów oferty)
- Sheet wysuwany z prawej (`justify-content:flex-end`), overlay `rgba(40,30,22,.5)`, z-index 60.
- Galeria, cena + werdykt AVM z **paskiem przedziału** (`avmGeom`: left/width/mark), parametry, udogodnienia, **kalkulator kosztów** (rata kredytu `monthly()`, czynsz, PCC 2%), źródła ofert (deduplikacja), dane okolicy (dojazd, hałas, szkoły), CTA „Umów oglądanie" → viewing picker, „Kontakt" → tworzy wątek w wiadomościach, „Zapisz" (fav), „Udostępnij".

### 6. Viewing picker (umawianie oglądania)
- Modal wycentrowany, z-index 75. Wybór terminu z `SLOTS` (3 sloty). Potwierdzenie → toast „Wysłano prośbę o termin".

### 7. Compare (porównywarka)
- Modal wycentrowany, z-index 70. Kolumny = wybrane oferty (`cmp`), wiersze = parametry (cena, m², zł/m², werdykt, dojazd, rok, źródła…). Miniatura-gradient na górze każdej kolumny.

### 8. Sell (sprzedaj)
- Kreator ogłoszenia: lista pól (adres, metraż, zdjęcia, rzut, opis AI) z checkboxami stanu „Gotowe/Do zrobienia", **wskaźnik kompletności** (`sellScore` 0–100) i tip. Akcent: publikacja za darmo dla prywatnych.

### 9. Business (dla biznesu)
- Taby Agencja / Deweloper (`bizTab`). Plany subskrypcji, korzyści (deduplikacja podnosi jakość, promowanie ofert, publikacja cenników → zgodność z ustawą / dane.gov.pl).

### 10. Messages (wiadomości)
- Dwukolumnowy komunikator: lista wątków (avatar inicjał + kolor, nazwa, podgląd ostatniej wiadomości, meta oferty, status online) + okno rozmowy (bąbelki me/other, „pisze…" animowane, przypięta oferta, szybkie szablony, propozycje terminów, załączniki). Perspektywa kupujący/sprzedający (`msgPersp`), wybór wątku `activeConv`, `draft`.

---

## Interactions & Behavior
- **Nawigacja** — przyciski nagłówka ustawiają `screen` i czyszczą `selectedId`. Logo → landing.
- **Filtry** — natychmiastowe (`filtered()` filtruje `LISTINGS` po typie, cenie, pokojach, metrażu, rynku, udogodnieniach, „uczciwa cena"; sortuje wg `sort`). W produkcji: synchronizować z **URL query params** (kluczowy wyróżnik — filtry nie resetują się i są linkowalne).
- **Werdykt ceny (AVM)** — `verdict(l)`: `below` jeśli `price < avmLow`, `above` jeśli `> avmHigh`, inaczej `normal`. Kolory/etykiety w `vColor/vLabel/vDot`. Tylko dla `type:'kup'`.
- **Rata kredytu** — `monthly(price)`: 80% LTV, oprocentowanie 7,4% roczne, 300 mies. (annuitet). PCC = 2% ceny, szac. czynsz = `area*14`.
- **Fav / Compare** — `fav` (mapa id→bool), `cmp` (lista id). Toasty potwierdzające (auto-hide 2,4 s).
- **Kontakt** — tworzy / otwiera wątek powiązany z `listingId`, przełącza na ekran wiadomości.
- **Hover** — karty oferty ↔ pin mapy podświetlane wzajemnie (`hovered`).
- **Animacje** — wejścia kart `rl-fade`/`rl-pop`, panele `rl-slide`, wskaźnik pisania `rl-typ`. Hover CTA: terakota → ciemniejsza terakota.
- **Responsywność** — `device:'mobile'` renderuje shell 420px w ramce telefonu; search przełącza lista/mapa zamiast splitu.

## State Management
Stan zamockowany w kliencie (`this.state`). Najważniejsze zmienne:
- Nawigacja/layout: `screen`, `device`.
- Filtry: `type`, `q`, `priceMax`, `rentMax`, `rooms[]`, `areaMin`, `market`, `amen[]`, `onlyFair`, `iso`, `sort`, `showMore`.
- Interakcja z listą: `hovered`, `selectedId`, `fav{}`, `cmp[]`, `showCmp`, `saved[]`, `toast`, `mobMap`, `drawing`, `rect`.
- Onboarding: `onbStep`, `onbAreas[]`, `onbBudget`, `onbRooms[]`, `onbMusts[]`.
- Sell: `sellDone{}`.
- Business: `bizTab`.
- Wiadomości: `convs`, `msgPersp`, `activeConv`, `draft`, `typing{}`, `showViewing`, `showConvMenu`.

W realnej aplikacji to mapuje się na: API ofert (z deduplikacją po stronie backendu), serwis AVM, stan filtrów w URL, auth/sesja użytkownika, API wiadomości (najlepiej realtime — WebSocket), zapisane oferty per użytkownik.

## Data model (mock → docelowy backend)
Oferta (`mk(...)`): `id, dist (dzielnica), city, rooms, area, floor, year, market (pierwotny/wtórny), type (kup/wynajmij), price, amen[], sources[] (biura — deduplikacja), avmLow, avmHigh, cx/cy (pozycja na mapie), commute, noise, schools, fresh (dni od aktualizacji), grad (gradient zdjęcia), quality (0–99)`. Słownik dzielnic `DIST` zawiera: `city, cx, cy, fair (zł/m²), commute, noise, schools`. 21 ofert seed (Gdańsk/Gdynia/Sopot), kup + wynajem.

## Assets
- **Czcionki**: Google Fonts — Bricolage Grotesque, Hanken Grotesk, Space Mono.
- **Ikony**: inline SVG (stroke, `currentColor`) — wyszukiwarka, serce, wiadomości, checkmarki itp. Zastąpić biblioteką ikon docelowego systemu (np. lucide).
- **Zdjęcia ofert**: brak realnych zdjęć — placeholdery to gradienty + tekstura. W produkcji podłączyć prawdziwe zdjęcia/CDN; gradient może zostać jako fallback.
- **Mapa**: schematyczna mapa Trójmiasta narysowana w SVG. W produkcji użyć realnej mapy (np. MapLibre / Mapbox / Leaflet) z geokodowaniem dzielnic.
- Brak zewnętrznych assetów do skopiowania poza fontami.

## Files
- `REALS.dc.html` — główny, kompletny prototyp (wszystkie ekrany + logika + dane mock).
- `REALS Kierunki.dc.html` — wariant / eksploracja kierunków projektowych.
- `REALS-print-8xslfc.dc.html` — wersja do druku / PDF.
- `support.js` — runtime podglądu wymagany do otwarcia plików `.dc.html` w przeglądarce (nie część produkcji).

---

## Co jeszcze warto przygotować przed kodowaniem
1. **Backend deduplikacji** — algorytm scalania tej samej nieruchomości z wielu źródeł (matching po adresie/metrażu/cechach) to serce produktu; wymaga osobnej specyfikacji i danych testowych z realnych portali/biur.
2. **Serwis AVM** — model wyceny (źródło danych transakcyjnych, metodyka przedziału `avmLow/avmHigh`, częstotliwość odświeżania). Tu zamockowany jako `fair × area`.
3. **Źródła danych ofert** — integracje/feedy z biurami i deweloperami (API, XML, scraping?) + zgody prawne.
4. **Realna mapa i geokodowanie** dzielnic, izochrony dojazdu (np. usługa routingu).
5. **Auth, konta, RODO** — logowanie, zapisane oferty, zgody marketingowe, polityka prywatności.
6. **Wiadomości realtime** — backend czatu (WebSocket), powiadomienia, moderacja.
7. **Płatności/subskrypcje** dla agencji i deweloperów (plany, fakturowanie).
8. **Zgodność prawna** — publikacja cenników deweloperów (ustawa o jawności cen / dane.gov.pl), regulamin marketplace.
9. **Treść realna** — zdjęcia ofert, kopie, dane kontaktowe.
10. **Testy i analityka** — zdarzenia (wyświetlenia oferty, kontakt, zapis), A/B layoutów.
