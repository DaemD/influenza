"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bookmark,
  Heart,
  MessageSquare,
  Share2,
  Star,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PortfolioPosts } from "@/components/portfolio-posts";
import { cn, formatEngagement, formatFollowers, formatPkr } from "@/lib/utils";
import { toast } from "sonner";

export default function CreatorPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deliverables, setDeliverables] = useState("1 Reel");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["creator", id],
    queryFn: async () => {
      const res = await fetch(`/api/creator/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const sendOffer = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorProfileId: id,
          title: title || selectedPackage || "Collaboration",
          description,
          budgetPkr: Number(budget),
          deliverables: deliverables
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Offer sent");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveCreator = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorProfileId: id }),
      });
      if (!res.ok) throw new Error("Could not save");
      return res.json();
    },
    onSuccess: () => toast.success("Saved to your list"),
  });

  if (isLoading) {
    return <p className="text-sm text-[#717171]">Loading profile…</p>;
  }

  const profile = data?.profile;
  if (!profile) return <p>Creator not found</p>;

  const ig = profile.socialAccounts?.find(
    (a: { platform: string }) => a.platform === "INSTAGRAM"
  );
  const metrics = ig?.metrics?.[0];
  const reviews = profile.user?.reviewsReceived ?? [];
  const posts = ig?.posts ?? [];
  const nicheTitle = profile.categories?.[0]
    ? `${profile.categories.join(", ")}`
    : "Content Creator";

  const packages = [
    { key: "story", label: "1 Instagram Story", price: profile.storyPricePkr },
    { key: "post", label: "1 Instagram Feed Post", price: profile.postPricePkr },
    { key: "reel", label: "1 Instagram Reel", price: profile.reelPricePkr },
    { key: "bundle", label: "Bundle (Story + Post + Reel)", price: profile.bundlePricePkr },
  ].filter((p) => p.price != null);

  const startingPrice =
    profile.priceFromPkr ??
    (packages.length ? Math.min(...packages.map((p) => p.price as number)) : null);

  function pickPackage(pkg: { key: string; label: string; price: number | null }) {
    setSelectedPackage(pkg.label);
    setTitle(pkg.label);
    setDeliverables(pkg.label);
    if (pkg.price != null) setBudget(String(pkg.price));
    setOpen(true);
  }

  return (
    <div className="pb-24 lg:pb-8">
      {/* Top actions — Collabstr Share / Save */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#717171]">{nicheTitle}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1a1a1a] sm:text-3xl">
            {profile.displayName}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              void navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied");
            }}
          >
            <Share2 className="mr-1 size-3.5" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => saveCreator.mutate()}
          >
            <Heart className="mr-1 size-3.5" />
            Save
          </Button>
        </div>
      </div>

      {/* Photo gallery */}
      <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl md:grid-cols-4 md:grid-rows-2 md:gap-2">
        <div className="relative col-span-2 row-span-2 aspect-square bg-neutral-100 md:aspect-auto md:min-h-[360px]">
          {ig?.profileImageUrl || posts[0]?.thumbnailUrl || posts[0]?.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                ig?.profileImageUrl ||
                posts[0]?.thumbnailUrl ||
                posts[0]?.mediaUrl ||
                ""
              }
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#fbcfe8] to-[#ff2d7b] text-5xl font-bold text-white">
              {profile.displayName.slice(0, 1)}
            </div>
          )}
        </div>
        {(posts.length ? posts : [1, 2, 3]).slice(0, 4).map((post: unknown, i: number) => {
          const p = typeof post === "object" && post !== null ? (post as { thumbnailUrl?: string; mediaUrl?: string }) : {};
          return (
            <div key={i} className="relative hidden aspect-square bg-neutral-100 md:block">
              {p.thumbnailUrl || p.mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.thumbnailUrl || p.mediaUrl || ""}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full bg-neutral-100" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-10">
          <section className="border-b border-[#ebebeb] pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[#1a1a1a]">{profile.displayName}</h2>
              {ig?.isAnalyticsVerified ? (
                <BadgeCheck className="size-5 text-[var(--brand)]" />
              ) : null}
            </div>
            <p className="mt-1 text-sm text-[#717171]">
              {profile.averageRating > 0 ? (
                <span className="inline-flex items-center gap-1 font-medium text-[#1a1a1a]">
                  <Star className="size-3.5 fill-[#ffb400] text-[#ffb400]" />
                  {profile.averageRating.toFixed(1)}
                  <span className="font-normal text-[#717171]">
                    · {profile.reviewCount || reviews.length} reviews
                  </span>
                </span>
              ) : (
                "New on Influence"
              )}
              {profile.location ? ` · ${profile.location}` : null}
            </p>
            <p className="mt-1 text-sm text-[#717171]">@{ig?.username ?? "creator"}</p>
            {profile.bio ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#1a1a1a]">
                {profile.bio}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="font-semibold text-[#1a1a1a]">
                  {metrics ? formatFollowers(metrics.followers) : "—"}
                </p>
                <p className="text-[#717171]">Followers</p>
              </div>
              <div>
                <p className="font-semibold text-[#1a1a1a]">
                  {metrics ? formatEngagement(metrics.engagementRate) : "—"}
                </p>
                <p className="text-[#717171]">Engagement</p>
              </div>
              <div>
                <p className="font-semibold text-[#1a1a1a]">
                  {metrics ? formatFollowers(Math.round(metrics.avgLikes)) : "—"}
                </p>
                <p className="text-[#717171]">Avg likes</p>
              </div>
            </div>
          </section>

          {/* Packages — Collabstr style */}
          <section className="border-b border-[#ebebeb] pb-8">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Packages</h2>
            <p className="mt-1 text-sm text-[#717171]">Instagram</p>
            <ul className="mt-4 divide-y divide-[#ebebeb] rounded-xl border border-[#ebebeb]">
              {packages.length ? (
                packages.map((pkg) => (
                  <li
                    key={pkg.key}
                    className="flex items-center justify-between gap-4 px-4 py-4"
                  >
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{pkg.label}</p>
                      <p className="text-sm font-semibold text-[#1a1a1a]">
                        {formatPkr(pkg.price as number)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full bg-[var(--brand)] text-white hover:bg-[#e0266c]"
                      onClick={() => pickPackage(pkg)}
                    >
                      Select
                    </Button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-sm text-[#717171]">
                  No packages listed yet. Send a custom offer instead.
                </li>
              )}
            </ul>
            <button
              type="button"
              className="mt-4 text-sm font-semibold text-[var(--brand)] underline-offset-2 hover:underline"
              onClick={() => {
                setSelectedPackage(null);
                setTitle("Custom collaboration");
                setOpen(true);
              }}
            >
              Negotiate a package
            </button>
          </section>

          {/* Analytics */}
          <section className="border-b border-[#ebebeb] pb-8">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Analytics</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Followers", value: metrics ? formatFollowers(metrics.followers) : "—" },
                {
                  label: "Engagement rate",
                  value: metrics ? formatEngagement(metrics.engagementRate) : "—",
                },
                {
                  label: "Average likes",
                  value: metrics ? formatFollowers(Math.round(metrics.avgLikes)) : "—",
                },
                {
                  label: "Average comments",
                  value: metrics ? String(Math.round(metrics.avgComments)) : "—",
                },
                {
                  label: "Average reel views",
                  value: metrics ? formatFollowers(Math.round(metrics.avgReelViews)) : "—",
                },
                {
                  label: "Posts",
                  value: metrics ? String(metrics.mediaCount) : "—",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[#ebebeb] px-4 py-3"
                >
                  <p className="text-xs text-[#717171]">{stat.label}</p>
                  <p className="mt-1 text-lg font-semibold text-[#1a1a1a]">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Posts with per-post engagement */}
          <section className="border-b border-[#ebebeb] pb-8">
            <PortfolioPosts
              posts={(posts as Array<Record<string, unknown>>).map((post) => ({
                id: String(post.id),
                mediaType: post.mediaType as string | undefined,
                caption: (post.caption as string | null) ?? null,
                permalink: (post.permalink as string | null) ?? null,
                thumbnailUrl: (post.thumbnailUrl as string | null) ?? null,
                mediaUrl: (post.mediaUrl as string | null) ?? null,
                likeCount: Number(post.likeCount ?? 0),
                commentCount: Number(post.commentCount ?? 0),
                viewCount:
                  post.viewCount == null ? null : Number(post.viewCount),
                postedAt: (post.postedAt as string | null) ?? null,
              }))}
            />
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a]">Reviews</h2>
            {reviews.length ? (
              <ul className="mt-4 space-y-4">
                {reviews.map(
                  (r: {
                    id: string;
                    rating: number;
                    comment?: string;
                    reviewer: { name: string };
                  }) => (
                    <li key={r.id} className="rounded-xl border border-[#ebebeb] p-4">
                      <p className="flex items-center gap-1 text-sm font-medium">
                        <Star className="size-3.5 fill-[#ffb400] text-[#ffb400]" />
                        {r.rating}.0 · {r.reviewer.name}
                      </p>
                      {r.comment ? (
                        <p className="mt-2 text-sm text-[#717171]">{r.comment}</p>
                      ) : null}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#717171]">No reviews yet.</p>
            )}
          </section>
        </div>

        {/* Sticky hire panel — Collabstr sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[#ebebeb] p-5 shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
            <p className="text-2xl font-bold text-[#1a1a1a]">
              {startingPrice != null ? formatPkr(startingPrice) : "Custom"}
              <span className="ml-1 text-sm font-normal text-[#717171]">starting</span>
            </p>
            <p className="mt-1 text-sm text-[#717171]">
              {selectedPackage || "Pick a package or send a custom offer"}
            </p>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                className={cn(
                  buttonVariants(),
                  "mt-5 h-12 w-full rounded-full bg-[var(--brand)] text-base font-semibold text-white hover:bg-[#e0266c]"
                )}
              >
                Send offer
              </DialogTrigger>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Send offer to {profile.displayName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deliverables</Label>
                    <Input
                      value={deliverables}
                      onChange={(e) => setDeliverables(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget (PKR)</Label>
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <Button
                    className="h-11 w-full rounded-full bg-[var(--brand)] text-white hover:bg-[#e0266c]"
                    disabled={sendOffer.isPending}
                    onClick={() => sendOffer.mutate()}
                  >
                    {sendOffer.isPending ? "Sending…" : "Send offer"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Link
              href="/brand/messages"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-3 h-11 w-full rounded-full"
              )}
            >
              <MessageSquare className="mr-1 size-4" />
              Message
            </Link>

            <Button
              variant="ghost"
              className="mt-2 h-10 w-full rounded-full text-[#717171]"
              onClick={() => saveCreator.mutate()}
            >
              <Bookmark className="mr-1 size-4" />
              Save creator
            </Button>

            <p className="mt-4 text-center text-xs text-[#717171]">
              Can&apos;t find what you need?{" "}
              <button
                type="button"
                className="font-semibold text-[var(--brand)]"
                onClick={() => {
                  setTitle("Custom collaboration");
                  setOpen(true);
                }}
              >
                Negotiate a package
              </button>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
