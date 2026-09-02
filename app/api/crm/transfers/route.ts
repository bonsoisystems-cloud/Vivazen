import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "InterBranchTransfer" ORDER BY date DESC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching transfers:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { type, fromBranch, toBranch, details, by } = body;

    const id = `tr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const today = new Date().toISOString().split("T")[0];

    const rows = await query(
      `INSERT INTO "InterBranchTransfer" (id, date, type, "fromBranch", "toBranch", details, status, "by", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'Completed', $7, NOW(), NOW())
       RETURNING *`,
      [id, today, type || "Stock", fromBranch || "Jaunpur", toBranch || "Varanasi", JSON.stringify(details || {}), by || "Super Admin"]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error logging transfer:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
