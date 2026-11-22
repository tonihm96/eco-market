import { asc, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";

import { productCategoryInputSchema } from "@eco-market/shared";

import { authPlugin } from "@/auth/auth.plugin";
import database from "@/database/client";
import { productCategories } from "@/database/schema";

const params = z.object({ id: z.uuid() });

export const categoriesRoutes = new Elysia({
  prefix: "/categories",
  detail: { tags: ["Categories"] },
})
  .use(authPlugin)
  .get("/", () => database.query.productCategories.findMany({ orderBy: asc(productCategories.name) }))
  .get(
    "/:id",
    async ({ params: { id }, status }) =>
      (await database.query.productCategories.findFirst({ where: eq(productCategories.id, id) })) ??
      status(404, "Category not found"),
    { params },
  )
  .guard({ role: ["admin"] }, (app) =>
    app
      .post(
        "/",
        async ({ body, status }) => {
          const [category] = await database.insert(productCategories).values(body).returning();
          return status(201, category);
        },
        { body: productCategoryInputSchema },
      )
      .patch(
        "/:id",
        async ({ params: { id }, body, status }) => {
          const [category] = await database
            .update(productCategories)
            .set(body)
            .where(eq(productCategories.id, id))
            .returning();
          return category ?? status(404, "Category not found");
        },
        { params, body: productCategoryInputSchema.partial() },
      )
      .delete(
        "/:id",
        async ({ params: { id }, status }) => {
          const [category] = await database
            .delete(productCategories)
            .where(eq(productCategories.id, id))
            .returning({ id: productCategories.id });
          return category === undefined ? status(404, "Category not found") : status(204);
        },
        { params },
      ),
  );
