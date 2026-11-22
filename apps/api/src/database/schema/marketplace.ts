import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { orderStatuses, paymentMethods, paymentStatuses, productUnits } from "@eco-market/shared";

import { users } from "./auth";
import { id, timestamps } from "./base-fields";

export const productUnitEnum = pgEnum("product_unit", productUnits);
export const orderStatusEnum = pgEnum("order_status", orderStatuses);
export const paymentMethodEnum = pgEnum("payment_method", paymentMethods);
export const paymentStatusEnum = pgEnum("payment_status", paymentStatuses);

export const producers = pgTable("producers", {
  id: id(),
  userId: uuid()
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text().notNull(),
  bio: text(),
  phone: text(),
  imageUrl: text(),
  city: text(),
  state: text(),
  ...timestamps,
});

export const productCategories = pgTable("product_categories", {
  id: id(),
  name: text().notNull().unique(),
  description: text(),
  imageUrl: text(),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: id(),
    producerId: uuid()
      .notNull()
      .references(() => producers.id, { onDelete: "cascade" }),
    categoryId: uuid()
      .notNull()
      .references(() => productCategories.id, { onDelete: "restrict" }),
    name: text().notNull(),
    description: text(),
    price: numeric({ precision: 12, scale: 2 }).notNull(),
    unit: productUnitEnum().default("unit").notNull(),
    stock: integer().default(0).notNull(),
    imageUrl: text(),
    isActive: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index("products_producer_id_idx").on(table.producerId),
    index("products_category_id_idx").on(table.categoryId),
  ],
);

export const addresses = pgTable(
  "addresses",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text().notNull(),
    street: text().notNull(),
    number: text().notNull(),
    complement: text(),
    district: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zipCode: text().notNull(),
    isDefault: boolean().default(false).notNull(),
    ...timestamps,
  },
  (table) => [index("addresses_user_id_idx").on(table.userId)],
);

export const orders = pgTable(
  "orders",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    producerId: uuid()
      .notNull()
      .references(() => producers.id, { onDelete: "restrict" }),
    status: orderStatusEnum().default("pending").notNull(),
    total: numeric({ precision: 12, scale: 2 }).notNull(),
    notes: text(),
    // Snapshot of the delivery address at checkout time
    deliveryAddress: text().notNull(),
    ...timestamps,
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_producer_id_idx").on(table.producerId),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    // Snapshot of name and price at checkout time
    productName: text().notNull(),
    unitPrice: numeric({ precision: 12, scale: 2 }).notNull(),
    quantity: integer().notNull(),
    ...timestamps,
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);

export const payments = pgTable(
  "payments",
  {
    id: id(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    method: paymentMethodEnum().notNull(),
    status: paymentStatusEnum().default("pending").notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    provider: text().notNull(),
    providerReference: text(),
    instructions: text(),
    paidAt: timestamp(),
    ...timestamps,
  },
  (table) => [uniqueIndex("payments_order_id_idx").on(table.orderId)],
);
