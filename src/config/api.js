import { resolveApiBaseUrl } from "./apiBaseUrl.js";

export const apiBaseUrl = resolveApiBaseUrl({
  configuredApiUrl: import.meta.env.VITE_API_URL,
  development: import.meta.env.DEV,
  browserOrigin: typeof window === "undefined" ? "" : window.location.origin,
});

export function apiAssetUrl(path = "") {
  return `${apiBaseUrl}/${String(path).replace(/^\/+/, "")}`;
}
