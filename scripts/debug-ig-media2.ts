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
  if (!account?.accessTokenEnc) return;
  const token = decryptSecret(account.accessTokenEnc);
  const version = process.env.INSTAGRAM_GRAPH_API_VERSION ?? "v21.0";

  const meUrl = `https://graph.instagram.com/${version}/me?fields=id,user_id,username,account_type,media_count,followers_count&access_token=${token}`;
  const me = await (await fetch(meUrl)).json();
  console.log("me:", JSON.stringify(me, null, 2));

  for (const id of [me.id, me.user_id].filter(Boolean)) {
    const url = `https://graph.instagram.com/${version}/${id}/media?fields=id,media_type,permalink,timestamp&limit=5&access_token=${token}`;
    const res = await fetch(url);
    const json = await res.json();
    console.log(`\nmedia via ${id}:`, res.status, JSON.stringify(json).slice(0, 800));
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
