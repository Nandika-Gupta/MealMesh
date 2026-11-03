/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readProviderListings, saveProviderListings } from "@/lib/food-storage";

type FoodListing = {
  id: number;
  name: string;
  category: string;
  quantity: string;
  pickupTime: string;
  location: string;
  status: "Available" | "Claimed";
  emoji: string;
  description: string;
  imageData?: string;
};

export default function NewFoodListing() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "Meals",
    quantity: "",
    location: "",
    pickupDate: "",
    pickupStart: "",
    pickupEnd: "",
    description: "",
    imageData: "",
  });

  const [message, setMessage] = useState("");
  const [minimumDate, setMinimumDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const localDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    setMinimumDate(localDate);
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, imageData: String(reader.result || "") }));
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (form.pickupEnd <= form.pickupStart) {
      setMessage("Pickup end time must be later than the start time.");
      return;
    }

    const emojiMap: Record<string, string> = {
      Meals: "🍛",
      Fruits: "🍎",
      Vegetables: "🥦",
      Bakery: "🍞",
      Dairy: "🥛",
      Other: "🥗",
    };

    const newListing: FoodListing = {
      id: Date.now(),
      name: form.name.trim(),
      category: form.category,
      quantity: form.quantity.trim(),
      pickupTime: `${form.pickupDate}, ${form.pickupStart} – ${form.pickupEnd}`,
      location: form.location.trim(),
      status: "Available",
      emoji: emojiMap[form.category] || "🥗",
      description: form.description.trim(),
      imageData: form.imageData || undefined,
    };

    try {
      const listings = readProviderListings<FoodListing>();
      listings.push(newListing);
      saveProviderListings(listings);

      setMessage("Your food listing has been saved successfully!");

      setForm({
        name: "",
        category: "Meals",
        quantity: "",
        location: "",
        pickupDate: "",
        pickupStart: "",
        pickupEnd: "",
        description: "",
        imageData: "",
      });

      setTimeout(() => {
        router.push("/provider/dashboard");
      }, 1200);
    } catch (error) {
      console.error("Unable to save listing:", error);
      setMessage("Unable to save your listing. Please try again.");
    }
  }

  return (
    <main className="new-listing-page">
      <nav className="provider-navbar">
        <Link href="/" className="provider-brand">
          🥬 MealMesh
        </Link>

        <div>
          <Link href="/listings">Browse Food</Link>
          <Link href="/provider/dashboard">Dashboard</Link>
          <Link href="/provider/listings">My Listings</Link>
        </div>
      </nav>

      <section className="new-listing-container">
        <Link href="/provider/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="new-listing-heading">
          <span className="section-tag">SHARE SOMETHING GOOD</span>
          <h1>List surplus food.</h1>
          <p>
            Give your extra food a purpose by connecting it with someone
            who needs it.
          </p>
        </div>

        <form className="new-listing-form" onSubmit={handleSubmit}>
          <h2>Food Details</h2>

          <label htmlFor="name">Food Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Vegetable Biryani"
            required
          />

          <label htmlFor="category">Food Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option>Meals</option>
            <option>Fruits</option>
            <option>Vegetables</option>
            <option>Bakery</option>
            <option>Dairy</option>
            <option>Other</option>
          </select>

          <label htmlFor="quantity">Available Quantity</label>
          <input
            id="quantity"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="e.g. 5 portions or 3 kg"
            required
          />

          <label htmlFor="foodImage">Food Photo (optional, max 1.5 MB)</label>
          <input id="foodImage" type="file" accept="image/*" onChange={handleImageChange} />
          {form.imageData && <img className="food-upload-preview" src={form.imageData} alt="Food preview" />}

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the food, its condition, and any important details..."
            rows={4}
            required
          />

          <div className="form-divider"></div>

          <h2>Pickup Details</h2>

          <label htmlFor="location">Pickup Location</label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. PES University, Bengaluru"
            required
          />

          <label htmlFor="pickupDate">Pickup Date</label>
          <input
            id="pickupDate"
            type="date"
            name="pickupDate"
            value={form.pickupDate}
            onChange={handleChange}
            min={minimumDate || undefined}
            required
          />

          <div className="pickup-time-grid">
            <div>
              <label htmlFor="pickupStart">Pickup Starts</label>
              <input
                id="pickupStart"
                type="time"
                name="pickupStart"
                value={form.pickupStart}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="pickupEnd">Pickup Ends</label>
              <input
                id="pickupEnd"
                type="time"
                name="pickupEnd"
                value={form.pickupEnd}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="publish-listing-button">
            Publish Food Listing →
          </button>

          {message && (
            <p className="listing-success-message" role="status">
              {message}
            </p>
          )}
        </form>
      </section>

      <footer className="provider-footer">
        MealMesh · Connecting food. Empowering communities.
      </footer>
    </main>
  );
}
