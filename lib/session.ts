/* eslint react-hooks/set-state-in-effect: off */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const SESSION_KEY = "mealmesh-user";

export type Role = "admin" | "provider" | "recipient";

export type SessionUser = {
  user_id: number;
  name: string;
  role: Role;
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

// where each role lands when it opens a page meant for another role
export function homeForRole(role: Role) {
  if (role === "admin") return "/admin";
  if (role === "provider") return "/provider/dashboard";
  return "/dashboard";
}

// client-side page guard: returns the session once it is allowed, otherwise redirects.
// Pages should render a placeholder while this is null so protected content never flashes.
export function useRequireSession(allowedRoles: Role[]) {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const rolesKey = allowedRoles.join(",");

  useEffect(() => {
    const user = getSession();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!rolesKey.split(",").includes(user.role)) {
      router.replace(homeForRole(user.role));
      return;
    }
    setSession(user);
  }, [router, rolesKey]);

  return session;
}
