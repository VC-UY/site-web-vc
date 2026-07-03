"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { theme } from "@/lib/theme";

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={`rounded-2xl p-6 backdrop-blur-xl ${className}`}
      style={{ background: theme.cardGradient, border: theme.border, boxShadow: theme.glow }}
    >
      {children}
    </motion.div>
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
    <div className="mb-10 text-center">
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-400">{eyebrow}</p>}
      <h2
        className="text-3xl font-bold md:text-4xl"
        style={{
          background: theme.textGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </h2>
      {subtitle && <p className="mx-auto mt-4 max-w-3xl text-lg text-white/80">{subtitle}</p>}
    </div>
  );
}

export function StatusPill({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        live ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
      {live ? "Donnees en direct" : "Coordinateur indisponible"}
    </span>
  );
}

export function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <GlassCard className="text-center">
      <p className="text-3xl font-bold text-cyan-300 md:text-4xl">{value}</p>
      <p className="mt-2 text-sm text-white/70">{label}</p>
    </GlassCard>
  );
}

export function BarChart({
  data,
  title,
}: {
  data: { name: string; value: number }[];
  title: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <GlassCard>
      <h3 className="mb-4 text-lg font-bold text-white">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-white/60">Aucune donnee disponible pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name}>
              <div className="mb-1 flex justify-between text-xs text-cyan-200">
                <span>{item.name}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
