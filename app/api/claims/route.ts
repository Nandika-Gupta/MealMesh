import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST /api/claims - a recipient claims a listing (atomic transaction)
export async function POST(req: NextRequest) {
  const { listing_id, recipient_id } = await req.json();
  const db = getDb();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const check = await client.query(
      "SELECT status FROM SurplusListings WHERE listing_id = $1 FOR UPDATE",
      [listing_id]
    );

    if (check.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (check.rows[0].status !== "available") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Listing already claimed" }, { status: 409 });
    }

    const result = await client.query(
      "INSERT INTO Claims (listing_id, recipient_id) VALUES ($1, $2) RETURNING claim_id",
      [listing_id, recipient_id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ claim_id: result.rows[0].claim_id }, { status: 201 });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Could not complete claim" }, { status: 500 });
  } finally {
    client.release();
  }
}
