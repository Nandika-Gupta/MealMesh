/* eslint react-hooks/set-state-in-effect: off, @next/next/no-img-element: off */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSession, type SessionUser } from "@/lib/session";
import Navbar from "@/components/Navbar";

type Review = { review_id: number; rating: number; comment: string | null; created_at: string; category_name: string; food_name?: string; recipient_name: string; provider_name: string; provider_org: string | null };
type ReviewableClaim = { claim_id: number; claim_status: string; review_id: number | null; category_name: string; food_name?: string; provider_name: string; provider_org: string | null; claimed_at: string };

export default function ReviewsPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [claims, setClaims] = useState<ReviewableClaim[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [claimId, setClaimId] = useState(""); const [rating, setRating] = useState("5"); const [comment, setComment] = useState("");
  const [message, setMessage] = useState(""); const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const user = getSession();
    setSession(user);
    try {
      const reviewsRes = await fetch("/api/reviews");
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
      if (user?.role === "recipient") {
        const claimsRes = await fetch(`/api/claims?recipient_id=${user.user_id}`);
        if (claimsRes.ok) {
          const data: ReviewableClaim[] = await claimsRes.json();
          const reviewable = data.filter((claim) => claim.claim_status === "completed" && claim.review_id === null);
          setClaims(reviewable);
          setClaimId((current) => reviewable.some((claim) => String(claim.claim_id) === current) ? current : reviewable[0] ? String(reviewable[0].claim_id) : "");
        }
      }
    } catch { setMessage("Unable to load reviews."); }
    finally { setLoaded(true); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !claimId) return;
    setSubmitting(true); setMessage("");
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ claim_id: Number(claimId), recipient_id: session.user_id, rating: Number(rating), comment: comment.trim() }) });
      const result = await res.json();
      if (!res.ok) { setMessage(result.error || "Unable to save your review."); return; }
      setMessage("Thank you! Your review has been posted."); setComment(""); setRating("5");
      await load();
    } catch { setMessage("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  }

  const claimLabel = (claim: ReviewableClaim) => `${claim.food_name || claim.category_name} from ${claim.provider_org || claim.provider_name} (${new Date(claim.claimed_at).toLocaleDateString()})`;
  const form = !loaded ? <p>Loading...</p>
    : !session ? <p>Please <Link href="/login">log in</Link> as a recipient to review food you have collected.</p>
    : session.role !== "recipient" ? <p>Only recipients can leave reviews, after collecting a claim.</p>
    : claims.length === 0 ? <p>You have no collected claims waiting for a review. Mark a claim as collected on your <Link href="/dashboard">dashboard</Link> first.</p>
    : <><label>Collected food</label><select value={claimId} onChange={(e) => setClaimId(e.target.value)} required>{claims.map((claim) => <option key={claim.claim_id} value={claim.claim_id}>{claimLabel(claim)}</option>)}</select><label>Rating</label><select value={rating} onChange={(e) => setRating(e.target.value)}><option value="5">★★★★★ - Excellent</option><option value="4">★★★★ - Good</option><option value="3">★★★ - Average</option><option value="2">★★ - Poor</option><option value="1">★ - Very poor</option></select><label>Your feedback</label><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} maxLength={500} /><button type="submit" className="feature-primary-button" disabled={submitting}>{submitting ? "Submitting..." : "Submit review"}</button></>;

  return <main className="simple-feature-page"><Navbar variant="provider" /><section className="simple-feature-hero"><p className="provider-eyebrow">COMMUNITY FEEDBACK</p><h1>Reviews & ratings</h1><p>Share your experience and help the MealMesh community build trust.</p></section><section className="simple-feature-content"><form className="feature-form" onSubmit={submit}><h2>Write a review</h2>{form}{message && <p role="status">{message}</p>}</form><div className="review-list"><h2>Community reviews ({reviews.length})</h2>{loaded && reviews.length === 0 ? <p>No reviews yet. Be the first to share feedback.</p> : reviews.map((review) => <article className="review-card" key={review.review_id}><div><strong>{review.recipient_name}</strong><span className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div><p>{review.comment || <em>No comment left.</em>}</p><small>{review.food_name || review.category_name} from {review.provider_org || review.provider_name} · {new Date(review.created_at).toLocaleDateString()}</small></article>)}</div></section></main>;
}
