import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Public GET: Fetch hero slides
export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: slides });
  } catch (error: any) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

// Protected POST: Create hero slide
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { image, alt, tagline, order, isActive } = body;

    const count = await prisma.heroSlide.count();
    const slide = await prisma.heroSlide.create({
      data: {
        image: image || "",
        alt: alt || "Hero Slide",
        tagline: tagline || "",
        order: order !== undefined ? Number(order) : count + 1,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, data: slide });
  } catch (error: any) {
    console.error("Error creating hero slide:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create hero slide" },
      { status: 500 }
    );
  }
}

// Protected PUT: Update hero slide
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, image, alt, tagline, order, isActive } = body;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await prisma.heroSlide.update({
      where: { id },
      data: {
        ...(image && { image }),
        ...(alt && { alt }),
        ...(tagline !== undefined && { tagline }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating hero slide:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update hero slide" },
      { status: 500 }
    );
  }
}

// Protected DELETE: Remove hero slide
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Hero slide deleted" });
  } catch (error: any) {
    console.error("Error deleting hero slide:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}
