import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

// POST /api/auth/login - verify credentials against the database
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const db = getDb();
  const result = await db.query(
    "SELECT user_id, name, email, password_hash, role FROM Users WHERE email = $1 AND is_active = true",
    [email]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  return NextResponse.json({
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}
