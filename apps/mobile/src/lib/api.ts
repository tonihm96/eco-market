import { getSessionCookie, isWeb } from "./auth-client";
import { API_URL } from "./config";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  const params = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
  return `${API_URL}${path}${params ? `?${params}` : ""}`;
};

// Authenticated fetch: Better Auth's Expo plugin keeps the session cookie in SecureStore
export const api = async <T>(path: string, { method = "GET", body, query }: RequestOptions = {}) => {
  const cookie = await getSessionCookie();
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    credentials: isWeb ? "include" : "omit",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, (await response.text()) || response.statusText);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
};
