"use client";

import { BarChart, MetricCard, SectionTitle, StatusPill } from "@/components/ui";
import { useLiveOverview } from "@/hooks/useLiveOverview";

export default function DashboardPage() {
  const { data, loading, refresh, error } = useLiveOverview(20000);

  return (
    <div className="px-6 py-16">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <SectionTitle title="Tableau de bord systeme" subtitle="Recapitulatif en temps reel du reseau VolunSys-UY1" />
          </div>
          <div className="flex items-center gap-3">
            <StatusPill live={data?.live ?? false} />
            <button
              onClick={refresh}
              className="rounded-lg border border-cyan-500/40 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10"
            >
              Actualiser
            </button>
          </div>
        </div>
        {error && <p className="mb-4 text-amber-300">{error}</p>}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Volontaires actifs" value={loading ? "..." : data?.active_volunteers ?? 0} />
          <MetricCard label="Volontaires total" value={loading ? "..." : data?.total_volunteers ?? 0} />
          <MetricCard label="Taches en cours" value={loading ? "..." : data?.running_tasks ?? 0} />
          <MetricCard label="Etat systeme" value={loading ? "..." : data?.system_status ?? "n/a"} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <BarChart title="Repartition des volontaires" data={data?.volunteers_by_status ?? []} />
          <BarChart title="Repartition des taches" data={data?.tasks_by_status ?? []} />
        </div>
        {data?.fetched_at && (
          <p className="mt-6 text-center text-xs text-white/50">Derniere mise a jour : {data.fetched_at}</p>
        )}
      </div>
    </div>
  );
}
