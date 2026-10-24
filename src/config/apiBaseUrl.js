const LOCAL_DEVELOPMENT_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;

export function resolveApiBaseUrl({ configuredApiUrl, development, browserOrigin }) {
  const configured = String(configuredApiUrl ?? "").trim().replace(/\/$/, "");
  const origin = String(browserOrigin ?? "").trim().replace(/\/$/, "");

  // In local development, use the origin that served the React app so every
  // request stays same-origin and is forwarded by Vite's /api proxy.
  if (development && LOCAL_DEVELOPMENT_ORIGIN.test(origin)) {
    return origin;
  }

  if (!configured) {
    throw new Error("VITE_API_URL must be configured for this build.");
  }

  if (!/^https?:\/\//i.test(configured)) {
    throw new Error("VITE_API_URL must be an absolute HTTP(S) URL.");
  }

  return configured;
}
