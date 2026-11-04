import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { attachListingDetails, getListingDetailsCollection } from "@/lib/mongodb";

// GET /api/listings - fetch all currently available listings
// GET /api/listings?provider_id=X - fetch every listing (any status) posted by one provider
export async function GET(req: NextRequest) {
  const providerParam = req.nextUrl.searchParams.get("provider_id");
  const db = getDb();

  if (providerParam === null) {
    const result = await db.query("SELECT * FROM available_listings_view");
    return NextResponse.json(await attachListingDetails(result.rows));
  }

  const providerId = Number(providerParam);
  if (!Number.isInteger(providerId) || providerId <= 0) {
    return NextResponse.json({ error: "Invalid provider id." }, { status: 400 });
  }

  const result = await db.query(
    `SELECT sl.listing_id,
            fc.name      AS category_name,
            sl.quantity,
            sl.unit,
            sl.usable_by,
            CASE WHEN sl.status = 'available' AND sl.usable_by <= NOW()
                 THEN 'expired' ELSE sl.status END AS status,
            sl.created_at,
            c.claim_id,
            c.status     AS claim_status,
            r.name       AS recipient_name
     FROM SurplusListings sl
     JOIN FoodCategories fc ON fc.category_id = sl.category_id
     LEFT JOIN Claims c     ON c.listing_id = sl.listing_id
     LEFT JOIN Users r      ON r.user_id = c.recipient_id
     WHERE sl.provider_id = $1
     ORDER BY sl.created_at DESC`,
    [providerId]
  );

  return NextResponse.json(await attachListingDetails(result.rows));
}

// POST /api/listings - create a new listing (provider posts surplus food)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    category_id, provider_id, quantity, unit, usable_by,
    photos, packaging_notes, allergen_tags, food_name, pickup_location, pickup_from,
  } = body;

  if (!category_id || !provider_id || !quantity || !unit || !usable_by) {
    return NextResponse.json(
      { error: "Category, quantity, unit and pickup deadline are required." },
      { status: 400 }
    );
  }

  if (!(Number(quantity) > 0)) {
    return NextResponse.json({ error: "Quantity must be greater than zero." }, { status: 400 });
  }

  const usableBy = new Date(usable_by);
  if (Number.isNaN(usableBy.getTime()) || usableBy.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Pickup deadline must be in the future." }, { status: 400 });
  }

  const db = getDb();

  const provider = await db.query(
    "SELECT role FROM Users WHERE user_id = $1 AND is_active = true",
    [provider_id]
  );
  if (provider.rows.length === 0 || provider.rows[0].role !== "provider") {
    return NextResponse.json({ error: "Only provider accounts can post listings." }, { status: 403 });
  }

  let listingId: number;
  try {
    const result = await db.query(
      `INSERT INTO SurplusListings (category_id, provider_id, quantity, unit, usable_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING listing_id`,
      [category_id, provider_id, quantity, unit, usableBy.toISOString()]
    );
    listingId = result.rows[0].listing_id;
  } catch (err: any) {
    // 23503 = foreign key violation (unknown category), 23514 = check constraint failed
    if (err.code === "23503" || err.code === "23514") {
      return NextResponse.json({ error: "Invalid listing details." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to create listing." }, { status: 500 });
  }

  // store the supplementary details in MongoDB
  const collection = await getListingDetailsCollection();
  await collection.insertOne({
    listing_id: listingId,
    photos: photos || [],
    packaging_notes: packaging_notes || "",
    allergen_tags: allergen_tags || [],
    food_name: food_name || "",
    pickup_location: pickup_location || "",
    pickup_from: pickup_from || null,
  });

  return NextResponse.json({ listing_id: listingId }, { status: 201 });
}
