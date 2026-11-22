import { Elysia } from "elysia";

import type { UserRole } from "@eco-market/shared";

import { auth } from "./auth";

// Mounts Better Auth and exposes `auth` / `role` macros for route guards
export const authPlugin = new Elysia({ name: "auth" }).mount(auth.handler).macro({
  auth: {
    resolve: async ({ status, request: { headers } }) => {
      const session = await auth.api.getSession({ headers });
      if (session === null) {
        return status(401, "Unauthorized");
      }
      return { user: session.user, session: session.session };
    },
  },
  role: (roles: UserRole[]) => ({
    resolve: async ({ status, request: { headers } }) => {
      const session = await auth.api.getSession({ headers });
      if (session === null) {
        return status(401, "Unauthorized");
      }
      if (!roles.includes(session.user.role as UserRole)) {
        return status(403, "Forbidden");
      }
      return { user: session.user, session: session.session };
    },
  }),
});

// Better Auth OpenAPI paths merged into the Elysia OpenAPI document
// https://elysiajs.com/integrations/better-auth.html#openapi
let cachedSchema: ReturnType<typeof auth.api.generateOpenAPISchema> | undefined;
const getSchema = async () => (cachedSchema ??= auth.api.generateOpenAPISchema());

export const betterAuthOpenAPI = {
  getPaths: async () => {
    const { paths } = await getSchema();
    return Object.fromEntries(
      Object.entries(paths).map(([path, operations]) => [
        `/auth${path}`,
        Object.fromEntries(
          Object.entries(operations as Record<string, object>).map(([method, operation]) => [
            method,
            { ...operation, tags: ["Auth"] },
          ]),
        ),
      ]),
    );
  },
  getComponents: async () => (await getSchema()).components,
};
