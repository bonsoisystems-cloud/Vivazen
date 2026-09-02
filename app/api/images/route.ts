import { NextRequest, NextResponse } from "next/server";
import prisma, { ImageCategory } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Public GET: Fetch all image assets (with optional category filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category && category !== "ALL"
      ? { category: category as ImageCategory }
      : {};

    const images = await prisma.imageAsset.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// Protected POST: Register new image asset
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, category, alt, detail, order } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Image name and URL are required" },
        { status: 400 }
      );
    }

    const count = await prisma.imageAsset.count();
    const image = await prisma.imageAsset.create({
      data: {
        name,
        url,
        category: (category as ImageCategory) || ImageCategory.OTHER,
        alt: alt || name,
        detail: detail || null,
        order: order !== undefined ? Number(order) : count + 1,
      },
    });

    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    console.error("Error creating image record:", error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}

// Protected PUT: Update image asset
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, url, category, alt, detail, order } = body;

    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    const updated = await prisma.imageAsset.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(url && { url }),
        ...(category && { category: category as ImageCategory }),
        ...(alt !== undefined && { alt }),
        ...(detail !== undefined && { detail }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating image record:", error);
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}

// Protected DELETE: Delete image asset (ADMIN only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Admin can delete images" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    await prisma.imageAsset.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
