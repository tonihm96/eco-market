import { API_URL } from "./auth-client";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  const url = new URL(path, API_URL);
  Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined && value !== "")
    .forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url.toString();
};

// Session cookie set by Better Auth is sent with credentials: "include"
export const api = async <T,>(path: string, { method = "GET", body, query }: RequestOptions = {}) => {
  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error((await response.text()) || response.statusText);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
};
