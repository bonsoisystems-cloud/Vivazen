import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { sendWhatsAppTextMessage, sendWhatsAppTemplateMessage, formatWhatsAppNumber } from "@/lib/whatsapp";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, message, templateName, templateParams, clientName, billNo, type } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    let result;
    if (templateName) {
      result = await sendWhatsAppTemplateMessage({
        to: phone,
        templateName,
        languageCode: body.languageCode || "en_US",
        components: templateParams
      });
    } else if (message) {
      result = await sendWhatsAppTextMessage({
        to: phone,
        text: message
      });
    } else {
      return NextResponse.json({ error: "Either message text or templateName is required" }, { status: 400 });
    }

    // Log the message into SmsLog in database
    try {
      const logId = `wa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const status = result.success ? "Sent" : "Failed";

      await query(
        `INSERT INTO "SmsLog" (id, date, "clientName", phone, type, channel, message, status, "sentBy", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, 'WhatsApp', $6, $7, $8, NOW(), NOW())`,
        [
          logId,
          now,
          clientName || "Client",
          formatWhatsAppNumber(phone),
          type || (billNo ? `Bill #${billNo}` : "Direct WhatsApp"),
          message || `[Template: ${templateName}]`,
          status,
          session.name || "Admin"
        ]
      );
    } catch (logErr) {
      console.error("Failed to log WhatsApp message to database:", logErr);
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: result.details
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      recipient: formatWhatsAppNumber(phone)
    });
  } catch (err: any) {
    console.error("Error in WhatsApp send route:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
