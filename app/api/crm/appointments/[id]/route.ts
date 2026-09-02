import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const apptRows = await query(`SELECT * FROM "Appointment" WHERE id = $1`, [id]);

    if (apptRows.length === 0) {
      return NextResponse.json({ error: "Appointment invoice not found" }, { status: 404 });
    }

    const appt = apptRows[0];

    // Fetch client details
    let client = null;
    if (appt.clientId) {
      const clientRows = await query(`SELECT * FROM "Client" WHERE id = $1`, [appt.clientId]);
      if (clientRows.length > 0) client = clientRows[0];
    }

    // Parse services JSON if stored as string
    let services = appt.services;
    if (typeof services === "string") {
      try { services = JSON.parse(services); } catch { services = []; }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...appt,
        services,
        client
      }
    });
  } catch (err) {
    console.error("Error fetching appointment invoice:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
