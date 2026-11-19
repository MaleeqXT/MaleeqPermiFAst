import axios from "axios";
import { apiBaseUrl } from "../config/api.js";

const http = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

const STUDENT_PREVIEW_SESSION_KEY = "ppf_student_dashboard_preview";

// The backend issues a Sanctum token during login. Add it to every API call so
// the session remains valid after React redirects to a protected dashboard.
http.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("ppf_auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // In an admin-as-student preview, a still-active admin session cookie can
  // take precedence over the temporary Bearer token. The API would then see
  // the admin (who has no student payment profile) rather than the selected
  // student. Use the preview token as the sole credential for that session.
  config.withCredentials = !window.sessionStorage.getItem(STUDENT_PREVIEW_SESSION_KEY);

  return config;
});

export default http;
