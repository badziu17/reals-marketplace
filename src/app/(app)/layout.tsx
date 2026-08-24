import { Chrome } from "@/components/layout/Chrome";
import { Footer } from "@/components/layout/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Chrome />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
