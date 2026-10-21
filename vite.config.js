import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const productionApiUrl = "https://staging2.passpermisfacile.fr";

  if (mode === "production" && !env.VITE_API_URL) {
    throw new Error("VITE_API_URL must be set for a production build.");
  }

  if (mode === "production" && env.VITE_API_URL.replace(/\/$/, "") !== productionApiUrl) {
    throw new Error(`Production builds must use ${productionApiUrl}.`);
  }

  return {
    plugins: [react()],
    server: {
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
  };
})
