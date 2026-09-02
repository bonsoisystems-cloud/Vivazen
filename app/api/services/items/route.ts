import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Protected POST: Create SubCategory or ServiceItem
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const typeStr = String(body.type || "").toLowerCase();

    if (typeStr === "subcategory") {
      const { categoryId, name, order } = body;
      if (!categoryId || !name) {
        return NextResponse.json(
          { error: "Category ID and Subcategory Name are required" },
          { status: 400 }
        );
      }

      const count = await prisma.subCategory.count({ where: { categoryId } });
      const subCategory = await prisma.subCategory.create({
        data: {
          categoryId,
          name: String(name).trim(),
          order: order !== undefined ? Number(order) : count + 1,
        },
        include: { items: true },
      });
      return NextResponse.json({ success: true, data: subCategory });
    } else {
      // Create ServiceItem
      const { subCategoryId, name, price, duration, membershipPrice, rewardPoints, serviceFor, desc, order } = body;
      if (!subCategoryId || !name || price === undefined) {
        return NextResponse.json(
          { error: "Subcategory ID, Item Name, and Price are required" },
          { status: 400 }
        );
      }

      const count = await prisma.serviceItem.count({ where: { subCategoryId } });
      const item = await prisma.serviceItem.create({
        data: {
          subCategoryId,
          name: String(name).trim(),
          price: Number(price),
          duration: duration !== undefined ? Number(duration) : 30,
          membershipPrice: membershipPrice ? Number(membershipPrice) : null,
          rewardPoints: rewardPoints !== undefined ? Number(rewardPoints) : 0,
          serviceFor: serviceFor || "Female",
          desc: desc || null,
          order: order !== undefined ? Number(order) : count + 1,
        },
      });
      return NextResponse.json({ success: true, data: item });
    }
  } catch (error) {
    console.error("Error creating subcategory/item:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}

// Protected PUT: Update SubCategory or ServiceItem (especially price updates)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    const typeStr = String(body.type || "").toLowerCase();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (typeStr === "subcategory") {
      const { name, order } = body;
      const updated = await prisma.subCategory.update({
        where: { id },
        data: {
          ...(name && { name: String(name).trim() }),
          ...(order !== undefined && { order: Number(order) }),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      // Update Service Item (price, name, duration, etc.)
      const { name, price, duration, membershipPrice, rewardPoints, serviceFor, desc, order, subCategoryId } = body;
      const updated = await prisma.serviceItem.update({
        where: { id },
        data: {
          ...(name && { name: String(name).trim() }),
          ...(price !== undefined && { price: Number(price) }),
          ...(duration !== undefined && { duration: Number(duration) }),
          ...(membershipPrice !== undefined && { membershipPrice: membershipPrice ? Number(membershipPrice) : null }),
          ...(rewardPoints !== undefined && { rewardPoints: Number(rewardPoints) }),
          ...(serviceFor && { serviceFor }),
          ...(desc !== undefined && { desc: desc || null }),
          ...(order !== undefined && { order: Number(order) }),
          ...(subCategoryId && { subCategoryId }),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error) {
    console.error("Error updating subcategory/item:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

// Protected DELETE: Remove SubCategory or ServiceItem
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeStr = String(searchParams.get("type") || "").toLowerCase();
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (typeStr === "subcategory") {
      if (session.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Only Admin can delete subcategories" },
          { status: 403 }
        );
      }
      await prisma.subCategory.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Subcategory deleted" });
    } else {
      // Deleting service item allowed for Admin & Manager
      await prisma.serviceItem.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Service item deleted" });
    }
  } catch (error) {
    console.error("Error deleting subcategory/item:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
