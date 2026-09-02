import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Public GET: Retrieve all services, subcategories, and items
export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        subcategories: {
          orderBy: { order: "asc" },
          include: {
            items: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// Helper function to generate guaranteed unique slug for ServiceCategory
async function getUniqueCategorySlug(baseSlug: string, currentId?: string): Promise<string> {
  let cleanSlug = String(baseSlug || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!cleanSlug) cleanSlug = "category";

  let slugCandidate = cleanSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.serviceCategory.findUnique({
      where: { slug: slugCandidate },
    });

    // If slug is available or already belongs to this exact category, it is safe to use
    if (!existing || (currentId && existing.id === currentId)) {
      return slugCandidate;
    }

    slugCandidate = `${cleanSlug}-${counter}`;
    counter++;
  }
}

// Protected POST: Create new service category
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, icon, desc, gradient, order } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const uniqueSlug = await getUniqueCategorySlug(slug || name);
    const count = await prisma.serviceCategory.count();

    const category = await prisma.serviceCategory.create({
      data: {
        name: String(name).trim(),
        slug: uniqueSlug,
        icon: icon || "https://pub-507869809f114df791179bd7ca34415b.r2.dev/hair-icon.png",
        desc: desc || "",
        gradient: gradient || "from-rose-500/20 to-pink-500/20",
        order: order !== undefined ? Number(order) : count + 1,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error("Error creating service category:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create service category" },
      { status: 500 }
    );
  }
}

// Protected PUT: Update service category
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, icon, desc, gradient, order } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    let cleanSlug: string | undefined = undefined;
    if (slug || name) {
      cleanSlug = await getUniqueCategorySlug(slug || name, id);
    }

    const updated = await prisma.serviceCategory.update({
      where: { id },
      data: {
        ...(name && { name: String(name).trim() }),
        ...(cleanSlug && { slug: cleanSlug }),
        ...(icon !== undefined && { icon }),
        ...(desc !== undefined && { desc }),
        ...(gradient !== undefined && { gradient }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating service category:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update service category" },
      { status: 500 }
    );
  }
}

// Protected DELETE: Remove service category (ADMIN only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Admin can delete categories" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    await prisma.serviceCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting service category:", error);
    return NextResponse.json(
      { error: "Failed to delete service category" },
      { status: 500 }
    );
  }
}
