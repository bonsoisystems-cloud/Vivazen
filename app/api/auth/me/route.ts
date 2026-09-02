import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const rows = await query(
      `SELECT id, name, email, role, permissions, "createdAt" FROM "User" WHERE id = $1`,
      [session.id]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
      },
    });
  } catch (error) {
    console.error("Auth session error:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
