"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { links } from "@/lib/theme";
import { GlassCard, SectionTitle, MetricCard } from "@/components/ui";

type TelemetryOverview = {
  machines_count: number;
  snapshots_count: number;
  power_events_count: number;
  machines: Array<{
    machine_id: string;
    hostname: string;
    os: string;
    cpu_model: string;
    cpu_cores: number;
    ram_gb: number;
    snapshot_count: number;
    last_seen: string | null;
    volunteer_id: string;
  }>;
  recent_snapshots: Array<{
    machine_id: string;
    hostname: string;
    predicted_availability: number | null;
    collected_at: string;
    hybrid?: number;
    launch?: boolean;
  }>;
};

export default function DonneesPage() {
  const [data, setData] = useState<TelemetryOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiGet<TelemetryOverview>("/telemetry/")
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const exportUrl = `${links.api}/telemetry/export.zip`;

  return (
    <div className="px-6 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="Recherche scientifique"
            title="Donnees collectees"
            subtitle="Telemetrie des machines volontaires (CPU, memoire, disponibilite predite 15 min). Utilisable pour la recherche et l'amelioration du modele global."
          />
          <a
            href={exportUrl}
            className="rounded-xl px-5 py-3 text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #00B0F0 0%, #00D4FF 100%)",
              boxShadow: "0 8px 32px rgba(0, 180, 240, 0.35)",
            }}
          >
            Telecharger ZIP
          </a>
        </div>

        {error && <p className="mb-6 text-amber-300">{error}</p>}

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <MetricCard label="Machines" value={data?.machines_count ?? "…"} />
          <MetricCard label="Snapshots" value={data?.snapshots_count ?? "…"} />
          <MetricCard label="Evenements secteur" value={data?.power_events_count ?? "…"} />
        </div>

        <GlassCard className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-white">Machines contribution</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm text-white/80">
              <thead className="border-b border-cyan-500/30 text-cyan-200">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Hote</th>
                  <th className="py-2 pr-3 font-semibold">OS</th>
                  <th className="py-2 pr-3 font-semibold">CPU</th>
                  <th className="py-2 pr-3 font-semibold">RAM</th>
                  <th className="py-2 pr-3 font-semibold">Snapshots</th>
                  <th className="py-2 font-semibold">Vu</th>
                </tr>
              </thead>
              <tbody>
                {(data?.machines ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-white/50">
                      Aucune donnee pour le moment. Les volontaires qui lancent l&apos;agent
                      enverront automatiquement des snapshots ici.
                    </td>
                  </tr>
                )}
                {(data?.machines ?? []).map((m) => (
                  <tr key={m.machine_id} className="border-b border-white/5">
                    <td className="py-2 pr-3">{m.hostname || m.machine_id.slice(0, 12)}</td>
                    <td className="py-2 pr-3">{m.os || "—"}</td>
                    <td className="py-2 pr-3">
                      {m.cpu_cores ? `${m.cpu_cores} cœurs` : "—"}
                    </td>
                    <td className="py-2 pr-3">{m.ram_gb ? `${m.ram_gb} Go` : "—"}</td>
                    <td className="py-2 pr-3">{m.snapshot_count}</td>
                    <td className="py-2 text-xs text-white/50">
                      {m.last_seen ? new Date(m.last_seen).toLocaleString("fr-FR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 text-lg font-bold text-white">Derniers snapshots</h3>
          <ul className="space-y-2 text-sm text-white/75">
            {(data?.recent_snapshots ?? []).map((s, i) => (
              <li
                key={`${s.machine_id}-${s.collected_at}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 py-2"
              >
                <span>
                  {s.hostname || s.machine_id.slice(0, 10)} — pred.{" "}
                  {s.predicted_availability != null
                    ? `${(s.predicted_availability * 100).toFixed(0)} %`
                    : "n/a"}
                  {s.launch != null && (
                    <span className={s.launch ? " text-emerald-300" : " text-rose-300"}>
                      {" "}
                      ({s.launch ? "launch OK" : "pas de launch"})
                    </span>
                  )}
                </span>
                <span className="text-xs text-white/45">
                  {new Date(s.collected_at).toLocaleString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-white/45">
            Le fichier ZIP contient README.json, machines.csv et des fichiers JSONL de
            snapshots pour re-entrainer le modele global hors production.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
