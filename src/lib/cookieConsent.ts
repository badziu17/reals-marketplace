// Zgoda na cookies — iteracja 14 (RODO).
//
// Tylko "niezbędne" (sesja NextAuth, localStorage funkcjonalny: fav,
// porównanie, urządzenie, preferencje) są aktywne bez zgody — to są dane
// niezbędne do funkcji, o które użytkownik sam poprosił (wyjątek z Prawa
// komunikacji elektronicznej, nie wymaga opt-in). "Analityczne" i
// "marketingowe" to kategorie na przyszłość (projekt nie ma jeszcze żadnego
// skryptu analitycznego/reklamowego) — infrastruktura zgody stoi gotowa,
// żeby nie trzeba było do tego wracać, gdy ktoś faktycznie doda GA4/piksel.

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const CONSENT_KEY = "reals-cookie-consent";
const REOPEN_EVENT = "reals-reopen-cookie-settings";

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

export function saveConsent(partial: { analytics: boolean; marketing: boolean }): ConsentState {
  const state: ConsentState = { necessary: true, ...partial, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    // localStorage niedostępny (np. tryb prywatny z zablokowanym storage) —
    // zgoda po prostu nie przetrwa odświeżenia, nic więcej nie da się zrobić
  }
  return state;
}

/** Czy dana kategoria (poza "necessary") ma zgodę — do gate'owania przyszłych skryptów. */
export function hasConsent(category: "analytics" | "marketing"): boolean {
  return !!getConsent()?.[category];
}

/** Wywoływane przez przycisk "Ustawienia cookies" w stopce, żeby ponownie otworzyć baner. */
export function requestReopenCookieSettings() {
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function onReopenCookieSettings(cb: () => void): () => void {
  window.addEventListener(REOPEN_EVENT, cb);
  return () => window.removeEventListener(REOPEN_EVENT, cb);
}
