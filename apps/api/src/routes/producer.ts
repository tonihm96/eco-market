import { and, asc, count, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";

import {
  orderStatusUpdateSchema,
  paginationQuerySchema,
  producerInputSchema,
  productInputSchema,
} from "@eco-market/shared";

import { authPlugin } from "@/auth/auth.plugin";
import database from "@/database/client";
import { orders, producers, products } from "@/database/schema";
import { canTransition } from "@/lib/order-status";
import { findOrder, findOrders } from "@/lib/orders";
import { paginate, toOffset } from "@/lib/pagination";

const idParams = z.object({ id: z.uuid() });

const findOwnProducer = (userId: string) =>
  database.query.producers.findFirst({ where: eq(producers.userId, userId) });

// Producer back office: storefront, products and received orders
export const producerRoutes = new Elysia({ prefix: "/producer", detail: { tags: ["Producer"] } })
  .use(authPlugin)
  .guard({ role: ["producer"] }, (app) =>
    app
      .resolve(async ({ user }) => {
        const producer = await findOwnProducer(user.id);
        if (producer === undefined) {
          throw new Error("Producer profile not found for user");
        }
        return { producer };
      })
      .get("/profile", ({ producer }) => producer)
      .patch(
        "/profile",
        async ({ producer, body }) => {
          const [updated] = await database
            .update(producers)
            .set(body)
            .where(eq(producers.id, producer.id))
            .returning();
          return updated;
        },
        { body: producerInputSchema.partial() },
      )
      .get(
        "/products",
        async ({ producer, query }) => {
          const filter = eq(products.producerId, producer.id);
          const [data, [{ total }]] = await Promise.all([
            database
              .select()
              .from(products)
              .where(filter)
              .orderBy(asc(products.name))
              .limit(query.pageSize)
              .offset(toOffset(query)),
            database.select({ total: count() }).from(products).where(filter),
          ]);
          return paginate(data, total, query);
        },
        { query: paginationQuerySchema },
      )
      .post(
        "/products",
        async ({ producer, body, status }) => {
          const [product] = await database
            .insert(products)
            .values({ ...body, price: body.price.toFixed(2), producerId: producer.id })
            .returning();
          return status(201, product);
        },
        { body: productInputSchema },
      )
      .patch(
        "/products/:id",
        async ({ producer, params: { id }, body, status }) => {
          const { price, ...rest } = body;
          const [product] = await database
            .update(products)
            .set({ ...rest, ...(price === undefined ? {} : { price: price.toFixed(2) }) })
            .where(and(eq(products.id, id), eq(products.producerId, producer.id)))
            .returning();
          return product ?? status(404, "Product not found");
        },
        { params: idParams, body: productInputSchema.partial() },
      )
      .delete(
        "/products/:id",
        async ({ producer, params: { id }, status }) => {
          // Soft delete: products referenced by orders must be kept
          const [product] = await database
            .update(products)
            .set({ isActive: false })
            .where(and(eq(products.id, id), eq(products.producerId, producer.id)))
            .returning({ id: products.id });
          return product === undefined ? status(404, "Product not found") : status(204);
        },
        { params: idParams },
      )
      .get("/orders", ({ producer, query }) => findOrders(eq(orders.producerId, producer.id), query), {
        query: paginationQuerySchema,
      })
      .patch(
        "/orders/:id/status",
        async ({ producer, params: { id }, body, status }) => {
          const order = await findOrder(id, eq(orders.producerId, producer.id));
          if (order === undefined) {
            return status(404, "Order not found");
          }
          if (!canTransition(order.status, body.status)) {
            return status(409, `Cannot change status from ${order.status} to ${body.status}`);
          }
          await database.update(orders).set({ status: body.status }).where(eq(orders.id, id));
          return findOrder(id);
        },
        { params: idParams, body: orderStatusUpdateSchema },
      ),
  );
