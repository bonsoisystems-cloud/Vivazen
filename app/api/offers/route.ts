import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Public GET: Fetch all active offers (or all offers if authenticated)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    const session = await getSessionFromRequest(request);
    const where = (!session && !all) ? { isActive: true } : {};

    const offers = await prisma.offer.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

// Protected POST: Create new promotional offer
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, badge, badgeColor, image, serviceSlug, subCategoryName, isActive, order } = body;

    if (!title || !image || !serviceSlug) {
      return NextResponse.json(
        { error: "Title, Image URL, and Service Category are required" },
        { status: 400 }
      );
    }

    const count = await prisma.offer.count();
    const offer = await prisma.offer.create({
      data: {
        title,
        subtitle: subtitle || "",
        badge: badge || "HOT",
        badgeColor: badgeColor || "from-rose-500 to-red-500",
        image,
        serviceSlug,
        subCategoryName: subCategoryName || "",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        order: order !== undefined ? Number(order) : count + 1,
      },
    });

    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}

// Protected PUT: Update existing offer
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, subtitle, badge, badgeColor, image, serviceSlug, subCategoryName, isActive, order } = body;

    if (!id) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(badge && { badge }),
        ...(badgeColor && { badgeColor }),
        ...(image && { image }),
        ...(serviceSlug && { serviceSlug }),
        ...(subCategoryName !== undefined && { subCategoryName }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

// Protected DELETE: Remove offer
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
    }

    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Offer deleted" });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
