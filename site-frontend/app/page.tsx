import { GlassCard, GradientButton, SectionTitle } from "@/components/ui";
import { links, theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const res = await fetch(`${links.api}/stats/`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (res.ok) return res.json();
  } catch {
    /* fallback */
  }
  return { active_volunteers: 0, tasks_completed: 0, system_status: "ok" };
}

const pillars = [
  {
    title: "Impact scientifique collectif",
    text: "Vos ressources inutilisées accélèrent des travaux de recherche locaux et internationaux.",
    color: theme.cyanBright,
  },
  {
    title: "Gamification & reconnaissance",
    text: "Badges, classements et mise en avant des contributeurs les plus engagés.",
    color: theme.success,
  },
  {
    title: "Micro-récompenses frugales",
    text: "Accès privilégié, visibilité publique, crédits de communication — sans infrastructure lourde.",
    color: theme.warning,
  },
  {
    title: "Confiance & transparence",
    text: "Tâches isolées dans Docker, suivi en temps réel, contrôle des ressources partagées.",
    color: theme.cyan,
  },
];

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-6 pb-24 pt-16">
        <div
          className="absolute right-0 top-0 h-96 w-96 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)",
            animation: "pulse-glow 8s ease-in-out infinite",
          }}
        />
        <div className="container relative z-10 mx-auto">
          <div className="animate-slide-in mx-auto max-w-4xl text-center">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: "linear-gradient(90deg, rgba(0,180,240,0.15) 0%, transparent 100%)",
                border: "1px solid rgba(0,212,255,0.3)",
              }}
            >
              <span className="text-sm font-semibold" style={{ color: theme.cyan }}>
                Calcul volontaire — Université de Yaoundé I
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight md:text-6xl">
              <span
                style={{
                  background: theme.textGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                La puissance collective
              </span>
              <br />
              <span style={{ color: theme.cyan }}>au service de la science</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-white/90">
              VolunSys-UY1 mutualise la puissance de calcul inutilisée pour exécuter des workflows
              scientifiques — une alternative{" "}
              <strong style={{ color: theme.cyanBright }}>frugale et communautaire</strong> aux
              infrastructures centralisées.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <GradientButton href={`${links.manager}/register`}>
                Soumettre une tâche — App Manager
              </GradientButton>
              <GradientButton href="/volontaire" variant="ghost">
                Installer l&apos;app volontaire
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — pas d'argent */}
      <section className="px-6 py-12">
        <div className="container mx-auto grid gap-6 md:grid-cols-3">
          {[
            { label: "Volontaires actifs", value: stats.active_volunteers ?? 0 },
            { label: "Contributions communautaires", value: stats.tasks_completed ?? "—" },
            { label: "État du réseau", value: stats.system_status === "ok" ? "Opérationnel" : "En cours" },
          ].map((s) => (
            <GlassCard key={s.label} className="text-center">
              <p className="text-4xl font-bold" style={{ color: theme.cyanBright }}>
                {s.value}
              </p>
              <p className="mt-2 text-sm" style={{ color: theme.cyan }}>
                {s.label}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="px-6 py-20">
        <div className="container mx-auto">
          <SectionTitle
            eyebrow="Recherche"
            title="Une stratégie d'engagement frugale"
            subtitle="Projet de Master 2 — comment recruter, motiver et fidéliser des volontaires dans un contexte de pays en développement, sans dépendre d'infrastructures coûteuses."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((p) => (
              <GlassCard key={p.title}>
                <h3 className="mb-3 text-xl font-bold" style={{ color: p.color }}>
                  {p.title}
                </h3>
                <p className="text-white/85">{p.text}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA double */}
      <section className="px-6 py-20">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            <GlassCard className="flex flex-col justify-between">
              <div>
                <h3 className="mb-3 text-2xl font-bold text-white">Chercheur ou gestionnaire</h3>
                <p className="mb-6 text-white/85">
                  Déposez vos workflows scientifiques, suivez l&apos;exécution en temps réel et
                  visualisez la performance du réseau de volontaires.
                </p>
              </div>
              <GradientButton href={links.manager}>
                Accéder au Manager →
              </GradientButton>
            </GlassCard>
            <GlassCard className="flex flex-col justify-between">
              <div>
                <h3 className="mb-3 text-2xl font-bold text-white">Volontaire</h3>
                <p className="mb-6 text-white/85">
                  Installez l&apos;application, configurez le coordinateur et partagez vos
                  ressources inutilisées en toute transparence. Guide pas à pas inclus.
                </p>
              </div>
              <GradientButton href="/volontaire" variant="ghost">
                Voir le guide d&apos;installation →
              </GradientButton>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-6 py-20">
        <div className="container mx-auto">
          <SectionTitle title="Comment ça marche" subtitle="Trois rôles, une même communauté" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Manager",
                text: "Soumet les workflows et répartit les tâches sur le réseau.",
              },
              {
                step: "02",
                title: "Coordinateur",
                text: "Orchestre la communication Redis et supervise l'état du système.",
              },
              {
                step: "03",
                title: "Volontaire",
                text: "Exécute les tâches dans des conteneurs Docker isolés.",
              },
            ].map((item) => (
              <GlassCard key={item.step}>
                <span className="font-mono text-3xl font-bold" style={{ color: theme.cyanBright }}>
                  {item.step}
                </span>
                <h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-white/80">{item.text}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
