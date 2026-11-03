
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readProviderListings } from "@/lib/food-storage";

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

type StoredFoodItem = {
  id: number;
  name: string;
  category: string;
  quantity: string;
  location: string;
  pickupTime: string;
  status: string;
  emoji?: string;
  description?: string;
  imageData?: string;
};

const foodItems: FoodItem[] = [
  {
    id: "sample-1",
    name: "Fresh Vegetable Biryani",
    category: "Meals",
    quantity: "10 portions",
    location: "Jayanagar, Bengaluru",
    provider: "Community Kitchen",
    expiry: "Today, 8:00 PM",
    emoji: "🍛",
    description: "Freshly prepared vegetable biryani, packed hygienically.",
  },
  {
    id: "sample-2",
    name: "Fresh Fruits Basket",
    category: "Fruits",
    quantity: "5 baskets",
    location: "JP Nagar, Bengaluru",
    provider: "Green Mart",
    expiry: "Today, 6:00 PM",
    emoji: "🍎",
    description: "A selection of fresh seasonal fruits.",
  },
  {
    id: "sample-3",
    name: "Assorted Bread Pack",
    category: "Bakery",
    quantity: "15 packs",
    location: "BTM Layout, Bengaluru",
    provider: "Daily Bakers",
    expiry: "Today, 7:00 PM",
    emoji: "🍞",
    description: "Fresh bread and bakery items available for collection.",
  },
  {
    id: "sample-4",
    name: "Homemade Dal and Rice",
    category: "Meals",
    quantity: "8 portions",
    location: "Banashankari, Bengaluru",
    provider: "Helping Hands",
    expiry: "Today, 5:30 PM",
    emoji: "🍲",
    description: "Nutritious homemade dal and rice meals.",
  },
  {
    id: "sample-5",
    name: "Fresh Milk Packets",
    category: "Dairy",
    quantity: "12 packets",
    location: "JP Nagar, Bengaluru",
    provider: "Daily Needs Store",
    expiry: "Tomorrow, 7:00 AM",
    emoji: "🥛",
    description: "Unopened milk packets stored under refrigeration.",
  },
  {
    id: "sample-6",
    name: "Vegetable Sandwiches",
    category: "Bakery",
    quantity: "6 packs",
    location: "Jayanagar, Bengaluru",
    provider: "Fresh Bites",
    expiry: "Today, 4:00 PM",
    emoji: "🥪",
    description: "Freshly prepared vegetable sandwiches.",
  },
];

const categories = [
  "All",
  "Meals",
  "Fruits",
  "Vegetables",
  "Bakery",
  "Dairy",
  "Other",
];

const categoryEmojis: Record<string, string> = {
  Meals: "🍛",
  Fruits: "🍎",
  Vegetables: "🥦",
  Bakery: "🍞",
  Dairy: "🥛",
  Other: "🥗",
};

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [providerItems, setProviderItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    function loadProviderListings() {
      try {
        const parsedListings = readProviderListings<StoredFoodItem>();

        if (Array.isArray(parsedListings)) {
          const convertedListings: FoodItem[] = parsedListings
            .filter((item) => item.status === "Available")
            .map((item) => ({
              id: `provider-${item.id}`,
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              location: item.location,
              provider: "Community Provider",
              expiry: item.pickupTime,
              emoji:
                item.emoji || categoryEmojis[item.category] || "🥗",
              description:
                item.description ||
                "Food shared by a MealMesh community provider.",
              imageData: item.imageData,
            }));

          setProviderItems(convertedListings);
        }
      } catch (error) {
        console.error("Unable to load provider listings:", error);
      }
    }

    loadProviderListings();

    window.addEventListener("storage", loadProviderListings);
    window.addEventListener("focus", loadProviderListings);
    window.addEventListener("pageshow", loadProviderListings);

    return () => {
      window.removeEventListener("storage", loadProviderListings);
      window.removeEventListener("focus", loadProviderListings);
      window.removeEventListener("pageshow", loadProviderListings);
    };
  }, []);

  const allItems = useMemo(
    () => [...foodItems, ...providerItems],
    [providerItems]
  );

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
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
  }, [allItems, search, category]);

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

        {filteredItems.length > 0 ? (
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
