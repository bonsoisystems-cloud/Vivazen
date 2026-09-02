import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await query(`SELECT * FROM "Membership" ORDER BY price ASC, "createdAt" DESC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching memberships:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      name, price, durationDays, rewardOnPurchase,
      discountServices, discountServicesType, discountProducts, discountProductsType,
      discountPackages, discountPackagesType, pointsBoost, minPoints, minBill
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Membership name and price required" }, { status: 400 });
    }

    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const rows = await query(
      `INSERT INTO "Membership" (
        id, name, price, "durationDays", "rewardOnPurchase",
        "discountServices", "discountServicesType", "discountProducts", "discountProductsType",
        "discountPackages", "discountPackagesType", "pointsBoost", "minPoints", "minBill", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        id, name.trim(), Number(price), Number(durationDays || 365), Number(rewardOnPurchase || 0),
        Number(discountServices || 10), discountServicesType || "%", Number(discountProducts || 10), discountProductsType || "%",
        Number(discountPackages || 10), discountPackagesType || "%", pointsBoost || "1X", Number(minPoints || 0), Number(minBill || 0)
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error creating membership:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      id, name, price, durationDays, rewardOnPurchase,
      discountServices, discountServicesType, discountProducts, discountProductsType,
      discountPackages, discountPackagesType, pointsBoost, minPoints, minBill
    } = body;

    if (!id || !name || !price) {
      return NextResponse.json({ error: "Membership ID, name and price required" }, { status: 400 });
    }

    const rows = await query(
      `UPDATE "Membership" SET 
        name = $1, 
        price = $2, 
        "durationDays" = $3, 
        "rewardOnPurchase" = $4, 
        "discountServices" = $5, 
        "discountServicesType" = $6, 
        "discountProducts" = $7, 
        "discountProductsType" = $8, 
        "discountPackages" = $9, 
        "discountPackagesType" = $10, 
        "pointsBoost" = $11, 
        "minPoints" = $12, 
        "minBill" = $13, 
        "updatedAt" = NOW() 
       WHERE id = $14 
       RETURNING *`,
      [
        name.trim(), Number(price), Number(durationDays || 365), Number(rewardOnPurchase || 0),
        Number(discountServices || 10), discountServicesType || "%", Number(discountProducts || 10), discountProductsType || "%",
        Number(discountPackages || 10), discountPackagesType || "%", pointsBoost || "1X", Number(minPoints || 0), Number(minBill || 0), id
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error updating membership:", err);
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

    await query(`DELETE FROM "Membership" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Membership deleted" });
  } catch (err) {
    console.error("Error deleting membership:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
