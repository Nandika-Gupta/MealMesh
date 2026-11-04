import { NextRequest, NextResponse, connection } from "next/server";
import { getDb } from "@/lib/db";
import { attachListingDetails } from "@/lib/mongodb";

// GET /api/reviews - fetch all reviews with who left them and for which provider
export async function GET() {
  // read from the database at request time, not during the build
  await connection();

  const db = getDb();
  const result = await db.query(
    `SELECT rv.review_id,
            rv.rating,
            rv.comment,
            rv.created_at,
            sl.listing_id,
            fc.name     AS category_name,
            r.name      AS recipient_name,
            p.name      AS provider_name,
            p.org_name  AS provider_org
     FROM Reviews rv
     JOIN Claims c           ON c.claim_id = rv.claim_id
     JOIN SurplusListings sl ON sl.listing_id = c.listing_id
     JOIN FoodCategories fc  ON fc.category_id = sl.category_id
     JOIN Users r            ON r.user_id = c.recipient_id
     JOIN Users p            ON p.user_id = sl.provider_id
     ORDER BY rv.created_at DESC`
  );

  return NextResponse.json(await attachListingDetails(result.rows));
}

// POST /api/reviews - a recipient reviews one of their completed claims
export async function POST(req: NextRequest) {
  const { claim_id, recipient_id, rating, comment } = await req.json();

  if (!claim_id || !recipient_id || rating === undefined) {
    return NextResponse.json({ error: "claim_id, recipient_id and rating are required." }, { status: 400 });
  }

  const ratingValue = Number(rating);
  if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return NextResponse.json({ error: "Rating must be a whole number from 1 to 5." }, { status: 400 });
  }

  const commentText = typeof comment === "string" ? comment.trim() : "";
  if (commentText.length > 500) {
    return NextResponse.json({ error: "Comment must be 500 characters or fewer." }, { status: 400 });
  }

  const db = getDb();
  const claim = await db.query(
    "SELECT recipient_id, status FROM Claims WHERE claim_id = $1",
    [claim_id]
  );

  if (claim.rows.length === 0) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  if (claim.rows[0].recipient_id !== Number(recipient_id)) {
    return NextResponse.json({ error: "You can only review your own claims." }, { status: 403 });
  }

  if (claim.rows[0].status !== "completed") {
    return NextResponse.json({ error: "You can review food once it has been collected." }, { status: 409 });
  }

  try {
    const result = await db.query(
      `INSERT INTO Reviews (claim_id, rating, comment)
       VALUES ($1, $2, $3)
       RETURNING review_id`,
      [claim_id, ratingValue, commentText || null]
    );

    return NextResponse.json({ review_id: result.rows[0].review_id }, { status: 201 });
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "You have already reviewed this claim." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to save review." }, { status: 500 });
  }
}
