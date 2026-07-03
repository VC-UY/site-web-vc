export const theme = {
  navyDark: "#001440",
  navyMid: "#002060",
  cyan: "#00B0F0",
  cyanBright: "#00D4FF",
  success: "#00FF88",
  warning: "#FFA500",
  pageGradient: "linear-gradient(180deg, #001440 0%, #002060 50%, #001440 100%)",
  cardGradient: "linear-gradient(135deg, rgba(0, 32, 96, 0.7) 0%, rgba(0, 20, 64, 0.7) 100%)",
  navGradient: "linear-gradient(135deg, rgba(0, 32, 96, 0.9) 0%, rgba(0, 20, 64, 0.9) 100%)",
  ctaGradient: "linear-gradient(135deg, #00B0F0 0%, #00D4FF 100%)",
  textGradient: "linear-gradient(135deg, #FFFFFF 0%, #00D4FF 100%)",
  border: "2px solid rgba(0, 180, 240, 0.3)",
  glow: "0 8px 32px rgba(0, 180, 240, 0.35)",
} as const;

export const links = {
  manager: process.env.NEXT_PUBLIC_MANAGER_URL || "https://manager-vc-uy.npe-techs.com",
  coordinator: process.env.NEXT_PUBLIC_COORDINATOR_URL || "https://coordinator-vc-uy.npe-techs.com",
  volunteerRepo: process.env.NEXT_PUBLIC_VOLUNTEER_REPO || "https://github.com/VC-UY/volunteer-app-2025",
  api: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003/api",
  site: process.env.NEXT_PUBLIC_SITE_URL || "https://vc-uy.npe-techs.com",
};

export const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/tableau-de-bord", label: "Tableau de bord" },
  { href: "/analyses", label: "Analyses" },
  { href: "/volontaires", label: "Volontaires" },
  { href: "/badges", label: "Badges et points" },
  { href: "/volontaire/inscription", label: "Devenir volontaire" },
];
