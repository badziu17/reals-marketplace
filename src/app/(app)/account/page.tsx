import { AccountSettings } from "@/components/account/AccountSettings";

// Iteracja 14 (RODO): profil, eksport danych (art. 15/20), usunięcie konta
// (art. 17 — anonimizacja, nie hard-delete; patrz /api/account/delete).
export default function AccountPage() {
  return <AccountSettings />;
}
