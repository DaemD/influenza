"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { CreatorCard, type CreatorCardData } from "@/components/creator-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, FOLLOWER_TIERS, PAKISTAN_CITIES } from "@/lib/constants";
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
  const [category, setCategory] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [tier, setTier] = useState("");
  const [verified, setVerified] = useState(true);
  const [sort, setSort] = useState("relevant");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const selectedTier = FOLLOWER_TIERS.find((t) => t.id === tier);

  const activeFilterCount = [category, city, tier, verified ? "v" : ""].filter(Boolean).length;

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

  function clearFilters() {
    setCategory(null);
    setCity("");
    setTier("");
    setVerified(false);
    setSort("relevant");
  }

  return (
    <div className="pb-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <p className="text-sm font-medium text-[var(--brand)]">Discover</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1a1a1a] sm:text-[2.5rem] sm:leading-tight">
          Find creators worth hiring
        </h1>
        <p className="mt-2 max-w-xl text-[#717171]">
          Browse Instagram creators across Pakistan — filter by niche, city, and reach.
        </p>
      </motion.div>

      {/* Compact sticky toolbar — search + controls only (does not cover the grid) */}
      <div className="sticky top-[6.75rem] z-30 -mx-4 border-b border-[#ebebeb]/70 bg-white/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:top-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9a9a9a]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, niche, or city…"
              className="h-11 rounded-full border-[#ebebeb] bg-[#f7f7f7] pl-10 pr-4 shadow-none transition-colors focus-visible:border-[#ff2d7b]/40 focus-visible:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                filtersOpen || activeFilterCount > 1
                  ? "border-[var(--brand)] bg-[#fff0f6] text-[var(--brand)]"
                  : "border-[#ebebeb] bg-white text-[#1a1a1a] hover:border-[#d4d4d4]"
              )}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            <label className="relative hidden sm:block">
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 appearance-none rounded-full border border-[#ebebeb] bg-white pl-4 pr-9 text-sm font-medium text-[#1a1a1a] outline-none transition-colors hover:border-[#d4d4d4] focus:border-[var(--brand)]"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                ▾
              </span>
            </label>
          </div>
        </div>

        {/* Categories — single slim scroll row */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={!category} onClick={() => setCategory(null)}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {c}
            </Chip>
          ))}
        </div>

        {/* Expandable advanced filters — not sticky forever covering content */}
        {filtersOpen ? (
          <div className="mt-3 grid gap-3 rounded-2xl border border-[#ebebeb] bg-[#fafafa] p-4 sm:grid-cols-3">
            <FilterField label="City">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ebebeb] bg-white px-3 text-sm outline-none focus:border-[var(--brand)]"
              >
                <option value="">All cities</option>
                {PAKISTAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Followers">
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ebebeb] bg-white px-3 text-sm outline-none focus:border-[var(--brand)]"
              >
                {FOLLOWER_TIERS.map((t) => (
                  <option key={t.id || "any"} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Sort">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ebebeb] bg-white px-3 text-sm outline-none focus:border-[var(--brand)] sm:hidden"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="hidden h-10 items-center text-sm text-[#717171] sm:flex">
                Use the sort menu above
              </p>
            </FilterField>

            <div className="flex items-end gap-2 sm:col-span-3">
              <button
                type="button"
                onClick={() => setVerified((v) => !v)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors",
                  verified
                    ? "border-[var(--brand)] bg-[#fff0f6] text-[var(--brand)]"
                    : "border-[#ebebeb] bg-white text-[#717171]"
                )}
              >
                <BadgeCheck className="size-4" />
                Verified analytics only
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[#717171] hover:text-[#1a1a1a]"
              >
                <X className="size-3.5" />
                Clear
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-[#717171]">
          {isLoading ? (
            "Searching…"
          ) : (
            <>
              <span className="font-semibold text-[#1a1a1a]">{creators.length}</span> creators
              {category ? (
                <>
                  {" "}
                  in <span className="font-medium text-[#1a1a1a]">{category}</span>
                </>
              ) : null}
              {city ? (
                <>
                  {" "}
                  · <span className="font-medium text-[#1a1a1a]">{city}</span>
                </>
              ) : null}
            </>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : creators.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
        >
          {creators.map((creator, i) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(i * 0.03, 0.24) }}
            >
              <CreatorCard creator={creator} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[#ebebeb] bg-[#fafafa] px-6 py-16 text-center">
          <p className="text-lg font-semibold text-[#1a1a1a]">No creators match</p>
          <p className="mt-1 text-sm text-[#717171]">
            Try a broader search or clear your filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 inline-flex h-10 items-center rounded-full bg-[#1a1a1a] px-5 text-sm font-medium text-white hover:bg-black"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-[#1a1a1a] text-white"
          : "bg-[#f3f3f3] text-[#555] hover:bg-[#ebebeb] hover:text-[#1a1a1a]"
      )}
    >
      {children}
    </button>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#9a9a9a]">
        {label}
      </span>
      {children}
    </label>
  );
}
