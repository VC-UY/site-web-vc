import { theme } from "@/lib/theme";
import { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={{
        background: theme.cardGradient,
        border: theme.border,
        boxShadow: theme.glow,
      }}
    >
      {children}
    </div>
  );
}

export function GradientButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const isPrimary = variant === "primary";
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5"
      style={
        isPrimary
          ? {
              background: theme.ctaGradient,
              color: "#fff",
              border: "2px solid rgba(0, 212, 255, 0.4)",
              boxShadow: theme.glow,
            }
          : {
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              border: theme.border,
              backdropFilter: "blur(10px)",
            }
      }
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-12 text-center">
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: theme.cyan }}>
          {eyebrow}
        </p>
      )}
      <h2
        className="text-4xl font-bold"
        style={{
          background: theme.textGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">{subtitle}</p>
      )}
    </div>
  );
}
