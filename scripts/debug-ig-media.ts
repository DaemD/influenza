import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { decryptSecret } from "../src/lib/crypto";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const account = await prisma.socialAccount.findFirst({
    where: { platform: "INSTAGRAM", accessTokenEnc: { not: null } },
  });
  if (!account?.accessTokenEnc || !account.platformUserId) {
    console.log("No connected account");
    return;
  }

  const token = decryptSecret(account.accessTokenEnc);
  const version = process.env.INSTAGRAM_GRAPH_API_VERSION ?? "v21.0";
  const igId = account.platformUserId;

  console.log("username:", account.username);
  console.log("platformUserId:", igId);

  const urls = [
    `https://graph.instagram.com/${version}/me?fields=user_id,username,media_count&access_token=${token}`,
    `https://graph.instagram.com/${version}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=5&access_token=${token}`,
    `https://graph.instagram.com/${version}/${igId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=5&access_token=${token}`,
    `https://graph.instagram.com/${version}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=5&access_token=${token}`,
  ];

  for (const url of urls) {
    const safe = url.replace(token, "TOKEN");
    console.log("\n---", safe);
    const res = await fetch(url);
    const json = await res.json();
    console.log("status", res.status);
    console.log(JSON.stringify(json, null, 2).slice(0, 1500));
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
