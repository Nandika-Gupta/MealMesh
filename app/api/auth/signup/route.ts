import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

// POST /api/auth/signup - create a new user account
export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const db = getDb();

  try {
    const result = await db.query(
      `INSERT INTO Users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, name, role`,
      [name, email, passwordHash, role]
    );

    return NextResponse.json(
      { user_id: result.rows[0].user_id, name: result.rows[0].name, role: result.rows[0].role },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
