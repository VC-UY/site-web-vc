"use client";

import { useEffect, useState } from "react";
import { apiGet, SystemOverview } from "@/lib/api";

export function useLiveOverview(intervalMs = 30000) {
  const [data, setData] = useState<SystemOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const overview = await apiGet<SystemOverview>("/overview/");
      setData(overview);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { data, error, loading, refresh };
}
