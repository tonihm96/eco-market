import { relations } from "drizzle-orm";

import { accounts, sessions, users } from "./auth";
import {
  addresses,
  orderItems,
  orders,
  payments,
  producers,
  productCategories,
  products,
} from "./marketplace";

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  addresses: many(addresses),
  orders: many(orders),
  producer: one(producers, { fields: [users.id], references: [producers.userId] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const producersRelations = relations(producers, ({ one, many }) => ({
  user: one(users, { fields: [producers.userId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  producer: one(producers, { fields: [products.producerId], references: [producers.id] }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, { fields: [orders.userId], references: [users.id] }),
  producer: one(producers, { fields: [orders.producerId], references: [producers.id] }),
  items: many(orderItems),
  payment: one(payments, { fields: [orders.id], references: [payments.orderId] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));
