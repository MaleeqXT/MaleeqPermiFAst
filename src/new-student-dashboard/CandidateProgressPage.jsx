import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar.jsx";
import StudentHeader from "./StudentHeader.jsx";
import http from "../helpers/http.jsx";
import QuestionDetail from "../monitordashboard/QuestionDetail.jsx";
import "./CandidateDashboard.css";
import "./CandidateProgressPage.css";

const ProgressIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-7" /><path d="M15 7h4v4" /></svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4" /><path d="m8.6 13.5 6.8 4" /></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2" /><path d="M22 12h-2" /></svg>
);

const PinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8" /><path d="M8 13h5" /></svg>
);

const ManoeuvreIcon = ({ type }) => {
  const shared = { fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "perpendicular") return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 4v24M25 4v24M16 4v24" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" /><rect x="12" y="12" width="8" height="10" rx="2" fill="currentColor" opacity=".85" /><path d="M10 17H3m4-4-4 4 4 4" {...shared} /><text x="13.5" y="9" fontSize="7" fontWeight="700" fill="currentColor">P</text><text x="13.5" y="28" fontSize="7" fontWeight="700" fill="currentColor">P</text></svg>;
  if (type === "parallel") return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 6h24M4 26h24M8 6v20" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" /><rect x="13" y="11" width="7" height="10" rx="2" fill="currentColor" opacity=".85" /><path d="M16 9V3m-3 3 3-3 3 3" {...shared} /><text x="14" y="24" fontSize="7" fontWeight="700" fill="currentColor">P</text></svg>;
  if (type === "straight") return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3v26" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" /><rect x="12" y="11" width="8" height="10" rx="2" fill="currentColor" opacity=".85" /><path d="M25 9v14m-3-3 3 3 3-3" {...shared} /></svg>;
  if (type === "uturn") return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 24V13a6 6 0 0 1 12 0v11M7 20l3 4 3-4" {...shared} strokeWidth="2.6" /></svg>;
  if (type === "roundabout") return <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="17" cy="16" r="7" {...shared} strokeWidth="2.2" /><circle cx="17" cy="16" r="2.5" fill="currentColor" /><path d="M17 9a7 7 0 0 1 7 7M10 16H3m4-3-4 3 4 3" {...shared} strokeWidth="2" /></svg>;
  return <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="23" cy="7" r="2.5" fill="currentColor" /><path d="M6 8h12M12 7l-3 3m3-3-3-3" {...shared} /><rect x="12" y="14" width="8" height="10" rx="2" fill="currentColor" opacity=".85" /></svg>;
};

const MANOEUVRES = [
  { id: "perpendicular", label: "Stationnement en bataille", count: 1 },
  { id: "parallel", label: "Stationnement en créneau", count: 1 },
  { id: "straight", label: "Marche arrière en ligne droite", count: 1 },
  { id: "uturn", label: "Demi-tour", count: 2 },
  { id: "roundabout", label: "Giratoire", count: 3 },
  { id: "precision", label: "Arrêt de précision", count: 2 },
];

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);

