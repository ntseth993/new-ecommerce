import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const SESSION_ID = "default-session";

const router = Router();

async function getOrderWithItems(orderId: number) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId));

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    total: parseFloat(order.total as string),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      price: parseFloat(item.price as string),
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      subtotal: parseFloat(item.subtotal as string),
    })),
  };
}

router.get("/", async (req, res) => {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(ordersTable.createdAt);

    const ordersWithItems = await Promise.all(
      orders.map(o => getOrderWithItems(o.id))
    );

    res.json(ordersWithItems.filter(Boolean));
  } catch (err) {
    req.log.error({ err }, "Error fetching orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { customerName, customerEmail, shippingAddress } = req.body;

    if (!customerName || !customerEmail || !shippingAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cartItems = await db
      .select({
        productId: cartItemsTable.productId,
        productName: productsTable.name,
        price: productsTable.price,
        imageUrl: productsTable.imageUrl,
        quantity: cartItemsTable.quantity,
      })
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.sessionId, SESSION_ID));

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const total = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.price as string) * item.quantity;
    }, 0);

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName,
        customerEmail,
        shippingAddress,
        total: total.toFixed(2),
        status: "pending",
      })
      .returning();

    await db.insert(orderItemsTable).values(
      cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName ?? "",
        price: item.price as string,
        imageUrl: item.imageUrl ?? "",
        quantity: item.quantity,
        subtotal: (parseFloat(item.price as string) * item.quantity).toFixed(2),
      }))
    );

    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, SESSION_ID));

    const result = await getOrderWithItems(order.id);
    res.status(201).json(result);
  } catch (err) {
    req.log.error({ err }, "Error creating order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid order ID" });

    const order = await getOrderWithItems(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    req.log.error({ err }, "Error fetching order");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
