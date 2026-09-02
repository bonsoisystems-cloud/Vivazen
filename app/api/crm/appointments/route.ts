import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const date = searchParams.get("date");

    if (clientId) {
      const rows = await query(`SELECT * FROM "Appointment" WHERE "clientId" = $1 ORDER BY "date" DESC, "time" ASC`, [clientId]);
      return NextResponse.json({ success: true, data: rows });
    }

    if (date) {
      const rows = await query(`SELECT * FROM "Appointment" WHERE "date" = $1 ORDER BY "time" ASC`, [date]);
      return NextResponse.json({ success: true, data: rows });
    }

    const rows = await query(`SELECT * FROM "Appointment" ORDER BY "date" DESC, "time" ASC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { clientName, phone, email, date, time, services, total, advance, status, source, remarks } = body;

    if (!clientName || !phone || !date || !time) {
      return NextResponse.json({ error: "Client name, phone, date, and time are required" }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const cleanName = clientName.trim();
    const cleanEmail = email ? email.trim() : null;

    // Ensure client exists
    let clientId = "";
    const clientRows = await query(`SELECT id FROM "Client" WHERE phone = $1`, [cleanPhone]);
    if (clientRows.length > 0) {
      clientId = clientRows[0].id;
      await query(
        `UPDATE "Client" SET
          name = COALESCE(NULLIF($1, ''), name),
          email = COALESCE($2, email),
          "lastVisit" = NOW(),
          "updatedAt" = NOW()
         WHERE id = $3`,
        [cleanName, cleanEmail, clientId]
      );
    } else {
      clientId = `cl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const inviteCode = `VIV${Math.floor(1000 + Math.random() * 9000)}`;
      await query(
        `INSERT INTO "Client" (
          id, name, phone, email, "gender", "address", "source", "inviteCode", "points", "walletBalance", "firstVisit", "lastVisit", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, 'Female', 'Jaunpur', 'Appointment Direct', $5, 0, 0, NOW(), NOW(), NOW(), NOW()
        )`,
        [clientId, cleanName, cleanPhone, cleanEmail, inviteCode]
      );
    }

    const id = `ap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const rows = await query(
      `INSERT INTO "Appointment" (
        id, "clientId", "clientName", phone, date, time, services, total, advance, status, source, remarks, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        id, clientId, clientName.trim(), phone.trim(), date, time,
        JSON.stringify(services || []),
        Number(total || 0),
        Number(advance || 0),
        status || "Pending",
        source || "Software",
        remarks || null
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating appointment:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, clientName, phone, status, date, time, services, total, advance, remarks } = body;

    if (!id) return NextResponse.json({ error: "Appointment ID required" }, { status: 400 });

    const rows = await query(
      `UPDATE "Appointment" SET
        "clientName" = COALESCE($1, "clientName"),
        phone = COALESCE($2, phone),
        status = COALESCE($3, status),
        date = COALESCE($4, date),
        time = COALESCE($5, time),
        services = COALESCE($6, services),
        total = COALESCE($7, total),
        advance = COALESCE($8, advance),
        remarks = COALESCE($9, remarks),
        "updatedAt" = NOW()
      WHERE id = $10
      RETURNING *`,
      [
        clientName || null,
        phone || null,
        status || null,
        date || null,
        time || null,
        services !== undefined ? JSON.stringify(services) : null,
        total !== undefined ? Number(total) : null,
        advance !== undefined ? Number(advance) : null,
        remarks !== undefined ? remarks : null,
        id
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error updating appointment:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Appointment ID required" }, { status: 400 });

    await query(`DELETE FROM "Appointment" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Appointment deleted" });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
