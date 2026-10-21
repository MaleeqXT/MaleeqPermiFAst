const configuredApiUrl = String(import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");

if (!configuredApiUrl) {
  throw new Error("VITE_API_URL must be configured for this build.");
}

if (!/^https?:\/\//i.test(configuredApiUrl)) {
  throw new Error("VITE_API_URL must be an absolute HTTP(S) URL.");
}

export const apiBaseUrl = configuredApiUrl;

export function apiAssetUrl(path = "") {
  return `${apiBaseUrl}/${String(path).replace(/^\/+/, "")}`;
}
