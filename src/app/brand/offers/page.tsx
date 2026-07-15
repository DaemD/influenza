"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatPkr } from "@/lib/utils";

type Offer = {
  id: string;
  title: string;
  budgetPkr: number;
  status: string;
  creatorProfile?: { displayName: string; id: string };
};

export default function BrandOffersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await fetch("/api/offers");
      return res.json() as Promise<{ offers: Offer[] }>;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Offers</h1>
        <p className="mt-1 text-sm text-neutral-500">Track proposals you&apos;ve sent to creators.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : data?.offers?.length ? (
        <ul className="space-y-3">
          {data.offers.map((offer) => (
            <li
              key={offer.id}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="font-semibold">{offer.title}</p>
                <p className="text-sm text-neutral-500">
                  {offer.creatorProfile ? (
                    <Link
                      href={`/brand/creators/${offer.creatorProfile.id}`}
                      className="hover:underline"
                    >
                      {offer.creatorProfile.displayName}
                    </Link>
                  ) : (
                    "Creator"
                  )}{" "}
                  · {formatPkr(offer.budgetPkr)}
                </p>
              </div>
              <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-medium">
                {offer.status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">
          No offers yet.{" "}
          <Link href="/brand/discover" className="font-medium text-neutral-900 underline">
            Discover creators
          </Link>
        </p>
      )}
    </div>
  );
}
