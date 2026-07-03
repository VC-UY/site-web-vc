import { MetadataRoute } from "next";
import { links } from "@/lib/theme";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = links.site;
  const routes = [
    "",
    "/tableau-de-bord",
    "/analyses",
    "/volontaires",
    "/badges",
    "/volontaire/inscription",
    "/volontaire/connexion",
  ];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
