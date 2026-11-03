/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { readProviderListings, saveProviderListings } from "@/lib/food-storage";

type FoodListing = { id: number; name: string; category: string; quantity: string; location: string; pickupTime: string; status: string; emoji?: string; description?: string; imageData?: string };
type Claim = { id: string; listingId: string; name: string; category: string; quantity: string; provider: string; location: string; pickupTime: string; status: "Confirmed" | "Collected"; emoji: string; imageData?: string; claimedAt: number };
const CLAIMS_KEY = "mealmesh-recipient-claims";
const sampleListings: Record<string, FoodListing> = {
  "1": { id: 1, name: "Fresh Vegetable Biryani", category: "Meals", quantity: "10 portions", location: "Jayanagar, Bengaluru", pickupTime: "Today, 8:00 PM", status: "Available", emoji: "🍛", description: "Freshly prepared vegetable biryani, packed hygienically." },
  "2": { id: 2, name: "Fresh Fruits Basket", category: "Fruits", quantity: "5 baskets", location: "JP Nagar, Bengaluru", pickupTime: "Today, 6:00 PM", status: "Available", emoji: "🍎", description: "A selection of fresh seasonal fruits." },
  "3": { id: 3, name: "Assorted Bread Pack", category: "Bakery", quantity: "15 packs", location: "BTM Layout, Bengaluru", pickupTime: "Today, 7:00 PM", status: "Available", emoji: "🍞", description: "Fresh bread and bakery items." },
  "4": { id: 4, name: "Homemade Dal and Rice", category: "Meals", quantity: "8 portions", location: "Banashankari, Bengaluru", pickupTime: "Today, 5:30 PM", status: "Available", emoji: "🍲", description: "Nutritious homemade dal and rice meals." },
  "5": { id: 5, name: "Fresh Milk Packets", category: "Dairy", quantity: "12 packets", location: "JP Nagar, Bengaluru", pickupTime: "Tomorrow, 7:00 AM", status: "Available", emoji: "🥛", description: "Unopened milk packets stored under refrigeration." },
  "6": { id: 6, name: "Vegetable Sandwiches", category: "Bakery", quantity: "6 packs", location: "Jayanagar, Bengaluru", pickupTime: "Today, 4:00 PM", status: "Available", emoji: "🥪", description: "Freshly prepared vegetable sandwiches." },
};

export default function ClaimFoodPage() {
  const params = useParams();
  const id = String(params.id);
  const providerId = id.startsWith("provider-") ? id.slice("provider-".length) : "";
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      if (providerId) {
        const items = readProviderListings<FoodListing>();
        setListing(items.find((item) => String(item.id) === providerId) || null);
      } else if (id.startsWith("sample-")) {
        setListing(sampleListings[id.slice("sample-".length)] || null);
      } else setListing(null);
    } catch { setError("Unable to load this listing."); }
    finally { setLoading(false); }
  }, [id, providerId]);

  function handleClaim() {
    if (!listing || listing.status !== "Available") return;
    try {
      if (providerId) {
        const items = readProviderListings<FoodListing>();
        const index = items.findIndex((item) => String(item.id) === providerId);
        if (index < 0 || items[index].status !== "Available") { setError("This food has already been claimed."); return; }
        items[index] = { ...items[index], status: "Claimed" };
        saveProviderListings(items);
      }
      const savedClaims: Claim[] = JSON.parse(localStorage.getItem(CLAIMS_KEY) || "[]");
      const claimId = `${id}-${Date.now()}`;
      const claim: Claim = { id: claimId, listingId: id, name: listing.name, category: listing.category, quantity: listing.quantity, provider: providerId ? "Community Provider" : "Community Kitchen", location: listing.location, pickupTime: listing.pickupTime, status: "Confirmed", emoji: listing.emoji || "🥗", imageData: listing.imageData, claimedAt: Date.now() };
      localStorage.setItem(CLAIMS_KEY, JSON.stringify([claim, ...savedClaims]));
      setListing({ ...listing, status: "Claimed" });
      setConfirmed(true);
    } catch { setError("Unable to save your claim. Please try again."); }
  }

  if (loading) return <main className="claim-page">Loading food listing...</main>;
  if (!listing) return <main className="claim-page"><div className="claim-not-found"><h2>Food listing not found</h2><p>This listing may have been removed.</p><Link href="/listings">Browse available food</Link></div></main>;

  return <main className="claim-page"><nav className="claim-navbar"><Link href="/" className="claim-logo">MealMesh</Link><Link href="/listings">Back to listings</Link></nav>
    <section className="claim-container"><div className="claim-image">{listing.imageData ? <img src={listing.imageData} alt={listing.name} /> : <span>{listing.emoji || "🍽️"}</span>}</div><div className="claim-details"><p className="claim-eyebrow">FOOD DETAILS</p><span className="claim-category">{listing.category}</span><h1>{listing.name}</h1><p className="claim-description">{listing.description || "Food shared through the MealMesh community."}</p><div className="claim-info"><p><strong>Quantity:</strong> {listing.quantity}</p><p><strong>Pickup location:</strong> {listing.location}</p><p><strong>Pickup time:</strong> {listing.pickupTime}</p><p><strong>Status:</strong> {confirmed ? "Claimed by you" : listing.status}</p></div>{error && <p className="claim-error">{error}</p>}
      {confirmed ? <div className="claim-success"><h2>Claim confirmed!</h2><p>Your claim is now saved in your recipient dashboard. Please collect it during the pickup window.</p><Link href="/dashboard">View my dashboard</Link></div> : listing.status === "Claimed" ? <div className="claim-success"><h2>Already claimed</h2><p>This food listing is no longer available.</p><Link href="/listings">Browse other listings</Link></div> : <button className="claim-action" onClick={handleClaim}>Confirm Food Claim</button>}
    </div></section><footer className="claim-footer"><p>© {new Date().getFullYear()} MealMesh. Sharing food, reducing waste.</p></footer></main>;
}
