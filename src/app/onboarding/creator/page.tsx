"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Camera } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORIES, LANGUAGES, PAKISTAN_CITIES } from "@/lib/constants";
import { formatEngagement, formatFollowers, cn } from "@/lib/utils";
import { toast } from "sonner";

type Step = "instagram" | "profile";

type InstagramStatus = {
  configured: boolean;
  connected: boolean;
  account: {
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
    verified: boolean;
    followers: number;
    engagementRate: number;
    hasRealToken: boolean;
  } | null;
};

function CreatorOnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("instagram");
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [storyPrice, setStoryPrice] = useState("");
  const [reelPrice, setReelPrice] = useState("");
  const [postPrice, setPostPrice] = useState("");

  const { data: status, refetch } = useQuery({
    queryKey: ["instagram-status"],
    queryFn: async () => {
      const res = await fetch("/api/instagram/status");
      return res.json() as Promise<InstagramStatus>;
    },
  });

  useEffect(() => {
    const result = searchParams.get("instagram");
    const message = searchParams.get("message");
    if (result === "connected") {
      toast.success("Instagram connected · Verified analytics enabled");
      void refetch().then((r) => {
        const account = r.data?.account;
        if (account?.displayName) setDisplayName(account.displayName);
        setStep("profile");
      });
      router.replace("/onboarding/creator");
    } else if (result === "error") {
      toast.error(message || "Instagram connection failed");
      router.replace("/onboarding/creator");
    }
  }, [searchParams, refetch, router]);

  useEffect(() => {
    if (status?.connected && status.account) {
      setDisplayName((prev) => prev || status.account?.displayName || status.account?.username || "");
    }
  }, [status]);

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function connectInstagram() {
    if (status?.configured) {
      window.location.href =
        "/api/instagram/connect?returnTo=" + encodeURIComponent("/onboarding/creator");
      return;
    }
    void connectDemo();
  }

  async function connectDemo() {
    setLoading(true);
    const res = await fetch("/api/instagram/connect-demo", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      toast.error("Could not connect Instagram");
      return;
    }
    const data = await res.json();
    if (data.displayName) setDisplayName(data.displayName);
    toast.success("Demo Instagram connected (configure Meta credentials for real OAuth)");
    await refetch();
    setStep("profile");
  }

  async function saveProfile() {
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/creator/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        bio,
        city,
        location: city ? `${city}, Pakistan` : "Pakistan",
        categories,
        languages,
        storyPricePkr: storyPrice ? Number(storyPrice) : null,
        reelPricePkr: reelPrice ? Number(reelPrice) : null,
        postPricePkr: postPrice ? Number(postPrice) : null,
        completeOnboarding: true,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Could not save profile");
      return;
    }
    toast.success("You're live");
    router.push("/creator");
  }

  const account = status?.account;
  const oauthReady = Boolean(status?.configured);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium text-neutral-400">Creator onboarding</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {step === "instagram" ? "Connect Instagram" : "Complete your profile"}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        {step === "instagram"
          ? "Business or Creator accounts only. We'll import your stats and enable Verified Analytics."
          : "A few details so brands can find you."}
      </p>

      <div className="mt-6 flex gap-2">
        {(["instagram", "profile"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200",
              step === s || (step === "profile" && i === 0) ? "bg-blue-600" : "bg-neutral-100"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "instagram" ? (
          <motion.div
            key="ig"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-10 space-y-4"
          >
            <div className="rounded-2xl border border-neutral-200 p-6">
              {account ? (
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={account.profileImageUrl ?? undefined} />
                    <AvatarFallback>
                      {(account.displayName || account.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium">@{account.username}</p>
                      {account.verified ? (
                        <BadgeCheck className="size-4 text-blue-600" />
                      ) : null}
                    </div>
                    <p className="text-sm text-neutral-500">
                      {formatFollowers(account.followers)} followers ·{" "}
                      {formatEngagement(account.engagementRate)} engagement
                      {account.hasRealToken ? "" : " · demo"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100">
                    <Camera className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Instagram Login</p>
                    <p className="text-sm text-neutral-500">
                      {oauthReady
                        ? "Sign in with Meta to import live analytics"
                        : "Meta credentials not set — demo connect available"}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={connectInstagram}
                disabled={loading}
                className="mt-6 h-11 w-full rounded-xl"
              >
                {loading
                  ? "Connecting…"
                  : account
                    ? oauthReady
                      ? "Reconnect Instagram"
                      : "Refresh demo connection"
                    : oauthReady
                      ? "Connect Instagram"
                      : "Connect Instagram (demo)"}
              </Button>

              {account ? (
                <Button
                  variant="outline"
                  className="mt-3 h-11 w-full rounded-xl"
                  onClick={() => setStep("profile")}
                >
                  Continue
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep("profile")}
                  className="mt-3 w-full text-center text-sm text-neutral-400 hover:text-neutral-600"
                >
                  Skip for now
                </button>
              )}

              {!oauthReady ? (
                <p className="mt-4 text-xs leading-relaxed text-neutral-400">
                  To enable real OAuth, add <code className="text-neutral-500">META_APP_ID</code>,{" "}
                  <code className="text-neutral-500">META_APP_SECRET</code>, and{" "}
                  <code className="text-neutral-500">TOKEN_ENCRYPTION_KEY</code> — see{" "}
                  <code className="text-neutral-500">docs/instagram-setup.md</code>.
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-8 space-y-5"
          >
            <div className="space-y-2">
              <Label>Display name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-24 rounded-xl"
                placeholder="What you create and who you work with"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <div className="flex flex-wrap gap-2">
                {PAKISTAN_CITIES.map((c) => (
                  <button key={c} type="button" onClick={() => setCity(c)}>
                    <Badge
                      variant={city === c ? "default" : "secondary"}
                      className="cursor-pointer rounded-lg"
                    >
                      {c}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => toggle(categories, c, setCategories)}>
                    <Badge
                      variant={categories.includes(c) ? "default" : "secondary"}
                      className="cursor-pointer rounded-lg"
                    >
                      {c}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l} type="button" onClick={() => toggle(languages, l, setLanguages)}>
                    <Badge
                      variant={languages.includes(l) ? "default" : "secondary"}
                      className="cursor-pointer rounded-lg"
                    >
                      {l}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Story (PKR)</Label>
                <Input
                  type="number"
                  value={storyPrice}
                  onChange={(e) => setStoryPrice(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Reel (PKR)</Label>
                <Input
                  type="number"
                  value={reelPrice}
                  onChange={(e) => setReelPrice(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Post (PKR)</Label>
                <Input
                  type="number"
                  value={postPrice}
                  onChange={(e) => setPostPrice(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <Button onClick={saveProfile} disabled={loading} className="h-11 w-full rounded-xl">
              {loading ? "Saving…" : "Finish"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CreatorOnboardingPage() {
  return (
    <Suspense>
      <CreatorOnboardingInner />
    </Suspense>
  );
}
