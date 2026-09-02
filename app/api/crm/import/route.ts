import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Safe Integer parser that strips non-numeric characters (e.g. "10 units" -> 10, "₹850" -> 850, "NaN" -> 0)
function safeParseInt(val: any, fallback = 0): number {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : Math.round(val);
  const cleaned = String(val).replace(/[^0-9.-]/g, "").trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? fallback : parsed;
}

// Safe Float parser that strips currency symbols, commas, and handles decimals
function safeParseFloat(val: any, fallback = 0): number {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, "").trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

// Robust date parser for Excel dates (serial numbers, DD/MM/YYYY, ISO, etc.)
function safeParseDate(val: any): string {
  if (!val) return new Date().toISOString();

  // If it's already a valid Date object
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString();
  }

  // If it's an Excel numeric serial date (e.g. 45321)
  if (typeof val === "number" && !isNaN(val) && val > 1000 && val < 100000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const jsDate = new Date(excelEpoch.getTime() + val * 86400000);
    if (!isNaN(jsDate.getTime())) {
      return jsDate.toISOString();
    }
  }

  const str = String(val).trim();
  if (!str || str === "—" || str === "-" || str === "N/A" || str.toLowerCase() === "null") {
    return new Date().toISOString();
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Handle YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Fallback try native parse
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch {
    // ignore
  }

  return new Date().toISOString();
}

