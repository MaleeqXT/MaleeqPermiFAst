import http from "./http.jsx";
import { apiBaseUrl } from "../config/api.js";

const LOCAL_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;

function documentUrl(path) {
  const normalizedPath = `/${String(path).replace(/^\/+/, "")}`;
  const isLocalDevelopment = import.meta.env.DEV
    && LOCAL_ORIGIN.test(window.location.origin);

  // In development Vite proxies these non-API Laravel routes.  In deployed
  // builds the configured backend remains the source of protected documents.
  const baseUrl = isLocalDevelopment ? window.location.origin : apiBaseUrl;
  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}

export async function openProtectedDocument(path) {
  const preview = window.open("", "_blank");

  try {
    const response = await http.get(documentUrl(path), { responseType: "blob" });
    const objectUrl = URL.createObjectURL(response.data);

    if (preview) {
      preview.opener = null;
      preview.location.replace(objectUrl);
    } else {
      window.location.assign(objectUrl);
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    preview?.close();
    throw error;
  }
}
