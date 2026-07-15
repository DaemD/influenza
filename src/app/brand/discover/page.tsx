"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { CreatorCard, type CreatorCardData } from "@/components/creator-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, FOLLOWER_TIERS, PAKISTAN_CITIES, PLATFORMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SORTS = [
  { id: "relevant", label: "Most relevant" },
  { id: "followers", label: "Highest followers" },
  { id: "price", label: "Lowest price" },
  { id: "engagement", label: "Highest engagement" },
  { id: "newest", label: "Newest" },
] as const;

export default function DiscoverPage() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [category, setCategory] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [tier, setTier] = useState("");
  const [verified, setVerified] = useState(true);
  const [sort, setSort] = useState("relevant");

  const selectedTier = FOLLOWER_TIERS.find((t) => t.id === tier);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (city) p.set("city", city);
    if (verified) p.set("verified", "1");
    if (selectedTier?.min) p.set("minFollowers", String(selectedTier.min));
    if (selectedTier?.max) p.set("maxFollowers", String(selectedTier.max));
    p.set("sort", sort);
    return p.toString();
  }, [q, category, city, verified, selectedTier, sort]);

  const { data, isLoading } = useQuery({
    queryKey: ["discover", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/discover?${queryString}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json() as Promise<{ creators: CreatorCardData[] }>;
    },
  });

  const creators = data?.creators ?? [];
  const featured = creators.slice(0, 4);
  const explore = creators.slice(4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] sm:text-4xl">
          Find & Hire Influencers
        </h1>
        <p className="mt-2 text-[#717171]">
          Search vetted Instagram creators across Pakistan and hire in minutes.
        </p>
      </div>

      {/* Sticky filter bar — Collabstr-style top filters */}
      <div className="sticky top-16 z-30 -mx-4 space-y-4 border-b border-[#ebebeb] bg-white px-4 py-4 sm:-mx-6 sm:px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#717171]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search creators, niches, cities…"
            className="h-12 rounded-full border-[#ebebeb] bg-[#f7f7f7] pl-11 text-base shadow-none focus-visible:bg-white"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#717171]">
            Platform
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  platform === p.id
                    ? "border-[var(--brand)] bg-[#fff0f6] text-[var(--brand)]"
                    : "border-[#ebebeb] text-[#717171] hover:border-[#d4d4d4]"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#717171]">
            Category
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium",
                !category
                  ? "border-[var(--brand)] bg-[#fff0f6] text-[var(--brand)]"
                  : "border-[#ebebeb] text-[#717171]"
              )}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(category === c ? null : c)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium",
                  category === c
                    ? "border-[var(--brand)] bg-[#fff0f6] text-[var(--brand)]"
                    : "border-[#ebebeb] text-[#717171]"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setVerified((v) => !v)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              verified
                ? "border-[var(--brand)] bg-[#fff0f6] text-[var(--brand)]"
                : "border-[#ebebeb] text-[#717171]"
            )}
          >
            Verified only
          </button>
          {FOLLOWER_TIERS.filter((t) => t.id).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTier(tier === t.id ? "" : t.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                tier === t.id
                  ? "border-[var(--brand)] bg-[#fff0f6] text-[var(--brand)]"
                  : "border-[#ebebeb] text-[#717171]"
              )}
            >
              {t.label}
            </button>
          ))}
          {PAKISTAN_CITIES.slice(0, 5).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCity(city === c ? null : c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                city === c
                  ? "border-[var(--brand)] bg-[#fff0f6] text-[var(--brand)]"
                  : "border-[#ebebeb] text-[#717171]"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSort(s.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                sort === s.id
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-[#f7f7f7] text-[#717171] hover:bg-[#ebebeb]"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-x-4 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : creators.length ? (
        <div className="space-y-10">
          {featured.length ? (
            <section>
              <h2 className="mb-4 text-xl font-bold text-[#1a1a1a]">Featured Creators</h2>
              <div className="grid gap-x-4 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {featured.map((creator) => (
                  <CreatorCard key={creator.id} creator={{ ...creator, featured: true }} />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1a1a1a]">Explore Creators</h2>
              <span className="text-sm text-[#717171]">{creators.length} results</span>
            </div>
            <div className="grid gap-x-4 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {(explore.length ? explore : creators).map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#ebebeb] px-6 py-16 text-center">
          <p className="font-semibold text-[#1a1a1a]">No creators found</p>
          <p className="mt-1 text-sm text-[#717171]">
            Try clearing filters or invite creators to join Influence.
          </p>
        </div>
      )}
    </div>
  );
}
