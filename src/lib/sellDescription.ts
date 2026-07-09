// Generator opisu ogłoszenia — iteracja 11 (Sell).
//
// UWAGA: to jest generator oparty o szablony, NIE prawdziwe wywołanie modelu
// językowego — w projekcie nie ma jeszcze żadnej integracji z zewnętrznym
// API LLM (ani klucza API do tego celu). Nazwa przycisku w UI ("Wygeneruj
// opis") celowo nie obiecuje więcej niż to dostarcza. Podłączenie prawdziwego
// wywołania (np. Claude API) to naturalny, ale osobny krok — wymagałby
// dodania klucza API i wydzielonego endpointu.

interface DescriptionInput {
  districtName: string;
  rooms: number;
  area: number;
  floor: number | null;
  year: number | null;
  type: "KUP" | "WYNAJEM";
  market: "PIERWOTNY" | "WTORNY";
  amenities: string[];
}

const AMENITY_PHRASES: Record<string, string> = {
  balkon: "balkonem",
  ogródek: "ogródkiem",
  parking: "miejscem parkingowym",
  winda: "windą w budynku",
};

export function generateListingDescription(input: DescriptionInput): string {
  const floorText =
    input.floor == null ? "" : input.floor === 0 ? " na parterze" : ` na ${input.floor} piętrze`;
  const yearText = input.year ? ` (rok budowy ${input.year})` : "";
  const marketText = input.market === "PIERWOTNY" ? "z rynku pierwotnego" : "z rynku wtórnego";

  const amenityList = input.amenities.map((a) => AMENITY_PHRASES[a]).filter(Boolean);
  const amenitiesText = amenityList.length
    ? ` Mieszkanie wyróżnia się ${amenityList.join(", ")}.`
    : "";

  const intro =
    input.type === "KUP"
      ? `${input.rooms}-pokojowe mieszkanie o powierzchni ${input.area} m² w ${input.districtName}${floorText}, ${marketText}${yearText}.`
      : `Do wynajęcia ${input.rooms}-pokojowe mieszkanie o powierzchni ${input.area} m² w ${input.districtName}${floorText}${yearText}.`;

  return `${intro}${amenitiesText} Spokojna okolica z dobrym dojazdem do centrum Trójmiasta — dobre miejsce do życia na co dzień.`;
}
