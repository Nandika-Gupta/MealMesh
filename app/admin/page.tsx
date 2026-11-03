/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readProviderListings, saveProviderListings } from "@/lib/food-storage";
type Listing = { id: number; name: string; category: string; location: string; status: string; quantity: string; pickupTime: string };
type Claim = { id: string; name: string; status: string };
type Review = { id: number; name: string; rating: number; comment: string };
export default function AdminDashboard() {
  const [listings, setListings] = useState<Listing[]>([]); const [claims, setClaims] = useState<Claim[]>([]); const [reviews, setReviews] = useState<Review[]>([]);
  function load() { try { setListings(readProviderListings<Listing>()); setClaims(JSON.parse(localStorage.getItem("mealmesh-recipient-claims") || "[]")); setReviews(JSON.parse(localStorage.getItem("mealmesh-reviews") || "[]")); } catch { /* Keep the dashboard available if local data is malformed. */ } }
  useEffect(() => { load(); }, []);
  function deleteListing(id: number) { const next = listings.filter((item) => item.id !== id); setListings(next); saveProviderListings(next); }
  return <main className="provider-page"><nav className="provider-navbar"><Link href="/" className="provider-logo">MealMesh</Link><div className="provider-nav-links"><Link href="/listings">Browse Food</Link><Link href="/reviews">Reviews</Link></div></nav><section className="provider-welcome"><div><p className="provider-eyebrow">ADMINISTRATION</p><h1>Platform overview</h1><p>Review local demo activity across food listings, claims and feedback.</p></div><button className="provider-add-button" onClick={load}>Refresh overview</button></section><section className="provider-stats"><div className="provider-stat-card"><span>📦</span><p>Total Listings</p><h2>{listings.length}</h2></div><div className="provider-stat-card"><span>🌱</span><p>Available</p><h2>{listings.filter(x=>x.status === "Available").length}</h2></div><div className="provider-stat-card"><span>🤝</span><p>Claims</p><h2>{claims.length}</h2></div><div className="provider-stat-card"><span>⭐</span><p>Reviews</p><h2>{reviews.length}</h2></div></section><section className="provider-listings"><div className="provider-section-heading"><div><h2>All provider listings</h2><p>Remove inappropriate demo listings from the local browser store.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Food</th><th>Category</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{listings.map(item=><tr key={item.id}><td>{item.name}<small>{item.quantity}</small></td><td>{item.category}</td><td>{item.location}</td><td>{item.status}</td><td><button className="danger-action" onClick={()=>deleteListing(item.id)}>Delete</button></td></tr>)}</tbody></table>{listings.length===0 && <p>No provider listings have been added.</p>}</div></section><p className="admin-demo-note">Demo limitation: this admin view reads browser localStorage only. It is not protected by server-side admin authentication and must not be used for real user data.</p></main>;
}
