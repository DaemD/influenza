/**
 * Temporary in-memory store — no Postgres.
 * Data resets when the server restarts. Swap this for Prisma later.
 */

export type StoreCreator = {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  bio: string | null;
  city: string | null;
  location: string | null;
  categories: string[];
  languages: string[];
  storyPricePkr: number | null;
  reelPricePkr: number | null;
  postPricePkr: number | null;
  bundlePricePkr: number | null;
  priceFromPkr: number | null;
  averageRating: number;
  reviewCount: number;
  isOnboarded: boolean;
  isDiscoverable: boolean;
  photoUrl: string | null;
  followers: number;
  engagementRate: number;
  verified: boolean;
  posts: Array<{
    id: string;
    mediaType: string;
    caption: string | null;
    permalink: string | null;
    thumbnailUrl: string | null;
    mediaUrl: string | null;
    likeCount: number;
    commentCount: number;
    viewCount: number | null;
    postedAt: string | null;
  }>;
  createdAt: string;
};

export type StoreBrand = {
  userId: string;
  companyName: string;
  website: string | null;
  industry: string | null;
  bio: string | null;
  isOnboarded: boolean;
};

export type StoreOffer = {
  id: string;
  brandUserId: string;
  creatorProfileId: string;
  title: string;
  description: string;
  deliverables: string[];
  budgetPkr: number;
  deadline: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COUNTERED" | "COMPLETED" | "CANCELLED";
  counterBudgetPkr?: number;
  counterMessage?: string;
  conversationId: string | null;
  createdAt: string;
};

export type StoreConversation = {
  id: string;
  participantIds: string[];
  lastMessageAt: string;
};

export type StoreMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  type: string;
  createdAt: string;
};

export type StoreNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  isRead: boolean;
  createdAt: string;
};

export type StoreSaved = {
  userId: string;
  creatorProfileId: string;
  createdAt: string;
};

export type StoreIgAccount = {
  userId: string;
  username: string;
  displayName: string;
  profileImageUrl: string | null;
  verified: boolean;
  followers: number;
  engagementRate: number;
  lastSyncedAt: string;
  hasRealToken: boolean;
};

