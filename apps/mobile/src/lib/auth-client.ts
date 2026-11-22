import { expoClient } from "@better-auth/expo/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { API_URL } from "./config";

export const isWeb = Platform.OS === "web";

const additionalFields = inferAdditionalFields({
  user: {
    role: { type: "string", required: false },
    phone: { type: "string", required: false },
  },
});

// Native: session cookie stored in SecureStore by the Expo plugin. Web: regular browser cookies.
export const authClient = createAuthClient({
  baseURL: `${API_URL}/auth`,
  plugins: isWeb
    ? [additionalFields]
    : [
        expoClient({ scheme: "ecomarket", storagePrefix: "ecomarket", storage: SecureStore }),
        additionalFields,
      ],
});

export const getSessionCookie = async (): Promise<string | undefined> => {
  if (isWeb) return undefined;
  const client = authClient as unknown as { getCookie: () => Promise<string> | string };
  return await client.getCookie();
};
