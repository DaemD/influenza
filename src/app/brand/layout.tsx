import { AppNav } from "@/components/app-nav";
import { BRAND_NAV } from "@/lib/constants";
import { requireRole } from "@/lib/session";

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("BRAND");
  return (
    <div className="min-h-screen bg-white">
      <AppNav items={BRAND_NAV} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
