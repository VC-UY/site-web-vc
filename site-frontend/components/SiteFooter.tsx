import Link from "next/link";
import { LogoWithText } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t py-14" style={{ borderColor: "rgba(0,180,240,0.2)" }}>
      <div className="container mx-auto grid gap-10 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <LogoWithText />
          <p className="mt-4 max-w-md text-sm text-white/70">
            Plateforme de calcul volontaire, Universite de Yaounde I. Pretex vos
            ressources inutilisees pour accelerer les calculs scientifiques et l&apos;entrainement
            de modeles.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-cyan-300">
          <Link href="/tableau-de-bord">Tableau de bord</Link>
          <Link href="/badges">Badges et points</Link>
          <Link href="/volontaire/inscription">Devenir volontaire</Link>
        </div>
        <div className="text-xs text-white/50">
          VolunSys-UY1, calcul distribue, participation communautaire et classement en direct.
        </div>
      </div>
    </footer>
  );
}
