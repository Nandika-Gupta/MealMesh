import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { attachListingDetails, getListingDetailsCollection } from "@/lib/mongodb";

function parseListingId(id: string) {
  const listingId = Number(id);
  return Number.isInteger(listingId) && listingId > 0 ? listingId : null;
}

// GET /api/listings/[id] - fetch one listing (any status) with its MongoDB details
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/listings/[id]">) {
  const listingId = parseListingId((await ctx.params).id);
  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing id." }, { status: 400 });
  }

  const db = getDb();
  const result = await db.query(
    `SELECT sl.listing_id,
            fc.name     AS category_name,
            sl.quantity,
            sl.unit,
            sl.usable_by,
            CASE WHEN sl.status = 'available' AND sl.usable_by <= NOW()
                 THEN 'expired' ELSE sl.status END AS status,
            sl.provider_id,
            u.name      AS provider_name,
            u.org_name  AS provider_org
     FROM SurplusListings sl
     JOIN FoodCategories fc ON fc.category_id = sl.category_id
     JOIN Users u           ON u.user_id = sl.provider_id
     WHERE sl.listing_id = $1`,
    [listingId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const [listing] = await attachListingDetails(result.rows);
  return NextResponse.json(listing);
}

// PATCH /api/listings/[id] - provider marks a claimed listing as collected (atomic transaction)
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/listings/[id]">) {
  const listingId = parseListingId((await ctx.params).id);
  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing id." }, { status: 400 });
  }

  const { user_id, status } = await req.json();
  if (!user_id || status !== "delivered") {
    return NextResponse.json({ error: "user_id and status 'delivered' are required." }, { status: 400 });
  }

  const db = getDb();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const check = await client.query(
      "SELECT provider_id, status FROM SurplusListings WHERE listing_id = $1 FOR UPDATE",
      [listingId]
    );

    if (check.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (check.rows[0].provider_id !== Number(user_id)) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "You can only update your own listings." }, { status: 403 });
    }

    if (check.rows[0].status !== "claimed") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Only claimed listings can be marked as collected." }, { status: 409 });
    }

    await client.query("UPDATE SurplusListings SET status = 'delivered' WHERE listing_id = $1", [listingId]);
    await client.query(
      "UPDATE Claims SET status = 'completed' WHERE listing_id = $1 AND status = 'pending'",
      [listingId]
    );

    await client.query("COMMIT");
    return NextResponse.json({ listing_id: listingId, status: "delivered" });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Could not update listing" }, { status: 500 });
  } finally {
    client.release();
  }
}

// DELETE /api/listings/[id] - the listing's provider or an admin removes a listing
export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/listings/[id]">) {
  const listingId = parseListingId((await ctx.params).id);
  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing id." }, { status: 400 });
  }

  const { user_id } = await req.json();
  if (!user_id) {
    return NextResponse.json({ error: "user_id is required." }, { status: 400 });
  }

  const db = getDb();
  const [listing, user] = await Promise.all([
    db.query("SELECT provider_id FROM SurplusListings WHERE listing_id = $1", [listingId]),
    db.query("SELECT role FROM Users WHERE user_id = $1 AND is_active = true", [user_id]),
  ]);

  if (listing.rows.length === 0) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const isOwner = listing.rows[0].provider_id === Number(user_id);
  const isAdmin = user.rows[0]?.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "You can only delete your own listings." }, { status: 403 });
  }

  // Claims and Reviews for this listing are removed by ON DELETE CASCADE
  await db.query("DELETE FROM SurplusListings WHERE listing_id = $1", [listingId]);

  const collection = await getListingDetailsCollection();
  await collection.deleteOne({ listing_id: listingId });

  return NextResponse.json({ listing_id: listingId, deleted: true });
}
