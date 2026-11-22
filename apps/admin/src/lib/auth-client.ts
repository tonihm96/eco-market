import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export const authClient = createAuthClient({
  baseURL: `${API_URL}/auth`,
  plugins: [
    inferAdditionalFields({
      user: { role: { type: "string", required: false }, phone: { type: "string", required: false } },
    }),
  ],
});
