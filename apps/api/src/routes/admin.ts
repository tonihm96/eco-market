import { asc, count, eq, ilike, or, sum } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";

import {
  orderStatusUpdateSchema,
  paginationQuerySchema,
  userRoleUpdateSchema,
} from "@eco-market/shared";

import { authPlugin } from "@/auth/auth.plugin";
import database from "@/database/client";
import { orders, producers, products, sessions, users } from "@/database/schema";
import { findOrder, findOrders } from "@/lib/orders";
import { paginate, toOffset } from "@/lib/pagination";

const idParams = z.object({ id: z.uuid() });
const searchQuery = paginationQuerySchema.extend({ q: z.string().trim().min(1).optional() });

// Administrative panel API
export const adminRoutes = new Elysia({ prefix: "/admin", detail: { tags: ["Admin"] } })
  .use(authPlugin)
  .guard({ role: ["admin"] }, (app) =>
    app
      .get("/stats", async () => {
        const [[usersCount], [producersCount], [productsCount], [ordersSummary]] = await Promise.all([
          database.select({ value: count() }).from(users),
          database.select({ value: count() }).from(producers),
          database.select({ value: count() }).from(products),
          database.select({ value: count(), revenue: sum(orders.total) }).from(orders),
        ]);
        return {
          users: usersCount.value,
          producers: producersCount.value,
          products: productsCount.value,
          orders: ordersSummary.value,
          revenue: ordersSummary.revenue ?? "0",
        };
      })
      .get(
        "/users",
        async ({ query }) => {
          const filter = query.q
            ? or(ilike(users.name, `%${query.q}%`), ilike(users.email, `%${query.q}%`))
            : undefined;
          const columns = {
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            emailVerified: users.emailVerified,
            banned: users.banned,
            createdAt: users.createdAt,
          };
          const [data, [{ total }]] = await Promise.all([
            database
              .select(columns)
              .from(users)
              .where(filter)
              .orderBy(asc(users.name))
              .limit(query.pageSize)
              .offset(toOffset(query)),
            database.select({ total: count() }).from(users).where(filter),
          ]);
          return paginate(data, total, query);
        },
        { query: searchQuery },
      )
      .patch(
        "/users/:id",
        async ({ params: { id }, body, user, status }) => {
          if (id === user.id) {
            return status(409, "Admins cannot change their own account");
          }
          const updated = await database.transaction(async (tx) => {
            const [row] = await tx
              .update(users)
              .set(body)
              .where(eq(users.id, id))
              .returning({ id: users.id, role: users.role, banned: users.banned });
            if (row === undefined) {
              return undefined;
            }
            if (row.role === "producer") {
              const target = await tx.query.users.findFirst({ where: eq(users.id, id) });
              await tx
                .insert(producers)
                .values({ userId: id, name: target?.name ?? "Produtor" })
                .onConflictDoNothing();
            }
            if (row.banned) {
              await tx.delete(sessions).where(eq(sessions.userId, id));
            }
            return row;
          });
          return updated ?? status(404, "User not found");
        },
        {
          params: idParams,
          body: userRoleUpdateSchema.partial().extend({ banned: z.boolean().optional() }),
        },
      )
      .get(
        "/products",
        async ({ query }) => {
          const filter = query.q ? ilike(products.name, `%${query.q}%`) : undefined;
          const [data, [{ total }]] = await Promise.all([
            database.query.products.findMany({
              where: filter,
              with: { producer: { columns: { id: true, name: true } }, category: { columns: { id: true, name: true } } },
              orderBy: asc(products.name),
              limit: query.pageSize,
              offset: toOffset(query),
            }),
            database.select({ total: count() }).from(products).where(filter),
          ]);
          return paginate(data, total, query);
        },
        { query: searchQuery },
      )
      .patch(
        "/products/:id",
        async ({ params: { id }, body, status }) => {
          const [product] = await database
            .update(products)
            .set(body)
            .where(eq(products.id, id))
            .returning();
          return product ?? status(404, "Product not found");
        },
        { params: idParams, body: z.object({ isActive: z.boolean() }) },
      )
      .get("/orders", ({ query }) => findOrders(undefined, query), { query: paginationQuerySchema })
      .patch(
        "/orders/:id/status",
        async ({ params: { id }, body, status }) => {
          const [order] = await database
            .update(orders)
            .set({ status: body.status })
            .where(eq(orders.id, id))
            .returning({ id: orders.id });
          return order === undefined ? status(404, "Order not found") : findOrder(id);
        },
        { params: idParams, body: orderStatusUpdateSchema },
      ),
  );

