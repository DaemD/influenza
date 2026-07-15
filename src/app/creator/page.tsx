import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatFollowers, formatEngagement } from "@/lib/utils";

export default async function CreatorHomePage() {
  const session = await requireRole("CREATOR");
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      socialAccounts: {
        where: { platform: "INSTAGRAM", deletedAt: null },
        include: { metrics: { where: { isCurrent: true }, take: 1 } },
        take: 1,
      },
      offers: {
        where: { status: "PENDING", deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const ig = profile?.socialAccounts[0];
  const metrics = ig?.metrics[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi, {profile?.displayName ?? session.user.name}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Your creator home — offers, messages, and profile at a glance.
        </p>
      </div>

      {!profile?.isOnboarded ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
          <p className="font-medium text-neutral-900">Finish onboarding</p>
          <p className="mt-1 text-sm text-neutral-500">
            Connect Instagram and complete your profile to appear in Discover.
          </p>
          <Link
            href="/onboarding/creator"
            className={cn(buttonVariants(), "mt-4 inline-flex rounded-xl")}
          >
            Continue setup
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-neutral-400">Followers</p>
          <p className="mt-1 text-2xl font-semibold">
            {metrics ? formatFollowers(metrics.followers) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-neutral-400">Engagement</p>
          <p className="mt-1 text-2xl font-semibold">
            {metrics ? formatEngagement(metrics.engagementRate) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-neutral-400">Pending offers</p>
          <p className="mt-1 text-2xl font-semibold">{profile?.offers.length ?? 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent offers</h2>
          <Link
            href="/creator/offers"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            View all
          </Link>
        </div>
        {profile?.offers.length ? (
          <ul className="mt-4 divide-y divide-neutral-100">
            {profile.offers.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{o.title}</p>
                  <p className="text-xs text-neutral-400">PKR {o.budgetPkr.toLocaleString()}</p>
                </div>
                <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-700">
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">No offers yet. Brands will find you on Discover.</p>
        )}
      </div>
    </div>
  );
}
