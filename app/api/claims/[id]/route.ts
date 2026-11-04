import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// PATCH /api/claims/[id] - recipient confirms pickup; completes the claim and marks the listing delivered
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/claims/[id]">) {
  const claimId = Number((await ctx.params).id);
  if (!Number.isInteger(claimId) || claimId <= 0) {
    return NextResponse.json({ error: "Invalid claim id." }, { status: 400 });
  }

  const { recipient_id, status } = await req.json();
  if (!recipient_id || status !== "completed") {
    return NextResponse.json({ error: "recipient_id and status 'completed' are required." }, { status: 400 });
  }

  const db = getDb();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const check = await client.query(
      "SELECT listing_id, recipient_id, status FROM Claims WHERE claim_id = $1 FOR UPDATE",
      [claimId]
    );

    if (check.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const claim = check.rows[0];

    if (claim.recipient_id !== Number(recipient_id)) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "You can only update your own claims." }, { status: 403 });
    }

    if (claim.status !== "pending") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Only pending claims can be marked as collected." }, { status: 409 });
    }

    await client.query(
      "UPDATE Claims SET status = 'completed', pickup_time = NOW() WHERE claim_id = $1",
      [claimId]
    );
    await client.query(
      "UPDATE SurplusListings SET status = 'delivered' WHERE listing_id = $1",
      [claim.listing_id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ claim_id: claimId, status: "completed" });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Could not update claim" }, { status: 500 });
  } finally {
    client.release();
  }
}
