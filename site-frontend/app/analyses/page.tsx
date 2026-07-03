"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiGet, Analytics } from "@/lib/api";
import { BarChart, GlassCard, MetricCard, SectionTitle, StatusPill } from "@/components/ui";

export default function AnalysesPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiGet<Analytics>("/analytics/")
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 25000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-6 py-16">
      <div className="container mx-auto">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <SectionTitle
            eyebrow="Suivi en direct"
            title="Analyses et metriques"
            subtitle="Indicateurs calcules en direct pour mesurer participation, regularite et efficacite de la plateforme"
          />
          <div className="flex items-center gap-3">
            <StatusPill live={data?.live ?? false} />
            <button
              onClick={load}
              className="rounded-lg border border-cyan-500/40 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10"
            >
              Actualiser
            </button>
          </div>
        </div>

        {error && <p className="mb-6 text-center text-amber-300">{error}</p>}

        <div className="mb-12 grid items-center gap-8 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Image
              src="/images/analytics.svg"
              alt="Analyses du reseau"
              width={520}
              height={360}
              className="mx-auto w-full max-w-md animate-float"
            />
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Taux de completion" value={data ? `${data.completion_rate}%` : "..."} />
            <MetricCard label="Taux d'utilisation" value={data ? `${data.utilization_rate}%` : "..."} />
            <MetricCard label="Inscrits site" value={data?.registered_on_site ?? "..."} />
            <MetricCard label="Workflows actifs" value={data?.total_workflows ?? "..."} />
          </div>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Volontaires actifs" value={data?.active_volunteers ?? "..."} />
          <MetricCard label="Taches terminees" value={data?.completed_tasks ?? "..."} />
          <MetricCard label="Taches en cours" value={data?.running_tasks ?? "..."} />
          <MetricCard label="Etat systeme" value={data?.system_status ?? "..."} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BarChart title="Volontaires par statut" data={data?.volunteers_by_status ?? []} />
          <BarChart title="Taches par statut" data={data?.tasks_by_status ?? []} />
        </div>

        {data?.fetched_at && (
          <p className="mt-8 text-center text-xs text-white/50">Derniere mise a jour : {data.fetched_at}</p>
        )}
      </div>
    </div>
  );
}
