import { useEffect, useState } from "react";
import { disablePushNotifications, enablePushNotifications, pushSupportStatus, startForegroundPushListener } from "./firebaseMessaging.js";
import "./PushNotificationControl.css";

export default function PushNotificationControl() {
  const [status, setStatus] = useState({ supported: false, reason: "Vérification…" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { pushSupportStatus().then(setStatus).catch(() => setStatus({ supported: false, reason: "Notifications indisponibles." })); }, []);
  useEffect(() => { startForegroundPushListener(); }, []);

  const enable = async () => {
    setBusy(true); setMessage("");
    try { await enablePushNotifications(); setStatus(await pushSupportStatus()); setMessage("Notifications push activées sur cet appareil."); }
    catch (error) { setMessage(error.message || "Activation impossible."); }
    finally { setBusy(false); }
  };
  const disable = async () => {
    setBusy(true); setMessage("");
    try { await disablePushNotifications(); setMessage("Notifications push désactivées sur cet appareil."); }
    catch { setMessage("Désactivation impossible. Réessayez."); }
    finally { setBusy(false); }
  };

  const enabled = status.permission === "granted";
  return <div className="ppf-push-control">
    <span>{enabled ? "Alertes push activées sur cet appareil" : status.supported ? "Activez les alertes push sur cet appareil" : status.reason}</span>
    {status.supported && <button type="button" disabled={busy} onClick={enabled ? disable : enable}>{enabled ? "Désactiver" : "Activer les notifications push"}</button>}
    {message && <small role="status">{message}</small>}
  </div>;
}
