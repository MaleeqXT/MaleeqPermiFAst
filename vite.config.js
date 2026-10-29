import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const productionApiUrl = "https://staging2.passpermisfacile.fr";
  const localProxyTarget = String(env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000").replace(/\/$/, "");
  const localProxy = mode === "development" && localProxyTarget ? {
    "/api": {
      target: localProxyTarget,
      changeOrigin: true,
      secure: true,
    },
    "/storage": {
      target: localProxyTarget,
      changeOrigin: true,
      secure: true,
    },
    "/assets": {
      target: localProxyTarget,
      changeOrigin: true,
      secure: true,
    },
    "/theory-diagrams": {
      target: localProxyTarget,
      changeOrigin: true,
      secure: true,
    },
    // Protected Laravel documents are opened from React pages as blobs so the
    // bearer token is retained. These routes intentionally sit outside /api.
    "/admin": {
      target: localProxyTarget,
      changeOrigin: true,
      secure: true,
    },
    "/download": {
      target: localProxyTarget,
      changeOrigin: true,
      secure: true,
    },
  } : undefined;

  if (mode === "production" && !env.VITE_API_URL) {
    throw new Error("VITE_API_URL must be set for a production build.");
  }

  if (mode === "production" && env.VITE_API_URL.replace(/\/$/, "") !== productionApiUrl) {
    throw new Error(`Production builds must use ${productionApiUrl}.`);
  }

  return {
    plugins: [react()],
    server: {
      proxy: localProxy,
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
  };
})
