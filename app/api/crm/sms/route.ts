import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { sendWhatsAppTextMessage, formatWhatsAppNumber } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "SmsLog" ORDER BY "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching SMS logs:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { clientName, phone, type, channel = "WhatsApp", message, sentBy } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone and message required" }, { status: 400 });
    }

    let status = "Sent";
    let waResponse: any = null;

    // Dispatch via Official WhatsApp Cloud API if channel is WhatsApp
    if (channel === "WhatsApp") {
      const waResult = await sendWhatsAppTextMessage({
        to: phone,
        text: message
      });
      status = waResult.success ? "Sent" : "Failed";
      waResponse = waResult;
    }

    const id = `sm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const rows = await query(
      `INSERT INTO "SmsLog" (id, date, "clientName", phone, type, channel, message, status, "sentBy", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        id,
        now,
        clientName || "Client",
        formatWhatsAppNumber(phone),
        type || "Promotional Offer",
        channel,
        message.trim(),
        status,
        sentBy || session.name || "Super Admin"
      ]
    );

    return NextResponse.json({
      success: true,
      data: rows[0],
      delivery: waResponse
    });
  } catch (err) {
    console.error("Error creating SMS/WhatsApp log:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

