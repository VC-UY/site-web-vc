"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getToken, getVolunteerUser } from "@/lib/auth";
import { GlassCard, SectionTitle } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { links } from "@/lib/theme";

type Guide = {
  repository: string;
  one_liner_linux: string;
  one_liner_linux_service: string;
  one_liner_linux_uninstall: string;
  one_liner_agent_uninstall?: string;
  one_liner_windows: string;
  requirements: string[];
  verification: string[];
  uninstall_steps?: string[];
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
          title={`Installation, ${user.pseudonym}`}
          subtitle="Une seule commande (sans Git, sans sudo/Ashley) — runtime compat, arriere-plan, relance au reboot"
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
            <GlassCard className="mb-6 border-cyan-400/30">
              <h3 className="text-lg font-bold text-white">Linux / macOS (recommande)</h3>
              <p className="mt-2 text-sm text-white/70">
                Une seule commande (pas de Git). Sur Linux, tout tourne en arriere-plan : vous pouvez fermer
                le terminal, et au reboot ca se relance seul. Puis ouvrez{" "}
                <span className="text-cyan-300">http://localhost:8003</span>
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                <code className="flex-1 break-all rounded-lg bg-black/40 px-4 py-3 text-sm text-cyan-100">
                  {guide.one_liner_linux}
                </code>
                <CopyButton text={guide.one_liner_linux} label="Copier" />
              </div>
            </GlassCard>

            <GlassCard className="mb-6 border-emerald-400/30">
              <h3 className="text-lg font-bold text-white">Linux — maj / deja installe (ZBook, Baudouin…)</h3>
              <p className="mt-2 text-sm text-white/70">
                Relancez cette commande pour basculer vers le runtime compat (sans Ashley / sans sudo)
                et redemarrer runtime + agent + UI.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                <code className="flex-1 break-all rounded-lg bg-black/40 px-4 py-3 text-sm text-emerald-100">
                  {guide.one_liner_linux_service}
                </code>
                <CopyButton text={guide.one_liner_linux_service} label="Copier" />
              </div>
            </GlassCard>

            <GlassCard className="mb-6 border-cyan-400/30">
              <h3 className="text-lg font-bold text-white">Windows (PowerShell)</h3>
              <p className="mt-2 text-sm text-white/70">
                Ouvrez PowerShell, copiez cette commande, puis ouvrez{" "}
                <span className="text-cyan-300">http://localhost:8003</span>
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                <code className="flex-1 break-all rounded-lg bg-black/40 px-4 py-3 text-sm text-cyan-100">
                  {guide.one_liner_windows}
                </code>
                <CopyButton text={guide.one_liner_windows} label="Copier" />
              </div>
            </GlassCard>

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
                Depot GitHub
              </a>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-bold text-white">Verification</h3>
              <ul className="mt-3 space-y-1 text-sm text-white/80">
                {guide.verification.map((v) => (
                  <li key={v}>✓ {v}</li>
                ))}
              </ul>
              <div className="mt-5 rounded-lg border border-rose-400/30 bg-rose-500/10 p-4">
                <h4 className="text-sm font-semibold text-rose-200">
                  Quitter le programme volontaire (ne plus etre contributeur)
                </h4>
                {guide.uninstall_steps && (
                  <ul className="mt-3 space-y-1 text-xs text-rose-100/90">
                    {guide.uninstall_steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-rose-100/80">1) Desinstaller l&apos;application volontaire</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <code className="flex-1 break-all rounded-lg bg-black/40 px-4 py-3 text-xs text-rose-100">
                    {guide.one_liner_linux_uninstall}
                  </code>
                  <CopyButton text={guide.one_liner_linux_uninstall} label="Copier" />
                </div>
                {guide.one_liner_agent_uninstall && (
                  <>
                    <p className="mt-4 text-xs text-rose-100/80">
                      2) Arreter l&apos;agent de collecte / prediction (demon au demarrage)
                    </p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                      <code className="flex-1 break-all rounded-lg bg-black/40 px-4 py-3 text-xs text-rose-100">
                        {guide.one_liner_agent_uninstall}
                      </code>
                      <CopyButton text={guide.one_liner_agent_uninstall} label="Copier" />
                    </div>
                  </>
                )}
              </div>
              <p className="mt-4 text-xs text-white/50">
                Application locale : http://localhost:8003 — Manager : {links.manager} — Donnees :{" "}
                <a href="/donnees" className="text-cyan-300 underline">
                  /donnees
                </a>
              </p>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}
