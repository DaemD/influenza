export const CATEGORIES = [
  "Lifestyle",
  "Beauty",
  "Fashion",
  "Travel",
  "Fitness",
  "Food",
  "Comedy",
  "Family",
  "Music",
  "Tech",
  "Education",
  "Gaming",
  "Business",
  "Sports",
  "Photography",
] as const;

export const LANGUAGES = [
  "English",
  "Urdu",
  "Punjabi",
  "Sindhi",
  "Pashto",
  "Arabic",
] as const;

export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
] as const;

export const PLATFORMS = [
  { id: "any", label: "Any" },
  { id: "instagram", label: "Instagram" },
] as const;

export const FOLLOWER_TIERS = [
  { id: "", label: "Any followers", min: 0, max: 0 },
  { id: "nano", label: "Nano (1K–10K)", min: 1000, max: 10000 },
  { id: "micro", label: "Micro (10K–100K)", min: 10000, max: 100000 },
  { id: "mid", label: "Mid (100K–500K)", min: 100000, max: 500000 },
  { id: "macro", label: "Macro (500K+)", min: 500000, max: 0 },
] as const;

export const CREATOR_NAV = [
  { href: "/creator", label: "Home" },
  { href: "/creator/messages", label: "Messages" },
  { href: "/creator/offers", label: "Offers" },
  { href: "/creator/profile", label: "Profile" },
  { href: "/creator/settings", label: "Settings" },
] as const;

export const BRAND_NAV = [
  { href: "/brand/discover", label: "Find Creators" },
  { href: "/brand/messages", label: "Messages" },
  { href: "/brand/offers", label: "Offers" },
  { href: "/brand/saved", label: "Saved" },
  { href: "/brand/settings", label: "Settings" },
] as const;
