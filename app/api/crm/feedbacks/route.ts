import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "Feedback" ORDER BY date DESC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { billNo, clientName, email, overall, timely, support, satisfaction, serviceRating, review, suggestion, date } = body;

    if (!billNo || !clientName) {
      return NextResponse.json({ error: "Bill number and client name required" }, { status: 400 });
    }

    const id = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const fDate = date || new Date().toISOString().split("T")[0];

    const rows = await query(
      `INSERT INTO "Feedback" (
        id, "billNo", "clientName", email, overall, timely, support, satisfaction, "serviceRating", review, suggestion, date, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        id, billNo, clientName, email || null,
        Number(overall || 5), Number(timely || 5), Number(support || 5), Number(satisfaction || 5),
        Number(serviceRating || 5), review || null, suggestion || null, fDate
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating feedback:", err);
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

    await query(`DELETE FROM "Feedback" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Feedback deleted" });
  } catch (err) {
    console.error("Error deleting feedback:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
