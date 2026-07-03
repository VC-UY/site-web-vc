import { theme } from "@/lib/theme";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      className="mt-20 border-t py-12"
      style={{ borderColor: "rgba(0, 180, 240, 0.2)" }}
    >
      <div className="container mx-auto grid gap-8 px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">VolunSys-UY1</p>
          <p className="mt-2 text-sm" style={{ color: theme.cyan, opacity: 0.85 }}>
            Calcul volontaire au service de la recherche — Université de Yaoundé I
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm" style={{ color: theme.cyan }}>
          <Link href="/volontaire" className="hover:text-[#00D4FF]">
            Guide volontaire
          </Link>
          <Link href="/a-propos" className="hover:text-[#00D4FF]">
            Projet de recherche
          </Link>
          <Link href="/badges" className="hover:text-[#00D4FF]">
            Gamification
          </Link>
        </div>
        <div className="text-xs" style={{ color: theme.cyan, opacity: 0.7 }}>
          Master 2 Informatique — Systèmes et Réseaux
          <br />
          Encadrement : Dr ADAMOU HAMZA
        </div>
      </div>
    </footer>
  );
}
