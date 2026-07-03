import { GlassCard, GradientButton, SectionTitle } from "@/components/ui";
import { links, theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

type InstallGuide = {
  repository: string;
  coordinator: { host: string; proxy_port: number };
  requirements: string[];
  platforms: Record<string, { title: string; steps: string[] }>;
  configuration: { title: string; fields: { name: string; value: string; description: string }[]; note: string };
  verification: string[];
  troubleshooting: { problem: string; solution: string }[];
};

async function getGuide(): Promise<InstallGuide> {
  try {
    const res = await fetch(`${links.api}/install-guide/`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (res.ok) return res.json();
  } catch {
    /* fallback */
  }
  return {
    repository: links.volunteerRepo,
    coordinator: { host: "173.249.38.251", proxy_port: 6380 },
    requirements: ["Python 3.10+", "Docker", "Git", "4 Go RAM", "Internet stable"],
    platforms: {
      linux: {
        title: "Linux / macOS",
        steps: [
          `git clone ${links.volunteerRepo}.git`,
          "cd volunteer-app-2025/volontaire",
          "chmod +x install.sh run.sh && ./install.sh",
          "./run.sh",
        ],
      },
      windows: {
        title: "Windows",
        steps: [
          `git clone ${links.volunteerRepo}.git`,
          "cd volunteer-app-2025\\volontaire",
          "PowerShell admin : .\\install_windows.ps1",
          ".\\run_windows.ps1",
        ],
      },
    },
    configuration: {
      title: "Connexion coordinateur",
      fields: [
        { name: "COORDINATOR_HOST", value: "173.249.38.251", description: "Hôte proxy Redis" },
        { name: "COORDINATOR_PROXY_PORT", value: "6380", description: "Port proxy" },
      ],
      note: "À renseigner au premier lancement ou dans le fichier .env",
    },
    verification: ["Interface accessible", "Statut disponible", "Pas d'erreur Redis"],
    troubleshooting: [],
  };
}

function StepList({ steps, title }: { steps: string[]; title: string }) {
  return (
    <GlassCard>
      <h3 className="mb-4 text-xl font-bold" style={{ color: theme.cyanBright }}>
        {title}
      </h3>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-white/90">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: "rgba(0,180,240,0.2)", color: theme.cyan }}
            >
              {i + 1}
            </span>
            <code className="flex-1 break-all rounded-lg bg-black/30 px-3 py-2 font-mono text-xs">
              {step}
            </code>
          </li>
        ))}
      </ol>
    </GlassCard>
  );
}

export default async function VolontairePage() {
  const guide = await getGuide();

  return (
    <div className="px-6 py-16">
      <div className="container mx-auto max-w-4xl">
        <SectionTitle
          eyebrow="Guide complet"
          title="Installer l'application volontaire"
          subtitle="Instructions pas à pas pour Linux, macOS et Windows — sans erreur, avec vérification et dépannage."
        />

        <div className="mb-8 flex flex-wrap gap-4">
          <GradientButton href={guide.repository}>Dépôt GitHub</GradientButton>
          <GradientButton href="/" variant="ghost">
            Retour à l&apos;accueil
          </GradientButton>
        </div>

        <GlassCard className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-white">Prérequis</h3>
          <ul className="grid gap-2 md:grid-cols-2">
            {guide.requirements.map((r) => (
              <li key={r} className="flex items-center gap-2 text-sm text-white/85">
                <span style={{ color: theme.success }}>✓</span> {r}
              </li>
            ))}
          </ul>
        </GlassCard>

        <div className="mb-8 grid gap-8">
          <StepList title={guide.platforms.linux.title} steps={guide.platforms.linux.steps} />
          <StepList title={guide.platforms.windows.title} steps={guide.platforms.windows.steps} />
        </div>

        <GlassCard className="mb-8">
          <h3 className="mb-4 text-xl font-bold" style={{ color: theme.cyanBright }}>
            {guide.configuration.title}
          </h3>
          <div className="space-y-4">
            {guide.configuration.fields.map((f) => (
              <div
                key={f.name}
                className="rounded-xl p-4"
                style={{ background: "rgba(0,0,0,0.25)", border: theme.border }}
              >
                <p className="font-mono text-sm font-bold" style={{ color: theme.cyanBright }}>
                  {f.name} = {f.value}
                </p>
                <p className="mt-1 text-sm text-white/75">{f.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/70">{guide.configuration.note}</p>
          <p className="mt-4 text-sm" style={{ color: theme.warning }}>
            Après installation : ouvrir{" "}
            <code className="rounded bg-black/30 px-2 py-1">http://localhost:8003</code>
          </p>
        </GlassCard>

        <GlassCard className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-white">Vérification</h3>
          <ul className="space-y-2">
            {guide.verification.map((v) => (
              <li key={v} className="text-sm text-white/85">
                ✓ {v}
              </li>
            ))}
          </ul>
        </GlassCard>

        {guide.troubleshooting.length > 0 && (
          <GlassCard>
            <h3 className="mb-4 text-lg font-bold text-white">Dépannage</h3>
            <div className="space-y-4">
              {guide.troubleshooting.map((t) => (
                <div key={t.problem}>
                  <p className="font-semibold" style={{ color: theme.error }}>
                    {t.problem}
                  </p>
                  <p className="text-sm text-white/80">{t.solution}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
