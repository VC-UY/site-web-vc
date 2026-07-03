"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getToken, getVolunteerUser } from "@/lib/auth";
import { GlassCard, SectionTitle } from "@/components/ui";
import { links } from "@/lib/theme";

type Guide = {
  repository: string;
  coordinator: { host: string; proxy_port: number };
  requirements: string[];
  platforms: Record<string, { title: string; steps: string[] }>;
  verification: string[];
};

export default function InstallationPage() {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = getVolunteerUser();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/volontaire/inscription");
      return;
    }
    apiGet<Guide>("/install-guide/", token)
      .then(setGuide)
      .catch((e) => setError(e instanceof Error ? e.message : "Acces refuse"));
  }, [router]);

  if (!user) return null;

  return (
    <div className="px-6 py-16">
      <div className="container mx-auto max-w-4xl">
        <SectionTitle
          title={`Guide d'installation, ${user.pseudonym}`}
          subtitle="Instructions completes pour rejoindre le reseau de calcul volontaire"
        />
        {error && (
          <GlassCard>
            <p className="text-red-400">{error}</p>
            <Link href="/volontaire/connexion" className="mt-2 inline-block text-cyan-300">
              Se reconnecter
            </Link>
          </GlassCard>
        )}
        {guide && (
          <>
            <GlassCard className="mb-6">
              <h3 className="text-lg font-bold text-white">Prerequis</h3>
              <ul className="mt-3 space-y-1 text-sm text-white/80">
                {guide.requirements.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
              <a
                href={guide.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-lg bg-cyan-500/20 px-4 py-2 text-sm text-cyan-200"
              >
                Depot GitHub volunteer-app-2025
              </a>
            </GlassCard>
            <GlassCard className="mb-6">
              <h3 className="text-lg font-bold text-white">Connexion coordinateur</h3>
              <p className="mt-2 font-mono text-sm text-cyan-300">
                COORDINATOR_HOST={guide.coordinator.host}
              </p>
              <p className="font-mono text-sm text-cyan-300">
                COORDINATOR_PROXY_PORT={guide.coordinator.proxy_port}
              </p>
            </GlassCard>
            {Object.values(guide.platforms).map((platform) => (
              <GlassCard key={platform.title} className="mb-6">
                <h3 className="text-lg font-bold text-cyan-300">{platform.title}</h3>
                <ol className="mt-4 space-y-3">
                  {platform.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                        {i + 1}
                      </span>
                      <code className="flex-1 break-all rounded-lg bg-black/30 px-3 py-2 text-white/85">{step}</code>
                    </li>
                  ))}
                </ol>
              </GlassCard>
            ))}
            <GlassCard>
              <h3 className="text-lg font-bold text-white">Verification</h3>
              <ul className="mt-3 space-y-1 text-sm text-white/80">
                {guide.verification.map((v) => (
                  <li key={v}>✓ {v}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-white/50">
                Application locale : http://localhost:8003, Manager : {links.manager}
              </p>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}
