import { useEffect, useState } from "react";
import http from "../helpers/http.jsx";
import "./CandidateLessonDrawer.css";

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
);

function formatDate(value) {
  if (!value) return "Non renseignée";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function EvaluationStatus({ label, value }) {
  const state = value === null || value === undefined ? "unknown" : value ? "yes" : "no";
  const text = state === "unknown" ? "Non renseignée" : value ? "Oui" : "Non";

  return <div className="nld-evaluation"><span>{label}</span><strong className={`nld-evaluation-state ${state}`}><i aria-hidden="true" />{text}</strong></div>;
}

export default function CandidateLessonDrawer({ lessonId, onClose }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lessonId) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lessonId, onClose]);

  useEffect(() => {
    if (!lessonId) {
      setLesson(null);
      setError("");
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError("");
    setLesson(null);

    http.get(`/student/progress/lessons/${lessonId}`)
      .then((response) => {
        if (active) setLesson(response.data?.data ?? null);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Impossible de charger les détails de cette leçon.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [lessonId]);

  if (!lessonId) return null;

  const fields = lesson ? [
    ["Date", formatDate(lesson.date)],
    ["Durée", lesson.duration || "Non renseignée"],
    ["Heure de départ", lesson.startAt || "Non renseignée"],
    ["Enseignant", lesson.monitor || "Non renseigné"],
    ["Type", lesson.type || "Non renseigné"],
    ["Boîte de vitesses", lesson.gearbox || "Non renseignée"],
  ] : [];

  return <div className="nld-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <aside className="nld-drawer" role="dialog" aria-modal="true" aria-label="Détails de la leçon">
      <header className="nld-header">
        <div><p>Suivi pédagogique</p><h2>Détails de la leçon</h2></div>
        <button type="button" onClick={onClose} aria-label="Fermer les détails"><CloseIcon /></button>
      </header>

      <div className="nld-body">
        {loading && <p className="nld-message">Chargement de la leçon…</p>}
        {error && <p className="nld-message error">{error}</p>}
        {lesson && <>
          {lesson.isAbsent && <p className="nld-absence">Cette leçon est signalée comme absente.</p>}
          <section className="nld-section">
            <h3>Informations de la leçon</h3>
            <div className="nld-fields">{fields.map(([label, value]) => <div className="nld-field" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          </section>

          <section className="nld-section">
            <h3>Évaluations</h3>
            <div className="nld-evaluations">
              <EvaluationStatus label="Évaluation initiale" value={lesson.evaluations?.initial} />
              <EvaluationStatus label="Évaluation permis" value={lesson.evaluations?.permit} />
            </div>
          </section>

          <section className="nld-section">
            <h3>Manœuvres effectuées lors de la leçon</h3>
            {lesson.maneuvers?.length ? <div className="nld-tags">{lesson.maneuvers.map((maneuver, index) => <span key={`${maneuver}-${index}`}>{maneuver}</span>)}</div> : <p className="nld-empty">Aucune manœuvre renseignée.</p>}
          </section>

          <section className="nld-section">
            <h3>Observations visibles de tous</h3>
            <div className="nld-observation">{lesson.publicObservation || "Aucune observation renseignée."}</div>
          </section>

          <section className="nld-section">
            <h3>Observations pour les enseignants</h3>
            <div className="nld-observation">{lesson.teacherObservation || "Aucune observation renseignée."}</div>
          </section>
        </>}
      </div>
    </aside>
  </div>;
}
