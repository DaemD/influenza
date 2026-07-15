"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SAMPLE_CARDS = [
  { name: "Sara Ahmed", niche: "Beauty Creator", followers: "84.2k", price: "Rs 15,000", city: "Lahore, PK" },
  { name: "Ali Raza", niche: "Food Creator", followers: "126k", price: "Rs 20,000", city: "Karachi, PK" },
  { name: "Hina Malik", niche: "Fitness Creator", followers: "52.3k", price: "Rs 12,000", city: "Islamabad, PK" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-[#ebebeb] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Influence<span className="text-[var(--brand)]">.</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-[#1a1a1a] hover:text-[var(--brand)]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-full bg-[var(--brand)] px-4 text-white hover:bg-[#e0266c]"
              )}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-[#1a1a1a] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
              Find & Hire Influencers for Your Brand
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#717171] sm:text-lg">
              Collaborate with Instagram creators on Pakistan&apos;s influencer
              marketplace — discover, offer, chat, and get content in one place.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="mx-auto mt-8 max-w-2xl"
          >
            <Link
              href="/signup?role=brand"
              className="flex items-center gap-3 rounded-full border border-[#ebebeb] bg-white px-4 py-3 shadow-sm transition hover:border-[#d4d4d4] hover:shadow-md"
            >
              <Search className="size-5 text-[#717171]" />
              <span className="flex-1 text-left text-sm text-[#717171] sm:text-base">
                Search Instagram creators in Pakistan…
              </span>
              <span className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">
                Search
              </span>
            </Link>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {["Instagram", "Beauty", "Fashion", "Food", "Lifestyle"].map((chip) => (
                <Link
                  key={chip}
                  href="/signup?role=brand"
                  className="rounded-full border border-[#ebebeb] px-3 py-1 text-xs font-medium text-[#717171] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  {chip}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-14 grid gap-4 sm:grid-cols-3"
          >
            {SAMPLE_CARDS.map((c, i) => (
              <div key={c.name} className="overflow-hidden rounded-xl">
                <div
                  className="relative aspect-[3/4] rounded-xl"
                  style={{
                    background:
                      i === 0
                        ? "linear-gradient(145deg, #fbcfe8, #f472b6)"
                        : i === 1
                          ? "linear-gradient(145deg, #fed7aa, #fb923c)"
                          : "linear-gradient(145deg, #bbf7d0, #4ade80)",
                  }}
                >
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-0.5 text-xs font-semibold text-white">
                    {c.followers}
                  </span>
                </div>
                <div className="pt-2.5">
                  <p className="font-semibold text-[#1a1a1a]">{c.name}</p>
                  <p className="text-sm text-[#717171]">{c.niche}</p>
                  <p className="font-semibold text-[#1a1a1a]">{c.price}</p>
                  <p className="text-xs text-[#717171]">{c.city}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="border-t border-[#ebebeb] bg-[#f7f7f7] py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3 sm:px-6">
            {[
              {
                title: "Search Creators",
                body: "Filter by niche, city, followers, and price. See verified Instagram stats before you hire.",
              },
              {
                title: "Send Offers & Chat",
                body: "Propose a collab, negotiate, and message creators securely inside Influence.",
              },
              {
                title: "Get Content Delivered",
                body: "Keep delivers, reviews, and conversations in one marketplace workflow.",
              },
            ].map((s) => (
              <div key={s.title}>
                <h2 className="text-lg font-bold text-[#1a1a1a]">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#717171]">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">
              Your next creator collab is minutes away
            </h2>
            <p className="mt-3 text-[#717171]">
              Free to start. Built for Pakistani brands and Instagram creators.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup?role=brand"
                className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e0266c]"
              >
                Find Creators
              </Link>
              <Link
                href="/signup?role=creator"
                className="rounded-full border border-[#ebebeb] px-6 py-3 text-sm font-semibold text-[#1a1a1a] hover:border-[#d4d4d4]"
              >
                Join as Creator
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#ebebeb] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-[#717171] sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} Influence
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-[#1a1a1a]">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-[#1a1a1a]">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
