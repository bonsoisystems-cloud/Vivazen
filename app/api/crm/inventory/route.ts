import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "products", "vendors", "usage", "purchases"

    if (type === "vendors") {
      const rows = await query(`SELECT * FROM "Vendor" ORDER BY name ASC`);
      return NextResponse.json({ success: true, data: rows });
    }

    if (type === "usage") {
      const rows = await query(`SELECT * FROM "ProductUsage" ORDER BY date DESC, "createdAt" DESC`);
      return NextResponse.json({ success: true, data: rows });
    }

    if (type === "purchases") {
      const rows = await query(`SELECT * FROM "StockPurchase" ORDER BY date DESC, "createdAt" DESC`);
      return NextResponse.json({ success: true, data: rows });
    }

    const rows = await query(`SELECT * FROM "Product" ORDER BY name ASC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching inventory:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    // 1. Add / Edit Product
    if (action === "edit_product") {
      const { id, name, mrp, salePrice, volume, unit, barcode, rewardPoints, stock } = body;
      if (!id || !name || !mrp) return NextResponse.json({ error: "Product ID, name and MRP required" }, { status: 400 });

      const rows = await query(
        `UPDATE "Product" SET 
          name = $1, 
          mrp = $2, 
          "salePrice" = $3, 
          volume = $4, 
          unit = $5, 
          barcode = COALESCE($6, barcode), 
          "rewardPoints" = $7, 
          stock = $8, 
          "updatedAt" = NOW() 
         WHERE id = $9 
         RETURNING *`,
        [name.trim(), Number(mrp), Number(salePrice || mrp), volume || "100", unit || "ML", barcode || null, Number(rewardPoints || 0), Number(stock || 0), id]
      );
      return NextResponse.json({ success: true, data: rows[0] });
    }

    if (action === "add_product" || !action) {
      const { name, mrp, salePrice, volume, unit, barcode, rewardPoints, stock } = body;
      if (!name || !mrp) return NextResponse.json({ error: "Product name and MRP required" }, { status: 400 });

      const id = `pr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const bc = barcode || `BC${Date.now().toString().slice(-6)}`;

      const rows = await query(
        `INSERT INTO "Product" (id, name, mrp, "salePrice", volume, unit, barcode, "rewardPoints", stock, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING *`,
        [id, name.trim(), Number(mrp), Number(salePrice || mrp), volume || "100", unit || "ML", bc, Number(rewardPoints || 0), Number(stock || 0)]
      );
      return NextResponse.json({ success: true, data: rows[0] });
    }

    // 2. Add / Edit Vendor
    if (action === "edit_vendor") {
      const { id, name, phone, email, gst, address } = body;
      if (!id || !name || !phone) return NextResponse.json({ error: "Vendor ID, name and phone required" }, { status: 400 });

      const rows = await query(
        `UPDATE "Vendor" SET 
          name = $1, 
          phone = $2, 
          email = $3, 
          gst = $4, 
          address = $5, 
          "updatedAt" = NOW() 
         WHERE id = $6 
         RETURNING *`,
        [name.trim(), phone.trim(), email || null, gst || null, address || null, id]
      );
      return NextResponse.json({ success: true, data: rows[0] });
    }

    if (action === "add_vendor") {
      const { name, phone, email, gst, address } = body;
      if (!name || !phone) return NextResponse.json({ error: "Vendor name and phone required" }, { status: 400 });

      const id = `vn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const rows = await query(
        `INSERT INTO "Vendor" (id, name, phone, email, gst, address, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [id, name.trim(), phone.trim(), email || null, gst || null, address || null]
      );
      return NextResponse.json({ success: true, data: rows[0] });
    }

    // 3. Log In-Salon Usage
    if (action === "log_usage") {
      const { productId, productName, qty, providerId, providerName, assignedBy, date, remarks } = body;
      if (!productId || !providerId) return NextResponse.json({ error: "Product and provider required" }, { status: 400 });

      const id = `pu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const uDate = date || new Date().toISOString().split("T")[0];

      const rows = await query(
        `INSERT INTO "ProductUsage" (id, "productId", "productName", qty, "providerId", "providerName", "assignedBy", date, remarks, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING *`,
        [id, productId, productName, Number(qty || 1), providerId, providerName, assignedBy || "Super Admin", uDate, remarks || null]
      );

      // Decrement product stock
      await query(`UPDATE "Product" SET stock = GREATEST(0, stock - $1), "updatedAt" = NOW() WHERE id = $2`, [Number(qty || 1), productId]);

      return NextResponse.json({ success: true, data: rows[0] });
    }

    // 4. Record Vendor Stock Purchase
    if (action === "stock_purchase") {
      const { vendorId, vendorName, invoiceNo, date, items, total } = body;
      const id = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const pDate = date || new Date().toISOString().split("T")[0];

      const rows = await query(
        `INSERT INTO "StockPurchase" (id, "vendorId", "vendorName", "invoiceNo", date, items, total, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [id, vendorId, vendorName, invoiceNo || null, pDate, JSON.stringify(items || []), Number(total || 0)]
      );

      // Increase stock for each purchased product
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.productId && item.qty) {
            await query(`UPDATE "Product" SET stock = stock + $1, "updatedAt" = NOW() WHERE id = $2`, [Number(item.qty), item.productId]);
          }
        }
      }

      return NextResponse.json({ success: true, data: rows[0] });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Error modifying inventory:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // "product" | "vendor"

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (type === "vendor") {
      await query(`DELETE FROM "Vendor" WHERE id = $1`, [id]);
    } else {
      await query(`DELETE FROM "Product" WHERE id = $1`, [id]);
    }

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting inventory item:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