const COMPETENCIES = [
  {
    id: "C1", shortTitle: "Maîtriser le véhicule", title: "Maîtriser le maniement du véhicule", description: "Être en capacité de manipuler le véhicule en toute sécurité.", progress: 75, hours: "7h30 réalisées", status: "Acquis", tone: "green",
    details: [
      ["1.1", "Connaître les principaux organes et commandes", 6, "Acquis", "green"],
      ["1.2", "Entrer, s'installer au poste de conduite et en sortir", 6, "Acquis", "green"],
      ["1.3", "Tenir, tourner le volant et maintenir la trajectoire", 5, "Acquis", "green"],
      ["1.4", "Démarrer et s'arrêter", 4, "En cours", "blue"],
      ["1.5", "Doser les accélérations et les freinages", 4, "En cours", "blue"],
      ["1.6", "Utiliser la boîte de vitesses", 3, "En progression", "amber"],
    ],
  },
  {
    id: "C2", shortTitle: "Appréhender la route", title: "Appréhender la route", description: "Comprendre l'environnement routier et adapter sa conduite aux situations.", progress: 60, hours: "6h00 réalisées", status: "En cours", tone: "blue",
    details: [
      ["2.1", "Rechercher la signalisation et les indices utiles", 5, "En cours", "blue"],
      ["2.2", "Positionner le véhicule sur la chaussée", 4, "En cours", "blue"],
      ["2.3", "Adapter l'allure aux situations", 4, "En cours", "blue"],
      ["2.4", "Détecter et franchir les intersections", 3, "En progression", "amber"],
      ["2.5", "Tourner à droite et à gauche", 4, "En cours", "blue"],
      ["2.6", "Circuler dans un carrefour à sens giratoire", 3, "En progression", "amber"],
    ],
  },
  {
    id: "C3", shortTitle: "Partager la route", title: "Partager la route avec les autres usagers", description: "Coopérer avec tous les usagers et communiquer ses intentions clairement.", progress: 70, hours: "7h00 réalisées", status: "En cours", tone: "purple",
    details: [
      ["3.1", "Évaluer et maintenir les distances de sécurité", 5, "En cours", "purple"],
      ["3.2", "Croiser, dépasser et être dépassé", 4, "En cours", "purple"],
      ["3.3", "Communiquer avec les autres usagers", 5, "En cours", "purple"],
      ["3.4", "Conduire avec les usagers vulnérables", 4, "En cours", "purple"],
      ["3.5", "S'insérer et sortir d'une voie rapide", 3, "En progression", "amber"],
      ["3.6", "Conduire dans une circulation dense", 4, "En cours", "purple"],
    ],
  },
  {
    id: "C4", shortTitle: "Autonomie & risque", title: "Autonomie et conscience du risque", description: "Conduire de manière autonome, sûre et économe dans toutes les situations.", progress: 55, hours: "4h00 réalisées", status: "En progression", tone: "amber",
    details: [
      ["4.1", "Suivre un itinéraire de manière autonome", 4, "En progression", "amber"],
      ["4.2", "Préparer et effectuer un voyage longue distance", 3, "En progression", "amber"],
      ["4.3", "Connaître les principaux facteurs de risque", 4, "En progression", "amber"],
      ["4.4", "Évaluer son état et ses capacités", 3, "En progression", "amber"],
      ["4.5", "Pratiquer l'écoconduite", 3, "En progression", "amber"],
      ["4.6", "Réagir face à une situation d'urgence", 2, "À travailler", "neutral"],
    ],
  },
];

const LESSONS = [
  { id: 1, weekday: "SAM.", day: "31", month: "MAI", date: "31 Mai 2025", time: "10h00 - 11h30", type: "Conduite", typeTone: "green", duration: "1h30", instructor: "Carl D.", initials: "CD", competencies: [["C1", "green"], ["C2", "blue"], ["C3", "purple"]], assessment: "Très bonne séance, progression sur les créneaux et l'anticipation. Continuez à travailler la fluidité des changements de rapports.", level: 4 },
  { id: 2, weekday: "MER.", day: "28", month: "MAI", date: "28 Mai 2025", time: "16h00 - 17h30", type: "Conduite", typeTone: "green", duration: "1h30", instructor: "Samira B.", initials: "SB", competencies: [["C1", "green"], ["C2", "blue"]], assessment: "Séance productive. Bonnes bases sur la gestion de l'espace. Attention à la vitesse en agglomération.", level: 4 },
  { id: 3, weekday: "MAR.", day: "27", month: "MAI", date: "27 Mai 2025", time: "18h30 - 19h30", type: "Code en ligne", typeTone: "blue", duration: "1h00", instructor: "—", initials: "", competencies: [], assessment: "Série : 15 - Résultat : 88%", level: 5 },
];

function ProgressRing({ progress = 0 }) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="nsp-progress-ring" aria-label={`${progress} % de progression`}>
      <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="nsp-progress-track" cx="50" cy="50" r={radius} /><circle className="nsp-progress-fill" cx="50" cy="50" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)} /></svg>
      <span><strong>{progress}%</strong></span>
    </div>
  );
}

function LevelSquares({ filled, tone = "green", total = 5 }) {
  return <span className="nsp-level-squares" aria-label={`${filled} niveaux sur ${total}`}>{Array.from({ length: total }, (_, index) => <i key={index} className={index < filled ? `filled ${tone}` : ""} />)}</span>;
}

function toneForIndex(index) {
  return ["green", "blue", "purple", "amber"][index] ?? "green";
}

function toneForStatus(status) {
  if (status === "acquired") return "green";
  if (status === "in_progress") return "blue";
  return "neutral";
}

function labelForStatus(status) {
  if (status === "acquired") return "Acquis";
  if (status === "in_progress") return "En cours";
  return "À travailler";
}

function formatMinutes(minutes = 0) {
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
}

