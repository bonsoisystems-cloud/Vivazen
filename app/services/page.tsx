import prisma from "@/lib/prisma";
import ServicesClientView from "./ServicesClientView";

export const revalidate = 60;

export default async function ServicesPage() {
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
  }).catch((err) => {
    console.error("SSR Services fetch error:", err);
    return [];
  });

  return <ServicesClientView initialServices={categories} />;
}
