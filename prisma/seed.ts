import "dotenv/config";
import { PrismaClient, UserRole, SocialPlatform } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const creators = [
  {
    email: "sara@influence.pk",
    name: "Sara Ahmed",
    displayName: "Sara Ahmed",
    username: "sara.beauty",
    city: "Lahore",
    categories: ["Beauty", "Lifestyle"],
    languages: ["English", "Urdu"],
    bio: "Beauty & lifestyle creator. Collabs with skincare and fashion brands across Pakistan.",
    followers: 84200,
    engagement: 4.2,
    story: 15000,
    reel: 45000,
    post: 35000,
  },
  {
    email: "ali@influence.pk",
    name: "Ali Raza",
    displayName: "Ali Raza",
    username: "ali.eats",
    city: "Karachi",
    categories: ["Food", "Lifestyle"],
    languages: ["English", "Urdu"],
    bio: "Karachi food reviews, café hopping, and restaurant launches.",
    followers: 126000,
    engagement: 3.8,
    story: 20000,
    reel: 60000,
    post: 40000,
  },
  {
    email: "hina@influence.pk",
    name: "Hina Malik",
    displayName: "Hina Malik",
    username: "hina.fits",
    city: "Islamabad",
    categories: ["Fitness", "Lifestyle"],
    languages: ["English", "Urdu"],
    bio: "Fitness coach and wellness creator. Gym wear, supplements, studios.",
    followers: 52300,
    engagement: 5.1,
    story: 12000,
    reel: 38000,
    post: 28000,
  },
  {
    email: "bilal@influence.pk",
    name: "Bilal Khan",
    displayName: "Bilal Khan",
    username: "bilal.tech",
    city: "Lahore",
    categories: ["Tech", "Education"],
    languages: ["English", "Urdu", "Punjabi"],
    bio: "Gadgets, startups, and product unboxings for the Pakistani market.",
    followers: 91000,
    engagement: 2.9,
    story: 18000,
    reel: 55000,
    post: 42000,
  },
  {
    email: "mehwish@influence.pk",
    name: "Mehwish Noor",
    displayName: "Mehwish Noor",
    username: "mehwish.travels",
    city: "Islamabad",
    categories: ["Travel", "Lifestyle"],
    languages: ["English", "Urdu"],
    bio: "Northern Pakistan travel diaries and hotel stays.",
    followers: 67800,
    engagement: 3.5,
    story: 16000,
    reel: 50000,
    post: 32000,
  },
];

async function ensureCredentialAccount(userId: string, email: string, password: string) {
  const existing = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
  });
  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: { password },
    });
  } else {
    await prisma.account.create({
      data: {
        userId,
        accountId: email,
        providerId: "credential",
        password,
      },
    });
  }
}

async function main() {
  const password = await hashPassword("password123");

  const brandUser = await prisma.user.upsert({
    where: { email: "brand@influence.pk" },
    create: {
      email: "brand@influence.pk",
      name: "Ayesha Khan",
      emailVerified: true,
      role: UserRole.BRAND,
    },
    update: { role: UserRole.BRAND, name: "Ayesha Khan" },
  });

  await ensureCredentialAccount(brandUser.id, "brand@influence.pk", password);

  await prisma.brandProfile.upsert({
    where: { userId: brandUser.id },
    create: {
      userId: brandUser.id,
      companyName: "Noon Style PK",
      website: "https://noon.com",
      industry: "Ecommerce",
      bio: "Fashion & lifestyle ecommerce hiring creators across Pakistan.",
      isOnboarded: true,
    },
    update: {
      companyName: "Noon Style PK",
      isOnboarded: true,
    },
  });

  for (const c of creators) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      create: {
        email: c.email,
        name: c.name,
        emailVerified: true,
        role: UserRole.CREATOR,
      },
      update: { role: UserRole.CREATOR, name: c.name },
    });

    await ensureCredentialAccount(user.id, c.email, password);

    const priceFrom = Math.min(c.story, c.reel, c.post);

    const profile = await prisma.creatorProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName: c.displayName,
        bio: c.bio,
        city: c.city,
        location: `${c.city}, Pakistan`,
        categories: c.categories,
        languages: c.languages,
        storyPricePkr: c.story,
        reelPricePkr: c.reel,
        postPricePkr: c.post,
        bundlePricePkr: c.story + c.reel + c.post,
        priceFromPkr: priceFrom,
        isOnboarded: true,
        isDiscoverable: true,
        averageRating: 4.6,
        reviewCount: 3,
        completedCollabs: 8,
      },
      update: {
        displayName: c.displayName,
        bio: c.bio,
        city: c.city,
        location: `${c.city}, Pakistan`,
        categories: c.categories,
        languages: c.languages,
        storyPricePkr: c.story,
        reelPricePkr: c.reel,
        postPricePkr: c.post,
        bundlePricePkr: c.story + c.reel + c.post,
        priceFromPkr: priceFrom,
        isOnboarded: true,
        isDiscoverable: true,
      },
    });

    const account = await prisma.socialAccount.upsert({
      where: {
        creatorProfileId_platform: {
          creatorProfileId: profile.id,
          platform: SocialPlatform.INSTAGRAM,
        },
      },
      create: {
        creatorProfileId: profile.id,
        platform: SocialPlatform.INSTAGRAM,
        username: c.username,
        displayName: c.displayName,
        profileUrl: `https://instagram.com/${c.username}`,
        isAnalyticsVerified: true,
        lastSyncedAt: new Date(),
      },
      update: {
        isAnalyticsVerified: true,
        username: c.username,
      },
    });

    await prisma.socialMetric.updateMany({
      where: { socialAccountId: account.id, isCurrent: true },
      data: { isCurrent: false },
    });

    await prisma.socialMetric.create({
      data: {
        socialAccountId: account.id,
        followers: c.followers,
        following: 500,
        mediaCount: 200,
        engagementRate: c.engagement,
        avgLikes: Math.round(c.followers * (c.engagement / 100) * 0.85),
        avgComments: Math.round(c.followers * (c.engagement / 100) * 0.08),
        avgReelViews: Math.round(c.followers * 0.35),
        isCurrent: true,
      },
    });
  }

  console.log("Seeded brand:", brandUser.email);
  console.log("Seeded creators:", creators.map((c) => c.email).join(", "));
  console.log("Password for all demo accounts: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
