import { GlassCard, SectionTitle } from "@/components/ui";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

type Mission = {
  title: string;
  institution: string;
  program: string;
  supervisor: string;
  research_question: string;
  pillars: { title: string; description: string }[];
  objectives: string[];
};

async function getMission(): Promise<Mission | null> {
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003/api";
    const res = await fetch(`${api}/mission/`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (res.ok) return res.json();
  } catch {
    return null;
  }
  return null;
}

export default async function AboutPage() {
  const mission = await getMission();

  return (
    <div className="px-6 py-16">
      <div className="container mx-auto max-w-4xl">
        <SectionTitle
          eyebrow="À propos"
          title="Calcul volontaire pour les pays en développement"
          subtitle="Un projet de recherche ancré dans le réel — pas une plateforme commerciale."
        />

        {mission && (
          <>
            <GlassCard className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.cyan }}>
                {mission.institution} — {mission.program}
              </p>
              <p className="mt-2 text-white/80">Encadrement : {mission.supervisor}</p>
              <blockquote
                className="mt-6 border-l-4 pl-4 text-lg italic text-white/90"
                style={{ borderColor: theme.cyanBright }}
              >
                {mission.research_question}
              </blockquote>
            </GlassCard>

            <h3 className="mb-6 text-2xl font-bold text-white">Objectifs spécifiques</h3>
            <div className="mb-12 grid gap-4">
              {mission.objectives.map((obj, i) => (
                <GlassCard key={obj} className="flex gap-4">
                  <span className="text-2xl font-bold" style={{ color: theme.cyanBright }}>
                    {i + 1}
                  </span>
                  <p className="text-white/85">{obj}</p>
                </GlassCard>
              ))}
            </div>

            <h3 className="mb-6 text-2xl font-bold text-white">Leviers d&apos;engagement</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {mission.pillars.map((p) => (
                <GlassCard key={p.title}>
                  <h4 className="mb-2 font-bold" style={{ color: theme.cyan }}>
                    {p.title}
                  </h4>
                  <p className="text-sm text-white/80">{p.description}</p>
                </GlassCard>
              ))}
            </div>
          </>
        )}

        <GlassCard className="mt-12">
          <h3 className="mb-3 text-xl font-bold text-white">Résultats attendus</h3>
          <ul className="space-y-2 text-sm text-white/85">
            <li>• Méthodologie reproductible de recrutement et fidélisation</li>
            <li>• Prototype intégrant gamification et micro-récompenses frugales</li>
            <li>• Typologie des incitations efficaces (sociales, culturelles, matérielles)</li>
            <li>• Analyse chiffrée de la participation avant/après déploiement des stratégies</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
