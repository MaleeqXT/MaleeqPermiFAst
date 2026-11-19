import { useEffect, useState } from "react";
import http from "../helpers/http.jsx";
import { studentIdFrom } from "../helpers/studentIdentity.js";
import "./SelectCandidateDrawer.css";

const IconChevR  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

const TOTAL_SEGMENTS = 10;

function getInitials(name = "") {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function avatarColor(name) {
  const colors = [
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#dcfce7", text: "#166534" },
    { bg: "#fef9c3", text: "#854d0e" },
    { bg: "#fce7f3", text: "#9d174d" },
    { bg: "#ede9fe", text: "#5b21b6" },
    { bg: "#ffedd5", text: "#9a3412" },
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function MiniProgress({ percent }) {
  const filled = Math.round((percent / 100) * TOTAL_SEGMENTS);
  return (
    <div className="scd-progress-bar">
      {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
        <div
          key={i}
          className={`scd-progress-seg${i < filled ? " scd-progress-seg--filled" : ""}`}
        />
      ))}
    </div>
  );
}

function CandidateRow({ candidate, onSelect }) {
  const { bg, text } = avatarColor(candidate.name);
  const initials = getInitials(candidate.name);

  return (
    <button className="scd-row" onClick={() => onSelect(candidate)}>
      <div className="scd-avatar" style={{ background: bg, color: text }}>
        {initials}
      </div>

      <div className="scd-info">
        <div className="scd-name">{candidate.name}</div>
        <div className="scd-progress-row">
          <span className="scd-progress-label">Progression des compétences</span>
          <span className="scd-progress-pct">{candidate.progress}%</span>
        </div>
        <MiniProgress percent={candidate.progress} />
      </div>

      <span className="scd-chev"><IconChevR /></span>
    </button>
  );
}

function toCandidate(user) {
  const studentId = studentIdFrom(user);
  if (!studentId) return null;

  return {
    ...user,
    id: studentId,
    studentId,
    student_id: studentId,
    name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.name || "Élève",
    email: user.email || "",
    phone: user.phone || user.tel || user.telephone || "",
    progress: Number(user.student?.progress_done || 0),
    hasPhoto: Boolean(user.profile_photo_url || user.media),
  };
}

export default function SelectCandidateDrawer({ onClose, onSelect, monitorId = null }) {
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    http.get("/monitor/students", {
      params: monitorId ? { monitor_id: monitorId } : undefined,
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (!controller.signal.aborted) setCandidates((data?.data || []).map(toCandidate).filter(Boolean));
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.response?.data?.message || "Impossible de charger les élèves.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [monitorId]);

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(candidate) {
    if (onSelect) {
      onSelect({
        ...candidate,
        email: candidate.email ?? "",
        phone: candidate.phone ?? "",
        seancePasse: candidate.seancePasse ?? 26,
        seanceAvenir: candidate.seanceAvenir ?? 0,
        balanceUtilise: candidate.balanceUtilise ?? 26,
        balanceReste: candidate.balanceReste ?? 0,
      });
    }
    onClose();
  }

  return (
    <>
      <div className="scd-overlay" onClick={onClose} />

      <aside className="scd-drawer">
        <header className="scd-header">
          <button className="scd-close-btn" onClick={onClose}>Fermer</button>
          <h2 className="scd-title">Sélectionner un candidat</h2>
          <span style={{ width: 52 }} />
        </header>

        <div className="scd-search-wrap">
          <div className="scd-search-box">
            <IconSearch />
            <input
              className="scd-search-input"
              type="text"
              placeholder="Rechercher un candidat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="scd-list">
          {loading ? (
            <div className="scd-empty">Chargement des candidats…</div>
          ) : error ? (
            <div className="scd-empty">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="scd-empty">Aucun candidat lié à ce moniteur trouvé</div>
          ) : (
            filtered.map(c => (
              <CandidateRow key={c.id} candidate={c} onSelect={handleSelect} />
            ))
          )}
        </div>
      </aside>
    </>
  );
}
