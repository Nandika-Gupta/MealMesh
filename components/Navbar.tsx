/* eslint react-hooks/set-state-in-effect: off */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { SESSION_KEY, clearSession, getSession, type Role, type SessionUser } from "@/lib/session";

type NavLink = { href: string; label: string };

// pages anyone can open, logged in or not
const publicLinks: NavLink[] = [
  { href: "/listings", label: "Browse Food" },
  { href: "/reviews", label: "Reviews" },
];

// pages each role is allowed into (see useRequireSession in lib/session.ts)
const roleLinks: Record<Role, NavLink[]> = {
  recipient: [{ href: "/dashboard", label: "Dashboard" }],
  provider: [
    { href: "/provider/dashboard", label: "Dashboard" },
    { href: "/provider/listings", label: "My Listings" },
  ],
  admin: [{ href: "/admin", label: "Admin" }],
};

// each page family already has its own navbar CSS in globals.css; keep using it
const variants = {
  home: { nav: "navbar", logo: "brand", links: "nav-actions", link: "nav-login", signup: "nav-signup", fullBrand: true },
  listings: { nav: "listings-navbar", logo: "brand", links: "listings-nav-links", link: "", signup: "listing-signup", fullBrand: true },
  claim: { nav: "claim-navbar", logo: "claim-logo", links: "provider-nav-links", link: "", signup: "", fullBrand: false },
  dashboard: { nav: "dashboard-navbar", logo: "dashboard-logo", links: "dashboard-nav-links", link: "", signup: "", fullBrand: false },
  provider: { nav: "provider-navbar", logo: "provider-logo", links: "provider-nav-links", link: "", signup: "", fullBrand: false },
  "provider-form": { nav: "provider-navbar", logo: "provider-brand", links: "", link: "", signup: "", fullBrand: false },
} as const;

export type NavbarVariant = keyof typeof variants;

type NavbarProps = {
  variant: NavbarVariant;
  // extra in-page links shown between the brand and the main links (used by the home page)
  sectionLinks?: ReactNode;
};

export default function Navbar({ variant, sectionLinks }: NavbarProps) {
  const style = variants[variant];
  const pathname = usePathname();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);

    // stay in sync if the user logs in or out in another tab
    function onStorage(event: StorageEvent) {
      if (event.key === null || event.key === SESSION_KEY) setSession(getSession());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  const linkClass = (href: string) =>
    [style.link, pathname === href ? "active" : ""].filter(Boolean).join(" ") || undefined;

  const links = [...publicLinks, ...(session ? roleLinks[session.role] ?? [] : [])];

  return (
    <nav className={style.nav}>
      <Link href="/" className={style.logo}>
        {style.fullBrand ? (
          <>
            <span className="brand-icon">🥬</span>
            <span>
              Meal<span className="brand-highlight">Mesh</span>
            </span>
          </>
        ) : variant === "provider-form" ? (
          "🥬 MealMesh"
        ) : (
          "MealMesh"
        )}
      </Link>

      {sectionLinks && <div className="nav-links">{sectionLinks}</div>}

      <div className={style.links || undefined}>
        {links.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            {item.label}
          </Link>
        ))}

        {/* auth links wait until the session has been read, so nobody sees the wrong set flash */}
        {ready &&
          (session ? (
            <Link href="/" className={style.link || undefined} onClick={handleLogout}>
              Logout
            </Link>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>
                Log in
              </Link>
              <Link href="/signup" className={style.signup || undefined}>
                {variant === "home" ? (
                  <>
                    Get started <span>↗</span>
                  </>
                ) : (
                  "Get started →"
                )}
              </Link>
            </>
          ))}
      </div>
    </nav>
  );
}
