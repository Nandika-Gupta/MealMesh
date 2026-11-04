/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { clearSession, useRequireSession } from "@/lib/session";
import { toDisplayListing, type ApiListing, type DisplayListing } from "@/lib/listings";

type ApiClaim = ApiListing & { claim_id: number; claim_status: "pending" | "completed" | "cancelled"; claimed_at: string; review_id: number | null };
type Claim = DisplayListing & { claimId: number; provider: string; claimStatus: "Confirmed" | "Collected" | "Cancelled"; reviewed: boolean };
const claimStatusLabels = { pending: "Confirmed", completed: "Collected", cancelled: "Cancelled" } as const;

function toClaim(row: ApiClaim): Claim {
  return { ...toDisplayListing(row), claimId: row.claim_id, provider: row.provider_org || row.provider_name || "", claimStatus: claimStatusLabels[row.claim_status], reviewed: row.review_id !== null };
}

export default function DashboardPage() {
  // providers and admins are sent to their own dashboards
  const session = useRequireSession(["recipient"]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const loadClaims = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/claims?recipient_id=${session.user_id}`);
      if (!res.ok) throw new Error("Request failed");
      const data: ApiClaim[] = await res.json();
      setClaims(data.map(toClaim)); setError("");
    } catch { setError("Unable to load your claims."); }
    finally { setLoaded(true); }
  }, [session]);
  useEffect(() => { loadClaims(); window.addEventListener("focus", loadClaims); return () => window.removeEventListener("focus", loadClaims); }, [loadClaims]);
  async function markCollected(claimId: number) {
    if (!session) return;
    const res = await fetch(`/api/claims/${claimId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient_id: session.user_id, status: "completed" }) });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Unable to update this claim."); return; }
    loadClaims();
  }
  if (!session) return <main className="dashboard-page"><p>Checking your session...</p></main>;
  const collectedCount = claims.filter((claim) => claim.claimStatus === "Collected").length;
  const awaitingCount = claims.filter((claim) => claim.claimStatus === "Confirmed").length;
  return <main className="dashboard-page">
    <nav className="dashboard-navbar"><Link href="/" className="dashboard-logo">MealMesh</Link><div className="dashboard-nav-links"><Link href="/listings">Browse Food</Link><Link href="/dashboard" className="active">Dashboard</Link><Link href="/reviews">Reviews</Link><Link href="/login" onClick={clearSession}>Logout</Link></div></nav>
    <section className="dashboard-welcome"><div><p className="dashboard-eyebrow">RECIPIENT DASHBOARD</p><h1>Hi {session.name}, your food is all in one place.</h1><p>Track your claimed food and collection details.</p></div><Link href="/listings" className="dashboard-browse-button">+ Find Food</Link></section>
    <section className="dashboard-stats"><div className="dashboard-stat-card"><span>📦</span><p>Total Claims</p><h2>{loaded ? claims.length : "—"}</h2></div><div className="dashboard-stat-card"><span>✓</span><p>Collected</p><h2>{collectedCount}</h2></div><div className="dashboard-stat-card"><span>🕒</span><p>Awaiting Pickup</p><h2>{awaitingCount}</h2></div></section>
    <section className="dashboard-claims"><div className="dashboard-section-heading"><div><p className="dashboard-eyebrow">YOUR ACTIVITY</p><h2>Your Food Claims</h2><p>Claims you confirm from Browse Food will appear here automatically.</p></div><Link href="/listings">Explore listings →</Link></div>
      {error && <p className="claim-error">{error}</p>}
      {!loaded ? <p>Loading your claims...</p> : claims.length === 0 ? <div className="dashboard-empty"><span>🥗</span><h3>No food claims yet</h3><p>Browse available food and confirm your first claim.</p><Link href="/listings">Browse Food</Link></div> : <div className="dashboard-claim-list">{claims.map((claim) => <article className="dashboard-claim-card" key={claim.claimId}><div className="dashboard-claim-emoji">{claim.imageData ? <img src={claim.imageData} alt={claim.name} /> : claim.emoji}</div><div className="dashboard-claim-info"><div className="dashboard-claim-title"><div><span className="dashboard-category">{claim.category}</span><h3>{claim.name}</h3></div><span className={`dashboard-status ${claim.claimStatus === "Collected" ? "status-collected" : "status-confirmed"}`}>{claim.claimStatus}</span></div><div className="dashboard-claim-details"><p><strong>Quantity:</strong> {claim.quantity}</p><p><strong>Provider:</strong> {claim.provider}</p><p><strong>Location:</strong> {claim.location}</p><p><strong>Pickup:</strong> {claim.pickupTime}</p></div>{claim.claimStatus === "Confirmed" && <button className="dashboard-collected-button" onClick={() => markCollected(claim.claimId)}>Mark as Collected</button>}{claim.claimStatus === "Collected" && !claim.reviewed && <Link href="/reviews" className="dashboard-collected-button">Leave a review</Link>}</div></article>)}</div>}
    </section><footer className="dashboard-footer"><p>MealMesh · Reducing food waste, one meal at a time.</p></footer>
  </main>;
}
