import { pgTable, serial, integer, text, numeric } from "drizzle-orm/pg-core";
import { productsTable } from "./products";

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export type CartItem = typeof cartItemsTable.$inferSelect;
