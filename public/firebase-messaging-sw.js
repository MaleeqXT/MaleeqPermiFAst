/* Firebase configuration is supplied by the authenticated web app at service-worker registration time. */
const encoded = new URL(self.location.href).searchParams.get("config");
let firebaseConfig = {};
try { firebaseConfig = JSON.parse(decodeURIComponent(escape(atob(encoded || "")))); } catch (_) { /* configuration unavailable */ }

importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    self.registration.showNotification("PassPermisFacile – Nouveau message", {
      body: "Vous avez reçu un nouveau message.",
      icon: "/favicon.ico",
      tag: `chat-message-${data.message_id || "new"}`,
      renotify: false,
      data: { url: data.url || "/" },
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin);
  if (target.origin !== self.location.origin) return;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => new URL(client.url).origin === target.origin);
    return existing ? existing.focus().then(() => existing.navigate(target.href)) : clients.openWindow(target.href);
  }));
});
