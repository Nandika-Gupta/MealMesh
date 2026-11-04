export const SESSION_KEY = "mealmesh-user";

export type SessionUser = {
  user_id: number;
  name: string;
  role: "admin" | "provider" | "recipient";
};

// read the simple session object saved by the login / signup pages
export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.user_id !== "number" || !parsed.role) return null;
    return parsed as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
