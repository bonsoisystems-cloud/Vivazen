import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "ServiceReminder" ORDER BY "afterDays" ASC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching reminders:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { serviceId, serviceName, afterDays, template, channel, status } = body;

    if (!template || !afterDays) {
      return NextResponse.json({ error: "Template and days required" }, { status: 400 });
    }

    const id = `rm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const rows = await query(
      `INSERT INTO "ServiceReminder" (id, "serviceId", "serviceName", "afterDays", template, channel, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [id, serviceId || "s1", serviceName || "General Service", Number(afterDays || 30), template, channel || "WhatsApp", status || "Active"]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating reminder:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, status } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const rows = await query(
      `UPDATE "ServiceReminder" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error toggling reminder:", err);
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

    await query(`DELETE FROM "ServiceReminder" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Reminder rule deleted" });
  } catch (err) {
    console.error("Error deleting reminder:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
