"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { GlassCard, MetricCard, SectionTitle, StatusPill } from "@/components/ui";
import { useLiveOverview } from "@/hooks/useLiveOverview";
import { apiGet, Mission } from "@/lib/api";
import { links, theme } from "@/lib/theme";

export default function HomePage() {
  const { data, loading, error } = useLiveOverview();
  const [mission, setMission] = useState<Mission | null>(null);

  useEffect(() => {
    apiGet<Mission>("/mission/").then(setMission).catch(() => setMission(null));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-20 pt-16">
        <ParticleCanvas />
        <div className="container relative z-10 mx-auto grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <StatusPill live={data?.live ?? false} />
            <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
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
              <span className="text-cyan-300">pour le calcul scientifique</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              {mission?.platform_description ??
                "VolunSys-UY1 mutualise la puissance inutilisee des ordinateurs pour executer simulations, entrainement de modeles et calculs intensifs."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`${links.manager}/register`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-8 py-4 text-sm font-bold text-white transition-transform hover:scale-105"
                style={{ background: theme.ctaGradient, boxShadow: theme.glow }}
              >
                Soumettre un calcul, App Manager
              </a>
              <Link
                href="/volontaire/inscription"
                className="rounded-xl border px-8 py-4 text-sm font-bold text-white transition-transform hover:scale-105"
                style={{ borderColor: "rgba(0,212,255,0.5)", background: "rgba(255,255,255,0.06)" }}
              >
                Pretear ma machine
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <Image
              src="/images/hero-network.svg"
              alt="Reseau de calcul volontaire VolunSys-UY1"
              width={560}
              height={420}
              className="mx-auto w-full max-w-lg animate-float"
              priority
            />
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        {error && <p className="mb-4 text-center text-sm text-amber-300">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Volontaires actifs" value={loading ? "..." : data?.active_volunteers ?? 0} />
          <MetricCard label="Taches totales" value={loading ? "..." : data?.total_tasks ?? 0} />
          <MetricCard label="Taches terminees" value={loading ? "..." : data?.completed_tasks ?? 0} />
          <MetricCard label="Workflows" value={loading ? "..." : data?.total_workflows ?? 0} />
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <SectionTitle
          eyebrow="VolunSys-UY1"
          title="Pourquoi cette plateforme"
          subtitle={mission?.institution ?? "Calcul volontaire pour l'Afrique centrale"}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(mission?.specific_objectives ?? []).map((text, i) => (
            <GlassCard key={text} className="flex gap-4">
              <span className="text-2xl font-bold text-cyan-300">{i + 1}</span>
              <p className="text-sm text-white/85">{text}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <SectionTitle
          eyebrow="Participation"
          title="Rejoignez le reseau"
          subtitle="Contribuez avec votre machine et montez dans le classement"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {(mission?.participation_benefits ?? []).map((benefit) => (
            <GlassCard key={benefit}>
              <p className="text-sm text-white/85">{benefit}</p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/volontaire/inscription"
            className="rounded-xl px-8 py-4 text-sm font-bold text-white"
            style={{ background: theme.ctaGradient, boxShadow: theme.glow }}
          >
            S&apos;inscrire et commencer
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Tableau de bord", desc: "Metriques systeme en temps reel.", href: "/tableau-de-bord" },
            { title: "Analyses", desc: "Participation et efficacite du reseau.", href: "/analyses" },
            { title: "Volontaires", desc: "Contributeurs connectes en direct.", href: "/volontaires" },
            { title: "Badges et points", desc: "Classement base sur la participation.", href: "/badges" },
          ].map((card) => (
            <GlassCard key={card.href}>
              <h3 className="text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-white/75">{card.desc}</p>
              <Link href={card.href} className="mt-4 inline-block text-cyan-300 hover:text-cyan-200">
                Ouvrir
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
