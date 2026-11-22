import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { Elysia } from "elysia";

import { checkoutInputSchema } from "@eco-market/shared";

import { authPlugin } from "@/auth/auth.plugin";
import type { Container } from "@/container";
import database from "@/database/client";
import { addresses, orderItems, orders, payments, products } from "@/database/schema";
import { formatAddress, planCheckout } from "@/lib/checkout";
import { findOrder } from "@/lib/orders";

class CheckoutError extends Error {}

export const createCheckoutRoutes = ({ paymentGateway }: Container) =>
  new Elysia({ prefix: "/checkout", detail: { tags: ["Checkout"] } }).use(authPlugin).post(
    "/",
    async ({ user, body, status }) => {
      const address = await database.query.addresses.findFirst({
        where: and(eq(addresses.id, body.addressId), eq(addresses.userId, user.id)),
      });
      if (address === undefined) {
        return status(404, "Address not found");
      }

      try {
        const orderId = await database.transaction(async (tx) => {
          const currentProducts = await tx
            .select()
            .from(products)
            .where(
              inArray(
                products.id,
                body.items.map((item) => item.productId),
              ),
            )
            .for("update");

          const plan = planCheckout(body, currentProducts);
          if (!plan.ok) {
            throw new CheckoutError(plan.error);
          }

          const [order] = await tx
            .insert(orders)
            .values({
              userId: user.id,
              producerId: body.producerId,
              total: plan.total.toFixed(2),
              notes: body.notes,
              deliveryAddress: formatAddress(address),
            })
            .returning();

          await tx.insert(orderItems).values(plan.lines.map((line) => ({ ...line, orderId: order.id })));

          for (const line of plan.lines) {
            await tx
              .update(products)
              .set({ stock: sql`${products.stock} - ${line.quantity}` })
              .where(and(eq(products.id, line.productId), gte(products.stock, line.quantity)));
          }

          const charge = await paymentGateway.charge({
            orderId: order.id,
            amount: plan.total,
            method: body.paymentMethod,
            customer: { id: user.id, name: user.name, email: user.email },
          });

          await tx.insert(payments).values({
            orderId: order.id,
            method: body.paymentMethod,
            status: charge.status,
            amount: plan.total.toFixed(2),
            provider: paymentGateway.name,
            providerReference: charge.providerReference,
            instructions: charge.instructions,
            paidAt: charge.status === "approved" ? new Date() : null,
          });

          if (charge.status === "approved") {
            await tx.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id));
          }

          return order.id;
        });

        return status(201, await findOrder(orderId));
      } catch (error) {
        if (error instanceof CheckoutError) {
          return status(422, error.message);
        }
        throw error;
      }
    },
    { auth: true, body: checkoutInputSchema },
  );
