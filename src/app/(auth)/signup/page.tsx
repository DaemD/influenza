"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params.get("role");
  const [role, setRole] = useState<"CREATOR" | "BRAND">(
    roleParam === "brand" ? "BRAND" : "CREATOR"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      // @ts-expect-error additional field
      role,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Could not create account");
      return;
    }
    toast.success("Account created");
    router.push(role === "CREATOR" ? "/onboarding/creator" : "/onboarding/brand");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md"
    >
      <Link href="/" className="text-xl font-bold tracking-tight">
        Influence<span className="text-[var(--brand)]">.</span>
      </Link>
      <h1 className="mt-8 text-2xl font-bold tracking-tight">Sign up</h1>
      <p className="mt-2 text-sm text-[#717171]">Join as a brand or creator.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-[#f7f7f7] p-1">
        <button
          type="button"
          onClick={() => setRole("CREATOR")}
          className={`rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            role === "CREATOR" ? "bg-white text-[var(--brand)] shadow-sm" : "text-[#717171]"
          }`}
        >
          Creator
        </button>
        <button
          type="button"
          onClick={() => setRole("BRAND")}
          className={`rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            role === "BRAND" ? "bg-white text-[var(--brand)] shadow-sm" : "text-[#717171]"
          }`}
        >
          Brand
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{role === "BRAND" ? "Your name" : "Display name"}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 rounded-xl"
            placeholder={role === "BRAND" ? "Ayesha Khan" : "Sara Ahmed"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl"
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-11 rounded-xl"
            placeholder="At least 8 characters"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-full bg-[var(--brand)] text-white hover:bg-[#e0266c]">
          {loading ? "Creating…" : "Continue"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-neutral-900 underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <Suspense>
        <SignupForm />
      </Suspense>
    </div>
  );
}
