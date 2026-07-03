import Link from "next/link";
import { Logo } from "./Logo";
import { theme } from "@/lib/theme";

const nav = [
  { href: "/#mission", label: "Mission" },
  { href: "/volontaire", label: "Devenir volontaire" },
  { href: "/a-propos", label: "À propos" },
  { href: "/badges", label: "Badges" },
];

export function SiteNav() {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: theme.navGradient,
        borderBottom: "2px solid rgba(0, 180, 240, 0.2)",
      }}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <span
            className="text-xl font-bold"
            style={{
              background: theme.textGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            VolunSys-UY1
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold transition-colors hover:text-[#00D4FF]"
              style={{ color: theme.cyan }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
