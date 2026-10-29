import { useEffect, useMemo, useState } from "react";
import http from "../../helpers/http.jsx";
import "./TabSkills.css";

const LEVELS = ["En cours", "À améliorer", "Maîtrisé"];

function Star({ filled }) {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "#c9cdd4"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>;
}

const ratingValue = (competency) => Math.max(0, Math.min(3, Number(competency?.rating?.[0]?.rating ?? competency?.rating?.rating ?? 0) || 0));

export default function TabSkills({ studentId }) {
  const [skills, setSkills] = useState([]);
  const [activeSkill, setActiveSkill] = useState(null);
  const [loading, setLoading] = useState(Boolean(studentId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    let current = true;
    setLoading(true); setError("");
    http.get(`/admin/competences/${studentId}`)
      .then(({ data }) => {
        if (!current) return;
        const fetched = Array.isArray(data?.data) ? data.data : [];
        setSkills(fetched);
        setActiveSkill((selected) => selected ?? fetched[0]?.id ?? null);
      })
      .catch(() => current && setError("Impossible de charger les compétences de cet élève."))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [studentId]);

  const skill = useMemo(() => skills.find((item) => String(item.id) === String(activeSkill)) ?? skills[0], [skills, activeSkill]);
  const competencies = skill?.competencies ?? [];
  const progress = competencies.length ? Math.round((competencies.reduce((total, item) => total + ratingValue(item), 0) / (competencies.length * 3)) * 100) : 0;
  const segments = Math.max(competencies.length, 1);
  const filledSegs = Math.round((progress / 100) * segments);

  if (loading) return <div className="ts-layout"><p>Chargement des compétences…</p></div>;
  if (error) return <div className="ts-layout"><p role="alert">{error}</p></div>;
  if (!skills.length) return <div className="ts-layout"><p>Aucune compétence n’est disponible pour cet élève.</p></div>;

  return <div className="ts-layout">
    <div className="ts-sidebar">
      {skills.map((item, index) => <div key={item.id} className="ts-sidebar-item-wrapper">
        {index > 0 && <div className="ts-connector" />}
        <button type="button" className={`ts-skill-item ${String(activeSkill) === String(item.id) ? "active" : ""}`} onClick={() => setActiveSkill(item.id)}>
          <div className={`ts-skill-num ${String(activeSkill) === String(item.id) ? "active" : ""}`}>{index + 1}</div>
          <div className="ts-skill-text"><span className="ts-skill-label">{item.name}</span><span className="ts-skill-tag">Compétence {index + 1}</span></div>
        </button>
      </div>)}
    </div>

    <div className="ts-detail">
      <div className="ts-progress-header">
        <div className="ts-progress-top"><div className="ts-progress-title-row"><span className="ts-progress-title">Progression en {(skill?.name ?? "compétence").toLowerCase()}</span></div><span className="ts-progress-pct">{progress} %</span></div>
        <div className="ts-progress-bar">{Array.from({ length: segments }).map((_, index) => <div key={index} className={`ts-progress-seg ${index < filledSegs ? "filled" : ""}`} />)}</div>
        <span className="ts-progress-status">Évaluation des compétences en cours</span>
      </div>
      <div className="ts-subskills-card">
        {competencies.map((competency) => {
          const rating = ratingValue(competency);
          return <div key={competency.id} className="ts-subskill-row"><span className="ts-subskill-name">{competency.label}</span><div className="ts-stars-group">{LEVELS.map((level, index) => <div key={level} className="ts-star-col"><Star filled={index < rating} /><span className="ts-star-label">{level}</span></div>)}</div></div>;
        })}
      </div>
    </div>
  </div>;
}
