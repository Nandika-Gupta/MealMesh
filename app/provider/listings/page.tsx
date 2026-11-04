/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getSession, type SessionUser } from "@/lib/session";
import { toDisplayListing, type ApiListing, type DisplayListing } from "@/lib/listings";

export default function MyListingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [items, setItems] = useState<DisplayListing[]>([]);
  const [filter, setFilter] = useState("All");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const loadListings = useCallback(async (user: SessionUser) => {
    try {
      const res = await fetch(`/api/listings?provider_id=${user.user_id}`);
      if (!res.ok) throw new Error("Request failed");
      const data: ApiListing[] = await res.json();
      setItems(data.map(toDisplayListing));
      setError("");
    } catch { setError("Unable to load your listings."); }
    finally { setLoaded(true); }
  }, []);

  useEffect(() => {
    const user = getSession();
    if (!user) { router.replace("/login"); return; }
    setSession(user);
    loadListings(user);
  }, [router, loadListings]);

  async function markCollected(id: number) {
    if (!session) return;
    const res = await fetch(`/api/listings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: session.user_id, status: "delivered" }) });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Unable to update this listing."); return; }
    loadListings(session);
  }
  async function removeListing(id: number) {
    if (!session || !window.confirm("Delete this listing? This cannot be undone.")) return;
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: session.user_id }) });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Unable to delete this listing."); return; }
    setItems((current) => current.filter((item) => item.id !== id));
  }
  const visible = filter === "All" ? items : items.filter((item) => item.status === filter);

  return <main className="provider-page">
    <nav className="provider-navbar"><Link href="/" className="provider-logo">MealMesh</Link><div className="provider-nav-links"><Link href="/listings">Browse Food</Link><Link href="/provider/dashboard">Dashboard</Link><Link href="/provider/listings" className="active">My Listings</Link></div></nav>
    <section className="provider-welcome"><div><p className="provider-eyebrow">PROVIDER WORKSPACE</p><h1>My food listings</h1><p>Update availability and keep your contributions organised.</p></div><Link href="/provider/listings/new" className="provider-add-button">+ Add Food Listing</Link></section>
    <section className="provider-listings"><div className="listing-management-toolbar"><div className="category-filters">{["All", "Available", "Claimed", "Collected", "Expired"].map((value) => <button key={value} className={filter === value ? "category-active" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div><span>{visible.length} listing(s)</span></div>
      {error && <p className="claim-error">{error}</p>}
      {!loaded ? <p>Loading your listings...</p> : visible.length === 0 ? <div className="provider-empty"><span>🥗</span><h3>No listings in this view</h3><p>Add food to start sharing with your community.</p><Link href="/provider/listings/new">Add Food Listing</Link></div> : <div className="provider-listing-grid">{visible.map((item) => <article className="provider-listing-card" key={item.id}><div className="provider-food-image">{item.imageData ? <img src={item.imageData} alt={item.name} /> : <span>{item.emoji}</span>}<span className="provider-category">{item.category}</span></div><div className="provider-card-content"><div className="provider-card-title"><h3>{item.name}</h3><span className={`provider-status ${item.status === "Available" ? "provider-available" : "provider-claimed"}`}>{item.status}</span></div><div className="provider-food-details"><p><strong>Quantity:</strong> {item.quantity}</p><p><strong>Pickup:</strong> {item.pickupTime}</p><p><strong>Location:</strong> {item.location}</p>{item.recipientName && <p><strong>Claimed by:</strong> {item.recipientName}</p>}<p>{item.description}</p></div><div className="listing-card-actions">{item.status === "Claimed" && <button onClick={() => markCollected(item.id)}>Mark collected</button>}<button className="danger-action" onClick={() => removeListing(item.id)}>Delete</button></div></div></article>)}</div>}
    </section><footer className="provider-footer">MealMesh · Connecting food. Empowering communities.</footer>
  </main>;
}
