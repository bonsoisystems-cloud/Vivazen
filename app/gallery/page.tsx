import prisma from "@/lib/prisma";
import GalleryClientView from "./GalleryClientView";

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await prisma.imageAsset.findMany({
    orderBy: { order: "asc" },
  }).catch((err) => {
    console.error("SSR Gallery images fetch error:", err);
    return [];
  });

  return <GalleryClientView initialImages={images} />;
}