function toStudentCompetencies(data) {
  if (!Array.isArray(data?.competencies)) return COMPETENCIES;

  return data.competencies.map((competency, index) => {
    const tone = toneForIndex(index);
    const status = competency.progress >= 80 ? "Acquis" : competency.progress > 0 ? "En cours" : "À travailler";

    return {
      id: competency.code,
      shortTitle: competency.title,
      title: competency.title,
      description: "Évaluation détaillée des compétences travaillées par votre moniteur.",
      progress: competency.progress,
      hours: `${competency.questions?.length ?? 0} sous-compétences`,
      status,
      tone,
      details: (competency.questions ?? []).map((question) => [
        question.letter,
        question.title,
        question.level ?? 0,
        labelForStatus(question.status),
        toneForStatus(question.status),
        question.observations ?? "",
        question.id,
        question.studentResponse ?? "",
        question.studentEvaluation ?? false,
        question.activeTab ?? "pourquoi",
      ]),
    };
  });
}

function CompetencySummary({ competency }) {
  return (
    <article className={`nsp-competency-row nsp-tone-${competency.tone}`}>
      <span className="nsp-competency-icon"><TargetIcon /></span>
      <div className="nsp-competency-copy"><div className="nsp-competency-title"><strong>{competency.id}</strong><span>{competency.title}</span></div><div className="nsp-competency-progress"><span style={{ width: `${competency.progress}%` }} /></div><small>{competency.hours}</small></div>
      <strong className="nsp-competency-percent">{competency.progress}%</strong>
      <span className="nsp-competency-status">{competency.status}</span>
    </article>
  );
}

function LessonDate({ lesson }) {
  return (
    <div className="nsp-lesson-date-wrap">
      <div className="nsp-lesson-date" aria-label={`${lesson.weekday} ${lesson.day} ${lesson.month}`}><span>{lesson.weekday}</span><strong>{lesson.day}</strong><small>{lesson.month}</small></div>
      <span className="nsp-lesson-date-copy"><strong>{lesson.date}</strong><small>{lesson.time}</small></span>
    </div>
  );
}

function StudentHistoryTable({ lessons }) {
  return <table className="nsp-history-table"><thead><tr><th>Date</th><th>Type</th><th>Durée</th><th>Moniteur</th><th>Compétences travaillées</th><th>Bilan du moniteur</th><th>Niveau atteint</th><th aria-label="Action" /></tr></thead><tbody>{lessons.length ? lessons.map((lesson) => <tr key={lesson.id}><td><LessonDate lesson={lesson} /></td><td><span className={`nsp-type-badge ${lesson.typeTone || (lesson.type === "Code en ligne" ? "blue" : "green")}`}>{lesson.type}</span></td><td><strong>{lesson.duration}</strong></td><td>{lesson.instructor === "—" ? "—" : <span className="nsp-history-instructor"><i>{lesson.initials}</i>{lesson.instructor}</span>}</td><td>{lesson.competencies.length ? <span className="nsp-history-competencies">{lesson.competencies.map(([code, tone]) => <i key={code} className={tone}>{code}</i>)}</span> : "—"}</td><td><p>{lesson.assessment || "—"}</p></td><td><span className="nsp-history-level"><LevelSquares filled={lesson.level} total={5} /><small>{lesson.level}/5</small></span></td><td><button type="button" className="nsp-row-action" aria-label={`Voir la leçon du ${lesson.date}`}><ChevronRightIcon /></button></td></tr>) : <tr><td colSpan="8" className="nsp-history-empty">Aucune leçon disponible.</td></tr>}</tbody></table>;
}

