import { db } from "@/prisma/db";

export type Role = "ADMIN" | "MANAGER";
export const Role = {
  ADMIN: "ADMIN" as const,
  MANAGER: "MANAGER" as const,
};

export type ImageCategory =
  | "HERO"
  | "GALLERY_HAIR"
  | "GALLERY_BRIDAL"
  | "GALLERY_NAIL"
  | "GALLERY_SKIN"
  | "GALLERY_MAKEUP"
  | "INTERIOR"
  | "OFFER"
  | "SERVICE_ICON"
  | "OTHER";

export const ImageCategory = {
  HERO: "HERO" as const,
  GALLERY_HAIR: "GALLERY_HAIR" as const,
  GALLERY_BRIDAL: "GALLERY_BRIDAL" as const,
  GALLERY_NAIL: "GALLERY_NAIL" as const,
  GALLERY_SKIN: "GALLERY_SKIN" as const,
  GALLERY_MAKEUP: "GALLERY_MAKEUP" as const,
  INTERIOR: "INTERIOR" as const,
  OFFER: "OFFER" as const,
  SERVICE_ICON: "SERVICE_ICON" as const,
  OTHER: "OTHER" as const,
};

// Helper model adapter over Prisma 8 db.orm.public with dynamic resolution
const orm: any = new Proxy({}, {
  get(_target, prop) {
    return (db.orm as any).public[prop];
  }
});

