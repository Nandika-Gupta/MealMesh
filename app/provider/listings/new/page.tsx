/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireSession } from "@/lib/session";
import Navbar from "@/components/Navbar";

type Category = { category_id: number; name: string };

const emptyForm = {
  name: "",
  categoryId: "",
  quantity: "",
  unit: "portions",
  location: "",
  pickupDate: "",
  pickupStart: "",
  pickupEnd: "",
  description: "",
  imageData: "",
};

export default function NewFoodListing() {
  const router = useRouter();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const session = useRequireSession(["provider"]);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [minimumDate, setMinimumDate] = useState("");

  useEffect(() => {
    if (!session) return;

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) {
          setForm((current) => current.categoryId ? current : { ...current, categoryId: String(data[0].category_id) });
        }
      })
      .catch(() => setMessage("Unable to load food categories."));
  }, [session]);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!session) return;

    if (form.pickupEnd <= form.pickupStart) {
      setMessage("Pickup end time must be later than the start time.");
      return;
    }

    // the end of the pickup window becomes usable_by in SurplusListings
    const usableBy = new Date(`${form.pickupDate}T${form.pickupEnd}`);
    const pickupFrom = new Date(`${form.pickupDate}T${form.pickupStart}`);

    if (usableBy.getTime() <= Date.now()) {
      setMessage("Pickup end time must be in the future.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: Number(form.categoryId),
          provider_id: session.user_id,
          quantity: Number(form.quantity),
          unit: form.unit.trim(),
          usable_by: usableBy.toISOString(),
          food_name: form.name.trim(),
          pickup_location: form.location.trim(),
          pickup_from: pickupFrom.toISOString(),
          packaging_notes: form.description.trim(),
          photos: form.imageData ? [form.imageData] : [],
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Unable to save your listing. Please try again.");
        setSubmitting(false);
        return;
      }

      setMessage("Your food listing has been published successfully!");
      setForm({ ...emptyForm, categoryId: form.categoryId });

      setTimeout(() => {
        router.push("/provider/dashboard");
      }, 1200);
    } catch (error) {
      console.error("Unable to save listing:", error);
      setMessage("Unable to save your listing. Please try again.");
      setSubmitting(false);
    }
  }

  if (!session) return <main className="new-listing-page"><p>Checking your session...</p></main>;

  return (
    <main className="new-listing-page">
      <Navbar variant="provider-form" />

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
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
          >
            {categories.length === 0 && <option value="">Loading categories...</option>}
            {categories.map((item) => (
              <option key={item.category_id} value={item.category_id}>
                {item.name}
              </option>
            ))}
          </select>

          <div className="pickup-time-grid">
            <div>
              <label htmlFor="quantity">Available Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 5"
                required
              />
            </div>

            <div>
              <label htmlFor="unit">Unit</label>
              <input
                id="unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="e.g. portions, kg, packs"
                maxLength={20}
                required
              />
            </div>
          </div>

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

          <button type="submit" className="publish-listing-button" disabled={submitting}>
            {submitting ? "Publishing..." : "Publish Food Listing →"}
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
