/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { readProviderListings, saveProviderListings } from "@/lib/food-storage";

type FoodListing = {
  id: number;
  name: string;
  category: string;
  quantity: string;
  pickupTime: string;
  location: string;
  status: "Available" | "Claimed" | "Collected";
  emoji: string;
  description?: string;
  imageData?: string;
};

export default function ProviderDashboard() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadListings = useCallback(() => {
    try {
      setListings(readProviderListings<FoodListing>());
    } catch (error) {
      console.error("Unable to load provider listings:", error);
      setListings([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadListings();
    window.addEventListener("focus", loadListings);
    window.addEventListener("pageshow", loadListings);
    return () => {
      window.removeEventListener("focus", loadListings);
      window.removeEventListener("pageshow", loadListings);
    };
  }, [loadListings]);

  function updateStatus(id: number, status: FoodListing["status"]) {
    const updated = listings.map((item) => item.id === id ? { ...item, status } : item);
    setListings(updated);
    saveProviderListings(updated);
  }

  const availableCount = listings.filter((item) => item.status === "Available").length;
  const claimedCount = listings.filter((item) => item.status === "Claimed").length;
  const collectedCount = listings.filter((item) => item.status === "Collected").length;

  return (
    <main className="provider-page">
      <nav className="provider-navbar">
        <Link href="/" className="provider-logo">MealMesh</Link>
        <div className="provider-nav-links">
          <Link href="/listings">Browse Food</Link>
          <Link href="/provider/dashboard" className="active">Dashboard</Link>
          <Link href="/provider/listings">My Listings</Link>
          <Link href="/login">Logout</Link>
        </div>
      </nav>

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
          <div><p className="provider-eyebrow">YOUR CONTRIBUTION</p><h2>Recently Added Food</h2><p>New food listings are saved here as soon as you publish them.</p></div>
          <Link href="/provider/listings" className="text-action">Manage all listings →</Link>
        </div>
        {!loaded ? <p>Loading your listings...</p> : listings.length === 0 ? (
          <div className="provider-empty"><span>🥗</span><h3>No listings yet</h3><p>Your published food items will appear here.</p><Link href="/provider/listings/new">Add Your First Listing</Link></div>
        ) : (
          <div className="provider-listing-grid">
            {[...listings].sort((a, b) => b.id - a.id).slice(0, 6).map((item) => (
              <article className="provider-listing-card" key={item.id}>
                <div className="provider-food-image">
                  {item.imageData ? <img src={item.imageData} alt={item.name} /> : <span>{item.emoji || "🥗"}</span>}
                  <span className="provider-category">{item.category}</span>
                </div>
                <div className="provider-card-content">
                  <div className="provider-card-title"><h3>{item.name}</h3><span className={`provider-status ${item.status === "Available" ? "provider-available" : "provider-claimed"}`}>{item.status}</span></div>
                  <div className="provider-food-details"><p><strong>Quantity:</strong> {item.quantity}</p><p><strong>Pickup:</strong> {item.pickupTime}</p><p><strong>Location:</strong> {item.location}</p></div>
                  {item.status === "Available" && <button className="provider-mark-button" onClick={() => updateStatus(item.id, "Claimed")}>Mark as Claimed</button>}
                  {item.status === "Claimed" && <button className="provider-mark-button" onClick={() => updateStatus(item.id, "Collected")}>Mark as Collected</button>}
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
