import { and, asc, desc, eq, ne } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";

import { addressInputSchema, paginationQuerySchema } from "@eco-market/shared";

import { authPlugin } from "@/auth/auth.plugin";
import database from "@/database/client";
import { addresses, orders } from "@/database/schema";
import { findOrder, findOrders } from "@/lib/orders";

const idParams = z.object({ id: z.uuid() });

// Routes for any signed-in user (consumer profile, addresses, own orders)
export const meRoutes = new Elysia({ prefix: "/me", detail: { tags: ["Me"] } })
  .use(authPlugin)
  .guard({ auth: true }, (app) =>
    app
      .get("/", ({ user }) => user)
      .get("/addresses", ({ user }) =>
        database.query.addresses.findMany({
          where: eq(addresses.userId, user.id),
          orderBy: [desc(addresses.isDefault), asc(addresses.label)],
        }),
      )
      .post(
        "/addresses",
        ({ user, body, status }) =>
          database.transaction(async (tx) => {
            const existing = await tx.$count(addresses, eq(addresses.userId, user.id));
            const isDefault = body.isDefault || existing === 0;
            if (isDefault) {
              await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
            }
            const [address] = await tx
              .insert(addresses)
              .values({ ...body, isDefault, userId: user.id })
              .returning();
            return status(201, address);
          }),
        { body: addressInputSchema },
      )
      .patch(
        "/addresses/:id",
        ({ user, params: { id }, body, status }) =>
          database.transaction(async (tx) => {
            if (body.isDefault === true) {
              await tx
                .update(addresses)
                .set({ isDefault: false })
                .where(and(eq(addresses.userId, user.id), ne(addresses.id, id)));
            }
            const [address] = await tx
              .update(addresses)
              .set(body)
              .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
              .returning();
            return address ?? status(404, "Address not found");
          }),
        { params: idParams, body: addressInputSchema.partial() },
      )
      .delete(
        "/addresses/:id",
        async ({ user, params: { id }, status }) => {
          const [address] = await database
            .delete(addresses)
            .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
            .returning({ id: addresses.id });
          return address === undefined ? status(404, "Address not found") : status(204);
        },
        { params: idParams },
      )
      .get("/orders", ({ user, query }) => findOrders(eq(orders.userId, user.id), query), {
        query: paginationQuerySchema,
      })
      .get(
        "/orders/:id",
        async ({ user, params: { id }, status }) =>
          (await findOrder(id, eq(orders.userId, user.id))) ?? status(404, "Order not found"),
        { params: idParams },
      ),
  );
