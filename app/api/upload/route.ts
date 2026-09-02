import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import prisma, { ImageCategory } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let file: File | null = null;
    let category = "OTHER";
    let title = "";
    let detail = "";
    let directUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      file = formData.get("file") as File | null;
      category = (formData.get("category") as string) || "OTHER";
      title = (formData.get("title") as string) || "";
      detail = (formData.get("detail") as string) || "";
      directUrl = (formData.get("url") as string) || "";
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      directUrl = json.url || "";
      category = json.category || "OTHER";
      title = json.title || "";
      detail = json.detail || "";
    }

    let publicUrl = directUrl;

    if (file) {
      // Validate image and document formats (JPG, PNG, WebP, SVG, GIF, PDF)
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
        "image/svg+xml",
        "image/gif",
        "application/pdf"
      ];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Invalid file type. Please upload a JPG, PNG, WebP, SVG image or PDF document." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Validate file size: Image 20-50 KB for KYC/Staff, PDF max 500 KB
      const sizeInKb = buffer.length / 1024;
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImage = file.type.startsWith("image/");

      if (isImage && (category.startsWith("KYC") || category.startsWith("STAFF") || category === "STAFF_AVATAR")) {
        if (sizeInKb < 20) {
          return NextResponse.json(
            { success: false, error: `Image size (${sizeInKb.toFixed(1)} KB) is too small. Please upload an image between 20 KB and 50 KB.` },
            { status: 400 }
          );
        }
        if (sizeInKb > 50) {
          return NextResponse.json(
            { success: false, error: `Image size (${sizeInKb.toFixed(1)} KB) exceeds 50 KB limit. Please upload an image between 20 KB and 50 KB.` },
            { status: 400 }
          );
        }
      }

      if (isPdf) {
        if (sizeInKb > 500) {
          return NextResponse.json(
            { success: false, error: `PDF size (${sizeInKb.toFixed(1)} KB) exceeds 500 KB limit. Please upload a PDF under 500 KB.` },
            { status: 400 }
          );
        }
      }

      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `${timestamp}-${cleanFileName}`;

      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, uniqueFileName);
        await writeFile(filePath, buffer);
        
        // If R2 public endpoint configured, return full R2 url, otherwise relative /uploads/
        const r2Base = process.env.NEXT_PUBLIC_R2_IMAGE_BASE_URL || "";
        if (r2Base && r2Base.startsWith("http")) {
          // If direct R2 dev bucket is mapped, return relative path that frontend loads
          publicUrl = `/uploads/${uniqueFileName}`;
        } else {
          publicUrl = `/uploads/${uniqueFileName}`;
        }
      } catch (fsError) {
        console.warn("Local filesystem write not available. Using Data URI encoding:", fsError);
        publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      }
    }

    if (!publicUrl) {
      return NextResponse.json({ success: false, error: "No image file or URL provided" }, { status: 400 });
    }

    // Map category string to ImageCategory enum
    let dbCategory: ImageCategory = ImageCategory.OTHER;
    if (Object.values(ImageCategory).includes(category as ImageCategory)) {
      dbCategory = category as ImageCategory;
    }

    // Register asset in Database
    const asset = await prisma.imageAsset.create({
      data: {
        name: title || (file ? file.name.replace(/\.[^/.]+$/, "") : "Image Asset"),
        url: publicUrl,
        category: dbCategory,
        alt: title || (file ? file.name : "Image"),
        detail: detail || null,
        order: 0,
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      asset,
      message: "Image uploaded and registered successfully",
    });
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
