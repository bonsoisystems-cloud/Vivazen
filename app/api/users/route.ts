import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Admin-Only: GET all users with permissions
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const users = await query(
      `SELECT id, name, email, role, permissions, "createdAt", "updatedAt" FROM "User" ORDER BY "createdAt" DESC`
    );

    const formatted = users.map(u => ({
      ...u,
      permissions: Array.isArray(u.permissions) ? u.permissions : []
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// Admin-Only: POST create new user with permissions
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role, permissions } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existing = await query(
      `SELECT id FROM "User" WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const permArray = Array.isArray(permissions) ? permissions : [];

    const rows = await query(
      `INSERT INTO "User" (id, name, email, password, role, permissions, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, name, email, role, permissions, "createdAt"`,
      [id, name, email.toLowerCase().trim(), hashedPassword, role || "MANAGER", permArray]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// Admin-Only: PUT update user
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, role, password, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let queryStr = `UPDATE "User" SET "updatedAt" = NOW()`;
    const params: any[] = [];
    let idx = 1;

    if (name) {
      queryStr += `, name = $${idx++}`;
      params.push(name);
    }
    if (email) {
      queryStr += `, email = $${idx++}`;
      params.push(email.toLowerCase().trim());
    }
    if (role) {
      queryStr += `, role = $${idx++}`;
      params.push(role);
    }
    if (password && password.trim().length >= 6) {
      const hashedPassword = await hashPassword(password);
      queryStr += `, password = $${idx++}`;
      params.push(hashedPassword);
    }
    if (permissions !== undefined) {
      queryStr += `, permissions = $${idx++}`;
      params.push(Array.isArray(permissions) ? permissions : []);
    }

    queryStr += ` WHERE id = $${idx} RETURNING id, name, email, role, permissions, "createdAt", "updatedAt"`;
    params.push(id);

    const rows = await query(queryStr, params);
    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// Admin-Only: DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (id === session.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await query(`DELETE FROM "User" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
