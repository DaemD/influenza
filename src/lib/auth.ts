import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

function origin(url: string | undefined, fallback: string) {
  if (!url) return fallback;
  try {
    return new URL(url).origin;
  } catch {
    return url.replace(/\/$/, "") || fallback;
  }
}

const appOrigin = origin(
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000"
);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [appOrigin, "http://localhost:3000", "https://influence.miless.app"],
});

export type Session = typeof auth.$Infer.Session;
