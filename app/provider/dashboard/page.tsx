/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRequireSession } from "@/lib/session";
import { toDisplayListing, type ApiListing, type DisplayListing } from "@/lib/listings";
import Navbar from "@/components/Navbar";

export default function ProviderDashboard() {
  const session = useRequireSession(["provider"]);
  const [listings, setListings] = useState<DisplayListing[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const loadListings = useCallback(async () => {
    if (!session) return;

    try {
      const res = await fetch(`/api/listings?provider_id=${session.user_id}`);
      if (!res.ok) throw new Error("Request failed");
      const data: ApiListing[] = await res.json();
      setListings(data.map(toDisplayListing));
      setError("");
    } catch (error) {
      console.error("Unable to load provider listings:", error);
      setError("Unable to load your listings.");
    } finally {
      setLoaded(true);
    }
  }, [session]);

  useEffect(() => {
    loadListings();
    window.addEventListener("focus", loadListings);
    window.addEventListener("pageshow", loadListings);
    return () => {
      window.removeEventListener("focus", loadListings);
      window.removeEventListener("pageshow", loadListings);
    };
  }, [loadListings]);

  async function markCollected(id: number) {
    if (!session) return;
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: session.user_id, status: "delivered" }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Unable to update this listing.");
      return;
    }
    loadListings();
  }

  if (!session) return <main className="provider-page"><p>Checking your session...</p></main>;

  const availableCount = listings.filter((item) => item.status === "Available").length;
  const claimedCount = listings.filter((item) => item.status === "Claimed").length;
  const collectedCount = listings.filter((item) => item.status === "Collected").length;

  return (
    <main className="provider-page">
      <Navbar variant="provider" />

      <section className="provider-welcome">
        <div>
          <p className="provider-eyebrow">PROVIDER DASHBOARD</p>
          <h1>Your food can make a difference.</h1>
          <p>Manage your surplus food listings and help good food reach the people who need it.</p>
        </div>
        <Link href="/provider/listings/new" className="provider-add-button">+ Add Food Listing</Link>
      </section>

      <section className="provider-stats">
        <div className="provider-stat-card"><span>📦</span><p>Total Listings</p><h2>{loaded ? listings.length : "—"}</h2></div>
        <div className="provider-stat-card"><span>🌱</span><p>Available</p><h2>{availableCount}</h2></div>
        <div className="provider-stat-card"><span>✓</span><p>Claimed</p><h2>{claimedCount}</h2></div>
        <div className="provider-stat-card"><span>🤝</span><p>Collected</p><h2>{collectedCount}</h2></div>
      </section>

      <section className="provider-listings">
        <div className="provider-section-heading">
          <div><p className="provider-eyebrow">YOUR CONTRIBUTION</p><h2>Recently Added Food</h2><p>Your most recent food listings, straight from the database.</p></div>
          <Link href="/provider/listings" className="text-action">Manage all listings →</Link>
        </div>
        {error && <p className="claim-error">{error}</p>}
        {!loaded ? <p>Loading your listings...</p> : listings.length === 0 ? (
          <div className="provider-empty"><span>🥗</span><h3>No listings yet</h3><p>Your published food items will appear here.</p><Link href="/provider/listings/new">Add Your First Listing</Link></div>
        ) : (
          <div className="provider-listing-grid">
            {listings.slice(0, 6).map((item) => (
              <article className="provider-listing-card" key={item.id}>
                <div className="provider-food-image">
                  {item.imageData ? <img src={item.imageData} alt={item.name} /> : <span>{item.emoji || "🥗"}</span>}
                  <span className="provider-category">{item.category}</span>
                </div>
                <div className="provider-card-content">
                  <div className="provider-card-title"><h3>{item.name}</h3><span className={`provider-status ${item.status === "Available" ? "provider-available" : "provider-claimed"}`}>{item.status}</span></div>
                  <div className="provider-food-details"><p><strong>Quantity:</strong> {item.quantity}</p><p><strong>Pickup:</strong> {item.pickupTime}</p><p><strong>Location:</strong> {item.location}</p></div>
                  {item.recipientName && <p className="provider-food-details"><strong>Claimed by:</strong> {item.recipientName}</p>}
                  {item.status === "Claimed" && <button className="provider-mark-button" onClick={() => markCollected(item.id)}>Mark as Collected</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <footer className="provider-footer"><p>MealMesh · Connecting food. Empowering communities.</p></footer>
    </main>
  );
}
