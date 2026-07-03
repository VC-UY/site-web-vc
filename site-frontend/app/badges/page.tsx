"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { GlassCard, MetricCard, SectionTitle } from "@/components/ui";

const BADGE_LABELS: Record<string, string> = {
  "first-step": "Premier pas",
  science: "Scientifique solidaire",
  regular: "Contributeur regulier",
  reliable: "Fiabilite exemplaire",
  community: "Champion communautaire",
  ambassador: "Ambassadeur UY1",
};

type BadgesData = {
  catalog: { id: string; name: string; description: string; min_points?: number }[];
  leaderboard: {
    pseudonym: string;
    status: string;
    points: number;
    tasks_completed: number;
    tasks_total: number;
    badges: string[];
  }[];
  points_rules: Record<string, number>;
  registered_on_site: number;
  live_volunteers: number;
};

export default function BadgesPage() {
  const [data, setData] = useState<BadgesData | null>(null);

  useEffect(() => {
    apiGet<BadgesData>("/badges/").then(setData).catch(() => setData(null));
    const id = setInterval(() => apiGet<BadgesData>("/badges/").then(setData).catch(() => {}), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-6 py-16">
      <div className="container mx-auto">
        <SectionTitle
          eyebrow="Participation"
          title="Badges et points"
          subtitle="Chaque contribution compte, les badges sont attribues selon votre activite reelle sur le reseau"
        />
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Inscrits sur le site" value={data?.registered_on_site ?? "..."} />
          <MetricCard label="Volontaires connectes" value={data?.live_volunteers ?? "..."} />
          <MetricCard
            label="Points par tache terminee"
            value={data?.points_rules?.task_completed ?? 100}
          />
          <MetricCard label="Bonus machine disponible" value={data?.points_rules?.available_bonus ?? 50} />
        </div>

        <GlassCard className="mb-10">
          <h3 className="mb-3 text-lg font-bold text-white">Comment gagner des points</h3>
          <ul className="grid gap-2 text-sm text-white/80 md:grid-cols-2">
            <li>+{data?.points_rules?.task_completed ?? 100} pts par tache terminee avec succes</li>
            <li>+{data?.points_rules?.task_assigned ?? 25} pts par tache assignee</li>
            <li>+{data?.points_rules?.available_bonus ?? 50} pts si votre machine est disponible</li>
            <li>+{data?.points_rules?.busy_bonus ?? 30} pts si votre machine execute un calcul</li>
            <li>+{data?.points_rules?.gpu_bonus ?? 20} pts bonus si GPU disponible</li>
          </ul>
        </GlassCard>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.catalog ?? []).map((b) => (
            <GlassCard key={b.id}>
              <p className="text-xs font-semibold uppercase text-cyan-400">
                {b.min_points ? `${b.min_points} pts min.` : "Badge"}
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">{b.name}</h3>
              <p className="mt-2 text-sm text-white/70">{b.description}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard>
          <h3 className="mb-4 text-xl font-bold text-white">Classement par points</h3>
          {(data?.leaderboard ?? []).length === 0 ? (
            <p className="text-white/60">
              Classement vide, inscrivez-vous et connectez votre machine pour apparaitre ici.
            </p>
          ) : (
            <ol className="space-y-3">
              {data?.leaderboard.map((entry, i) => (
                <li
                  key={`${entry.pseudonym}-${i}`}
                  className="rounded-lg bg-black/20 px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-cyan-200">
                      #{i + 1} {entry.pseudonym}
                    </span>
                    <span className="text-lg font-bold text-cyan-300">{entry.points} pts</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/60">
                    <span>{entry.tasks_completed} taches terminees</span>
                    <span>{entry.status}</span>
                  </div>
                  {entry.badges.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entry.badges.map((id) => (
                        <span
                          key={id}
                          className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-200"
                        >
                          {BADGE_LABELS[id] ?? id}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