// Generate guaranteed unique invite code
function generateUniqueInviteCode(usedCodes: Set<string>): string {
  for (let i = 0; i < 100; i++) {
    const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const code = `VIV${hex}`;
    if (!usedCodes.has(code)) {
      usedCodes.add(code);
      return code;
    }
  }
  const fallback = `VIV${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(10 + Math.random() * 90)}`;
  usedCodes.add(fallback);
  return fallback;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { type, items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided for import" }, { status: 400 });
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ═════════════════════════════════════════════════════════════════════════
    // 1. SERVICES BULK IMPORT (Category, Sub Category, Service, Price)
    // ═════════════════════════════════════════════════════════════════════════
    if (type === "services") {
      let createdCount = 0;
      let updatedCount = 0;

      // Ensure ServiceItem columns exist in DB
      try {
        await query(`
          ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "duration" INTEGER DEFAULT 30;
          ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "membershipPrice" DOUBLE PRECISION;
          ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "rewardPoints" INTEGER DEFAULT 0;
          ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "serviceFor" TEXT DEFAULT 'Female';
          ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "hideOnWebsite" BOOLEAN DEFAULT false;
          ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "desc" TEXT;
          ALTER TABLE "ServiceItem" ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
          ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "icon" TEXT;
          ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "desc" TEXT;
          ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "gradient" TEXT;
          ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
          ALTER TABLE "SubCategory" ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
        `);
      } catch (err) {
        console.warn("Service table column verification notice:", err);
      }

      // Pre-load all categories and subcategories for instant resolution
      const allCats = await query<any>(`SELECT id, name, slug FROM "ServiceCategory"`);
      const catMap = new Map<string, any>();
      allCats.forEach((c) => {
        catMap.set(c.slug, c);
        catMap.set(c.name.toLowerCase().trim(), c);
      });

      const allSubs = await query<any>(`SELECT id, "categoryId", name FROM "SubCategory"`);
      const subMap = new Map<string, any>();
      allSubs.forEach((s) => {
        subMap.set(`${s.categoryId}:::${s.name.toLowerCase().trim()}`, s);
      });

      for (const item of items) {
        try {
          // 1. Resolve Category Name
          const categoryName = String(
            item["Category"] ??
            item["category"] ??
            item["Service Category"] ??
            item["service_category"] ??
            item.category ??
            "General Services"
          ).trim();

          // 2. Resolve Sub Category Name
          const subCategoryName = String(
            item["Sub Category"] ??
            item["SubCategory"] ??
            item["Sub-Category"] ??
            item["subCategory"] ??
            item["subcategory"] ??
            item["Subcategory"] ??
            item["Sub Category Name"] ??
            item.subCategory ??
            item.subcategory ??
            `${categoryName} Services`
          ).trim();

          // 3. Resolve Service Name
          const serviceName = String(
            item["Service"] ??
            item["Service Name"] ??
            item["service"] ??
            item["serviceName"] ??
            item["Name"] ??
            item.service ??
            item.name ??
            ""
          ).trim();

          // 4. Resolve Price (₹)
          const price = safeParseFloat(
            item["Price (₹)"] ??
            item["Price(₹)"] ??
            item["Price (Rs)"] ??
            item["Price (Rs.)"] ??
            item["Price"] ??
            item["Rate"] ??
            item["Sale Price"] ??
            item["MRP"] ??
            item.price,
            0
          );

          if (!serviceName) continue;

          // Optional attributes
          const duration = safeParseInt(
            item["Duration (Min)"] ??
            item["Duration"] ??
            item["Duration (mins)"] ??
            item["Time"] ??
            item.duration,
            30
          );

          const membershipPrice = (
            item["Membership Price (₹)"] !== undefined ||
            item["Membership Price"] !== undefined ||
            item.membershipPrice !== undefined
          ) ? safeParseFloat(item["Membership Price (₹)"] ?? item["Membership Price"] ?? item.membershipPrice, price) : null;

          const rewardPoints = safeParseInt(
            item["Reward Points"] ??
            item["Points"] ??
            item.rewardPoints,
            0
          );

          const serviceFor = String(
            item["Service For"] ??
            item["Gender"] ??
            item.serviceFor ??
            "Female"
          ).trim();

          const desc = item["Description"] ?? item["Details"] ?? item.desc ?? null;

          const catSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "general";

          // Find or create Category
          let category = catMap.get(categoryName.toLowerCase()) || catMap.get(catSlug);
          let categoryId = category?.id;

          if (!categoryId) {
            const catId = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            let uniqueSlug = catSlug;
            let counter = 1;
            while (catMap.has(uniqueSlug)) {
              uniqueSlug = `${catSlug}-${counter}`;
              counter++;
            }
            const count = catMap.size;
            await query(
              `INSERT INTO "ServiceCategory" (id, name, slug, icon, "desc", gradient, "order", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
              [
                catId,
                categoryName,
                uniqueSlug,
                "https://pub-507869809f114df791179bd7ca34415b.r2.dev/hair-icon.png",
                `${categoryName} services catalog`,
                "from-amber-500/20 to-rose-500/20",
                count + 1,
              ]
            );
            categoryId = catId;
            const newCat = { id: catId, name: categoryName, slug: uniqueSlug };
            catMap.set(categoryName.toLowerCase(), newCat);
            catMap.set(uniqueSlug, newCat);
          }

          // Find or create SubCategory
          const subKey = `${categoryId}:::${subCategoryName.toLowerCase()}`;
          let subCategory = subMap.get(subKey);
          let subCategoryId = subCategory?.id;

          if (!subCategoryId) {
            const subId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const existingSubsInCat = Array.from(subMap.values()).filter((s: any) => s.categoryId === categoryId);
            const subOrder = existingSubsInCat.length + 1;
            await query(
              `INSERT INTO "SubCategory" (id, "categoryId", name, "order", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, NOW(), NOW())`,
              [subId, categoryId, subCategoryName, subOrder]
            );
            subCategoryId = subId;
            const newSub = { id: subId, categoryId, name: subCategoryName };
            subMap.set(subKey, newSub);
          }

          // Check if ServiceItem already exists in this subcategory
          const itemRows = await query(
            `SELECT id FROM "ServiceItem" WHERE "subCategoryId" = $1 AND LOWER(name) = LOWER($2)`,
            [subCategoryId, serviceName]
          );

          if (itemRows.length > 0) {
            await query(
              `UPDATE "ServiceItem" SET 
                price = $1, 
                duration = $2, 
                "membershipPrice" = COALESCE($3, "membershipPrice"),
                "rewardPoints" = COALESCE($4, "rewardPoints"),
                "serviceFor" = COALESCE($5, "serviceFor"),
                "desc" = COALESCE($6, "desc"),
                "updatedAt" = NOW() 
               WHERE id = $7`,
              [
                price,
                duration > 0 ? duration : 30,
                membershipPrice,
                rewardPoints,
                serviceFor,
                desc,
                itemRows[0].id,
              ]
            );
            updatedCount++;
          } else {
            const itemId = `itm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            await query(
              `INSERT INTO "ServiceItem" (id, "subCategoryId", name, price, duration, "desc", "membershipPrice", "rewardPoints", "serviceFor", "order", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, NOW(), NOW())`,
              [
                itemId,
                subCategoryId,
                serviceName,
                price,
                duration > 0 ? duration : 30,
                desc,
                membershipPrice,
                rewardPoints,
                serviceFor || "Female",
              ]
            );
            createdCount++;
          }
        } catch (itemErr) {
          console.error("Error processing service item:", item, itemErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${createdCount + updatedCount} services (${createdCount} added, ${updatedCount} updated)`,
        createdCount,
        updatedCount,
      });
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. PRODUCTS / INVENTORY BULK IMPORT
    // ═════════════════════════════════════════════════════════════════════════
    if (type === "products") {
      let createdCount = 0;
      let updatedCount = 0;

      // Pre-load all products to match in memory
      const allProds = await query<any>(`SELECT id, LOWER(name) as lname, barcode FROM "Product"`);
      const prodNameMap = new Map<string, string>();
      const prodBarcodeMap = new Map<string, string>();
      allProds.forEach((p) => {
        if (p.lname) prodNameMap.set(p.lname, p.id);
        if (p.barcode) prodBarcodeMap.set(p.barcode, p.id);
      });

      for (const item of items) {
        try {
          const productName = String(item.name || item["Product name"] || item["Product Name"] || item["Name"] || "").trim();
          if (!productName) continue;

          const stock = safeParseInt(item.stock ?? item["Available in stock"] ?? item["Available In Stock"] ?? item["Stock"] ?? item["Quantity"] ?? item["Qty"], 0);
          const salePrice = safeParseFloat(item.salePrice ?? item["Sale price"] ?? item["Sale Price"] ?? item["Price"] ?? item["Rate"], 0);
          const mrp = safeParseFloat(item.mrp ?? item["MRP"] ?? item["Cost price"] ?? item["Cost Price"], salePrice);
          const barcode = String(item.barcode || item["Barcode"] || "").trim() || `PRD-${Math.floor(100000 + Math.random() * 900000)}`;
          const rewardPoints = safeParseInt(item.rewardPoints ?? item["Reward points"] ?? item["Points"], 0);
          const volume = String(item.volume || item["Volume"] || "100").trim();
          const unit = String(item.unit || item["Unit"] || "ML").trim();

          const existingId = prodNameMap.get(productName.toLowerCase()) || prodBarcodeMap.get(barcode);

          if (existingId) {
            await query(
              `UPDATE "Product" SET 
                stock = $1, 
                "salePrice" = $2, 
                mrp = $3, 
                "updatedAt" = NOW() 
               WHERE id = $4`,
              [stock, salePrice, mrp, existingId]
            );
            updatedCount++;
          } else {
            const id = `prd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            await query(
              `INSERT INTO "Product" (id, name, mrp, "salePrice", volume, unit, barcode, "rewardPoints", stock, "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
              [
                id,
                productName,
                mrp,
                salePrice,
                volume,
                unit,
                barcode,
                rewardPoints,
                stock,
              ]
            );
            prodNameMap.set(productName.toLowerCase(), id);
            prodBarcodeMap.set(barcode, id);
            createdCount++;
          }
        } catch (prodErr) {
          console.error("Error processing product:", item, prodErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${createdCount + updatedCount} products (${createdCount} added, ${updatedCount} updated)`,
        createdCount,
        updatedCount,
      });
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. CLIENTS DIRECTORY BULK IMPORT (HIGH-SPEED & UNIQUE INVITE CODES)
    // ═════════════════════════════════════════════════════════════════════════
    if (type === "clients") {
      let createdCount = 0;
      let updatedCount = 0;

      // Pre-fetch all existing clients and invite codes to prevent collisions and N+1 queries
      const existingClients = await query<any>(`SELECT id, phone, "inviteCode" FROM "Client"`);
      const phoneMap = new Map<string, string>();
      const usedInviteCodes = new Set<string>();

      existingClients.forEach((c) => {
        if (c.phone) phoneMap.set(c.phone, c.id);
        if (c.inviteCode) usedInviteCodes.add(c.inviteCode);
      });

      for (const item of items) {
        try {
          const name = String(item.name || item["Name"] || item["Client Name"] || "").trim();
          const rawPhone = String(item.phone || item["Contact number"] || item["Contact Number"] || item["Phone"] || item["Mobile"] || "").trim();
          const cleanPhone = rawPhone.replace(/[^0-9]/g, "").slice(-10);

          if (!name || cleanPhone.length < 10) continue;

          const points = safeParseInt(item.points ?? item["Points"] ?? item["Loyalty Points"] ?? item["Reward Points"], 0);
          const walletBalance = safeParseFloat(item.walletBalance ?? item["Wallet balance"] ?? item["Wallet Balance"] ?? item["Wallet"], 0);

          const firstVisitRaw = item.firstVisit || item["First visit"] || item["First Visit"];
          const lastVisitRaw = item.lastVisit || item["Last visit"] || item["Last Visit"];

          const firstVisit = safeParseDate(firstVisitRaw);
          const lastVisit = safeParseDate(lastVisitRaw);

          const email = String(item.email || item["Email"] || "").trim() || null;
          const gender = String(item.gender || item["Gender"] || "Female").trim();
          const address = String(item.address || item["Address"] || "Jaunpur").trim();

          const existingId = phoneMap.get(cleanPhone);

          if (existingId) {
            await query(
              `UPDATE "Client" SET 
                name = $1,
                email = COALESCE($2, email),
                points = points + $3,
                "walletBalance" = GREATEST("walletBalance", $4),
                "lastVisit" = $5,
                "updatedAt" = NOW()
               WHERE id = $6`,
              [name, email, points, walletBalance, lastVisit, existingId]
            );
            updatedCount++;
          } else {
            // Generate 100% collision-free unique invite code
            const id = `cl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const inviteCode = generateUniqueInviteCode(usedInviteCodes);

            let inserted = false;
            let retries = 0;
            while (!inserted && retries < 3) {
              try {
                await query(
                  `INSERT INTO "Client" (
                    id, name, phone, email, gender, address, source, "inviteCode", 
                    points, "walletBalance", "firstVisit", "lastVisit", "createdAt", "updatedAt"
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
                  [
                    id,
                    name,
                    cleanPhone,
                    email,
                    gender,
                    address,
                    "Bulk Import",
                    inviteCode,
                    points,
                    walletBalance,
                    firstVisit,
                    lastVisit,
                  ]
                );
                phoneMap.set(cleanPhone, id);
                createdCount++;
                inserted = true;
              } catch (err: any) {
                retries++;
                if (err?.code === "23505" && err?.detail?.includes("inviteCode")) {
                  const freshCode = generateUniqueInviteCode(usedInviteCodes);
                  console.warn(`Duplicate invite code encountered, retrying with ${freshCode}...`);
                } else {
                  console.error("Error inserting client:", cleanPhone, err);
                  break;
                }
              }
            }
          }
        } catch (itemErr) {
          console.error("Error processing client item:", item, itemErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${createdCount + updatedCount} clients (${createdCount} added, ${updatedCount} updated)`,
        createdCount,
        updatedCount,
      });
    }

    return NextResponse.json({ error: "Invalid import type specified" }, { status: 400 });
  } catch (err) {
    console.error("Error during bulk import:", err);
    return NextResponse.json({ error: "Database error during bulk import" }, { status: 500 });
  }
}
