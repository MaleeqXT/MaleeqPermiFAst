import { useEffect, useState } from "react";
import http from "../helpers/http.jsx";
import { isLocalDebugHost, sameMandatePayload } from "./mandatePayload.js";

// Local-development aid only. RdvPermisPage renders it behind an inline
// `import.meta.env.DEV` check, so production builds drop this module entirely.
// It shows the browser-side mapping and the exact body Laravel would send
// (GET …/mandate/preview: no provider call, no token).
export default function MandatePayloadDebug({ studentId, payload }) {
  const enabled = isLocalDebugHost(import.meta.env.DEV, typeof window === "undefined" ? "" : window.location.hostname);
  const [server, setServer] = useState(null);

  useEffect(() => {
    if (!enabled || !studentId) return undefined;
    let cancelled = false;
    setServer({ status: "loading" });
    http.get(`/admin/students/${encodeURIComponent(studentId)}/rdvpermis/mandate/preview`)
      .then((response) => { if (!cancelled) setServer({ status: "ready", payload: response?.data?.payload ?? null }); })
      .catch((error) => {
        if (!cancelled) setServer({ status: "error", message: error?.response?.data?.message ?? "Aperçu Laravel indisponible." });
      });
    return () => { cancelled = true; };
  }, [enabled, studentId]);

  if (!enabled || !payload) return null;

  return (
    <div className="rdv-payload-debug" data-testid="rdvpermis-payload-debug">
      <h3>Payload RdvPermis</h3>
      <p>Développement local uniquement. Corps exact que Laravel enverra à <code>POST /api/v2/auto-ecole/mandats</code> (sans jeton).</p>
      <pre data-testid="rdvpermis-payload-client">{JSON.stringify(payload, null, 2)}</pre>
      {server?.status === "loading" && <p>Vérification auprès de Laravel…</p>}
      {server?.status === "error" && <p className="rdv-payload-debug__mismatch">Laravel refuse ce payload : {server.message}</p>}
      {server?.status === "ready" && (sameMandatePayload(server.payload, payload)
        ? <p className="rdv-payload-debug__match" data-testid="rdvpermis-payload-match">Identique au payload calculé par Laravel.</p>
        : <>
          <p className="rdv-payload-debug__mismatch">Différent du payload calculé par Laravel :</p>
          <pre data-testid="rdvpermis-payload-server">{JSON.stringify(server.payload, null, 2)}</pre>
        </>)}
    </div>
  );
}
