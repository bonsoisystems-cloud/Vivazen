import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Single Unified Staff Table ("ServiceProvider")
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "providers" | "employees"
    const category = searchParams.get("category"); // "Service Provider" | "Administrative"

    let staffQuery = `SELECT * FROM "ServiceProvider"`;
    const params: any[] = [];
    if (category) {
      staffQuery += ` WHERE category = $1`;
      params.push(category);
    }
    staffQuery += ` ORDER BY name ASC`;

    const allStaff = await query(staffQuery, params);
    const users = await query(`SELECT id, name, email, role, permissions FROM "User"`);

    const providers = allStaff.filter(s => s.category !== "Administrative");
    const employees = allStaff.filter(s => s.category === "Administrative");

    if (type === "providers") {
      return NextResponse.json({ success: true, data: providers });
    }

    if (type === "employees") {
      return NextResponse.json({ success: true, data: employees });
    }

    return NextResponse.json({
      success: true,
      data: {
        staff: allStaff,
        providers,
        employees,
        users
      }
    });
  } catch (err) {
    console.error("Error fetching unified staff:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      name,
      phone,
      email,
      category, // "Service Provider" | "Administrative"
      department,
      type, // Role / Designation (e.g. "Senior Beautician", "Receptionist", "Hair Stylist")
      specialization,
      experienceYears,
      commissionService,
      commissionProduct,
      salary,
      hoursStart,
      hoursEnd,
      gender,
      dob,
      joiningDate,
      bloodGroup,
      address,
      emergency,
      emergencyPhone,
      panNumber,
      panDoc,
      aadharNumber,
      aadharDoc,
      photo,
      bankName,
      bankAccount,
      ifscCode,
      upiId,
      // Staff Login Account Creation / Linking
      createLoginAccount,
      loginPassword,
      loginRole,
      loginPermissions
    } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }

    // Auto-verify / migrate columns & Role enum
    try {
      await query(`
        DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF'; EXCEPTION WHEN OTHERS THEN NULL; END; END IF; END $$;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS permissions text[] DEFAULT '{}';
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Service Provider';
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "department" TEXT DEFAULT 'Salon & Spa';
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'Beautician';
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "specialization" TEXT DEFAULT 'Hair & Beauty';
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER DEFAULT 1;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "commissionService" DOUBLE PRECISION DEFAULT 15;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "commissionProduct" DOUBLE PRECISION DEFAULT 10;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "salary" DOUBLE PRECISION DEFAULT 12000;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "hoursStart" TEXT DEFAULT '10:00';
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "hoursEnd" TEXT DEFAULT '19:00';
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "gender" TEXT DEFAULT 'Female';
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "dob" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "joiningDate" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "bloodGroup" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "address" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "emergency" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "panNumber" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "panDoc" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "aadharNumber" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "aadharDoc" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "photo" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "bankAccount" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "ifscCode" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "upiId" TEXT;
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "attendanceId" TEXT;
      `);
    } catch (migErr) {
      console.warn("ServiceProvider schema check notice:", migErr);
    }

    const id = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const attId = `ATT${Math.floor(10000 + Math.random() * 90000)}`;
    const isServiceProv = category !== "Administrative";

    const rows = await query(
      `INSERT INTO "ServiceProvider" (
        id, name, phone, email, category, department, type, specialization, "experienceYears",
        "commissionService", "commissionProduct", salary, "hoursStart", "hoursEnd", gender, dob, "joiningDate",
        "bloodGroup", address, emergency, "emergencyPhone", "panNumber", "panDoc", "aadharNumber", "aadharDoc",
        photo, "bankName", "bankAccount", "ifscCode", "upiId", "attendanceId", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25,
        $26, $27, $28, $29, $30, $31, NOW(), NOW()
      ) RETURNING *`,
      [
        id,
        name.trim(),
        phone.trim(),
        email ? email.trim() : null,
        category || (isServiceProv ? "Service Provider" : "Administrative"),
        department || (isServiceProv ? "Salon & Spa" : "Front Desk"),
        type || (isServiceProv ? "Beautician" : "Receptionist"),
        specialization || (isServiceProv ? "Hair & Beauty" : "Desk Management"),
        Number(experienceYears || 1),
        Number(commissionService || (isServiceProv ? 15 : 0)),
        Number(commissionProduct || (isServiceProv ? 10 : 0)),
        Number(salary || (isServiceProv ? 12000 : 15000)),
        hoursStart || (isServiceProv ? "10:00" : "09:30"),
        hoursEnd || (isServiceProv ? "19:00" : "19:30"),
        gender || "Female",
        dob || null,
        joiningDate || null,
        bloodGroup || null,
        address || null,
        emergency || null,
        emergencyPhone || null,
        panNumber || null,
        panDoc || null,
        aadharNumber || null,
        aadharDoc || null,
        photo || null,
        bankName || null,
        bankAccount || null,
        ifscCode || null,
        upiId || null,
        attId
      ]
    );

    const staffRecord = rows[0];

    // ─── CONNECT & CREATE LOGIN USER ACCOUNT IF REQUESTED ───
    let linkedUser = null;
    if (createLoginAccount && email?.trim() && loginPassword?.trim()) {
      try {
        const cleanEmail = email.trim().toLowerCase();
        const existing = await query(`SELECT id FROM "User" WHERE email = $1`, [cleanEmail]);

        const hashedPassword = await hashPassword(loginPassword.trim());
        const userRole = loginRole || (isServiceProv ? "STAFF" : "MANAGER");
        const userPerms = Array.isArray(loginPermissions) && loginPermissions.length > 0
          ? loginPermissions
          : isServiceProv
          ? ["attendance", "appointments", "appointments:view", "clients", "clients:view"]
          : [
              "billing", "billing:create", "billing:edit",
              "appointments", "appointments:create", "appointments:edit",
              "clients", "clients:create", "clients:edit",
              "enquiries", "enquiries:create", "enquiries:edit",
              "attendance"
            ];

        if (existing.length > 0) {
          await query(
            `UPDATE "User" SET name = $1, password = $2, role = $3, permissions = $4, "updatedAt" = NOW() WHERE email = $5`,
            [name.trim(), hashedPassword, userRole, userPerms, cleanEmail]
          );
        } else {
          const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const uRows = await query(
            `INSERT INTO "User" (id, name, email, password, role, permissions, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING id, name, email, role, permissions`,
            [userId, name.trim(), cleanEmail, hashedPassword, userRole, userPerms]
          );
          linkedUser = uRows[0];
        }
      } catch (loginErr) {
        console.error("Warning: Failed to create/link login account for staff member:", loginErr);
      }
    }

    return NextResponse.json({ success: true, data: staffRecord, user: linkedUser });
  } catch (err: any) {
    console.error("Error creating unified staff record:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create staff record", detail: err?.detail },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      id,
      name,
      phone,
      email,
      category,
      department,
      type,
      specialization,
      experienceYears,
      commissionService,
      commissionProduct,
      salary,
      hoursStart,
      hoursEnd,
      gender,
      dob,
      joiningDate,
      bloodGroup,
      address,
      emergency,
      emergencyPhone,
      panNumber,
      panDoc,
      aadharNumber,
      aadharDoc,
      photo,
      bankName,
      bankAccount,
      ifscCode,
      upiId,
      // Staff Login Account Linking/Update
      updateLoginAccount,
      loginPassword,
      loginRole,
      loginPermissions
    } = body;

    if (!id) return NextResponse.json({ error: "Staff ID required" }, { status: 400 });

    const rows = await query(
      `UPDATE "ServiceProvider" SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = $3,
        category = COALESCE($4, category),
        department = COALESCE($5, department),
        type = COALESCE($6, type),
        specialization = COALESCE($7, specialization),
        "experienceYears" = COALESCE($8, "experienceYears"),
        "commissionService" = COALESCE($9, "commissionService"),
        "commissionProduct" = COALESCE($10, "commissionProduct"),
        salary = COALESCE($11, salary),
        "hoursStart" = COALESCE($12, "hoursStart"),
        "hoursEnd" = COALESCE($13, "hoursEnd"),
        gender = COALESCE($14, gender),
        dob = $15,
        "joiningDate" = $16,
        "bloodGroup" = $17,
        address = $18,
        emergency = $19,
        "emergencyPhone" = $20,
        "panNumber" = $21,
        "panDoc" = $22,
        "aadharNumber" = $23,
        "aadharDoc" = $24,
        photo = $25,
        "bankName" = $26,
        "bankAccount" = $27,
        "ifscCode" = $28,
        "upiId" = $29,
        "updatedAt" = NOW()
      WHERE id = $30
      RETURNING *`,
      [
        name?.trim(),
        phone?.trim(),
        email ? email.trim() : null,
        category,
        department,
        type,
        specialization,
        experienceYears !== undefined ? Number(experienceYears) : null,
        commissionService !== undefined ? Number(commissionService) : null,
        commissionProduct !== undefined ? Number(commissionProduct) : null,
        salary !== undefined ? Number(salary) : null,
        hoursStart,
        hoursEnd,
        gender,
        dob || null,
        joiningDate || null,
        bloodGroup || null,
        address || null,
        emergency || null,
        emergencyPhone || null,
        panNumber || null,
        panDoc || null,
        aadharNumber || null,
        aadharDoc || null,
        photo || null,
        bankName || null,
        bankAccount || null,
        ifscCode || null,
        upiId || null,
        id
      ]
    );

    const staffRecord = rows[0];

    // ─── CONNECT & UPDATE LOGIN USER ACCOUNT IF REQUESTED ───
    if (updateLoginAccount && email?.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await query(`SELECT id FROM "User" WHERE email = $1`, [cleanEmail]);

      const userRole = loginRole || (category === "Administrative" ? "MANAGER" : "STAFF");
      const userPerms = Array.isArray(loginPermissions)
        ? loginPermissions
        : ["attendance", "appointments", "appointments:view", "clients", "clients:view"];

      if (existing.length > 0) {
        if (loginPassword?.trim()) {
          const hashedPassword = await hashPassword(loginPassword.trim());
          await query(
            `UPDATE "User" SET name = $1, password = $2, role = $3, permissions = $4, "updatedAt" = NOW() WHERE email = $5`,
            [name.trim(), hashedPassword, userRole, userPerms, cleanEmail]
          );
        } else {
          await query(
            `UPDATE "User" SET name = $1, role = $2, permissions = $3, "updatedAt" = NOW() WHERE email = $4`,
            [name.trim(), userRole, userPerms, cleanEmail]
          );
        }
      } else if (loginPassword?.trim()) {
        const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const hashedPassword = await hashPassword(loginPassword.trim());
        await query(
          `INSERT INTO "User" (id, name, email, password, role, permissions, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [userId, name.trim(), cleanEmail, hashedPassword, userRole, userPerms]
        );
      }
    }

    return NextResponse.json({ success: true, data: staffRecord });
  } catch (err: any) {
    console.error("Error updating unified staff record:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update staff record", detail: err?.detail },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await query(`DELETE FROM "ServiceProvider" WHERE id = $1`, [id]);

    return NextResponse.json({ success: true, message: "Staff record removed from unified table" });
  } catch (err: any) {
    console.error("Error deleting staff record:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete staff record", detail: err?.detail },
      { status: 500 }
    );
  }
}