function id(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const demoCreators: StoreCreator[] = [
  {
    id: "creator_sara",
    userId: "user_sara",
    displayName: "Sara Ahmed",
    username: "sara.beauty",
    bio: "Beauty & lifestyle creator. Collabs with skincare and fashion brands across Pakistan.",
    city: "Lahore",
    location: "Lahore, Pakistan",
    categories: ["Beauty", "Lifestyle"],
    languages: ["English", "Urdu"],
    storyPricePkr: 15000,
    reelPricePkr: 45000,
    postPricePkr: 35000,
    bundlePricePkr: 95000,
    priceFromPkr: 15000,
    averageRating: 4.8,
    reviewCount: 12,
    isOnboarded: true,
    isDiscoverable: true,
    photoUrl: null,
    followers: 84200,
    engagementRate: 4.2,
    verified: true,
    posts: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "creator_ali",
    userId: "user_ali",
    displayName: "Ali Raza",
    username: "ali.eats",
    bio: "Karachi food reviews, café hopping, and restaurant launches.",
    city: "Karachi",
    location: "Karachi, Pakistan",
    categories: ["Food", "Lifestyle"],
    languages: ["English", "Urdu"],
    storyPricePkr: 20000,
    reelPricePkr: 60000,
    postPricePkr: 40000,
    bundlePricePkr: 120000,
    priceFromPkr: 20000,
    averageRating: 4.6,
    reviewCount: 8,
    isOnboarded: true,
    isDiscoverable: true,
    photoUrl: null,
    followers: 126000,
    engagementRate: 3.8,
    verified: true,
    posts: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "creator_hina",
    userId: "user_hina",
    displayName: "Hina Malik",
    username: "hina.fits",
    bio: "Fitness coach and wellness creator. Gym wear, supplements, studios.",
    city: "Islamabad",
    location: "Islamabad, Pakistan",
    categories: ["Fitness", "Lifestyle"],
    languages: ["English", "Urdu"],
    storyPricePkr: 12000,
    reelPricePkr: 38000,
    postPricePkr: 28000,
    bundlePricePkr: 78000,
    priceFromPkr: 12000,
    averageRating: 4.9,
    reviewCount: 15,
    isOnboarded: true,
    isDiscoverable: true,
    photoUrl: null,
    followers: 52300,
    engagementRate: 5.1,
    verified: true,
    posts: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "creator_bilal",
    userId: "user_bilal",
    displayName: "Bilal Khan",
    username: "bilal.tech",
    bio: "Gadgets, startups, and product unboxings for the Pakistani market.",
    city: "Lahore",
    location: "Lahore, Pakistan",
    categories: ["Tech", "Education"],
    languages: ["English", "Urdu", "Punjabi"],
    storyPricePkr: 18000,
    reelPricePkr: 55000,
    postPricePkr: 42000,
    bundlePricePkr: 115000,
    priceFromPkr: 18000,
    averageRating: 4.5,
    reviewCount: 6,
    isOnboarded: true,
    isDiscoverable: true,
    photoUrl: null,
    followers: 91000,
    engagementRate: 2.9,
    verified: true,
    posts: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "creator_mehwish",
    userId: "user_mehwish",
    displayName: "Mehwish Noor",
    username: "mehwish.travels",
    bio: "Northern Pakistan travel diaries and hotel stays.",
    city: "Islamabad",
    location: "Islamabad, Pakistan",
    categories: ["Travel", "Lifestyle"],
    languages: ["English", "Urdu"],
    storyPricePkr: 16000,
    reelPricePkr: 50000,
    postPricePkr: 32000,
    bundlePricePkr: 98000,
    priceFromPkr: 16000,
    averageRating: 4.7,
    reviewCount: 9,
    isOnboarded: true,
    isDiscoverable: true,
    photoUrl: null,
    followers: 67800,
    engagementRate: 3.5,
    verified: true,
    posts: [],
    createdAt: new Date().toISOString(),
  },
];

type MemoryDb = {
  creators: StoreCreator[];
  brands: Map<string, StoreBrand>;
  offers: StoreOffer[];
  conversations: StoreConversation[];
  messages: StoreMessage[];
  notifications: StoreNotification[];
  saved: StoreSaved[];
  igAccounts: Map<string, StoreIgAccount>;
};

const globalStore = globalThis as unknown as { __influenceStore?: MemoryDb };

function db(): MemoryDb {
  if (!globalStore.__influenceStore) {
    globalStore.__influenceStore = {
      creators: [...demoCreators],
      brands: new Map(),
      offers: [],
      conversations: [],
      messages: [],
      notifications: [],
      saved: [],
      igAccounts: new Map(),
    };
  }
  return globalStore.__influenceStore;
}

export const store = {
  listCreators(filters: {
    q?: string;
    category?: string | null;
    city?: string | null;
    verifiedOnly?: boolean;
    minFollowers?: number;
    maxFollowers?: number;
    minEngagement?: number;
    maxPrice?: number;
    sort?: string;
  }) {
    let list = db().creators.filter((c) => c.isDiscoverable && c.isOnboarded);

    const q = filters.q?.toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          (c.bio ?? "").toLowerCase().includes(q) ||
          (c.location ?? "").toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q)
      );
    }
    if (filters.category) list = list.filter((c) => c.categories.includes(filters.category!));
    if (filters.city) list = list.filter((c) => c.city === filters.city);
    if (filters.verifiedOnly) list = list.filter((c) => c.verified);
    if (filters.minFollowers) list = list.filter((c) => c.followers >= filters.minFollowers!);
    if (filters.maxFollowers) list = list.filter((c) => c.followers <= filters.maxFollowers!);
    if (filters.minEngagement) list = list.filter((c) => c.engagementRate >= filters.minEngagement!);
    if (filters.maxPrice) list = list.filter((c) => (c.priceFromPkr ?? Infinity) <= filters.maxPrice!);

    const sort = filters.sort ?? "relevant";
    if (sort === "price") list = [...list].sort((a, b) => (a.priceFromPkr ?? 0) - (b.priceFromPkr ?? 0));
    if (sort === "rating" || sort === "relevant")
      list = [...list].sort((a, b) => b.averageRating - a.averageRating);
    if (sort === "newest") list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "engagement") list = [...list].sort((a, b) => b.engagementRate - a.engagementRate);
    if (sort === "followers") list = [...list].sort((a, b) => b.followers - a.followers);

    return list.slice(0, 48);
  },

  getCreator(id: string) {
    return db().creators.find((c) => c.id === id) ?? null;
  },

  getCreatorByUserId(userId: string) {
    return db().creators.find((c) => c.userId === userId) ?? null;
  },

  upsertCreatorProfile(
    userId: string,
    data: Partial<StoreCreator> & { displayName: string; completeOnboarding?: boolean }
  ) {
    const existing = db().creators.find((c) => c.userId === userId);
    const prices = [
      data.storyPricePkr,
      data.reelPricePkr,
      data.postPricePkr,
      data.bundlePricePkr,
    ].filter((p): p is number => typeof p === "number" && p > 0);
    const priceFromPkr = prices.length ? Math.min(...prices) : null;

    if (existing) {
      Object.assign(existing, {
        displayName: data.displayName,
        bio: data.bio ?? null,
        city: data.city ?? null,
        location: data.location ?? null,
        categories: data.categories ?? existing.categories,
        languages: data.languages ?? existing.languages,
        storyPricePkr: data.storyPricePkr ?? null,
        reelPricePkr: data.reelPricePkr ?? null,
        postPricePkr: data.postPricePkr ?? null,
        bundlePricePkr: data.bundlePricePkr ?? null,
        priceFromPkr,
        ...(data.completeOnboarding ? { isOnboarded: true, isDiscoverable: true } : {}),
      });
      return existing;
    }

    const created: StoreCreator = {
      id: id("creator"),
      userId,
      displayName: data.displayName,
      username: data.displayName.toLowerCase().replace(/\s+/g, "_"),
      bio: data.bio ?? null,
      city: data.city ?? null,
      location: data.location ?? null,
      categories: data.categories ?? [],
      languages: data.languages ?? [],
      storyPricePkr: data.storyPricePkr ?? null,
      reelPricePkr: data.reelPricePkr ?? null,
      postPricePkr: data.postPricePkr ?? null,
      bundlePricePkr: data.bundlePricePkr ?? null,
      priceFromPkr,
      averageRating: 0,
      reviewCount: 0,
      isOnboarded: Boolean(data.completeOnboarding),
      isDiscoverable: Boolean(data.completeOnboarding),
      photoUrl: null,
      followers: 0,
      engagementRate: 0,
      verified: false,
      posts: [],
      createdAt: new Date().toISOString(),
    };
    db().creators.push(created);
    return created;
  },

  getBrand(userId: string) {
    return db().brands.get(userId) ?? null;
  },

  upsertBrand(userId: string, data: Omit<StoreBrand, "userId" | "isOnboarded"> & { isOnboarded?: boolean }) {
    const brand: StoreBrand = {
      userId,
      companyName: data.companyName,
      website: data.website ?? null,
      industry: data.industry ?? null,
      bio: data.bio ?? null,
      isOnboarded: data.isOnboarded ?? true,
    };
    db().brands.set(userId, brand);
    return brand;
  },

  listOffersForBrand(brandUserId: string) {
    return db()
      .offers.filter((o) => o.brandUserId === brandUserId)
      .map((o) => ({
        ...o,
        creatorProfile: this.getCreator(o.creatorProfileId),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  listOffersForCreator(userId: string) {
    const profile = this.getCreatorByUserId(userId);
    if (!profile) return [];
    return db()
      .offers.filter((o) => o.creatorProfileId === profile.id)
      .map((o) => ({
        ...o,
        brandUser: { brandProfile: this.getBrand(o.brandUserId) },
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  createOffer(input: {
    brandUserId: string;
    creatorProfileId: string;
    title: string;
    description: string;
    deliverables: string[];
    budgetPkr: number;
    deadline: string | null;
  }) {
    const creator = this.getCreator(input.creatorProfileId);
    if (!creator) return null;

    const conversationId = id("conv");
    db().conversations.push({
      id: conversationId,
      participantIds: [input.brandUserId, creator.userId],
      lastMessageAt: new Date().toISOString(),
    });
    db().messages.push({
      id: id("msg"),
      conversationId,
      senderId: input.brandUserId,
      body: `Offer sent: ${input.title}`,
      type: "OFFER_UPDATE",
      createdAt: new Date().toISOString(),
    });

    const offer: StoreOffer = {
      id: id("offer"),
      ...input,
      status: "PENDING",
      conversationId,
      createdAt: new Date().toISOString(),
    };
    db().offers.push(offer);

    this.addNotification({
      userId: creator.userId,
      type: "OFFER_RECEIVED",
      title: "New offer received",
      body: input.title,
      href: "/creator/offers",
    });

    return offer;
  },

  updateOffer(
    offerId: string,
    userId: string,
    patch: { status: StoreOffer["status"]; counterBudgetPkr?: number; counterMessage?: string }
  ) {
    const offer = db().offers.find((o) => o.id === offerId);
    if (!offer) return { error: "Not found", status: 404 as const };

    const creator = this.getCreator(offer.creatorProfileId);
    const isCreator = creator?.userId === userId;
    const isBrand = offer.brandUserId === userId;
    if (!isCreator && !isBrand) return { error: "Forbidden", status: 403 as const };

    if ((patch.status === "ACCEPTED" || patch.status === "DECLINED" || patch.status === "COUNTERED") && !isCreator) {
      return { error: "Only creator can accept/decline/counter", status: 403 as const };
    }
    if (patch.status === "CANCELLED" && !isBrand) {
      return { error: "Only brand can cancel", status: 403 as const };
    }

    offer.status = patch.status;
    if (patch.counterBudgetPkr != null) offer.counterBudgetPkr = patch.counterBudgetPkr;
    if (patch.counterMessage != null) offer.counterMessage = patch.counterMessage;

    if (patch.status === "ACCEPTED" || patch.status === "DECLINED" || patch.status === "COUNTERED") {
      this.addNotification({
        userId: isCreator ? offer.brandUserId : creator!.userId,
        type:
          patch.status === "ACCEPTED"
            ? "OFFER_ACCEPTED"
            : patch.status === "DECLINED"
              ? "OFFER_DECLINED"
              : "OFFER_COUNTERED",
        title: `Offer ${patch.status.toLowerCase()}`,
        body: offer.title,
        href: isCreator ? "/brand/offers" : "/creator/offers",
      });
    }

    return { offer };
  },

  listConversations(userId: string) {
    return db()
      .conversations.filter((c) => c.participantIds.includes(userId))
      .map((c) => {
        const otherId = c.participantIds.find((p) => p !== userId) ?? null;
        const lastMessage =
          db()
            .messages.filter((m) => m.conversationId === c.id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
        return {
          id: c.id,
          lastMessageAt: c.lastMessageAt,
          lastMessage,
          otherUser: otherId
            ? {
                id: otherId,
                name:
                  this.getCreatorByUserId(otherId)?.displayName ??
                  this.getBrand(otherId)?.companyName ??
                  "User",
                image: this.getCreatorByUserId(otherId)?.photoUrl ?? null,
              }
            : null,
        };
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  },

  getMessages(conversationId: string, userId: string) {
    const conv = db().conversations.find((c) => c.id === conversationId);
    if (!conv || !conv.participantIds.includes(userId)) return null;
    return db()
      .messages.filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((m) => ({
        ...m,
        sender: {
          id: m.senderId,
          name:
            this.getCreatorByUserId(m.senderId)?.displayName ??
            this.getBrand(m.senderId)?.companyName ??
            "User",
          image: this.getCreatorByUserId(m.senderId)?.photoUrl ?? null,
        },
      }));
  },

  sendMessage(conversationId: string, userId: string, body: string, role?: string | null) {
    const conv = db().conversations.find((c) => c.id === conversationId);
    if (!conv || !conv.participantIds.includes(userId)) return null;

    const message: StoreMessage = {
      id: id("msg"),
      conversationId,
      senderId: userId,
      body,
      type: "TEXT",
      createdAt: new Date().toISOString(),
    };
    db().messages.push(message);
    conv.lastMessageAt = message.createdAt;

    for (const otherId of conv.participantIds.filter((p) => p !== userId)) {
      this.addNotification({
        userId: otherId,
        type: "NEW_MESSAGE",
        title: "New message",
        body: body.slice(0, 100),
        href: role === "BRAND" ? "/brand/messages" : "/creator/messages",
      });
    }

    return message;
  },

  listSaved(userId: string) {
    return db()
      .saved.filter((s) => s.userId === userId)
      .map((s) => ({
        ...s,
        creatorProfile: this.getCreator(s.creatorProfileId),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  saveCreator(userId: string, creatorProfileId: string) {
    const existing = db().saved.find(
      (s) => s.userId === userId && s.creatorProfileId === creatorProfileId
    );
    if (existing) return existing;
    const row: StoreSaved = {
      userId,
      creatorProfileId,
      createdAt: new Date().toISOString(),
    };
    db().saved.push(row);
    return row;
  },

  unsaveCreator(userId: string, creatorProfileId: string) {
    db().saved = db().saved.filter(
      (s) => !(s.userId === userId && s.creatorProfileId === creatorProfileId)
    );
  },

  listNotifications(userId: string) {
    return db()
      .notifications.filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50);
  },

  addNotification(input: {
    userId: string;
    type: string;
    title: string;
    body?: string | null;
    href?: string | null;
  }) {
    db().notifications.unshift({
      id: id("notif"),
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },

  markNotificationsRead(userId: string, idOrAll: string | true) {
    for (const n of db().notifications) {
      if (n.userId !== userId) continue;
      if (idOrAll === true || n.id === idOrAll) n.isRead = true;
    }
  },

  getIgStatus(userId: string) {
    return db().igAccounts.get(userId) ?? null;
  },

  connectIgDemo(userId: string, name: string) {
    const username = name.toLowerCase().replace(/\s+/g, "_") || `creator_${userId.slice(0, 6)}`;
    let profile = this.getCreatorByUserId(userId);
    if (!profile) {
      profile = this.upsertCreatorProfile(userId, { displayName: name || "Creator" });
    }
    profile.verified = true;
    profile.followers = 12500 + Math.floor(Math.random() * 40000);
    profile.engagementRate = Math.round((2.4 + Math.random() * 3) * 10) / 10;
    profile.username = username;

    const account: StoreIgAccount = {
      userId,
      username,
      displayName: name,
      profileImageUrl: null,
      verified: true,
      followers: profile.followers,
      engagementRate: profile.engagementRate,
      lastSyncedAt: new Date().toISOString(),
      hasRealToken: false,
    };
    db().igAccounts.set(userId, account);
    return account;
  },
};
