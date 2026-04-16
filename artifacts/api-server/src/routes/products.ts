import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, like, or, ilike, asc, desc, and, sql } from "drizzle-orm";

const router = Router();

router.get("/featured", async (req, res) => {
  try {
    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        imageUrl: productsTable.imageUrl,
        images: productsTable.images,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        stock: productsTable.stock,
        rating: productsTable.rating,
        reviewCount: productsTable.reviewCount,
        isFeatured: productsTable.isFeatured,
        isNew: productsTable.isNew,
        badge: productsTable.badge,
        tags: productsTable.tags,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.isFeatured, true))
      .limit(6);

    res.json(products.map(p => ({
      ...p,
      price: parseFloat(p.price as string),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice as string) : undefined,
      rating: parseFloat(p.rating as string),
      categoryName: p.categoryName ?? "",
    })));
  } catch (err) {
    req.log.error({ err }, "Error fetching featured products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
    const [categories] = await db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable);
    const [newArrivals] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.isNew, true));
    const [onSale] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(sql`${productsTable.originalPrice} IS NOT NULL`);
    const [topRated] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(sql`${productsTable.rating}::numeric >= 4.5`);

    res.json({
      totalProducts: total.count,
      totalCategories: categories.count,
      newArrivals: newArrivals.count,
      onSaleCount: onSale.count,
      topRatedCount: topRated.count,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching products summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { category, search, page = "1", limit = "12", sort } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 12, 50);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (category) {
      conditions.push(eq(categoriesTable.slug, category));
    }
    if (search) {
      conditions.push(
        or(
          ilike(productsTable.name, `%${search}%`),
          ilike(productsTable.description, `%${search}%`)
        )!
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy;
    switch (sort) {
      case "price_asc":
        orderBy = asc(sql`${productsTable.price}::numeric`);
        break;
      case "price_desc":
        orderBy = desc(sql`${productsTable.price}::numeric`);
        break;
      case "popular":
        orderBy = desc(productsTable.reviewCount);
        break;
      case "newest":
      default:
        orderBy = desc(productsTable.id);
        break;
    }

    const baseQuery = db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        imageUrl: productsTable.imageUrl,
        images: productsTable.images,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        stock: productsTable.stock,
        rating: productsTable.rating,
        reviewCount: productsTable.reviewCount,
        isFeatured: productsTable.isFeatured,
        isNew: productsTable.isNew,
        badge: productsTable.badge,
        tags: productsTable.tags,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where);

    const products = await baseQuery
      .where(where)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    res.json({
      products: products.map(p => ({
        ...p,
        price: parseFloat(p.price as string),
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice as string) : undefined,
        rating: parseFloat(p.rating as string),
        categoryName: p.categoryName ?? "",
      })),
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const [product] = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        imageUrl: productsTable.imageUrl,
        images: productsTable.images,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        stock: productsTable.stock,
        rating: productsTable.rating,
        reviewCount: productsTable.reviewCount,
        isFeatured: productsTable.isFeatured,
        isNew: productsTable.isNew,
        badge: productsTable.badge,
        tags: productsTable.tags,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id));

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      ...product,
      price: parseFloat(product.price as string),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice as string) : undefined,
      rating: parseFloat(product.rating as string),
      categoryName: product.categoryName ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/related", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const [product] = await db
      .select({ categoryId: productsTable.categoryId })
      .from(productsTable)
      .where(eq(productsTable.id, id));

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const related = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        imageUrl: productsTable.imageUrl,
        images: productsTable.images,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        stock: productsTable.stock,
        rating: productsTable.rating,
        reviewCount: productsTable.reviewCount,
        isFeatured: productsTable.isFeatured,
        isNew: productsTable.isNew,
        badge: productsTable.badge,
        tags: productsTable.tags,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(
        eq(productsTable.categoryId, product.categoryId),
        sql`${productsTable.id} != ${id}`
      ))
      .limit(4);

    res.json(related.map(p => ({
      ...p,
      price: parseFloat(p.price as string),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice as string) : undefined,
      rating: parseFloat(p.rating as string),
      categoryName: p.categoryName ?? "",
    })));
  } catch (err) {
    req.log.error({ err }, "Error fetching related products");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
