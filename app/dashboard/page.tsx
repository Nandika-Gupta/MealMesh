/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Claim = { id: string; listingId: string; name: string; category: string; quantity: string; provider: string; location: string; pickupTime: string; status: "Confirmed" | "Collected"; emoji: string; imageData?: string; claimedAt: number };
const CLAIMS_KEY = "mealmesh-recipient-claims";

export default function DashboardPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const loadClaims = useCallback(() => {
    try { const data = localStorage.getItem(CLAIMS_KEY); setClaims(data ? JSON.parse(data) : []); }
    catch { setClaims([]); }
  }, []);
  useEffect(() => { loadClaims(); window.addEventListener("focus", loadClaims); return () => window.removeEventListener("focus", loadClaims); }, [loadClaims]);
  function markCollected(id: string) {
    const updated = claims.map((claim) => claim.id === id ? { ...claim, status: "Collected" as const } : claim);
    setClaims(updated); localStorage.setItem(CLAIMS_KEY, JSON.stringify(updated));
  }
  const collectedCount = claims.filter((claim) => claim.status === "Collected").length;
  return <main className="dashboard-page">
    <nav className="dashboard-navbar"><Link href="/" className="dashboard-logo">MealMesh</Link><div className="dashboard-nav-links"><Link href="/listings">Browse Food</Link><Link href="/dashboard" className="active">Dashboard</Link><Link href="/login">Logout</Link></div></nav>
    <section className="dashboard-welcome"><div><p className="dashboard-eyebrow">RECIPIENT DASHBOARD</p><h1>Your food, all in one place.</h1><p>Track your claimed food and collection details.</p></div><Link href="/listings" className="dashboard-browse-button">+ Find Food</Link></section>
    <section className="dashboard-stats"><div className="dashboard-stat-card"><span>📦</span><p>Total Claims</p><h2>{claims.length}</h2></div><div className="dashboard-stat-card"><span>✓</span><p>Collected</p><h2>{collectedCount}</h2></div><div className="dashboard-stat-card"><span>🕒</span><p>Awaiting Pickup</p><h2>{claims.length - collectedCount}</h2></div></section>
    <section className="dashboard-claims"><div className="dashboard-section-heading"><div><p className="dashboard-eyebrow">YOUR ACTIVITY</p><h2>Your Food Claims</h2><p>Claims you confirm from Browse Food will appear here automatically.</p></div><Link href="/listings">Explore listings →</Link></div>
      {claims.length === 0 ? <div className="dashboard-empty"><span>🥗</span><h3>No food claims yet</h3><p>Browse available food and confirm your first claim.</p><Link href="/listings">Browse Food</Link></div> : <div className="dashboard-claim-list">{claims.slice().sort((a,b) => b.claimedAt-a.claimedAt).map((claim) => <article className="dashboard-claim-card" key={claim.id}><div className="dashboard-claim-emoji">{claim.imageData ? <img src={claim.imageData} alt={claim.name} /> : claim.emoji}</div><div className="dashboard-claim-info"><div className="dashboard-claim-title"><div><span className="dashboard-category">{claim.category}</span><h3>{claim.name}</h3></div><span className={`dashboard-status ${claim.status === "Collected" ? "status-collected" : "status-confirmed"}`}>{claim.status}</span></div><div className="dashboard-claim-details"><p><strong>Quantity:</strong> {claim.quantity}</p><p><strong>Provider:</strong> {claim.provider}</p><p><strong>Location:</strong> {claim.location}</p><p><strong>Pickup:</strong> {claim.pickupTime}</p></div>{claim.status === "Confirmed" && <button className="dashboard-collected-button" onClick={() => markCollected(claim.id)}>Mark as Collected</button>}</div></article>)}</div>}
    </section><footer className="dashboard-footer"><p>MealMesh · Reducing food waste, one meal at a time.</p></footer>
  </main>;
}
