import { SellWizard } from "@/components/sell/SellWizard";

// Iteracja 11: kreator ogłoszenia dla osób prywatnych (bezpłatny).
// Realny formularz (nie checklist-atrapa z prototypu) — zapisuje draft do
// Listing(status: DRAFT) i publikuje (status: PUBLISHED), widoczne w
// panelu "Twoje ogłoszenia" na tej samej stronie.
export default function SellPage() {
  return <SellWizard />;
}
