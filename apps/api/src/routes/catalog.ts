import { and, asc, count, eq, exists, ilike, type SQL } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";

import { paginationQuerySchema } from "@eco-market/shared";

import database from "@/database/client";
import { producers, products } from "@/database/schema";
import { paginate, toOffset } from "@/lib/pagination";

const idParams = z.object({ id: z.uuid() });

const productFilters = paginationQuerySchema.extend({
  categoryId: z.uuid().optional(),
  producerId: z.uuid().optional(),
  q: z.string().trim().min(1).optional(),
});

const producerFilters = paginationQuerySchema.extend({
  categoryId: z.uuid().optional(),
  q: z.string().trim().min(1).optional(),
});

const activeProductsFilter = (filters: z.infer<typeof productFilters>): SQL | undefined =>
  and(
    eq(products.isActive, true),
    filters.categoryId ? eq(products.categoryId, filters.categoryId) : undefined,
    filters.producerId ? eq(products.producerId, filters.producerId) : undefined,
    filters.q ? ilike(products.name, `%${filters.q}%`) : undefined,
  );

// Public catalog: producers and their active products
export const catalogRoutes = new Elysia({ detail: { tags: ["Catalog"] } })
  .get(
    "/producers",
    async ({ query }) => {
      const filter = and(
        query.q ? ilike(producers.name, `%${query.q}%`) : undefined,
        query.categoryId
          ? exists(
              database
                .select({ id: products.id })
                .from(products)
                .where(
                  and(
                    eq(products.producerId, producers.id),
                    eq(products.categoryId, query.categoryId),
                    eq(products.isActive, true),
                  ),
                ),
            )
          : undefined,
      );
      const [data, [{ total }]] = await Promise.all([
        database
          .select()
          .from(producers)
          .where(filter)
          .orderBy(asc(producers.name))
          .limit(query.pageSize)
          .offset(toOffset(query)),
        database.select({ total: count() }).from(producers).where(filter),
      ]);
      return paginate(data, total, query);
    },
    { query: producerFilters },
  )
  .get(
    "/producers/:id",
    async ({ params: { id }, status }) =>
      (await database.query.producers.findFirst({ where: eq(producers.id, id) })) ??
      status(404, "Producer not found"),
    { params: idParams },
  )
  .get(
    "/products",
    async ({ query }) => {
      const filter = activeProductsFilter(query);
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
    { query: productFilters },
  )
  .get(
    "/products/:id",
    async ({ params: { id }, status }) =>
      (await database.query.products.findFirst({
        where: and(eq(products.id, id), eq(products.isActive, true)),
        with: { producer: true, category: true },
      })) ?? status(404, "Product not found"),
    { params: idParams },
  );
