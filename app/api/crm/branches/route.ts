import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "Branch" ORDER BY name ASC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching branches:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, address, phone, email, gst, hours, status } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Branch name and phone required" }, { status: 400 });
    }

    const id = `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const rows = await query(
      `INSERT INTO "Branch" (id, name, address, phone, email, gst, hours, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [id, name.trim(), address || "City Center", phone.trim(), email || null, gst || null, hours || "10:00-20:00", status || "active"]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating branch:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
