import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "VolunSys-UY1 — Calcul volontaire pour la science",
  description:
    "Plateforme de calcul distribué volontaire. Contribuez à la recherche, rejoignez la communauté, soumettez vos workflows scientifiques.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
