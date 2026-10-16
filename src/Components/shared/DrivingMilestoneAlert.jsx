import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import http from "../../helpers/http";
import "./DrivingMilestoneAlert.css";

export default function DrivingMilestoneAlert({ alert, onAcknowledged }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!alert) return null;

  const acknowledge = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await http.post(`/driving-lesson-milestones/${alert.id}/acknowledge`);
      onAcknowledged?.(alert);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "L’alerte n’a pas pu être confirmée. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="driving-milestone-backdrop" role="presentation">
      <section className="driving-milestone-modal" role="alertdialog" aria-modal="true" aria-labelledby="driving-milestone-title" aria-describedby="driving-milestone-message">
        <div className="driving-milestone-icon" aria-hidden="true"><AlertTriangle size={30} /></div>
        <div className="driving-milestone-content">
          <p className="driving-milestone-kicker">Alerte de suivi</p>
          <h2 id="driving-milestone-title">Bilan de conduite à prévoir</h2>
          <p className="driving-milestone-student"><strong>Élève concerné :</strong> {alert.student_name || "Élève"}</p>
          <p id="driving-milestone-message">{alert.message}</p>
          {error && <p className="driving-milestone-error" role="alert">{error}</p>}
          <button type="button" className="driving-milestone-confirm" onClick={acknowledge} disabled={saving} autoFocus>
            {saving ? <><Loader2 size={17} className="driving-milestone-spinner" /> Confirmation…</> : "Compris"}
          </button>
        </div>
      </section>
    </div>
  );
}
