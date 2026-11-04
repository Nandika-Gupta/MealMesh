"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type FoodItem = {
  id: string;
  name: string;
  category: string;
  quantity: string;
  location: string;
  provider: string;
  expiry: string;
  emoji: string;
  description: string;
  imageData?: string;
};

type ApiListing = {
  listing_id: number;
  category_name: string;
  quantity: string;
  unit: string;
  usable_by: string;
  provider_name: string;
  provider_org: string | null;
  photos?: string[];
  packaging_notes?: string;
  allergen_tags?: string[];
  food_name?: string;
  pickup_location?: string;
};

// matches the rows seeded into FoodCategories in schema.sql
const categories = [
  "All",
  "Cooked Meals",
  "Produce",
  "Bakery",
  "Dairy",
  "Packaged Goods",
  "Other",
];

const categoryEmojis: Record<string, string> = {
  "Cooked Meals": "🍛",
  Produce: "🥦",
  Bakery: "🍞",
  Dairy: "🥛",
  "Packaged Goods": "📦",
  Other: "🥗",
};

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      try {
        const res = await fetch("/api/listings");
        const data: ApiListing[] = await res.json();

        const converted: FoodItem[] = data.map((listing) => ({
          id: `db-${listing.listing_id}`,
          name: listing.food_name || listing.category_name,
          category: listing.category_name,
          quantity: `${Number(listing.quantity)} ${listing.unit}`,
          location: listing.pickup_location || listing.provider_org || listing.provider_name,
          provider: listing.provider_name,
          expiry: new Date(listing.usable_by).toLocaleString(),
          emoji: categoryEmojis[listing.category_name] || "🥗",
          description:
            listing.packaging_notes ||
            "Food shared through the MealMesh community.",
          imageData: listing.photos && listing.photos[0],
        }));

        setItems(converted);
      } catch (error) {
        console.error("Unable to load listings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        category === "All" || item.category === category;

      const searchText = search.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(searchText) ||
        item.location.toLowerCase().includes(searchText) ||
        item.provider.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [items, search, category]);

  return (
    <main className="listings-page">
      <nav className="listings-navbar">
        <Link href="/" className="brand">
          <span className="brand-icon">🥬</span>
          <span>
            Meal<span className="brand-highlight">Mesh</span>
          </span>
        </Link>

        <div className="listings-nav-links">
          <Link href="/">Home</Link>
          <Link href="/listings" className="active">
            Food listings
          </Link>
          <Link href="/reviews">Reviews</Link>
          <Link href="/login">Log in</Link>
          <Link href="/signup" className="listing-signup">
            Join us →
          </Link>
        </div>
      </nav>

      <section className="listings-hero">
        <div className="section-tag">SHARE MORE. WASTE LESS.</div>
        <h1>
          Good food deserves <span>a second chance.</span>
        </h1>
        <p>
          Discover surplus food shared by people and businesses
          in your community.
        </p>

        <div className="listing-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search food, location or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="food-listings-section">
        <div className="listing-section-heading">
          <div>
            <div className="section-tag">COMMUNITY FOOD BOARD</div>
            <h2>Available food</h2>
            <p>Explore food contributions from your community.</p>
          </div>

          <Link href="/signup" className="listing-provider-button">
            + Share surplus food
          </Link>
        </div>

        <div className="category-filters">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "category-active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="listing-results">
          Showing <strong>{filteredItems.length}</strong> food listings
        </div>

        {loading ? (
          <div className="no-listings">
            <p>Loading listings...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="food-grid">
            {filteredItems.map((item) => (
              <article className="food-card" key={item.id}>
                <div className="food-card-image">
                  {item.imageData ? <img src={item.imageData} alt={item.name} /> : <span>{item.emoji}</span>}
                  <span className="food-category">{item.category}</span>
                </div>

                <div className="food-card-content">
                  <h3>{item.name}</h3>
                  <p className="food-description">{item.description}</p>

                  <div className="food-details">
                    <div>📦 {item.quantity}</div>
                    <div>📍 {item.location}</div>
                    <div>🏪 {item.provider}</div>
                    <div>⏰ Collect by: {item.expiry}</div>
                  </div>

                  <Link
                    href={`/listings/${item.id}/claim`}
                    className="food-claim-button"
                  >
                    View details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-listings">
            <span>🔍</span>
            <h3>No food listings found</h3>
            <p>Try another search term or category.</p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <footer className="listings-footer">
        <Link href="/" className="brand">
          🥬 Meal<span className="brand-highlight">Mesh</span>
        </Link>
        <p>Every meal shared makes a difference. 🌱</p>
      </footer>
    </main>
  );
}
