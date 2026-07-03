"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoWithText } from "./Logo";
import { links, navItems, theme } from "@/lib/theme";
import { getVolunteerUser } from "@/lib/auth";
import { useEffect, useState } from "react";

export function SiteNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<ReturnType<typeof getVolunteerUser>>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getVolunteerUser());
    setOpen(false);
  }, [pathname]);

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ background: theme.navGradient, borderColor: "rgba(0,180,240,0.25)" }}
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <LogoWithText />
        <button
          type="button"
          className="rounded-lg border border-cyan-500/40 px-3 py-2 text-sm text-cyan-200 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          Menu
        </button>
        <div className="hidden flex-wrap items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold transition-colors ${
                pathname === item.href ? "text-cyan-300" : "text-cyan-400 hover:text-cyan-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/volontaire/installation" className="text-sm text-cyan-200">
              {user.pseudonym}
            </Link>
          ) : (
            <Link href="/volontaire/connexion" className="text-sm text-white/80 hover:text-white">
              Connexion
            </Link>
          )}
          <a
            href={links.manager}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: theme.ctaGradient, boxShadow: theme.glow }}
          >
            App Manager
          </a>
        </div>
      </div>
      {open && (
        <div className="border-t border-cyan-500/20 px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold ${
                  pathname === item.href ? "text-cyan-300" : "text-cyan-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
