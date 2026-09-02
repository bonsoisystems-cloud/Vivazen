import prisma from "@/lib/prisma";
import ContactClientView from "./ContactClientView";

export const revalidate = 60;

export default async function ContactPage() {
  const [services, packages] = await Promise.all([
    prisma.serviceCategory.findMany({
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
      console.error("SSR Contact services error:", err);
      return [];
    }),
    prisma.servicePackage.findMany({
      orderBy: { order: "asc" },
    }).catch((err) => {
      console.error("SSR Contact packages error:", err);
      return [];
    }),
  ]);

  return <ContactClientView initialServices={services} initialPackages={packages} />;
}
