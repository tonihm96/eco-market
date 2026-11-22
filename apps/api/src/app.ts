import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { z } from "zod";

import { authPlugin, betterAuthOpenAPI } from "@/auth/auth.plugin";
import type { Container } from "@/container";
import env from "@/env";
import { adminRoutes } from "@/routes/admin";
import { catalogRoutes } from "@/routes/catalog";
import { categoriesRoutes } from "@/routes/categories";
import { createCheckoutRoutes } from "@/routes/checkout";
import { meRoutes } from "@/routes/me";
import { producerRoutes } from "@/routes/producer";

import { version } from "../package.json";

export const createApp = async (container: Container) =>
  new Elysia()
    .use(cors({ origin: env.CORS_ORIGINS, credentials: true }))
    .use(
      openapi({
        path: "/docs",
        mapJsonSchema: { zod: z.toJSONSchema },
        documentation: {
          info: { title: "Eco Market API", version },
          // Better Auth emits OpenAPI 3.1 schemas typed differently from Elysia's OpenAPI types
          components: (await betterAuthOpenAPI.getComponents()) as never,
          paths: await betterAuthOpenAPI.getPaths(),
        },
      }),
    )
    .use(authPlugin)
    .get("/health", () => ({ status: "ok" }), { detail: { tags: ["Health"] } })
    .use(categoriesRoutes)
    .use(catalogRoutes)
    .use(meRoutes)
    .use(producerRoutes)
    .use(createCheckoutRoutes(container))
    .use(adminRoutes);

export type App = Awaited<ReturnType<typeof createApp>>;
