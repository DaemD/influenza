import { requireRole } from "@/lib/session";
import { store } from "@/lib/store";

export default async function BrandSettingsPage() {
  const session = await requireRole("BRAND");
  const brand = store.getBrand(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Brand account details.</p>
      </div>
      <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-500">Company</p>
        <p className="font-medium">{brand?.companyName ?? "—"}</p>
        <p className="pt-2 text-sm text-neutral-500">Email</p>
        <p className="font-medium">{session.user.email}</p>
        <p className="pt-4 text-xs text-amber-700">
          Note: data is in-memory until Railway Postgres is connected — it resets on redeploy.
        </p>
      </div>
    </div>
  );
}
