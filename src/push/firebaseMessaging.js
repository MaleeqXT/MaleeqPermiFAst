import { getApp, getApps, initializeApp } from "firebase/app";
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import http from "../helpers/http.jsx";

const TOKEN_KEY = "ppf_fcm_token";
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function configured() {
  return Boolean(config.apiKey && config.projectId && config.messagingSenderId && config.appId && import.meta.env.VITE_FIREBASE_VAPID_KEY);
}

function deviceDetails() {
  const agent = navigator.userAgent || "";
  const browser = /Edg\//.test(agent) ? "Edge" : /Chrome\//.test(agent) ? "Chrome" : /Firefox\//.test(agent) ? "Firefox" : /Safari\//.test(agent) ? "Safari" : "Navigateur";
  const platform = navigator.userAgentData?.platform || navigator.platform || "Web";
  return { browser, platform: String(platform).slice(0, 50), device_name: `${browser} · ${String(platform).slice(0, 40)}` };
}

async function messagingContext() {
  if (!configured() || !window.isSecureContext || !(await isSupported())) throw new Error("Les notifications push ne sont pas disponibles ou Firebase n’est pas configuré.");
  const app = getApps().length ? getApp() : initializeApp(config);
  // Firebase configuration is public by design. Passing it to the worker lets
  // background push work without ever exposing the server service account.
  const workerConfig = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?config=${encodeURIComponent(workerConfig)}`);
  return { messaging: getMessaging(app), registration };
}

export async function pushSupportStatus() {
  if (!configured()) return { supported: false, reason: "Firebase n’est pas encore configuré." };
  if (!window.isSecureContext) return { supported: false, reason: "Les notifications push nécessitent HTTPS." };
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !(await isSupported())) return { supported: false, reason: "Ce navigateur ne prend pas en charge les notifications push." };
  return { supported: true, permission: Notification.permission };
}

export async function enablePushNotifications() {
  const support = await pushSupportStatus();
  if (!support.supported) throw new Error(support.reason);
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") throw new Error("L’autorisation de notifications n’a pas été accordée.");
  const { messaging, registration } = await messagingContext();
  const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) throw new Error("Impossible d’enregistrer cet appareil pour les notifications.");
  await http.post("/push/register", { fcm_token: token, ...deviceDetails() });
  window.localStorage.setItem(TOKEN_KEY, token);
  return token;
}

export async function disablePushNotifications() {
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token) await http.delete("/push/unregister", { data: { fcm_token: token } });
  if (configured() && window.isSecureContext && await isSupported()) {
    const { messaging } = await messagingContext();
    await deleteToken(messaging);
  }
  window.localStorage.removeItem(TOKEN_KEY);
}

let foregroundListenerStarted = false;
export async function startForegroundPushListener() {
  if (foregroundListenerStarted || !configured() || !window.isSecureContext || !(await isSupported())) return;
  const { messaging } = await messagingContext();
  foregroundListenerStarted = true;
  onMessage(messaging, () => window.dispatchEvent(new CustomEvent("ppf-fcm-foreground")));
}
