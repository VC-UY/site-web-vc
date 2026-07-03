import { links } from "./theme";

const API = links.api;

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`);
  return data;
}

export type SystemOverview = {
  system_status: string;
  active_volunteers: number;
  total_volunteers: number;
  total_tasks: number;
  completed_tasks: number;
  running_tasks: number;
  total_workflows: number;
  volunteers_by_status: { name: string; value: number }[];
  tasks_by_status: { name: string; value: number }[];
  volunteers_preview: Record<string, unknown>[];
  live: boolean;
  fetched_at?: string;
};

export type Mission = {
  title: string;
  institution: string;
  platform_description: string;
  main_objective: string;
  specific_objectives: string[];
  pillars: { title: string; description: string }[];
  gamification_badges?: { id: string; name: string; description: string; min_points?: number }[];
  participation_benefits?: string[];
};

export type Analytics = {
  active_volunteers: number;
  total_volunteers: number;
  total_tasks: number;
  completed_tasks: number;
  running_tasks: number;
  total_workflows: number;
  completion_rate: number;
  utilization_rate: number;
  registered_on_site: number;
  volunteers_by_status: { name: string; value: number }[];
  tasks_by_status: { name: string; value: number }[];
  system_status: string;
  live: boolean;
  fetched_at?: string;
};
