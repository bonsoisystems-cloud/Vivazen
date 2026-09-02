import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const phone = searchParams.get("phone");

    const clientSelect = `
      SELECT c.*, 
             m.name AS "membershipName", 
             m.price AS "membershipPrice", 
             m."pointsBoost" AS "membershipPointsBoost", 
             m."discountServices" AS "membershipDiscountServices",
             m."discountProducts" AS "membershipDiscountProducts",
             m."discountPackages" AS "membershipDiscountPackages",
             m."durationDays" AS "membershipDurationDays"
      FROM "Client" c
      LEFT JOIN "Membership" m ON c."membershipId" = m.id
    `;

    if (id) {
      const rows = await query(`${clientSelect} WHERE c.id = $1`, [id]);
      return NextResponse.json({ success: true, data: rows[0] || null });
    }

    if (phone) {
      const rows = await query(`${clientSelect} WHERE c.phone = $1`, [phone]);
      return NextResponse.json({ success: true, data: rows[0] || null });
    }

    const rows = await query(`${clientSelect} ORDER BY c."lastVisit" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching clients:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, phone, email, gender, dob, anniversary, address, source, membershipId, points, walletBalance } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Client name and phone are required" }, { status: 400 });
    }

    const id = `cl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const inviteCode = `VIV${Math.floor(100 + Math.random() * 900)}`;

    const rows = await query(
      `INSERT INTO "Client" (
        id, name, phone, email, gender, dob, anniversary, address, source, 
        "inviteCode", points, "walletBalance", "membershipId", "firstVisit", "lastVisit", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW(), NOW())
      ON CONFLICT (phone) DO UPDATE SET 
        name = EXCLUDED.name,
        email = COALESCE(EXCLUDED.email, "Client".email),
        "lastVisit" = NOW(),
        "updatedAt" = NOW()
      RETURNING *`,
      [
        id,
        name.trim(),
        phone.trim(),
        email || null,
        gender || "Female",
        dob || null,
        anniversary || null,
        address || "Jaunpur",
        source || "Walk-in",
        inviteCode,
        Number(points || 0),
        Number(walletBalance || 0),
        membershipId || null
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating client:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, name, phone, email, gender, dob, anniversary, address, source, membershipId, points, walletBalance } = body;

    if (!id) return NextResponse.json({ error: "Client ID required" }, { status: 400 });

    // If membershipId is explicitly provided in body (including null or empty string to revoke), handle it
    const hasMembershipField = "membershipId" in body;
    const cleanMembershipId = membershipId ? String(membershipId).trim() : null;

    const rows = await query(
      `UPDATE "Client" SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        gender = COALESCE($4, gender),
        dob = COALESCE($5, dob),
        anniversary = COALESCE($6, anniversary),
        address = COALESCE($7, address),
        source = COALESCE($8, source),
        "membershipId" = CASE WHEN $9 = true THEN $10 ELSE "Client"."membershipId" END,
        points = COALESCE($11, points),
        "walletBalance" = COALESCE($12, "walletBalance"),
        "updatedAt" = NOW()
      WHERE id = $13
      RETURNING *`,
      [
        name, phone, email, gender, dob, anniversary, address, source, 
        hasMembershipField, cleanMembershipId, 
        points, walletBalance, id
      ]
    );

    // Re-fetch with membership join for rich frontend payload
    const updatedWithMembership = await query(
      `SELECT c.*, 
             m.name AS "membershipName", 
             m.price AS "membershipPrice", 
             m."pointsBoost" AS "membershipPointsBoost", 
             m."discountServices" AS "membershipDiscountServices",
             m."discountProducts" AS "membershipDiscountProducts",
             m."discountPackages" AS "membershipDiscountPackages",
             m."durationDays" AS "membershipDurationDays"
      FROM "Client" c
      LEFT JOIN "Membership" m ON c."membershipId" = m.id
      WHERE c.id = $1`,
      [id]
    );

    return NextResponse.json({ success: true, data: updatedWithMembership[0] || rows[0] });
  } catch (err) {
    console.error("Error updating client:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Client ID required" }, { status: 400 });

    await query(`DELETE FROM "Client" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Client deleted" });
  } catch (err) {
    console.error("Error deleting client:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
