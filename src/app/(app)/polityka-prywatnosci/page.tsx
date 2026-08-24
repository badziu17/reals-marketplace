// Polityka prywatności — iteracja 14 (RODO).
//
// UWAGA: to jest solidny SZKIC pokrywający standardowe wymagane elementy
// (administrator, cele, podstawy prawne, retencja, prawa użytkownika,
// odbiorcy danych, cookies) — nie zastępuje przeglądu prawnego. Pola w
// nawiasach kwadratowych [TAK] wymagają uzupełnienia realnymi danymi firmy
// przed publikacją na żywo. Biorąc pod uwagę, że REALS ma czat i przetwarza
// dane transakcyjne (nie jest to prosty sklep), warto to przejrzeć z
// prawnikiem przed uruchomieniem produkcyjnym — patrz roadmap, iteracja 14.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="mb-2.5 font-display text-lg font-bold text-ink">{title}</h2>
      <div className="flex flex-col gap-2.5 text-[14.5px] leading-relaxed text-ink-secondary">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-[760px] px-[22px] py-11">
      <h1 className="mb-1.5 font-display text-[28px] font-bold tracking-heading text-ink">Polityka prywatności</h1>
      <p className="mb-8 text-sm text-ink-faint">Ostatnia aktualizacja: [DATA]</p>

      <Section title="1. Administrator danych">
        <p>
          Administratorem Twoich danych osobowych jest [NAZWA FIRMY / IMIĘ I NAZWISKO], [ADRES], NIP: [NIP]. Kontakt
          w sprawach ochrony danych: [E-MAIL KONTAKTOWY].
        </p>
      </Section>

      <Section title="2. Jakie dane przetwarzamy i po co">
        <p>
          <b>Konto użytkownika</b> — adres e-mail, imię/nazwa, zdjęcie profilowe (jeśli logujesz się przez Google),
          hasło (jako skrót, nigdy w postaci jawnej). Cel: umożliwienie założenia konta i korzystania z serwisu.
        </p>
        <p>
          <b>Ogłoszenia</b> — treść i zdjęcia ogłoszeń, które samodzielnie dodajesz w kreatorze „Sprzedaj”. Cel:
          publikacja Twojej oferty w wyszukiwarce.
        </p>
        <p>
          <b>Wiadomości</b> — treść wiadomości wysyłanych do innych użytkowników w module „Wiadomości”, w tym
          ewentualne zdjęcia-załączniki. Cel: umożliwienie kontaktu między kupującym a sprzedającym.
        </p>
        <p>
          <b>Preferencje wyszukiwania</b> — wybrane dzielnice, budżet, liczba pokoi, udogodnienia (z kreatora
          „Dostrój gust”). Cel: dopasowanie wyników wyszukiwania.
        </p>
        <p>
          <b>Pliki cookie i podobne technologie</b> — patrz sekcja 6.
        </p>
      </Section>

      <Section title="3. Podstawy prawne przetwarzania">
        <ul className="list-disc pl-5">
          <li>
            <b>Wykonanie umowy</b> (art. 6 ust. 1 lit. b RODO) — założenie konta, publikacja ogłoszeń, wiadomości
            między użytkownikami.
          </li>
          <li>
            <b>Zgoda</b> (art. 6 ust. 1 lit. a RODO) — cookies analityczne i marketingowe, newsletter (jeśli
            zostanie uruchomiony).
          </li>
          <li>
            <b>Prawnie uzasadniony interes administratora</b> (art. 6 ust. 1 lit. f RODO) — bezpieczeństwo serwisu,
            zapobieganie nadużyciom, podstawowa analityka niezbędna do utrzymania jakości usługi.
          </li>
        </ul>
      </Section>

      <Section title="4. Jak długo przechowujemy dane">
        <p>
          Dane konta — przez czas istnienia konta oraz do 12 miesięcy po jego usunięciu (dane rozliczeniowe zgodnie
          z odrębnymi przepisami, jeśli dotyczy). Ogłoszenia — do czasu ich wycofania przez użytkownika lub usunięcia
          konta. Wiadomości — przechowywane tak długo, jak trwa rozmowa; przy usunięciu konta dane osobowe nadawcy są
          anonimizowane, a treść rozmowy pozostaje widoczna dla drugiej strony (ma do tego prawo, skoro brała udział w
          korespondencji).
        </p>
      </Section>

      <Section title="5. Komu przekazujemy dane">
        <p>
          Dane mogą być przetwarzane przez podmioty świadczące dla nas usługi hostingu i infrastruktury (np. Vercel,
          dostawca bazy danych PostgreSQL) oraz uwierzytelniania (Google OAuth — jeśli logujesz się tą metodą) na
          podstawie umów powierzenia przetwarzania danych. Nie sprzedajemy danych osobowych podmiotom trzecim.
        </p>
      </Section>

      <Section title="6. Pliki cookie">
        <p>
          Używamy plików cookie i lokalnego przechowywania danych w przeglądarce (localStorage) w trzech kategoriach:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Niezbędne</b> — sesja logowania, zapisane ulubione oferty, lista porównania, wybrane preferencje
            wyszukiwania. Nie wymagają zgody — służą wyłącznie do funkcji, o które sam/-a poprosisz.
          </li>
          <li>
            <b>Analityczne</b> — pomagają nam rozumieć ruch na stronie. Wymagają Twojej zgody.
          </li>
          <li>
            <b>Marketingowe</b> — personalizacja treści/reklam. Wymagają Twojej zgody.
          </li>
        </ul>
        <p>
          Zgodę możesz w każdej chwili zmienić przyciskiem „Ustawienia cookies” w stopce strony.
        </p>
      </Section>

      <Section title="7. Twoje prawa">
        <p>Zgodnie z RODO przysługuje Ci prawo do:</p>
        <ul className="list-disc pl-5">
          <li>dostępu do swoich danych i otrzymania ich kopii,</li>
          <li>sprostowania nieprawidłowych danych,</li>
          <li>usunięcia danych („prawo do bycia zapomnianym”),</li>
          <li>ograniczenia przetwarzania,</li>
          <li>przenoszenia danych,</li>
          <li>wniesienia sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie,</li>
          <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).</li>
        </ul>
        <p>
          Pobranie kopii swoich danych i usunięcie konta możesz zrobić samodzielnie w{" "}
          <a href="/account" className="font-semibold text-terracotta underline">
            ustawieniach konta
          </a>
          . W pozostałych sprawach napisz na [E-MAIL KONTAKTOWY].
        </p>
      </Section>

      <Section title="8. Bezpieczeństwo">
        <p>
          Stosujemy odpowiednie środki techniczne i organizacyjne (szyfrowane połączenie HTTPS, hasła przechowywane
          jako skróty, ograniczony dostęp do danych) w celu ochrony Twoich danych przed nieuprawnionym dostępem.
        </p>
      </Section>

      <Section title="9. Zmiany polityki">
        <p>
          Możemy aktualizować niniejszą politykę — o istotnych zmianach poinformujemy w widoczny sposób w serwisie.
        </p>
      </Section>
    </main>
  );
}
