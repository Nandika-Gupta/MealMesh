import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getListingDetailsCollection } from "@/lib/mongodb";

// GET /api/listings/[id] - fetch one listing (any status) with its MongoDB details
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/listings/[id]">) {
  const { id } = await ctx.params;
  const listingId = Number(id);

  if (!Number.isInteger(listingId) || listingId <= 0) {
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

  const listing = result.rows[0];
  const collection = await getListingDetailsCollection();
  const details = await collection.findOne({ listing_id: listing.listing_id });

  return NextResponse.json({
    ...listing,
    photos: details?.photos || [],
    packaging_notes: details?.packaging_notes || "",
    allergen_tags: details?.allergen_tags || [],
    food_name: details?.food_name || "",
    pickup_location: details?.pickup_location || "",
    pickup_from: details?.pickup_from || null,
  });
}
