import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Public GET: Fetch all packages
export async function GET() {
  try {
    const packages = await prisma.servicePackage.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: packages });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

// Protected POST: Create a package
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, price, originalPrice, items, order } = body;

    if (!name || !price) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const pkg = await prisma.servicePackage.create({
      data: {
        name,
        price: String(price),
        originalPrice: originalPrice ? String(originalPrice) : String(price),
        items: items || [],
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json({ success: true, data: pkg }, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json({ success: false, error: "Failed to create package" }, { status: 500 });
  }
}

// Protected PUT: Update a package
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, price, originalPrice, items, order } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing package ID" }, { status: 400 });
    }

    const updated = await prisma.servicePackage.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: String(price) }),
        ...(originalPrice !== undefined && { originalPrice: String(originalPrice) }),
        ...(items !== undefined && { items }),
        ...(order !== undefined && { order: parseInt(order) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json({ success: false, error: "Failed to update package" }, { status: 500 });
  }
}

// Protected DELETE: Remove a package
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing package ID" }, { status: 400 });
    }

    await prisma.servicePackage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json({ success: false, error: "Failed to delete package" }, { status: 500 });
  }
}
