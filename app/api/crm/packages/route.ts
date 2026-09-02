import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "ServicePackage" ORDER BY "order" ASC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching packages:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, originalPrice, price, durationDays, validUpto, items, order } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Package name and price required" }, { status: 400 });
    }

    const id = `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const rows = await query(
      `INSERT INTO "ServicePackage" (id, name, "originalPrice", price, "durationDays", "validUpto", items, "order", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [id, name.trim(), String(originalPrice || price), String(price), Number(durationDays || 90), validUpto || null, JSON.stringify(items || []), Number(order || 0)]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating package:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, name, originalPrice, price, durationDays, validUpto, items, order } = body;

    if (!id || !name || !price) {
      return NextResponse.json({ error: "Package ID, name and price required" }, { status: 400 });
    }

    const rows = await query(
      `UPDATE "ServicePackage" SET 
        name = $1, 
        "originalPrice" = $2, 
        price = $3, 
        "durationDays" = $4, 
        "validUpto" = $5, 
        items = $6, 
        "order" = $7, 
        "updatedAt" = NOW() 
       WHERE id = $8 
       RETURNING *`,
      [name.trim(), String(originalPrice || price), String(price), Number(durationDays || 90), validUpto || null, JSON.stringify(items || []), Number(order || 0), id]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error updating package:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await query(`DELETE FROM "ServicePackage" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Package deleted" });
  } catch (err) {
    console.error("Error deleting package:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
