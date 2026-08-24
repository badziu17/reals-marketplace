// Regulamin — iteracja 14 (RODO/zgodność prawna).
// Jak Polityka prywatności: solidny SZKIC, nie zastępuje przeglądu prawnego.
// Pola w nawiasach kwadratowych wymagają uzupełnienia przed publikacją.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="mb-2.5 font-display text-lg font-bold text-ink">{title}</h2>
      <div className="flex flex-col gap-2.5 text-[14.5px] leading-relaxed text-ink-secondary">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[760px] px-[22px] py-11">
      <h1 className="mb-1.5 font-display text-[28px] font-bold tracking-heading text-ink">Regulamin serwisu REALS</h1>
      <p className="mb-8 text-sm text-ink-faint">Ostatnia aktualizacja: [DATA]</p>

      <Section title="1. Definicje">
        <ul className="list-disc pl-5">
          <li><b>Serwis</b> — platforma REALS dostępna pod adresem [DOMENA].</li>
          <li><b>Administrator</b> — [NAZWA FIRMY / IMIĘ I NAZWISKO], operator Serwisu.</li>
          <li><b>Użytkownik</b> — osoba fizyczna korzystająca z Serwisu, w tym Ogłoszeniodawca.</li>
          <li><b>Ogłoszeniodawca</b> — Użytkownik publikujący Ogłoszenie za pomocą kreatora „Sprzedaj”.</li>
          <li><b>Ogłoszenie</b> — treść dotycząca nieruchomości opublikowana przez Ogłoszeniodawcę w Serwisie.</li>
        </ul>
      </Section>

      <Section title="2. Przedmiot regulaminu">
        <p>
          Regulamin określa zasady korzystania z Serwisu, w tym zakładania konta, publikowania Ogłoszeń, komunikacji
          między Użytkownikami oraz zasady odpowiedzialności Administratora.
        </p>
      </Section>

      <Section title="3. Warunki korzystania z Serwisu">
        <ul className="list-disc pl-5">
          <li>Z Serwisu mogą korzystać osoby, które ukończyły 18 lat i posiadają pełną zdolność do czynności prawnych.</li>
          <li>Założenie konta wymaga podania prawdziwych danych (adres e-mail) oraz akceptacji niniejszego Regulaminu i Polityki prywatności.</li>
          <li>Użytkownik odpowiada za zachowanie poufności swojego hasła i za działania wykonane z użyciem swojego konta.</li>
          <li>Zabronione jest zakładanie wielu kont w celu obejścia ograniczeń Serwisu.</li>
        </ul>
      </Section>

      <Section title="4. Publikacja ogłoszeń">
        <ul className="list-disc pl-5">
          <li>Publikacja Ogłoszeń przez osoby prywatne jest bezpłatna.</li>
          <li>Ogłoszeniodawca oświadcza, że jest uprawniony do dysponowania nieruchomością (właściciel, pełnomocnik lub osoba działająca w jego imieniu) oraz że podane informacje są prawdziwe i kompletne.</li>
          <li>Zabronione jest publikowanie Ogłoszeń: nieprawdziwych, wprowadzających w błąd, naruszających prawa osób trzecich, dotyczących nieruchomości, którymi Ogłoszeniodawca nie ma prawa dysponować, oraz zawierających treści niezgodne z prawem.</li>
          <li>Administrator zastrzega sobie prawo do usunięcia lub zawieszenia Ogłoszenia naruszającego Regulamin lub przepisy prawa, bez konieczności wcześniejszego powiadomienia.</li>
          <li>Wycena orientacyjna („wycena REALS”) prezentowana przy Ogłoszeniach ma charakter wyłącznie informacyjny i nie stanowi operatu szacunkowego w rozumieniu przepisów o gospodarce nieruchomościami. Nie może być podstawą decyzji finansowych bez konsultacji z rzeczoznawcą majątkowym.</li>
        </ul>
      </Section>

      <Section title="5. Komunikacja między Użytkownikami">
        <ul className="list-disc pl-5">
          <li>Moduł „Wiadomości” służy wyłącznie do komunikacji w sprawach związanych z Ogłoszeniami.</li>
          <li>Zabronione jest wykorzystywanie modułu do rozsyłania niechcianych treści (spam), reklam niezwiązanych z Serwisem lub treści niezgodnych z prawem.</li>
          <li>Administrator nie jest stroną rozmów prowadzonych między Użytkownikami i nie ponosi odpowiedzialności za ich treść.</li>
        </ul>
      </Section>

      <Section title="6. Odpowiedzialność Administratora">
        <ul className="list-disc pl-5">
          <li>Administrator pełni funkcję pośrednika technicznego, umożliwiającego publikację Ogłoszeń i kontakt między Użytkownikami — nie jest stroną transakcji dotyczących nieruchomości.</li>
          <li>Administrator nie weryfikuje stanu prawnego ani technicznego nieruchomości prezentowanych w Ogłoszeniach i nie ponosi za nie odpowiedzialności.</li>
          <li>Administrator dokłada starań, aby Serwis działał nieprzerwanie, ale nie gwarantuje nieprzerwanej dostępności.</li>
        </ul>
      </Section>

      <Section title="7. Reklamacje">
        <p>
          Reklamacje dotyczące funkcjonowania Serwisu można zgłaszać na adres [E-MAIL KONTAKTOWY]. Reklamacja
          powinna zawierać opis problemu oraz dane kontaktowe. Administrator rozpatruje reklamacje w terminie 14 dni.
        </p>
      </Section>

      <Section title="8. Usunięcie konta">
        <p>
          Użytkownik może w każdej chwili usunąć konto w{" "}
          <a href="/account" className="font-semibold text-terracotta underline">
            ustawieniach konta
          </a>
          . Szczegóły dotyczące przetwarzania danych po usunięciu konta opisuje Polityka prywatności.
        </p>
      </Section>

      <Section title="9. Postanowienia końcowe">
        <p>
          W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy prawa polskiego, w tym Kodeksu
          cywilnego i ustawy o świadczeniu usług drogą elektroniczną. Administrator zastrzega sobie prawo do zmiany
          Regulaminu — o zmianach poinformuje z odpowiednim wyprzedzeniem.
        </p>
      </Section>
    </main>
  );
}
