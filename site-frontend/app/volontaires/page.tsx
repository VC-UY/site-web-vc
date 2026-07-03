"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { GlassCard, SectionTitle, StatusPill } from "@/components/ui";

type Volunteer = Record<string, unknown>;

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGet<{ count: number; results: Volunteer[] }>("/volunteers/");
        setVolunteers(res.results);
        setLive(true);
      } catch {
        setLive(false);
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-6 py-16">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <SectionTitle title="Reseau de volontaires" subtitle="Donnees issues du coordinateur en direct" />
          <StatusPill live={live} />
        </div>
        {loading ? (
          <p className="text-center text-white/60">Chargement...</p>
        ) : volunteers.length === 0 ? (
          <GlassCard>
            <p className="text-center text-white/70">Aucun volontaire connecte pour le moment.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {volunteers.map((v, i) => (
              <GlassCard key={String(v.id ?? i)}>
                <p className="text-lg font-bold text-cyan-300">{String(v.name ?? v.pseudonym ?? "Volontaire")}</p>
                <p className="mt-2 text-sm text-white/70">Statut : {String(v.current_status ?? "n/a")}</p>
                {v.ip_address != null && (
                  <p className="mt-1 text-xs text-white/50">IP : {String(v.ip_address)}</p>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
