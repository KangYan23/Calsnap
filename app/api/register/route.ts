import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body?.username ?? "").trim();
    const password = (body?.password ?? "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");

    const existing = await users.findOne({ username });
    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const insert = await users.insertOne({ username, password: hashed });

    // Set cookie so the new user is authenticated immediately
    cookies().set("userId", insert.insertedId.toString(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


