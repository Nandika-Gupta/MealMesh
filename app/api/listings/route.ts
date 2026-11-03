import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getListingDetailsCollection } from "@/lib/mongodb";

// GET /api/listings - fetch all currently available listings
export async function GET() {
  const db = getDb();
  const result = await db.query("SELECT * FROM available_listings_view");
  const listings = result.rows;

  // attach MongoDB details (photos, packaging notes, allergen tags) to each listing
  const collection = await getListingDetailsCollection();
  const listingsWithDetails = await Promise.all(
    listings.map(async (listing) => {
      const details = await collection.findOne({ listing_id: listing.listing_id });
      return {
        ...listing,
        photos: details?.photos || [],
        packaging_notes: details?.packaging_notes || "",
        allergen_tags: details?.allergen_tags || [],
      };
    })
  );

  return NextResponse.json(listingsWithDetails);
}

// POST /api/listings - create a new listing (provider posts surplus food)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category_id, provider_id, quantity, unit, usable_by, photos, packaging_notes, allergen_tags } = body;

  const db = getDb();
  const result = await db.query(
    `INSERT INTO SurplusListings (category_id, provider_id, quantity, unit, usable_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING listing_id`,
    [category_id, provider_id, quantity, unit, usable_by]
  );
  const listingId = result.rows[0].listing_id;

  // store the supplementary details in MongoDB
  const collection = await getListingDetailsCollection();
  await collection.insertOne({
    listing_id: listingId,
    photos: photos || [],
    packaging_notes: packaging_notes || "",
    allergen_tags: allergen_tags || [],
  });

  return NextResponse.json({ listing_id: listingId }, { status: 201 });
}
