import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "Expense" ORDER BY date DESC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { date, type, amount, paymentMode, recipient, paidBy, description } = body;

    if (!type || !amount) {
      return NextResponse.json({ error: "Category and amount required" }, { status: 400 });
    }

    const id = `ex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const eDate = date || new Date().toISOString().split("T")[0];

    const rows = await query(
      `INSERT INTO "Expense" (id, date, type, amount, "paymentMode", recipient, "paidBy", description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        id, eDate, type || "Miscellaneous", Number(amount),
        paymentMode || "Cash", recipient || "Vendor", paidBy || "Super Admin", description || null
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating expense:", err);
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

    await query(`DELETE FROM "Expense" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
