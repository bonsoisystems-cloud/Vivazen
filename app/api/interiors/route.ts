import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Public GET: Fetch interior showcase items
export async function GET() {
  try {
    const interiors = await prisma.interior.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: interiors });
  } catch (error) {
    console.error("Error fetching interiors:", error);
    return NextResponse.json({ error: "Failed to fetch interiors" }, { status: 500 });
  }
}

// Protected POST: Create interior item
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { image, title, desc, order } = body;

    const count = await prisma.interior.count();
    const interior = await prisma.interior.create({
      data: {
        image,
        title: title || "Sanctuary View",
        desc: desc || "",
        order: order !== undefined ? Number(order) : count + 1,
      },
    });

    return NextResponse.json({ success: true, data: interior });
  } catch (error) {
    console.error("Error creating interior item:", error);
    return NextResponse.json({ error: "Failed to create interior item" }, { status: 500 });
  }
}

// Protected PUT: Update interior item
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, image, title, desc, order } = body;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await prisma.interior.update({
      where: { id },
      data: {
        ...(image && { image }),
        ...(title && { title }),
        ...(desc !== undefined && { desc }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating interior item:", error);
    return NextResponse.json({ error: "Failed to update interior item" }, { status: 500 });
  }
}

// Protected DELETE: Remove interior item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.interior.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Interior item deleted" });
  } catch (error) {
    console.error("Error deleting interior item:", error);
    return NextResponse.json({ error: "Failed to delete interior item" }, { status: 500 });
  }
}
