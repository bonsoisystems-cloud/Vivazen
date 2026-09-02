import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "Enquiry" ORDER BY "followDate" ASC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { clientName, phone, email, address, enquiryFor, enquiryType, response, followDate, source, representative, status } = body;

    if (!clientName || !phone) {
      return NextResponse.json({ error: "Client name and phone are required" }, { status: 400 });
    }

    const id = `en_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const fDate = followDate || new Date().toISOString().split("T")[0];

    const rows = await query(
      `INSERT INTO "Enquiry" (
        id, "clientName", phone, email, address, "enquiryFor", "enquiryType", response, "followDate", source, representative, status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        id, clientName.trim(), phone.trim(), email || null, address || null,
        enquiryFor || "General Inquiry", enquiryType || "General Inquiry",
        response || null, fDate, source || "Walk-in", representative || null, status || "Warm"
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating enquiry:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, clientName, phone, email, address, enquiryFor, enquiryType, response, followDate, source, representative, status } = body;

    if (!id) return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 });

    const rows = await query(
      `UPDATE "Enquiry" SET
        "clientName" = COALESCE($1, "clientName"),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        address = COALESCE($4, address),
        "enquiryFor" = COALESCE($5, "enquiryFor"),
        "enquiryType" = COALESCE($6, "enquiryType"),
        response = COALESCE($7, response),
        "followDate" = COALESCE($8, "followDate"),
        source = COALESCE($9, source),
        representative = COALESCE($10, representative),
        status = COALESCE($11, status),
        "updatedAt" = NOW()
      WHERE id = $12
      RETURNING *`,
      [clientName, phone, email, address, enquiryFor, enquiryType, response, followDate, source, representative, status, id]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error updating enquiry:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 });

    await query(`DELETE FROM "Enquiry" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Enquiry deleted" });
  } catch (err) {
    console.error("Error deleting enquiry:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
