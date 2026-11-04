import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { attachListingDetails } from "@/lib/mongodb";

// GET /api/admin/overview?admin_id=X - all users, listings, claims and reviews for the admin page
export async function GET(req: NextRequest) {
  const adminId = Number(req.nextUrl.searchParams.get("admin_id"));

  if (!Number.isInteger(adminId) || adminId <= 0) {
    return NextResponse.json({ error: "A valid admin_id is required." }, { status: 400 });
  }

  const db = getDb();
  const admin = await db.query(
    "SELECT role FROM Users WHERE user_id = $1 AND is_active = true",
    [adminId]
  );

  if (admin.rows.length === 0 || admin.rows[0].role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const [users, listings, claims, reviews] = await Promise.all([
    db.query(
      `SELECT user_id, name, email, role, org_name, phone, is_active, created_at
       FROM Users
       ORDER BY created_at DESC`
    ),
    db.query(
      `SELECT sl.listing_id,
              fc.name     AS category_name,
              sl.quantity,
              sl.unit,
              sl.usable_by,
              CASE WHEN sl.status = 'available' AND sl.usable_by <= NOW()
                   THEN 'expired' ELSE sl.status END AS status,
              sl.created_at,
              u.name      AS provider_name,
              u.org_name  AS provider_org
       FROM SurplusListings sl
       JOIN FoodCategories fc ON fc.category_id = sl.category_id
       JOIN Users u           ON u.user_id = sl.provider_id
       ORDER BY sl.created_at DESC`
    ),
    db.query(
      `SELECT c.claim_id,
              c.listing_id,
              c.status    AS claim_status,
              c.claimed_at,
              c.pickup_time,
              fc.name     AS category_name,
              r.name      AS recipient_name,
              p.name      AS provider_name
       FROM Claims c
       JOIN SurplusListings sl ON sl.listing_id = c.listing_id
       JOIN FoodCategories fc  ON fc.category_id = sl.category_id
       JOIN Users r            ON r.user_id = c.recipient_id
       JOIN Users p            ON p.user_id = sl.provider_id
       ORDER BY c.claimed_at DESC`
    ),
    db.query(
      `SELECT rv.review_id,
              rv.claim_id,
              rv.rating,
              rv.comment,
              rv.created_at,
              r.name      AS recipient_name,
              p.name      AS provider_name
       FROM Reviews rv
       JOIN Claims c           ON c.claim_id = rv.claim_id
       JOIN SurplusListings sl ON sl.listing_id = c.listing_id
       JOIN Users r            ON r.user_id = c.recipient_id
       JOIN Users p            ON p.user_id = sl.provider_id
       ORDER BY rv.created_at DESC`
    ),
  ]);

  return NextResponse.json({
    users: users.rows,
    listings: await attachListingDetails(listings.rows),
    claims: claims.rows,
    reviews: reviews.rows,
  });
}
