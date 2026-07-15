"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { formatFollowers, formatPkr } from "@/lib/utils";

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
      className="group block overflow-hidden rounded-xl bg-white transition-opacity hover:opacity-95"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
        {creator.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.photoUrl}
            alt={creator.displayName}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-neutral-200 via-neutral-100 to-[#ffe4ef]">
            <span className="text-4xl font-semibold text-neutral-400">
              {creator.displayName.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          {formatFollowers(creator.followers)}
        </div>
      </div>

      <div className="space-y-0.5 pt-2.5">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[15px] font-semibold text-[#1a1a1a]">
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
        <p className="text-[15px] font-semibold text-[#1a1a1a]">
          {creator.priceFromPkr != null ? formatPkr(creator.priceFromPkr) : "Price on request"}
        </p>
        {creator.location ? (
          <p className="truncate text-xs text-[#717171]">{creator.location}</p>
        ) : null}
        {creator.featured && creator.bio ? (
          <p className="line-clamp-2 pt-1 text-xs leading-relaxed text-[#717171]">
            {creator.bio}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
