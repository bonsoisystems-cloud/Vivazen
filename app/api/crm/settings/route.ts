import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "SoftwareSettings" LIMIT 1`);
    if (rows.length === 0) {
      // Default initial settings
      const defaultSettings = {
        remindBirthday: true,
        remindAnniversary: true,
        remindAppointments: true,
        remindPendingPayments: true,
        remindPackageExpiry: true,
        redeemPointsThreshold: 100,
        pricePerPoint: 1.0,
        maxRedeemPoints: 500,
        holidays: [],
        officialWhatsappEnabled: false,
        officialWhatsappApiUrl: "https://graph.facebook.com/v20.0/",
        officialWhatsappPhoneId: "",
        officialWhatsappToken: "",
        scannerWhatsappEnabled: true,
        scannerWhatsappApiUrl: "https://wap.shivsofts.com/",
        scannerWhatsappInstanceId: "",
        scannerWhatsappToken: ""
      };
      return NextResponse.json({ success: true, data: defaultSettings });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error fetching settings:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Check if table exists or create if not
    await query(`
      CREATE TABLE IF NOT EXISTS "SoftwareSettings" (
        id VARCHAR(50) PRIMARY KEY,
        "remindBirthday" BOOLEAN DEFAULT true,
        "remindAnniversary" BOOLEAN DEFAULT true,
        "remindAppointments" BOOLEAN DEFAULT true,
        "remindPendingPayments" BOOLEAN DEFAULT true,
        "remindPackageExpiry" BOOLEAN DEFAULT true,
        "redeemPointsThreshold" INTEGER DEFAULT 100,
        "pricePerPoint" NUMERIC(10,2) DEFAULT 1.0,
        "maxRedeemPoints" INTEGER DEFAULT 500,
        holidays JSONB DEFAULT '[]',
        "officialWhatsappEnabled" BOOLEAN DEFAULT false,
        "officialWhatsappApiUrl" TEXT,
        "officialWhatsappPhoneId" TEXT,
        "officialWhatsappToken" TEXT,
        "scannerWhatsappEnabled" BOOLEAN DEFAULT true,
        "scannerWhatsappApiUrl" TEXT,
        "scannerWhatsappInstanceId" TEXT,
        "scannerWhatsappToken" TEXT,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const existing = await query(`SELECT id FROM "SoftwareSettings" LIMIT 1`);

    if (existing.length > 0) {
      const rows = await query(
        `UPDATE "SoftwareSettings" SET
          "remindBirthday" = $1,
          "remindAnniversary" = $2,
          "remindAppointments" = $3,
          "remindPendingPayments" = $4,
          "remindPackageExpiry" = $5,
          "redeemPointsThreshold" = $6,
          "pricePerPoint" = $7,
          "maxRedeemPoints" = $8,
          holidays = $9,
          "officialWhatsappEnabled" = $10,
          "officialWhatsappApiUrl" = $11,
          "officialWhatsappPhoneId" = $12,
          "officialWhatsappToken" = $13,
          "scannerWhatsappEnabled" = $14,
          "scannerWhatsappApiUrl" = $15,
          "scannerWhatsappInstanceId" = $16,
          "scannerWhatsappToken" = $17,
          "updatedAt" = NOW()
        WHERE id = $18
        RETURNING *`,
        [
          Boolean(body.remindBirthday),
          Boolean(body.remindAnniversary),
          Boolean(body.remindAppointments),
          Boolean(body.remindPendingPayments),
          Boolean(body.remindPackageExpiry),
          Number(body.redeemPointsThreshold || 100),
          Number(body.pricePerPoint || 1.0),
          Number(body.maxRedeemPoints || 500),
          JSON.stringify(body.holidays || []),
          Boolean(body.officialWhatsappEnabled),
          body.officialWhatsappApiUrl || "",
          body.officialWhatsappPhoneId || "",
          body.officialWhatsappToken || "",
          Boolean(body.scannerWhatsappEnabled),
          body.scannerWhatsappApiUrl || "",
          body.scannerWhatsappInstanceId || "",
          body.scannerWhatsappToken || "",
          existing[0].id
        ]
      );
      return NextResponse.json({ success: true, data: rows[0] });
    } else {
      const rows = await query(
        `INSERT INTO "SoftwareSettings" (
          id, "remindBirthday", "remindAnniversary", "remindAppointments", "remindPendingPayments", "remindPackageExpiry",
          "redeemPointsThreshold", "pricePerPoint", "maxRedeemPoints", holidays,
          "officialWhatsappEnabled", "officialWhatsappApiUrl", "officialWhatsappPhoneId", "officialWhatsappToken",
          "scannerWhatsappEnabled", "scannerWhatsappApiUrl", "scannerWhatsappInstanceId", "scannerWhatsappToken", "updatedAt"
        ) VALUES (
          'settings_1', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
        )
        RETURNING *`,
        [
          Boolean(body.remindBirthday),
          Boolean(body.remindAnniversary),
          Boolean(body.remindAppointments),
          Boolean(body.remindPendingPayments),
          Boolean(body.remindPackageExpiry),
          Number(body.redeemPointsThreshold || 100),
          Number(body.pricePerPoint || 1.0),
          Number(body.maxRedeemPoints || 500),
          JSON.stringify(body.holidays || []),
          Boolean(body.officialWhatsappEnabled),
          body.officialWhatsappApiUrl || "",
          body.officialWhatsappPhoneId || "",
          body.officialWhatsappToken || "",
          Boolean(body.scannerWhatsappEnabled),
          body.scannerWhatsappApiUrl || "",
          body.scannerWhatsappInstanceId || "",
          body.scannerWhatsappToken || ""
        ]
      );
      return NextResponse.json({ success: true, data: rows[0] });
    }
  } catch (err) {
    console.error("Error saving settings:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
