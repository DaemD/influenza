"use client";

import { useQuery } from "@tanstack/react-query";
import { CreatorCard, type CreatorCardData } from "@/components/creator-card";

export default function SavedCreatorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["saved"],
    queryFn: async () => {
      const res = await fetch("/api/saved");
      return res.json();
    },
  });

  const creators: CreatorCardData[] = (data?.saved ?? []).map(
    (s: {
      creatorProfile: {
        id: string;
        displayName: string;
        location: string | null;
        categories: string[];
        priceFromPkr: number | null;
        averageRating: number;
        socialAccounts: Array<{
          username: string;
          profileImageUrl: string | null;
          isAnalyticsVerified: boolean;
          metrics: Array<{ followers: number; engagementRate: number }>;
        }>;
      };
    }) => {
      const ig = s.creatorProfile.socialAccounts[0];
      const m = ig?.metrics[0];
      return {
        id: s.creatorProfile.id,
        displayName: s.creatorProfile.displayName,
        username: ig?.username ?? "creator",
        location: s.creatorProfile.location,
        categories: s.creatorProfile.categories,
        priceFromPkr: s.creatorProfile.priceFromPkr,
        averageRating: s.creatorProfile.averageRating,
        verified: ig?.isAnalyticsVerified ?? false,
        photoUrl: ig?.profileImageUrl ?? null,
        followers: m?.followers ?? 0,
        engagementRate: m?.engagementRate ?? 0,
      };
    }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saved creators</h1>
        <p className="mt-1 text-sm text-neutral-500">Your shortlist for upcoming campaigns.</p>
      </div>
      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : creators.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">No saved creators yet.</p>
      )}
    </div>
  );
}
