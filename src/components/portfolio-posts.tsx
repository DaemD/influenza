"use client";

import { useMemo, useState } from "react";
import { Eye, Heart, MessageCircle, Play } from "lucide-react";
import { formatFollowers, cn } from "@/lib/utils";

export type PortfolioPost = {
  id: string;
  mediaType?: string;
  caption?: string | null;
  permalink?: string | null;
  thumbnailUrl?: string | null;
  mediaUrl?: string | null;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number | null;
  postedAt?: string | null;
};

type SortKey = "recent" | "liked" | "comments" | "viewed" | "engaged";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "liked", label: "Most liked" },
  { value: "comments", label: "Most comments" },
  { value: "viewed", label: "Most viewed" },
  { value: "engaged", label: "Most engaged" },
];

function engagementScore(post: PortfolioPost) {
  return (post.likeCount ?? 0) + (post.commentCount ?? 0);
}

function sortPosts(posts: PortfolioPost[], sort: SortKey): PortfolioPost[] {
  const copy = [...posts];
  switch (sort) {
    case "liked":
      return copy.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
    case "comments":
      return copy.sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));
    case "viewed":
      return copy.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    case "engaged":
      return copy.sort((a, b) => engagementScore(b) - engagementScore(a));
    case "recent":
    default:
      return copy.sort((a, b) => {
        const at = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const bt = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        return bt - at;
      });
  }
}

export function PortfolioPosts({ posts }: { posts: PortfolioPost[] }) {
  const [sort, setSort] = useState<SortKey>("recent");
  const sorted = useMemo(() => sortPosts(posts, sort), [posts, sort]);

  if (!posts.length) {
    return (
      <div>
        <h2 className="text-xl font-bold text-[#1a1a1a]">Posts</h2>
        <div className="mt-3 rounded-xl border border-dashed border-[#ebebeb] bg-[#f7f7f7] px-4 py-6 text-sm text-[#717171]">
          <p className="font-medium text-[#1a1a1a]">No feed posts from Instagram yet</p>
          <p className="mt-2 leading-relaxed">
            Meta&apos;s API returned <span className="font-medium text-[#1a1a1a]">0 media</span> for
            this Creator account. Stories and highlights are not included. If you already have feed
            posts or Reels on Instagram:
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>Confirm the account is Professional (Creator / Business)</li>
            <li>Publish a new Reel or feed post on Instagram</li>
            <li>Come back here → Settings → Sync analytics</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">Posts</h2>
          <p className="mt-1 text-sm text-[#717171]">
            {posts.length} Instagram posts · likes, comments
            {posts.some((p) => (p.viewCount ?? 0) > 0) ? " & views" : ""}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#717171]">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-full border border-[#ebebeb] bg-white px-3.5 pr-8 text-sm font-medium text-[#1a1a1a] outline-none focus:border-[var(--brand)]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sorted.map((post) => {
          const src = post.thumbnailUrl || post.mediaUrl || "";
          const isVideo =
            post.mediaType === "VIDEO" ||
            post.mediaType === "REELS" ||
            post.mediaType === "VIDEO";
          const likes = post.likeCount ?? 0;
          const comments = post.commentCount ?? 0;
          const views = post.viewCount ?? 0;

          const body = (
            <div className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="size-full object-cover" />
              ) : (
                <div className="size-full bg-neutral-100" />
              )}

              {isVideo ? (
                <div className="absolute left-2 top-2 rounded-md bg-black/60 p-1 text-white">
                  <Play className="size-3.5 fill-white" />
                </div>
              ) : null}

              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-2.5 pb-2.5 pt-10",
                  "opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                )}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-white">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3.5" />
                    {formatFollowers(likes)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="size-3.5" />
                    {formatFollowers(comments)}
                  </span>
                  {views > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3.5" />
                      {formatFollowers(views)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );

          if (post.permalink) {
            return (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {body}
              </a>
            );
          }

          return (
            <div key={post.id} className="block">
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
