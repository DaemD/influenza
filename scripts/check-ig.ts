import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const accounts = await prisma.socialAccount.findMany({
    where: { platform: "INSTAGRAM", deletedAt: null },
    include: { metrics: { where: { isCurrent: true }, take: 1 } },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  console.log(
    JSON.stringify(
      accounts.map((a) => ({
        username: a.username,
        verified: a.isAnalyticsVerified,
        hasToken: Boolean(a.accessTokenEnc),
        followers: a.metrics[0]?.followers,
        synced: a.lastSyncedAt,
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
