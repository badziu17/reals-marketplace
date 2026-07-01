import { Chrome } from "@/components/layout/Chrome";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Chrome />
      <main>{children}</main>
    </>
  );
}
