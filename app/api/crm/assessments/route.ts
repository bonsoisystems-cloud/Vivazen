import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "SelfAssessment" ORDER BY date DESC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching assessments:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { date, branchId, branchName, cleanliness, reception, service, punctuality, display, feedback, targetMet, targetAmount, actualAmount, notes, submittedBy } = body;

    const id = `as_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const aDate = date || new Date().toISOString().split("T")[0];

    const rows = await query(
      `INSERT INTO "SelfAssessment" (
        id, date, "branchId", "branchName", cleanliness, reception, service, punctuality, display, feedback,
        "targetMet", "targetAmount", "actualAmount", notes, "submittedBy", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *`,
      [
        id, aDate, branchId || "b1", branchName || "Jaunpur",
        Number(cleanliness || 5), Number(reception || 5), Number(service || 5), Number(punctuality || 5),
        Number(display || 5), Number(feedback || 5), Boolean(targetMet !== false),
        Number(targetAmount || 0), Number(actualAmount || 0), notes || null, submittedBy || "Super Admin"
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating assessment:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
