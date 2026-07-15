import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortfolioPosts } from "@/components/portfolio-posts";
import { cn, formatPkr } from "@/lib/utils";

export default async function CreatorProfilePage() {
  const session = await requireRole("CREATOR");
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      socialAccounts: {
        where: { deletedAt: null },
        include: {
          metrics: { where: { isCurrent: true }, take: 1 },
          posts: { orderBy: { postedAt: "desc" }, take: 24 },
        },
      },
    },
  });

  const posts =
    profile?.socialAccounts.find((a) => a.platform === "INSTAGRAM")?.posts ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-neutral-500">How brands see you on Influence.</p>
        </div>
        <Link
          href="/onboarding/creator"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          Edit
        </Link>
      </div>

      {profile ? (
        <>
          <div className="space-y-4 rounded-2xl border border-[#ebebeb] bg-white p-6">
            <h2 className="text-xl font-semibold">{profile.displayName}</h2>
            <p className="text-sm text-neutral-600">{profile.bio || "No bio yet."}</p>
            <p className="text-sm text-neutral-400">{profile.location}</p>
            <div className="flex flex-wrap gap-2">
              {profile.categories.map((c) => (
                <Badge key={c} variant="secondary" className="rounded-lg">
                  {c}
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <p className="text-xs text-neutral-400">Story</p>
                <p className="font-medium">
                  {profile.storyPricePkr != null ? formatPkr(profile.storyPricePkr) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Reel</p>
                <p className="font-medium">
                  {profile.reelPricePkr != null ? formatPkr(profile.reelPricePkr) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Post</p>
                <p className="font-medium">
                  {profile.postPricePkr != null ? formatPkr(profile.postPricePkr) : "—"}
                </p>
              </div>
            </div>
            {profile.socialAccounts.map((a) => (
              <div key={a.id} className="rounded-xl bg-neutral-50 p-4 text-sm">
                <p className="font-medium">
                  {a.platform} · @{a.username}{" "}
                  {a.isAnalyticsVerified ? "· Verified analytics" : ""}
                </p>
                {a.metrics[0] ? (
                  <p className="mt-1 text-neutral-500">
                    {a.metrics[0].followers.toLocaleString()} followers ·{" "}
                    {a.metrics[0].engagementRate.toFixed(1)}% engagement
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#ebebeb] bg-white p-6">
            <PortfolioPosts
              posts={posts.map((post) => ({
                id: post.id,
                mediaType: post.mediaType,
                caption: post.caption,
                permalink: post.permalink,
                thumbnailUrl: post.thumbnailUrl,
                mediaUrl: post.mediaUrl,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                viewCount: post.viewCount,
                postedAt: post.postedAt?.toISOString() ?? null,
              }))}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-neutral-500">Complete onboarding to create your profile.</p>
      )}
    </div>
  );
}
