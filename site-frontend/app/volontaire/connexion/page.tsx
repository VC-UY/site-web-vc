"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { GlassCard, SectionTitle } from "@/components/ui";

export default function ConnexionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await apiPost<{ token: string; volunteer: { pseudonym: string; email: string; created_at: string } }>(
        "/volunteers/login/",
        { email: fd.get("email"), password: fd.get("password") }
      );
      saveSession(res.token, res.volunteer);
      router.push("/volontaire/installation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-16">
      <div className="container mx-auto max-w-lg">
        <SectionTitle title="Connexion volontaire" subtitle="Accedez au guide d'installation" />
        <GlassCard>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-cyan-200">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-cyan-500/30 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-cyan-200">Mot de passe</label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-cyan-500/30 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-300 py-3 font-bold text-white disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-white/60">
            Pas encore inscrit ? <Link href="/volontaire/inscription" className="text-cyan-300">Inscription</Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