export default function CandidateProgressPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCompetencyId, setActiveCompetencyId] = useState("C1");
  const [progressData, setProgressData] = useState(null);
  const [openQuestionKey, setOpenQuestionKey] = useState(null);
  const [studentQuestionDetails, setStudentQuestionDetails] = useState({});
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    http.get("/student/progress")
      .then((response) => {
        if (cancelled) return;
        const data = response.data?.data ?? null;
        setProgressData(data);
        if (data?.competencies?.[0]?.code) setActiveCompetencyId(data.competencies[0].code);
      })
      .catch(() => {
        if (!cancelled) setProgressData(null);
      });

    return () => { cancelled = true; };
  }, []);

  const competencies = toStudentCompetencies(progressData);
  const activeCompetency = competencies.find((competency) => competency.id === activeCompetencyId) ?? competencies[0];
  const overallPercentage = progressData?.overallPercentage ?? 68;
  const hours = progressData?.hours ?? { plannedMinutes: 30 * 60, completedMinutes: 24 * 60 + 30, remainingMinutes: 5 * 60 + 30 };
  const lessons = progressData?.lessons ?? LESSONS;
  const visibleLessons = historyExpanded ? lessons : lessons.slice(0, 5);
  const nextAppointment = progressData?.nextAppointment;
  const studentName = progressData?.student?.name || "Linda";

  const handleSidebarNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const saveStudentQuestionDetail = (questionKey, questionId, detail) => {
    setStudentQuestionDetails((current) => ({
      ...current,
      [questionKey]: {
        studentResponse: detail.studentResponse,
        studentEvaluation: detail.studentEvaluation,
        activeTab: detail.activeTab,
      },
    }));

    if (!questionId) return;

    http.put(`/student/progress/competencies/${questionId}/comment`, {
      student_response: detail.studentResponse,
      student_evaluation: detail.studentEvaluation,
      active_tab: detail.activeTab,
    }).then((response) => {
      const saved = response.data?.data;
      if (!saved) return;
      setStudentQuestionDetails((current) => ({
        ...current,
        [questionKey]: saved,
      }));
    }).catch(() => {
      // Keep the typed text visible. A later refresh continues to display the
      // last server-saved value if the network request could not be completed.
    });
  };

  return (
    <div className="nsd-root nsp-root">
      <StudentSidebar activePath="/student-progress" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleSidebarNavigate} />
      <main className="nsd-main nsp-main">
        <StudentHeader className="nsp-header" headingClassName="nsp-page-heading" titleNode={<div className="nsp-title-row"><h1 className="nsd-greeting-title">Ma progression détaillée</h1><span className="nsp-title-icon"><ProgressIcon /></span></div>} subtitle="Votre apprentissage en temps réel et votre livret numérique connecté." onMenuOpen={() => setSidebarOpen(true)} />

        <div className="nsp-actions" aria-label="Actions du livret"><button type="button" className="nsp-action-button"><FileIcon />Exporter mon livret (PDF)</button><button type="button" className="nsp-action-button nsp-action-button--green"><ShareIcon />Partager mon livret</button></div>

        <section className="nsp-overview-grid" aria-label="Vue d'ensemble de la progression">
          <article className="nsp-panel nsp-overview-card nsp-global-card"><h2>Ma progression globale</h2><div className="nsp-global-body"><ProgressRing progress={overallPercentage} /><div className="nsp-global-copy"><strong>Bravo {studentName} !</strong><span>Votre moniteur met à jour votre progression.</span><span>Continuez vos efforts pour atteindre vos objectifs.</span><button type="button"><TargetIcon />Voir mes objectifs</button></div></div></article>
          <article className="nsp-panel nsp-overview-card nsp-hours-card"><h2><ClockIcon />Heures de conduite</h2><div className="nsp-hours-values"><span><strong>{formatMinutes(hours.completedMinutes)}</strong><small>réalisées</small></span><span><b>sur {formatMinutes(hours.plannedMinutes)}</b><small>prévues</small></span></div><div className="nsp-hours-progress"><span style={{ width: `${hours.plannedMinutes ? Math.min(100, (hours.completedMinutes / hours.plannedMinutes) * 100) : 0}%` }} /></div><div className="nsp-next-lesson"><small>Heures restantes</small><strong><CalendarIcon />{formatMinutes(hours.remainingMinutes)}</strong></div></article>
          <article className="nsp-panel nsp-overview-card nsp-appointment-card"><h2><CalendarIcon />Prochain rendez-vous</h2><div className="nsp-appointment-body"><div className="nsp-appointment-date"><span>{nextAppointment?.weekday ?? "—"}</span><strong>{nextAppointment?.day ?? "—"}</strong><small>{nextAppointment?.month ?? ""}</small></div><div className="nsp-appointment-copy"><strong>{nextAppointment?.title ?? "Aucun rendez-vous prévu"}</strong><span>{nextAppointment ? `${nextAppointment.date}${nextAppointment.time ? ` à ${nextAppointment.time}` : ""}` : "Votre prochain cours apparaîtra ici."}</span>{nextAppointment && <span>avec <b>{nextAppointment.monitorName || "votre moniteur"}</b></span>}<span><PinIcon />Agence à confirmer</span><button type="button" onClick={() => navigate("/student-courses")}><CalendarIcon />Voir mon planning</button></div></div></article>
        </section>

        <section className="nsp-competency-grid">
          <article className="nsp-panel nsp-breakdown-card"><div className="nsp-manoeuvres-card" aria-label="Manœuvres effectuées lors des leçons"><h3>Manœuvres effectuées lors des leçons</h3><div className="nsp-manoeuvres-grid">{MANOEUVRES.map((manoeuvre) => <div className="nsp-manoeuvre-item" key={manoeuvre.id} title={manoeuvre.label}><span className="nsp-manoeuvre-icon"><ManoeuvreIcon type={manoeuvre.id} /></span><strong>{manoeuvre.count}</strong><span>{manoeuvre.label}</span></div>)}</div></div><div className="nsp-section-title"><h2>Répartition par compétence (REMC)</h2><span className="nsp-info" title="Référentiel pour l'éducation à une mobilité citoyenne">i</span></div><div className="nsp-competency-list">{competencies.map((competency) => <CompetencySummary key={competency.id} competency={competency} />)}</div><div className="nsp-legend" aria-label="Légende des statuts"><span><i className="green" />Acquis</span><span><i className="blue" />En cours d'acquisition</span><span><i className="amber" />En progression</span><span><i className="neutral" />À travailler</span></div></article>

          <article className="nsp-panel nsp-detail-card">
            <h2>Détail de la compétence sélectionnée</h2>
            <div className="nsp-competency-tabs" role="tablist" aria-label="Choisir une compétence">{competencies.map((competency) => <button key={competency.id} type="button" role="tab" aria-selected={activeCompetencyId === competency.id} className={activeCompetencyId === competency.id ? "active" : ""} onClick={() => { setActiveCompetencyId(competency.id); setOpenQuestionKey(null); }}><strong>{competency.id}</strong><span>{competency.shortTitle}</span></button>)}</div>
            <div className={`nsp-detail-summary nsp-tone-${activeCompetency.tone}`}><div><h3>{activeCompetency.id} - {activeCompetency.title}</h3><p>{activeCompetency.description}</p></div><span><strong>{activeCompetency.progress}%</strong><small>Niveau atteint</small></span></div>
            <div className="nsp-detail-table" role="table" aria-label={`Détails de la compétence ${activeCompetency.id}`}><div className="nsp-detail-row nsp-detail-row--head" role="row"><span>Compétence</span><span>Niveau atteint</span><span>Statut</span></div>{activeCompetency.details.map(([code, description, level, status, tone, observations, questionId, savedStudentResponse, savedStudentEvaluation, savedActiveTab]) => { const questionKey = `${activeCompetency.id}-${code}`; const detail = studentQuestionDetails[questionKey] ?? { studentResponse: savedStudentResponse, studentEvaluation: savedStudentEvaluation, activeTab: savedActiveTab }; const isOpen = openQuestionKey === questionKey; return <div className="nsp-question-wrap" key={questionKey}><div className={`nsp-detail-row nsp-detail-row--interactive ${isOpen ? "active" : ""}`} role="button" tabIndex={0} onClick={() => setOpenQuestionKey((current) => current === questionKey ? null : questionKey)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpenQuestionKey((current) => current === questionKey ? null : questionKey); } }}><span><b>{code}</b>{description}</span><LevelSquares filled={level} tone={tone} total={5} /><span className={`nsp-detail-status ${tone}`}>{status}</span></div>{isOpen && <div className="nsp-question-detail"><QuestionDetail role="student" observations={observations} studentResponse={detail.studentResponse ?? ""} studentEvaluation={detail.studentEvaluation ?? false} activeTab={detail.activeTab ?? "pourquoi"} onSave={(nextDetail) => saveStudentQuestionDetail(questionKey, questionId, nextDetail)} /></div>}</div>; })}</div>
            <button type="button" className="nsp-advice-button" onClick={() => { const firstCode = activeCompetency.details[0]?.[0]; if (firstCode) setOpenQuestionKey(`${activeCompetency.id}-${firstCode}`); }}><ChatIcon />Voir les conseils de moniteur pour cette compétence</button>
          </article>
        </section>

        <section className="nsp-panel nsp-history-card">
          <div className="nsp-history-heading"><h2>Mes dernières leçons</h2><button type="button" onClick={() => setHistoryModalOpen(true)}>Voir tout l'historique <ChevronRightIcon /></button></div>
          <div className="nsp-history-scroll"><StudentHistoryTable lessons={visibleLessons} /></div>
          {lessons.length > 5 && <button type="button" className="nsp-load-more" onClick={() => setHistoryExpanded((expanded) => !expanded)}>{historyExpanded ? "Réduire l'historique" : "Charger plus d'historique"} <ChevronDownIcon /></button>}
        </section>
        {historyModalOpen && <div className="nsp-history-modal-backdrop" role="presentation" onMouseDown={() => setHistoryModalOpen(false)}><section className="nsp-history-modal" role="dialog" aria-modal="true" aria-label="Historique complet des leçons" onMouseDown={(event) => event.stopPropagation()}><header><h2>Historique complet des leçons</h2><button type="button" aria-label="Fermer l'historique" onClick={() => setHistoryModalOpen(false)}>×</button></header><div className="nsp-history-modal-table"><StudentHistoryTable lessons={lessons} /></div></section></div>}
      </main>
    </div>
  );
}
