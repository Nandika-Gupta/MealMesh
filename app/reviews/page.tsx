/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
type Review = { id: number; name: string; rating: number; comment: string; createdAt: number };
const KEY = "mealmesh-reviews";
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState(""); const [rating, setRating] = useState("5"); const [comment, setComment] = useState("");
  useEffect(() => { try { setReviews(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setReviews([]); } }, []);
  function submit(e: React.FormEvent) { e.preventDefault(); const next = [{ id: Date.now(), name: name.trim(), rating: Number(rating), comment: comment.trim(), createdAt: Date.now() }, ...reviews]; setReviews(next); localStorage.setItem(KEY, JSON.stringify(next)); setName(""); setComment(""); setRating("5"); }
  return <main className="simple-feature-page"><nav className="provider-navbar"><Link href="/" className="provider-logo">MealMesh</Link><div className="provider-nav-links"><Link href="/listings">Browse Food</Link><Link href="/dashboard">Dashboard</Link></div></nav><section className="simple-feature-hero"><p className="provider-eyebrow">COMMUNITY FEEDBACK</p><h1>Reviews & ratings</h1><p>Share your experience and help the MealMesh community build trust.</p></section><section className="simple-feature-content"><form className="feature-form" onSubmit={submit}><h2>Write a review</h2><label>Your name</label><input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} /><label>Rating</label><select value={rating} onChange={(e) => setRating(e.target.value)}><option value="5">★★★★★ - Excellent</option><option value="4">★★★★ - Good</option><option value="3">★★★ - Average</option><option value="2">★★ - Poor</option><option value="1">★ - Very poor</option></select><label>Your feedback</label><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} required maxLength={500} /><button type="submit" className="feature-primary-button">Submit review</button></form><div className="review-list"><h2>Community reviews ({reviews.length})</h2>{reviews.length === 0 ? <p>No reviews yet. Be the first to share feedback.</p> : reviews.map((review) => <article className="review-card" key={review.id}><div><strong>{review.name}</strong><span className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span></div><p>{review.comment}</p><small>{new Date(review.createdAt).toLocaleDateString()}</small></article>)}</div></section></main>;
}
