/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getSession, type SessionUser } from "@/lib/session";
import { toDisplayListing, type ApiListing } from "@/lib/listings";

type User = { user_id: number; name: string; email: string; role: string; org_name: string | null; is_active: boolean; created_at: string };
type Claim = { claim_id: number; listing_id: number; claim_status: string; claimed_at: string; category_name: string; recipient_name: string; provider_name: string };
type Review = { review_id: number; claim_id: number; rating: number; comment: string | null; created_at: string; recipient_name: string; provider_name: string };
type Overview = { users: User[]; listings: ApiListing[]; claims: Claim[]; reviews: Review[] };
const emptyOverview: Overview = { users: [], listings: [], claims: [], reviews: [] };

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [data, setData] = useState<Overview>(emptyOverview);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const user = getSession();
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "admin") { router.replace("/dashboard"); return; }
    setSession(user);
    try {
      const res = await fetch(`/api/admin/overview?admin_id=${user.user_id}`);
      const result = await res.json();
      if (!res.ok) { setError(result.error || "Unable to load the overview."); return; }
      setData(result); setError("");
    } catch { setError("Unable to load the overview."); }
    finally { setLoaded(true); }
  }, [router]);
  useEffect(() => { load(); }, [load]);
  async function deleteListing(id: number) {
    if (!session || !window.confirm("Delete this listing and its claim/review? This cannot be undone.")) return;
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: session.user_id }) });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Unable to delete this listing."); return; }
    load();
  }
  const listings = data.listings.map((row) => ({ ...toDisplayListing(row), provider: row.provider_org || row.provider_name }));
  const date = (value: string | null) => value ? new Date(value).toLocaleString() : "—";
  return <main className="provider-page"><nav className="provider-navbar"><Link href="/" className="provider-logo">MealMesh</Link><div className="provider-nav-links"><Link href="/listings">Browse Food</Link><Link href="/reviews">Reviews</Link><Link href="/login">Logout</Link></div></nav>
    <section className="provider-welcome"><div><p className="provider-eyebrow">ADMINISTRATION</p><h1>Platform overview</h1><p>All users, food listings, claims and feedback stored in MealMesh.</p></div><button className="provider-add-button" onClick={load}>Refresh overview</button></section>
    {error && <p className="claim-error">{error}</p>}
    <section className="provider-stats"><div className="provider-stat-card"><span>👥</span><p>Users</p><h2>{loaded ? data.users.length : "—"}</h2></div><div className="provider-stat-card"><span>📦</span><p>Total Listings</p><h2>{listings.length}</h2></div><div className="provider-stat-card"><span>🌱</span><p>Available</p><h2>{listings.filter(x => x.status === "Available").length}</h2></div><div className="provider-stat-card"><span>🤝</span><p>Claims</p><h2>{data.claims.length}</h2></div><div className="provider-stat-card"><span>⭐</span><p>Reviews</p><h2>{data.reviews.length}</h2></div></section>
    <section className="provider-listings"><div className="provider-section-heading"><div><h2>Users</h2><p>Every registered account.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Organisation</th><th>Joined</th></tr></thead><tbody>{data.users.map(user => <tr key={user.user_id}><td>{user.name}{!user.is_active && <small>Inactive</small>}</td><td>{user.email}</td><td>{user.role}</td><td>{user.org_name || "—"}</td><td>{date(user.created_at)}</td></tr>)}</tbody></table>{loaded && data.users.length === 0 && <p>No users yet.</p>}</div></section>
    <section className="provider-listings"><div className="provider-section-heading"><div><h2>All listings</h2><p>Remove inappropriate listings from the database.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Food</th><th>Category</th><th>Provider</th><th>Pickup</th><th>Status</th><th>Action</th></tr></thead><tbody>{listings.map(item => <tr key={item.id}><td>{item.name}<small>{item.quantity}</small></td><td>{item.category}</td><td>{item.provider}</td><td>{item.pickupTime}</td><td>{item.status}</td><td><button className="danger-action" onClick={() => deleteListing(item.id)}>Delete</button></td></tr>)}</tbody></table>{loaded && listings.length === 0 && <p>No listings have been added.</p>}</div></section>
    <section className="provider-listings"><div className="provider-section-heading"><div><h2>All claims</h2><p>Who claimed what, and whether it was collected.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Claim</th><th>Food category</th><th>Recipient</th><th>Provider</th><th>Claimed at</th><th>Status</th></tr></thead><tbody>{data.claims.map(claim => <tr key={claim.claim_id}><td>#{claim.claim_id}<small>Listing #{claim.listing_id}</small></td><td>{claim.category_name}</td><td>{claim.recipient_name}</td><td>{claim.provider_name}</td><td>{date(claim.claimed_at)}</td><td>{claim.claim_status}</td></tr>)}</tbody></table>{loaded && data.claims.length === 0 && <p>No claims yet.</p>}</div></section>
    <section className="provider-listings"><div className="provider-section-heading"><div><h2>All reviews</h2><p>Feedback left by recipients after collecting food.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Rating</th><th>Comment</th><th>Recipient</th><th>Provider</th><th>Date</th></tr></thead><tbody>{data.reviews.map(review => <tr key={review.review_id}><td>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</td><td>{review.comment || "—"}</td><td>{review.recipient_name}</td><td>{review.provider_name}</td><td>{date(review.created_at)}</td></tr>)}</tbody></table>{loaded && data.reviews.length === 0 && <p>No reviews yet.</p>}</div></section>
  </main>;
}
