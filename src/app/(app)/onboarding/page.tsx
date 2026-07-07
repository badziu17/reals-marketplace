import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

// Iteracja 10: kreator preferencji (4 kroki: dzielnice, budżet, pokoje,
// must-have). Wynik trafia jako prawdziwe filtry do /search (patrz
// OnboardingWizard.finish()) i, jeśli użytkownik jest zalogowany, zapisuje
// się trwale w UserPreferences (POST /api/preferences).
export default function OnboardingPage() {
  return <OnboardingWizard />;
}
