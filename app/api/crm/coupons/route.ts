import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "Coupon" ORDER BY "validTill" ASC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching coupons:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { code, discount, discountType, minBill, maxDiscount, perUser, validTill, rewardPoints } = body;

    if (!code || !discount) {
      return NextResponse.json({ error: "Coupon code and discount required" }, { status: 400 });
    }

    const id = `cp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const vTill = validTill || "2026-12-31";

    const rows = await query(
      `INSERT INTO "Coupon" (id, code, discount, "discountType", "minBill", "maxDiscount", "perUser", "validTill", "rewardPoints", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        id, code.trim().toUpperCase(), Number(discount), discountType || "%",
        Number(minBill || 0), Number(maxDiscount || 0), Number(perUser || 1), vTill, Number(rewardPoints || 0)
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating coupon:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, code, discount, discountType, minBill, maxDiscount, perUser, validTill, rewardPoints } = body;

    if (!id || !code || !discount) {
      return NextResponse.json({ error: "Coupon ID, code and discount required" }, { status: 400 });
    }

    const vTill = validTill || "2026-12-31";

    const rows = await query(
      `UPDATE "Coupon" SET 
        code = $1, 
        discount = $2, 
        "discountType" = $3, 
        "minBill" = $4, 
        "maxDiscount" = $5, 
        "perUser" = $6, 
        "validTill" = $7, 
        "rewardPoints" = $8, 
        "updatedAt" = NOW() 
       WHERE id = $9 
       RETURNING *`,
      [
        code.trim().toUpperCase(), Number(discount), discountType || "%",
        Number(minBill || 0), Number(maxDiscount || 0), Number(perUser || 1), vTill, Number(rewardPoints || 0), id
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error updating coupon:", err);
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

    await query(`DELETE FROM "Coupon" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    console.error("Error deleting coupon:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
