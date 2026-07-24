"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatEngagement, formatFollowers } from "@/lib/utils";
import { toast } from "sonner";

function InstagramSettingsInner({ email }: { email: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ["instagram-status"],
    queryFn: async () => {
      const res = await fetch("/api/instagram/status");
      return res.json();
    },
  });

  useEffect(() => {
    const result = searchParams.get("instagram");
    const message = searchParams.get("message");
    if (result === "connected") {
      toast.success("Instagram reconnected");
      void qc.invalidateQueries({ queryKey: ["instagram-status"] });
      router.replace("/creator/settings");
    } else if (result === "error") {
      toast.error(message || "Instagram connection failed");
      router.replace("/creator/settings");
    }
  }, [searchParams, qc, router]);

  const sync = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sync failed");
      return json;
    },
    onSuccess: (data: {
      insights?: {
        insightsAttempted?: number;
        insightsSucceeded?: number;
        sampleRequestUrl?: string | null;
        sampleErrors?: Array<{ error?: string }>;
      };
    }) => {
      const i = data?.insights;
      if (i && typeof i.insightsAttempted === "number") {
        toast.success(
          `Synced — insights ${i.insightsSucceeded ?? 0}/${i.insightsAttempted} ok`
        );
        if (i.sampleRequestUrl) {
          console.info("[instagram sync] sample insights URL:", i.sampleRequestUrl);
        }
        if (i.sampleErrors?.length) {
          console.warn("[instagram sync] insights errors:", i.sampleErrors);
        }
      } else {
        toast.success("Analytics refreshed");
      }
      void qc.invalidateQueries({ queryKey: ["instagram-status"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const account = status?.account;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Account and Instagram connection.</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-500">Signed in as</p>
        <p className="font-medium">{email}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-semibold">Instagram</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Business or Creator account required for verified analytics.
          </p>
        </div>

        {account ? (
          <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-4">
            <Avatar className="size-12">
              <AvatarImage src={account.profileImageUrl ?? undefined} />
              <AvatarFallback>
                {(account.displayName || account.username).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-medium">@{account.username}</p>
                {account.verified ? <BadgeCheck className="size-4 text-blue-600" /> : null}
              </div>
              <p className="text-sm text-neutral-500">
                {formatFollowers(account.followers)} · {formatEngagement(account.engagementRate)}
                {account.hasRealToken ? "" : " · demo data"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No Instagram account connected.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-xl"
            onClick={() => {
              if (status?.configured) {
                window.location.href =
                  "/api/instagram/connect?returnTo=" +
                  encodeURIComponent("/creator/settings");
              } else {
                toast.error("Set META_APP_ID and META_APP_SECRET in .env first");
              }
            }}
          >
            {account ? "Reconnect" : "Connect Instagram"}
          </Button>
          {account?.hasRealToken ? (
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={sync.isPending}
              onClick={() => sync.mutate()}
            >
              <RefreshCw className="mr-1 size-4" />
              {sync.isPending ? "Syncing…" : "Sync analytics"}
            </Button>
          ) : null}
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Payments (Stripe, PayFast, Easypaisa, JazzCash) come in a later release.
      </p>
    </div>
  );
}

export function InstagramSettings({ email }: { email: string }) {
  return (
    <Suspense>
      <InstagramSettingsInner email={email} />
    </Suspense>
  );
}
