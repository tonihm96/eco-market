import { and, count, desc, eq, type SQL } from "drizzle-orm";

import type { PaginationQuery } from "@eco-market/shared";

import database from "@/database/client";
import { orders } from "@/database/schema";

import { paginate, toOffset } from "./pagination";

const orderWith = {
  items: {
    columns: { id: true, productId: true, productName: true, unitPrice: true, quantity: true },
  },
  payment: {
    columns: {
      id: true,
      method: true,
      status: true,
      amount: true,
      provider: true,
      providerReference: true,
      instructions: true,
    },
  },
  producer: { columns: { id: true, name: true } },
  customer: { columns: { id: true, name: true, email: true } },
} as const;

export const findOrders = async (filter: SQL | undefined, pagination: PaginationQuery) => {
  const [data, [{ total }]] = await Promise.all([
    database.query.orders.findMany({
      where: filter,
      with: orderWith,
      orderBy: desc(orders.createdAt),
      limit: pagination.pageSize,
      offset: toOffset(pagination),
    }),
    database.select({ total: count() }).from(orders).where(filter),
  ]);
  return paginate(data, total, pagination);
};

export const findOrder = (orderId: string, filter?: SQL) =>
  database.query.orders.findFirst({
    where: and(eq(orders.id, orderId), filter),
    with: orderWith,
  });
