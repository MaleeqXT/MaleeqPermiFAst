import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, Mail, MapPin, MoreVertical, UserRound } from "lucide-react";
import StudentHeader from "./StudentHeader.jsx";
import StudentSidebar from "./StudentSidebar.jsx";
import http from "../helpers/http.jsx";
import { LessonHistory, LessonStatus } from "../monitordashboard/formation/FormationComponents.jsx";
import { SavedManeuvers } from "../monitordashboard/formation/FormationManeuvers.jsx";
import FormationSchemaEditor from "../monitordashboard/formation/FormationSchemaEditor.jsx";
import LessonDistributionCalendar from "../monitordashboard/formation/LessonDistributionCalendar.jsx";
import { displayDate, formatDuration } from "../monitordashboard/formation/formationUtils.js";
import "../monitordashboard/formation/FormationPage.css";
import "./StudentFormationPage.css";

const errorMessage = (error) => error.response?.data?.message || "Impossible de charger votre formation pour le moment.";

function ReadOnlyField({ label, value, icon: Icon = CalendarDays }) {
  return <label className="mf-field"><span>{label}</span><div><Icon size={19} /><input readOnly value={value || "—"} /></div></label>;
}

export default function StudentFormationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [student, setStudent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [distributionOpen, setDistributionOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let active = true;
    http.get("/student/formation")
      .then(({ data }) => {
        if (!active) return;
        const payload = data?.data ?? {};
        setLessons(payload.lessons ?? []);
        setStudent(payload.student ?? null);
        setSelected(payload.lessons?.[0] ?? null);
      })
      .catch((requestError) => active && setError(errorMessage(requestError)))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const close = (event) => { if (!menuRef.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const sendBooklet = async () => {
    if (sending) return;
    setSending(true); setError(""); setNotice("");
    try {
      const { data } = await http.post("/student/formation/booklet");
      setNotice(data?.data?.message || "Votre livret a été envoyé à votre adresse e-mail.");
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setSending(false); }
  };

  return <div className="nsd-root sf-root">
    <StudentSidebar activePath="/student-formation" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <main className="nsd-main sf-main">
      <StudentHeader title="" onMenuOpen={() => setSidebarOpen(true)} />
      <section className="mf-page sf-page" aria-label="Ma formation">
        <header className="mf-page-heading">
          <button type="button" onClick={() => window.history.back()} aria-label="Retour"><ArrowLeft size={23} /></button>
          <div><h1>Formation</h1><nav aria-label="Fil Ariane"><button type="button" onClick={() => window.history.back()}>Accueil</button><span>›</span><span>Formation</span></nav></div>
          <div className="mf-heading-actions" ref={menuRef}>
            <button type="button" className="mf-more-button" aria-label="Actions de formation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreVertical size={24} /></button>
            {menuOpen && <div className="mf-actions-menu" role="menu">
              <button type="button" role="menuitem" disabled={!selected?.has_schema} onClick={() => { setMenuOpen(false); setSchemaOpen(true); }}>Schéma</button>
              <button type="button" role="menuitem" disabled={sending} onClick={() => { setMenuOpen(false); sendBooklet(); }}><Mail size={16} />{sending ? "Envoi du livret…" : "Recevoir le livret"}</button>
            </div>}
          </div>
        </header>

        {notice && <p className="mf-success sf-message" role="status">{notice}</p>}
        {error && <p className="mf-error sf-message" role="alert">{error}</p>}
        <div className="mf-columns">
          <aside className="mf-left">
            <section className="mf-card sf-student-card"><span>Élève</span><div><UserRound size={19} /><strong>{student?.name || "Chargement…"}</strong></div></section>
            <section className="mf-card mf-history-card"><h2>Historique des leçons <span>{lessons.length}</span></h2>{loading ? <p className="mf-muted">Chargement des leçons…</p> : <><LessonHistory lessons={lessons} selectedId={selected?.id} onSelect={setSelected} /><button type="button" className="mf-distribution-trigger" onClick={() => setDistributionOpen(true)}><CalendarDays size={17} />Voir la répartition</button></>}</section>
          </aside>

          <section className="mf-card mf-editor-card sf-detail-card">
            <header className="mf-new-heading"><CalendarDays size={25} /><h2>Leçon consultée</h2></header>
            {!selected && !loading && <p className="mf-muted">Aucune leçon enregistrée dans votre formation.</p>}
            {selected && <>
              <div className="mf-lesson-heading"><span className="mf-lesson-number">{selected.number}</span><strong>{displayDate(selected.date)}</strong><span>{formatDuration(selected.duration_minutes)}</span><LessonStatus status={selected.status} /><span className="mf-lesson-state">{selected.signature ? "Leçon signée" : selected.status === "upcoming" ? "Leçon à venir" : "Leçon enregistrée"}</span></div>
              <div className="mf-form-grid">
                <ReadOnlyField label="Date" value={displayDate(selected.date)} />
                <ReadOnlyField label="Durée" value={formatDuration(selected.duration_minutes)} />
                <ReadOnlyField label="Heure de départ" value={selected.start_at} />
                <ReadOnlyField label="Enseignant" value={selected.monitor_name} icon={UserRound} />
                <ReadOnlyField label="Type" value={selected.type} />
                <ReadOnlyField label="Enseignant Dpt" value={selected.department} />
                <ReadOnlyField label="Forfait" value={selected.offer_name} />
                <ReadOnlyField label="Lieu" value={selected.place_name} icon={MapPin} />
              </div>
              <div className="mf-toggles sf-toggles"><span>Boîte auto <b>{selected.boite_auto ? "Oui" : "Non"}</b></span><span>Évaluation initiale <b>{selected.evaluation_initiale ? "Oui" : "Non"}</b></span><span>Évaluation permis <b>{selected.evaluation_permis ? "Oui" : "Non"}</b></span></div>
              <section className="sf-section"><header><h3>Manœuvres effectuées lors de la leçon</h3>{selected.has_schema && <button type="button" onClick={() => setSchemaOpen(true)}>Voir le schéma</button>}</header><SavedManeuvers counts={selected.maneuver_counts} /></section>
              <section className="sf-section"><h3>Observations (visibles de tous)</h3><p className="sf-observation">{selected.public_observation || "Aucune observation publique pour cette leçon."}</p></section>
              <section className="sf-section"><h3>Compétences évaluées</h3>{selected.competencies?.length ? <div className="sf-competencies">{selected.competencies.map((competency) => <article key={competency.id}><span>{competency.title}</span><strong>{competency.rating}/5</strong>{competency.observations && <p>{competency.observations}</p>}</article>)}</div> : <p className="mf-muted">Aucune compétence évaluée pour cette leçon.</p>}</section>
            </>}
          </section>
        </div>
      </section>
    </main>
    {schemaOpen && selected && <FormationSchemaEditor studentId={student?.id} lesson={selected} apiBase="/student/formation/lessons" readOnly={Boolean(selected.signature)} onClose={() => setSchemaOpen(false)} />}
    {distributionOpen && <LessonDistributionCalendar lessons={lessons} onLessonSelect={setSelected} onClose={() => setDistributionOpen(false)} />}
  </div>;
}
