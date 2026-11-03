/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readProviderListings, saveProviderListings } from "@/lib/food-storage";

type Listing = { id: number; name: string; category: string; quantity: string; pickupTime: string; location: string; status: "Available" | "Claimed" | "Collected"; emoji: string; description?: string; imageData?: string };

export default function MyListingsPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [filter, setFilter] = useState("All");
  useEffect(() => { setItems(readProviderListings<Listing>()); }, []);

  function persist(next: Listing[]) { setItems(next); saveProviderListings(next); }
  function changeStatus(id: number, status: Listing["status"]) { persist(items.map((item) => item.id === id ? { ...item, status } : item)); }
  function removeListing(id: number) {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    persist(items.filter((item) => item.id !== id));
  }
  const visible = filter === "All" ? items : items.filter((item) => item.status === filter);

  return <main className="provider-page">
    <nav className="provider-navbar"><Link href="/" className="provider-logo">MealMesh</Link><div className="provider-nav-links"><Link href="/listings">Browse Food</Link><Link href="/provider/dashboard">Dashboard</Link><Link href="/provider/listings" className="active">My Listings</Link></div></nav>
    <section className="provider-welcome"><div><p className="provider-eyebrow">PROVIDER WORKSPACE</p><h1>My food listings</h1><p>Update availability and keep your contributions organised.</p></div><Link href="/provider/listings/new" className="provider-add-button">+ Add Food Listing</Link></section>
    <section className="provider-listings"><div className="listing-management-toolbar"><div className="category-filters">{["All", "Available", "Claimed", "Collected"].map((value) => <button key={value} className={filter === value ? "category-active" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div><span>{visible.length} listing(s)</span></div>
      {visible.length === 0 ? <div className="provider-empty"><span>🥗</span><h3>No listings in this view</h3><p>Add food to start sharing with your community.</p><Link href="/provider/listings/new">Add Food Listing</Link></div> : <div className="provider-listing-grid">{visible.map((item) => <article className="provider-listing-card" key={item.id}><div className="provider-food-image">{item.imageData ? <img src={item.imageData} alt={item.name} /> : <span>{item.emoji}</span>}<span className="provider-category">{item.category}</span></div><div className="provider-card-content"><div className="provider-card-title"><h3>{item.name}</h3><span className={`provider-status ${item.status === "Available" ? "provider-available" : "provider-claimed"}`}>{item.status}</span></div><div className="provider-food-details"><p><strong>Quantity:</strong> {item.quantity}</p><p><strong>Pickup:</strong> {item.pickupTime}</p><p><strong>Location:</strong> {item.location}</p><p>{item.description}</p></div><div className="listing-card-actions">{item.status === "Available" && <button onClick={() => changeStatus(item.id, "Claimed")}>Mark claimed</button>}{item.status === "Claimed" && <button onClick={() => changeStatus(item.id, "Collected")}>Mark collected</button>}{item.status === "Collected" && <button onClick={() => changeStatus(item.id, "Available")}>Make available again</button>}<button className="danger-action" onClick={() => removeListing(item.id)}>Delete</button></div></div></article>)}</div>}
    </section><footer className="provider-footer">MealMesh · Connecting food. Empowering communities.</footer>
  </main>;
}