export const prisma = {
  user: {
    findUnique: async ({ where, select }: { where: { email?: string; id?: string }; select?: any }) => {
      const q = orm.User.select("id", "name", "email", "password", "role", "createdAt", "updatedAt");
      if (where.email) {
        return (await q.where((u: any) => u.email.eq(where.email)).all())[0] || null;
      }
      if (where.id) {
        return (await q.where((u: any) => u.id.eq(where.id)).all())[0] || null;
      }
      return null;
    },
    findMany: async ({ orderBy, select }: any = {}) => {
      let q = orm.User.select("id", "name", "email", "role", "createdAt", "updatedAt");
      if (orderBy?.createdAt === "desc") {
        q = q.orderBy((u: any) => u.createdAt.desc());
      }
      return await q.all();
    },
    count: async () => {
      const all = await orm.User.select("id").all();
      return all.length;
    },
    create: async ({ data, select }: { data: any; select?: any }) => {
      const id = data.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return await orm.User.create({
        id,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || "MANAGER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    update: async ({ where, data, select }: { where: { id?: string; email?: string }; data: any; select?: any }) => {
      const target = where.id
        ? (u: any) => u.id.eq(where.id)
        : (u: any) => u.email.eq(where.email);
      await orm.User.where(target).update({
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.password && { password: data.password }),
        ...(data.role && { role: data.role }),
        updatedAt: new Date().toISOString(),
      });
      return await orm.User.select("id", "name", "email", "role").where(target).all().then((r: any) => r[0]);
    },
    upsert: async ({ where, update, create }: { where: { email: string }; update: any; create: any }) => {
      const existing = (await orm.User.select("id", "name", "email", "role").where((u: any) => u.email.eq(where.email)).all())[0];
      if (existing) {
        await orm.User.where((u: any) => u.email.eq(where.email)).update({
          ...(update.name && { name: update.name }),
          ...(update.password && { password: update.password }),
          ...(update.role && { role: update.role }),
          updatedAt: new Date().toISOString(),
        });
        return { ...existing, ...update };
      } else {
        const id = create.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        return await orm.User.create({
          id,
          name: create.name,
          email: create.email,
          password: create.password,
          role: create.role || "MANAGER",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return await orm.User.where((u: any) => u.id.eq(where.id)).delete();
    },
    deleteMany: async (_params?: any) => {
      return await orm.User.delete();
    },
  },

  imageAsset: {
    findMany: async ({ where, orderBy }: any = {}) => {
      let q = orm.ImageAsset.select("id", "name", "url", "category", "alt", "detail", "order", "createdAt", "updatedAt");
      if (where?.category) {
        q = q.where((img: any) => img.category.eq(where.category));
      }
      if (orderBy?.order === "asc") {
        q = q.orderBy((img: any) => img.order.asc());
      }
      return await q.all();
    },
    count: async () => {
      const all = await orm.ImageAsset.select("id").all();
      return all.length;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return await orm.ImageAsset.create({
        id,
        name: data.name,
        url: data.url,
        category: data.category || "OTHER",
        alt: data.alt || null,
        detail: data.detail || null,
        order: data.order !== undefined ? Number(data.order) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      await orm.ImageAsset.where((img: any) => img.id.eq(where.id)).update({
        ...(data.name && { name: data.name }),
        ...(data.url && { url: data.url }),
        ...(data.category && { category: data.category }),
        ...(data.alt !== undefined && { alt: data.alt }),
        ...(data.detail !== undefined && { detail: data.detail }),
        ...(data.order !== undefined && { order: Number(data.order) }),
        updatedAt: new Date().toISOString(),
      });
      return await orm.ImageAsset.select("id", "name", "url", "category").where((img: any) => img.id.eq(where.id)).all().then((r: any) => r[0]);
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return await orm.ImageAsset.where((img: any) => img.id.eq(where.id)).delete();
    },
    deleteMany: async (_params?: any) => {
      return await orm.ImageAsset.delete();
    },
  },

  offer: {
    findMany: async ({ where, orderBy }: any = {}) => {
      let q = orm.Offer.select("id", "title", "subtitle", "badge", "badgeColor", "image", "serviceSlug", "subCategoryName", "isActive", "order", "createdAt", "updatedAt");
      if (where?.isActive !== undefined) {
        q = q.where((o: any) => o.isActive.eq(where.isActive));
      }
      if (orderBy?.order === "asc") {
        q = q.orderBy((o: any) => o.order.asc());
      }
      return await q.all();
    },
    count: async () => {
      const all = await orm.Offer.select("id").all();
      return all.length;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || `off_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return await orm.Offer.create({
        id,
        title: data.title,
        subtitle: data.subtitle,
        badge: data.badge || "HOT",
        badgeColor: data.badgeColor || "from-rose-500 to-red-500",
        image: data.image,
        serviceSlug: data.serviceSlug || "services",
        subCategoryName: data.subCategoryName || "General",
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        order: data.order !== undefined ? Number(data.order) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      await orm.Offer.where((o: any) => o.id.eq(where.id)).update({
        ...(data.title && { title: data.title }),
        ...(data.subtitle && { subtitle: data.subtitle }),
        ...(data.badge && { badge: data.badge }),
        ...(data.badgeColor && { badgeColor: data.badgeColor }),
        ...(data.image && { image: data.image }),
        ...(data.serviceSlug && { serviceSlug: data.serviceSlug }),
        ...(data.subCategoryName && { subCategoryName: data.subCategoryName }),
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
        ...(data.order !== undefined && { order: Number(data.order) }),
        updatedAt: new Date().toISOString(),
      });
      return await orm.Offer.select("id", "title").where((o: any) => o.id.eq(where.id)).all().then((r: any) => r[0]);
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return await orm.Offer.where((o: any) => o.id.eq(where.id)).delete();
    },
    deleteMany: async (_params?: any) => {
      return await orm.Offer.delete();
    },
  },

  serviceCategory: {
    findMany: async ({ orderBy, include }: any = {}) => {
      let q = orm.ServiceCategory.select("id", "slug", "name", "icon", "desc", "gradient", "order", "createdAt", "updatedAt");
      if (orderBy?.order === "asc") {
        q = q.orderBy((c: any) => c.order.asc());
      }
      const categories = await q.all();
      if (include?.subcategories) {
        const subCategories = await orm.SubCategory.select("id", "categoryId", "name", "order").orderBy((s: any) => s.order.asc()).all();
        const items = await orm.ServiceItem.select("id", "subCategoryId", "name", "price", "desc", "order").orderBy((i: any) => i.order.asc()).all();

        return categories.map((cat: any) => ({
          ...cat,
          subcategories: subCategories
            .filter((sub: any) => sub.categoryId === cat.id)
            .map((sub: any) => ({
              ...sub,
              items: items.filter((itm: any) => itm.subCategoryId === sub.id),
            })),
        }));
      }
      return categories;
    },
    count: async () => {
      const all = await orm.ServiceCategory.select("id").all();
      return all.length;
    },
    findUnique: async ({ where }: { where: { slug?: string; id?: string } }) => {
      const q = orm.ServiceCategory.select("id", "slug", "name", "icon", "desc", "gradient", "order", "createdAt", "updatedAt");
      if (where.slug) {
        return (await q.where((c: any) => c.slug.eq(where.slug)).all())[0] || null;
      }
      if (where.id) {
        return (await q.where((c: any) => c.id.eq(where.id)).all())[0] || null;
      }
      return null;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return await orm.ServiceCategory.create({
        id,
        slug: data.slug,
        name: data.name,
        icon: data.icon || "",
        desc: data.desc || "",
        gradient: data.gradient || "from-rose-500/20 to-pink-500/20",
        order: data.order !== undefined ? Number(data.order) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      await orm.ServiceCategory.where((c: any) => c.id.eq(where.id)).update({
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.desc !== undefined && { desc: data.desc }),
        ...(data.gradient && { gradient: data.gradient }),
        ...(data.order !== undefined && { order: Number(data.order) }),
        updatedAt: new Date().toISOString(),
      });
      return await orm.ServiceCategory.select("id", "name", "slug").where((c: any) => c.id.eq(where.id)).all().then((r: any) => r[0]);
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return await orm.ServiceCategory.where((c: any) => c.id.eq(where.id)).delete();
    },
    deleteMany: async (_params?: any) => {
      return await orm.ServiceCategory.delete();
    },
  },

  subCategory: {
    findMany: async () => {
      return await orm.SubCategory.select("id", "categoryId", "name", "order", "createdAt", "updatedAt").all();
    },
    count: async ({ where }: any = {}) => {
      let q = orm.SubCategory.select("id");
      if (where?.categoryId) {
        q = q.where((s: any) => s.categoryId.eq(where.categoryId));
      }
      const all = await q.all();
      return all.length;
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = data.id || `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const created = await orm.SubCategory.create({
        id,
        categoryId: data.categoryId,
        name: data.name,
        order: data.order !== undefined ? Number(data.order) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { ...created, items: [] };
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      await orm.SubCategory.where((s: any) => s.id.eq(where.id)).update({
        ...(data.name && { name: data.name }),
        ...(data.order !== undefined && { order: Number(data.order) }),
        updatedAt: new Date().toISOString(),
      });
      return await orm.SubCategory.select("id", "name").where((s: any) => s.id.eq(where.id)).all().then((r: any) => r[0]);
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return await orm.SubCategory.where((s: any) => s.id.eq(where.id)).delete();
    },
    deleteMany: async (_params?: any) => {
      return await orm.SubCategory.delete();
    },
  },

  serviceItem: {
    findMany: async () => {
      return await orm.ServiceItem.select("id", "subCategoryId", "name", "price", "desc", "order", "createdAt", "updatedAt").all();
    },
    count: async ({ where }: any = {}) => {
      let q = orm.ServiceItem.select("id");
      if (where?.subCategoryId) {
        q = q.where((i: any) => i.subCategoryId.eq(where.subCategoryId));
      }
      const all = await q.all();
      return all.length;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || `itm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return await orm.ServiceItem.create({
        id,
        subCategoryId: data.subCategoryId,
        name: data.name,
        price: Number(data.price),
        desc: data.desc || null,
        order: data.order !== undefined ? Number(data.order) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      await orm.ServiceItem.where((i: any) => i.id.eq(where.id)).update({
        ...(data.name && { name: data.name }),
        ...(data.price !== undefined && { price: Number(data.price) }),
        ...(data.desc !== undefined && { desc: data.desc }),
        ...(data.order !== undefined && { order: Number(data.order) }),
        updatedAt: new Date().toISOString(),
      });
      return await orm.ServiceItem.select("id", "name", "price").where((i: any) => i.id.eq(where.id)).all().then((r: any) => r[0]);
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return await orm.ServiceItem.where((i: any) => i.id.eq(where.id)).delete();
    },
    deleteMany: async (_params?: any) => {
      return await orm.ServiceItem.delete();
    },
  },

  servicePackage: {
    findMany: async ({ orderBy }: any = {}) => {
      let q = orm.ServicePackage.select("id", "name", "originalPrice", "price", "items", "order", "createdAt", "updatedAt");
      if (orderBy?.order === "asc") {
        q = q.orderBy((p: any) => p.order.asc());
      }
      return await q.all();
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return await orm.ServicePackage.create({
        id,
        name: data.name,
        originalPrice: data.originalPrice,
        price: data.price,
        items: data.items,
        order: data.order !== undefined ? Number(data.order) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      await orm.ServicePackage.where((p: any) => p.id.eq(where.id)).update({
        ...(data.name && { name: data.name }),
        ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.items && { items: data.items }),
        ...(data.order !== undefined && { order: Number(data.order) }),
        updatedAt: new Date().toISOString(),
      });
      return await orm.ServicePackage.select("id", "name", "price").where((p: any) => p.id.eq(where.id)).all().then((r: any) => r[0]);
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return await orm.ServicePackage.where((p: any) => p.id.eq(where.id)).delete();
    },
    deleteMany: async (_params?: any) => {
      return await orm.ServicePackage.delete();
    },
  },

  heroSlide: {
    findMany: async ({ where, orderBy }: any = {}) => {
      let q = orm.HeroSlide.select("id", "image", "alt", "tagline", "order", "isActive", "createdAt", "updatedAt");
      if (where?.isActive !== undefined) {
        q = q.where((h: any) => h.isActive.eq(where.isActive));
      }
      if (orderBy?.order === "asc") {
        q = q.orderBy((h: any) => h.order.asc());
      }
      return await q.all();
    },
    count: async () => {
      const all = await orm.HeroSlide.select("id").all();
      return all.length;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || `hero_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return await orm.HeroSlide.create({
        id,
        image: data.image,
        alt: data.alt || "Hero Slide",
        tagline: data.tagline || "",
        order: data.order !== undefined ? Number(data.order) : 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      await orm.HeroSlide.where((h: any) => h.id.eq(where.id)).update({
        ...(data.image && { image: data.image }),
        ...(data.alt && { alt: data.alt }),
        ...(data.tagline !== undefined && { tagline: data.tagline }),
        ...(data.order !== undefined && { order: Number(data.order) }),
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
        updatedAt: new Date().toISOString(),
      });
      return await orm.HeroSlide.select("id", "alt").where((h: any) => h.id.eq(where.id)).all().then((r: any) => r[0]);
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return await orm.HeroSlide.where((h: any) => h.id.eq(where.id)).delete();
    },
    deleteMany: async (_params?: any) => {
      return await orm.HeroSlide.delete();
    },
  },

  interior: {
    findMany: async ({ orderBy }: any = {}) => {
      let q = orm.Interior.select("id", "image", "title", "desc", "order", "createdAt", "updatedAt");
      if (orderBy?.order === "asc") {
        q = q.orderBy((i: any) => i.order.asc());
      }
      return await q.all();
    },
    count: async () => {
      const all = await orm.Interior.select("id").all();
      return all.length;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || `int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return await orm.Interior.create({
        id,
        image: data.image,
        title: data.title,
        desc: data.desc || "",
        order: data.order !== undefined ? Number(data.order) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      await orm.Interior.where((i: any) => i.id.eq(where.id)).update({
        ...(data.image && { image: data.image }),
        ...(data.title && { title: data.title }),
        ...(data.desc !== undefined && { desc: data.desc }),
        ...(data.order !== undefined && { order: Number(data.order) }),
        updatedAt: new Date().toISOString(),
      });
      return await orm.Interior.select("id", "title").where((i: any) => i.id.eq(where.id)).all().then((r: any) => r[0]);
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return await orm.Interior.where((i: any) => i.id.eq(where.id)).delete();
    },
    deleteMany: async (_params?: any) => {
      return await orm.Interior.delete();
    },
  },
};

export { db };
export default prisma;
