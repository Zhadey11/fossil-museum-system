/** Usuario devuelto por POST /api/auth/login (persistido para UI y paneles). */
export const AUTH_USER_KEY = "fosiles_user";

export type StoredUser = {
  id: number;
  email: string;
  roles: number[];
};

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_USER_KEY);
}
