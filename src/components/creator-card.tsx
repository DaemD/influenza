"use client";

import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { formatEngagement, formatFollowers, formatPkr } from "@/lib/utils";

export type CreatorCardData = {
  id: string;
  displayName: string;
  username: string;
  location: string | null;
  categories: string[];
  priceFromPkr: number | null;
  averageRating: number;
  verified: boolean;
  photoUrl: string | null;
  followers: number;
  engagementRate: number;
  bio?: string | null;
  featured?: boolean;
};

export function CreatorCard({ creator }: { creator: CreatorCardData }) {
  const title = creator.categories[0]
    ? `${creator.categories[0]} Creator`
    : "Content Creator";

  return (
    <Link
      href={`/brand/creators/${creator.id}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f3f3f3]">
        {creator.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.photoUrl}
            alt={creator.displayName}
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#f5f5f5] via-[#f0f0f0] to-[#ffe4ef]">
            <span className="text-4xl font-semibold tracking-tight text-[#c4c4c4]">
              {creator.displayName.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent opacity-80" />

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          <span className="rounded-lg bg-black/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {formatFollowers(creator.followers)}
          </span>
          {creator.verified ? (
            <span className="inline-flex items-center gap-0.5 rounded-lg bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-[#1a1a1a] backdrop-blur-sm">
              <BadgeCheck className="size-3 text-[var(--brand)]" />
              Verified
            </span>
          ) : null}
        </div>

        {creator.engagementRate > 0 ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#1a1a1a] backdrop-blur-sm">
            {formatEngagement(creator.engagementRate)} eng.
          </span>
        ) : null}
      </div>

      <div className="space-y-0.5 pt-3">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-[#1a1a1a]">
            {creator.displayName}
          </h3>
          {creator.averageRating > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-[#1a1a1a]">
              <Star className="size-3 fill-[#ffb400] text-[#ffb400]" />
              {creator.averageRating.toFixed(1)}
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm text-[#717171]">{title}</p>
        <p className="pt-0.5 text-[15px] font-semibold text-[#1a1a1a]">
          {creator.priceFromPkr != null ? (
            <>
              from <span className="text-[var(--brand)]">{formatPkr(creator.priceFromPkr)}</span>
            </>
          ) : (
            "Price on request"
          )}
        </p>
        {creator.location ? (
          <p className="truncate text-xs text-[#9a9a9a]">{creator.location}</p>
        ) : null}
      </div>
    </Link>
  );
}
