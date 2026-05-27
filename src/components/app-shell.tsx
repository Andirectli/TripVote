"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  Home,
  ListPlus,
  Settings,
  Trophy,
  UsersRound,
} from "lucide-react";
import { cx } from "@/lib/format";
import { TripProvider } from "@/lib/store";

const navItems = [
  { href: "/", label: "Locations", icon: Home },
  { href: "/results", label: "Results", icon: Trophy },
  { href: "/add", label: "Add Airbnb", icon: ListPlus },
  { href: "/voters", label: "Voters", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <TripProvider>
      <div className="min-h-screen text-slate-950">
        <header className="sticky top-0 z-30 px-3 py-4">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-[#10100f] px-3 py-2 text-white shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
            <Link
              href="/tripvote"
              className={cx(
                "mr-1 inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-base font-black tracking-tight transition",
                pathname.startsWith("/tripvote")
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-white hover:bg-white/10",
              )}
            >
              <CircleHelp className="h-4 w-4" />
              <span className="text-base font-black tracking-tight">TripVote</span>
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx(
                      "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-bold transition",
                      isActive
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-white/75 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </TripProvider>
  );
}
