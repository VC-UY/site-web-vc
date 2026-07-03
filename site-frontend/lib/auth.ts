const TOKEN_KEY = "vcuy_volunteer_token";
const USER_KEY = "vcuy_volunteer_user";

export type VolunteerUser = {
  pseudonym: string;
  email: string;
  created_at: string;
};

export function saveSession(token: string, volunteer: VolunteerUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(volunteer));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getVolunteerUser(): VolunteerUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
