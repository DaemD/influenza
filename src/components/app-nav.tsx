"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavItem = { href: string; label: string };

export function AppNav({
  items,
  brand = "Influence",
}: {
  items: readonly NavItem[];
  brand?: string;
}) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-[#ebebeb] bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-[#1a1a1a]">
            {brand}
            <span className="text-[var(--brand)]">.</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/creator" &&
                  item.href !== "/brand/discover" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                    active
                      ? "bg-[#fff0f6] text-[var(--brand)]"
                      : "text-[#717171] hover:text-[#1a1a1a]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback className="bg-[#fff0f6] text-xs text-[var(--brand)]">
                  {session.user.name?.slice(0, 2).toUpperCase() ?? "IN"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#717171]"
                onClick={() =>
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/";
                      },
                    },
                  })
                }
              >
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-[#ebebeb] px-4 py-2 md:hidden">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium",
                active ? "bg-[#fff0f6] text-[var(--brand)]" : "text-[#717171]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
