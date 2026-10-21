import axios from "axios";
import { apiBaseUrl } from "../config/api.js";

const http = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

// The backend issues a Sanctum token during login. Add it to every API call so
// the session remains valid after React redirects to a protected dashboard.
http.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("ppf_auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
