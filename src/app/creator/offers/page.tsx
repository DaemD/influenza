"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatPkr } from "@/lib/utils";
import { toast } from "sonner";

type Offer = {
  id: string;
  title: string;
  description: string;
  budgetPkr: number;
  status: string;
  deliverables: string[];
  brandUser?: { name: string; brandProfile?: { companyName: string } | null };
  creatorProfile?: { displayName: string };
};

export default function CreatorOffersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await fetch("/api/offers");
      return res.json() as Promise<{ offers: Offer[] }>;
    },
  });

  const update = useMutation({
    mutationFn: async (payload: { id: string; status: string; counterBudgetPkr?: number }) => {
      const res = await fetch("/api/offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offer updated");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Offers</h1>
        <p className="mt-1 text-sm text-neutral-500">Accept, decline, or counter brand proposals.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : data?.offers?.length ? (
        <ul className="space-y-3">
          {data.offers.map((offer) => (
            <li
              key={offer.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{offer.title}</p>
                  <p className="text-sm text-neutral-500">
                    {offer.brandUser?.brandProfile?.companyName ?? offer.brandUser?.name} ·{" "}
                    {formatPkr(offer.budgetPkr)}
                  </p>
                  <p className="mt-2 text-sm text-neutral-600">{offer.description}</p>
                  {offer.deliverables?.length ? (
                    <p className="mt-2 text-xs text-neutral-400">
                      {offer.deliverables.join(" · ")}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-medium">
                  {offer.status}
                </span>
              </div>
              {offer.status === "PENDING" || offer.status === "COUNTERED" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() => update.mutate({ id: offer.id, status: "ACCEPTED" })}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => update.mutate({ id: offer.id, status: "DECLINED" })}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() =>
                      update.mutate({
                        id: offer.id,
                        status: "COUNTERED",
                        counterBudgetPkr: Math.round(offer.budgetPkr * 1.2),
                      })
                    }
                  >
                    Counter +20%
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">No offers yet.</p>
      )}
    </div>
  );
}
