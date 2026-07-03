import { GlassCard, GradientButton, SectionTitle } from "@/components/ui";
import { links, theme } from "@/lib/theme";

const badges = [
  { name: "Premier pas", desc: "Première tâche exécutée avec succès", color: theme.cyan },
  { name: "Contributeur régulier", desc: "7 jours d'activité consécutifs", color: theme.success },
  { name: "Champion communautaire", desc: "Top 3 du classement mensuel", color: theme.warning },
  { name: "Ambassadeur UY1", desc: "Recrutement de 3 nouveaux volontaires", color: theme.cyanBright },
  { name: "Scientifique solidaire", desc: "100 heures de calcul offertes", color: "#8B5CF6" },
  { name: "Fiabilité exemplaire", desc: "Aucune tâche échouée sur 30 jours", color: theme.success },
];

export default function BadgesPage() {
  return (
    <div className="px-6 py-16">
      <div className="container mx-auto max-w-4xl">
        <SectionTitle
          eyebrow="Gamification"
          title="Badges & reconnaissance"
          subtitle="Valoriser l'engagement par la visibilité et le sens — pas par des incitations financières."
        />

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {badges.map((b) => (
            <GlassCard key={b.name}>
              <div
                className="mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: `${b.color}22`, color: b.color, border: `1px solid ${b.color}44` }}
              >
                Badge
              </div>
              <h3 className="text-lg font-bold text-white">{b.name}</h3>
              <p className="mt-2 text-sm text-white/75">{b.desc}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard>
          <h3 className="mb-3 text-xl font-bold text-white">Micro-récompenses frugales</h3>
          <p className="mb-4 text-white/85">
            Au-delà des badges, le système expérimente des récompenses à{" "}
            <strong>faible coût et forte valeur perçue</strong> : reconnaissance publique sur le
            tableau d&apos;honneur, accès prioritaire aux ressources pédagogiques, crédits de
            communication, mentions dans les rapports de recherche.
          </p>
          <p className="text-sm text-white/70">
            L&apos;objectif est de tester ce qui motive réellement dans notre contexte — sans créer
            de dépendance à des incitations coûteuses.
          </p>
          <div className="mt-6">
            <GradientButton href="/volontaire">Rejoindre la communauté</GradientButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
