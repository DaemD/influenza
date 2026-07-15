import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const accounts = await prisma.socialAccount.findMany({
    where: { platform: "INSTAGRAM", deletedAt: null, accessTokenEnc: { not: null } },
    include: {
      _count: { select: { posts: true } },
      posts: { take: 3, orderBy: { postedAt: "desc" } },
      creatorProfile: { select: { id: true, displayName: true, isDiscoverable: true } },
    },
  });

  console.log(
    JSON.stringify(
      accounts.map((a) => ({
        username: a.username,
        creatorId: a.creatorProfile.id,
        discoverable: a.creatorProfile.isDiscoverable,
        postCount: a._count.posts,
        sample: a.posts.map((p) => ({
          id: p.id,
          type: p.mediaType,
          likes: p.likeCount,
          comments: p.commentCount,
          thumb: Boolean(p.thumbnailUrl || p.mediaUrl),
        })),
      })),
      null,
      2
    )
  );

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
