import { NextResponse, connection } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/categories - list food categories for the listing form
export async function GET() {
  // read from the database at request time, not during the build
  await connection();

  const db = getDb();
  const result = await db.query("SELECT category_id, name FROM FoodCategories ORDER BY category_id");
  return NextResponse.json(result.rows);
}
