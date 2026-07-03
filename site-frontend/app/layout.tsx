import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { links } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(links.site),
  title: {
    default: "VolunSys-UY1 | Calcul volontaire pour la science",
    template: "%s | VolunSys-UY1",
  },
  description:
    "Plateforme de calcul volontaire, Universite de Yaounde I. Partagez la puissance de votre machine pour les calculs scientifiques.",
  keywords: [
    "calcul volontaire",
    "volunteer computing",
    "Universite de Yaounde",
    "VolunSys",
    "calcul distribue",
    "VolunSys",
  ],
  openGraph: {
    title: "VolunSys-UY1, calcul volontaire",
    description: "La puissance collective au service de la science.",
    url: links.site,
    siteName: "VolunSys-UY1",
    locale: "fr_CM",
    type: "website",
    images: [{ url: "/logo.svg", width: 120, height: 120, alt: "VolunSys-UY1" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VolunSys-UY1",
    description: "Plateforme de calcul volontaire pour le calcul distribue.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen font-sans antialiased" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
