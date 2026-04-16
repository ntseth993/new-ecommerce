import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const SESSION_ID = "default-session";

const router = Router();

async function getCartData() {
  const items = await db
    .select({
      productId: cartItemsTable.productId,
      productName: productsTable.name,
      price: productsTable.price,
      originalPrice: productsTable.originalPrice,
      imageUrl: productsTable.imageUrl,
      quantity: cartItemsTable.quantity,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, SESSION_ID));

  const mapped = items.map(item => {
    const price = parseFloat(item.price as string);
    const originalPrice = item.originalPrice ? parseFloat(item.originalPrice as string) : undefined;
    return {
      productId: item.productId,
      productName: item.productName ?? "",
      price,
      originalPrice,
      imageUrl: item.imageUrl ?? "",
      quantity: item.quantity,
      subtotal: price * item.quantity,
    };
  });

  const total = mapped.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = mapped.reduce((sum, item) => sum + item.quantity, 0);

  return { items: mapped, total, itemCount };
}

router.get("/", async (req, res) => {
  try {
    const cart = await getCartData();
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Error fetching cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: "Invalid productId or quantity" });
    }

    const [existing] = await db
      .select()
      .from(cartItemsTable)
      .where(and(eq(cartItemsTable.sessionId, SESSION_ID), eq(cartItemsTable.productId, productId)));

    if (existing) {
      await db
        .update(cartItemsTable)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItemsTable.id, existing.id));
    } else {
      await db.insert(cartItemsTable).values({ sessionId: SESSION_ID, productId, quantity });
    }

    const cart = await getCartData();
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Error adding to cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const { quantity } = req.body;

    if (isNaN(productId)) return res.status(400).json({ error: "Invalid productId" });
    if (!quantity || quantity < 1) return res.status(400).json({ error: "Invalid quantity" });

    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(and(eq(cartItemsTable.sessionId, SESSION_ID), eq(cartItemsTable.productId, productId)));

    const cart = await getCartData();
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Error updating cart item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) return res.status(400).json({ error: "Invalid productId" });

    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.sessionId, SESSION_ID), eq(cartItemsTable.productId, productId)));

    const cart = await getCartData();
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Error removing from cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/", async (req, res) => {
  try {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, SESSION_ID));
    res.json({ items: [], total: 0, itemCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Error clearing cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
