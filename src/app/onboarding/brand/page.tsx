"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function BrandOnboardingPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/brand/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, website, industry, bio }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Could not save brand profile");
      return;
    }
    toast.success("You're ready to discover creators");
    router.push("/brand/discover");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-medium text-neutral-400">Brand onboarding</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Tell us about your brand</h1>
        <p className="mt-2 text-sm text-neutral-500">One short form. Then discover creators.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="h-11 rounded-xl"
              placeholder="Noon Pakistan"
            />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="Ecommerce, Food, Beauty…"
            />
          </div>
          <div className="space-y-2">
            <Label>About</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-24 rounded-xl"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl">
            {loading ? "Saving…" : "Start discovering"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
