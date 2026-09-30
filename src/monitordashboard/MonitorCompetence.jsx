import { useEffect, useState } from "react";
import "./MonitorCompetence.css";
import QuestionDetail from "./QuestionDetail.jsx";
import http from "../helpers/http";

// ── Icons ───────────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

// ── Full Competence Questions Data ──────────────────────────────────────────
const INITIAL_COMPETENCES_DATA = [
  {
    id: "c1",
    code: "C1",
    title: "Maîtriser le maniement du véhicule dans un trafic faible ou nul",
    progress: 96,
    color: "#facc15", // yellow/gold from reference circle
    badgeStyle: "black",
    questions: [
      {
        id: "c1-a",
        letter: "A",
        title: "Connaître les principaux organes et commandes du véhicule",
        status: "in_progress",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-b",
        letter: "B",
        title: "Entrer, s'installer au poste de conduite et en sortir sans surprendre",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-c",
        letter: "C",
        title: "Tenir, tourner le volant et maintenir la trajectoire",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-d1",
        letter: "D",
        title: "Démarrer et arrêter le véhicule sans caler",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-d2",
        letter: "D",
        title: "Démarrer en côte et dans un faux-plat, sans reculer",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-d3",
        letter: "D",
        title: "Déplacer le véhicule à allure lente",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-e",
        letter: "E",
        title: "Doser l'accélération et le freinage à diverses allures",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-f1",
        letter: "F",
        title: "Monter les vitesses sans erreurs et les passer au bon moment",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-f2",
        letter: "F",
        title: "Freiner et rétrograder sans lâcher le frein",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-f3",
        letter: "F",
        title: "Rétrograder sans freiner quand c'est nécessaire",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-f4",
        letter: "F",
        title: "Effectuer une première roulante à l'allure du pas",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-g",
        letter: "G",
        title: "Diriger la voiture en ligne droite et en courbe sans faire d'écarts de trajectoire",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-h",
        letter: "H",
        title: "Effectuer les contrôles vers l'arrière, sur les côtés et avertir au bon moment",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c1-i",
        letter: "I",
        title: "Effectuer une marche arrière et un demi-tour en sécurité",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
    ],
  },
  {
    id: "c2",
    code: "C2",
    title: "Appréhender la route et circuler dans des conditions normales",
    progress: 100,
    color: "#e05a47", // reddish/coral from reference circle
    badgeStyle: "white",
    questions: [
      {
        id: "c2-a",
        letter: "A",
        title: "Rechercher la signalisation et les indices utile(s) et en tenir compte",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c2-b",
        letter: "B",
        title: "Positionner le véhicule sur la voie de circulation adaptée",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c2-c",
        letter: "C",
        title: "Adapter l'allure aux situations",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c2-d",
        letter: "D",
        title: "Tourner à droite et à gauche en agglomération",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c2-e1",
        letter: "E",
        title: "Détecter, identifier et franchir les intersections",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c2-e2",
        letter: "E",
        title: "Céder le passage et marquer un arrêt précis à un stop",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c2-e3",
        letter: "E",
        title: "Aborder et franchir les feux",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c2-f",
        letter: "F",
        title: "Franchir les carrefours à sens giratoire et les ronds-points",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c2-g1",
        letter: "G",
        title: "Stationner en épi ou en bataille, à droite ou à gauche",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c2-g2",
        letter: "G",
        title: "Stationner en créneau à droite ou à gauche",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
    ],
  },
  {
    id: "c3",
    code: "C3",
    title: "Circuler dans des conditions difficiles et partager la route avec les autres usagers",
    progress: 95,
    color: "#f97316", // orange from reference circle
    badgeStyle: "white",
    questions: [
      {
        id: "c3-a",
        letter: "A",
        title: "Évaluer et maintenir les distances de sécurité",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c3-b1",
        letter: "B",
        title: "Croiser et anticiper les croisements difficiles",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c3-b2",
        letter: "B",
        title: "Dépasser et être dépassé(e)",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c3-c",
        letter: "C",
        title: "Passer les virages et conduire en côte et en descente",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c3-d",
        letter: "D",
        title: "Se comporter à l'égard des diverses catégories d'usagers avec respect et courtoisie",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c3-e",
        letter: "E",
        title: "S'insérer sur une voie rapide, y circuler et en sortir",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c3-f",
        letter: "F",
        title: "Conduire dans une circulation dense",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c3-g",
        letter: "G",
        title: "Connaître les règles de la circulation interfiles des motos et en tenir compte",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c3-h",
        letter: "H",
        title: "Conduire quand l'adhérence et la visibilité sont réduites",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c3-i",
        letter: "I",
        title: "Conduire dans les tunnels, sur les ponts, ...",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
    ],
  },
  {
    id: "c4",
    code: "C4",
    title: "Pratiquer une conduite autonome, sûre et économique",
    progress: 57,
    color: "#cbd5e1", // neutral/gray from reference circle
    badgeStyle: "white",
    questions: [
      {
        id: "c4-a",
        letter: "A",
        title: "Suivre un itinéraire de manière autonome",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c4-b",
        letter: "B",
        title: "Préparer et effectuer un voyage longue distance",
        status: "in_progress",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c4-c",
        letter: "C",
        title: "Connaître les principaux facteurs de risque et les recommandations à appliquer",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c4-d",
        letter: "D",
        title: "Connaître les comportements à adopter lors d'un accident de la route",
        status: "in_progress",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c4-e",
        letter: "E",
        title: "Avoir fait l'expérience des aides à la conduite du véhicule",
        status: "neutral",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c4-f",
        letter: "F",
        title: "Acquérir des notions sur l'entretien, le dépannage et les situations d'urgence",
        status: "in_progress",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
      {
        id: "c4-g",
        letter: "G",
        title: "Pratiquer l'écoconduite",
        status: "acquired",
        lessonCount: 0,
        observations: "",
        studentEvaluation: "",
        studentResponse: "",
      },
    ],
  },
];

const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2" /><path d="M22 12h-2" />
  </svg>
);

const IconClock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
);

const IconMessage = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8" /><path d="M8 13h5" /></svg>
);

const IconManoeuvre = ({ type }) => {
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

const COMPETENCE_TONES = ["green", "blue", "purple", "amber"];

const RECENT_LESSONS = [
  { id: 1, weekday: "SAM.", day: "31", month: "MAI", date: "31 Mai 2025", time: "10h00 - 11h30", type: "Conduite", duration: "1h30", skills: ["C1", "C2", "C3"], report: "Très bonne séance, progression sur les créneaux et l'anticipation. Continuer à travailler la fluidité des changements de rapports.", level: 4 },
  { id: 2, weekday: "MER.", day: "28", month: "MAI", date: "28 Mai 2025", time: "16h00 - 17h30", type: "Conduite", duration: "1h30", skills: ["C1", "C2"], report: "Séance productive. Bonnes bases sur la gestion de l'espace. Attention à la vitesse en agglomération.", level: 4 },
  { id: 3, weekday: "MAR.", day: "27", month: "MAI", date: "27 Mai 2025", time: "18h30 - 19h30", type: "Code en ligne", duration: "1h00", skills: [], report: "Série : 15 - Résultat : 88%", level: 5 },
];

function getStudentId(student) {
  return student?.student?.id ?? student?.student_id ?? student?.id ?? null;
}

function getStudentName(student) {
  return student?.name || student?.full_name || [student?.first_name, student?.last_name].filter(Boolean).join(" ").trim() || student?.student?.user?.name || "Candidat";
}

function formatMinutes(minutes = 0) {
  const total = Math.max(0, Number(minutes) || 0);
  return `${Math.floor(total / 60)}h${String(total % 60).padStart(2, "0")}`;
}

function getQuestionTone(status) {
  if (status === "acquired" || status === "completed") return "green";
  if (status === "in_progress" || status === "partial") return "blue";
  return "neutral";
}

function getQuestionStatus(status) {
  if (status === "acquired" || status === "completed") return "Acquis";
  if (status === "in_progress" || status === "partial") return "En cours";
  return "À travailler";
}

function ProgressRing({ progress }) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="mc-new-progress-ring" aria-label={`${progress} % de progression`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="mc-new-progress-track" cx="50" cy="50" r={radius} />
        <circle className="mc-new-progress-fill" cx="50" cy="50" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)} />
      </svg>
      <strong>{progress}%</strong>
    </div>
  );
}

function LevelSquares({ status, level, total = 5, onChange, disabled = false }) {
  const filled = typeof level === "number"
    ? Math.min(total, Math.max(0, level))
    : status === "acquired" || status === "completed" ? total : status === "in_progress" || status === "partial" ? Math.ceil(total * 0.6) : 0;
  const tone = getQuestionTone(status);
  const isInteractive = typeof onChange === "function";

  return <span className={`mc-new-level-squares ${isInteractive ? "interactive" : ""}`} aria-label={`${filled} niveaux sur ${total}`}>{Array.from({ length: total }, (_, index) => isInteractive ? <button key={index} type="button" disabled={disabled} aria-label={`Attribuer le niveau ${index + 1} sur ${total}`} aria-pressed={index < filled} className={index < filled ? `filled ${tone}` : ""} onClick={(event) => { event.stopPropagation(); onChange(index + 1 === filled ? 0 : index + 1); }} /> : <i key={index} className={index < filled ? `filled ${tone}` : ""} />)}</span>;
}

function MonitorHistoryTable({ lessons }) {
  return <table className="mc-new-history-table"><thead><tr><th>Date</th><th>Type</th><th>Durée</th><th>Compétences travaillées</th><th>Bilan du moniteur</th><th>Niveau atteint</th></tr></thead><tbody>{lessons.length ? lessons.map((lesson) => <tr key={lesson.id}><td><div className="mc-new-lesson-date"><div><span>{lesson.weekday}</span><strong>{lesson.day}</strong><small>{lesson.month}</small></div><p><b>{lesson.date}</b><span>{lesson.time}</span></p></div></td><td><span className={`mc-new-lesson-type ${lesson.type === "Code en ligne" ? "blue" : "green"}`}>{lesson.type}</span></td><td><strong>{lesson.duration}</strong></td><td>{lesson.skills.length ? <span className="mc-new-lesson-skills">{lesson.skills.map((skill, index) => <i key={skill} className={COMPETENCE_TONES[index]}>{skill}</i>)}</span> : "—"}</td><td><p className="mc-new-lesson-report">{lesson.report || "—"}</p></td><td><span className="mc-new-lesson-level"><LevelSquares status={lesson.level >= 5 ? "acquired" : "in_progress"} level={lesson.level} total={5} /><small>{lesson.level}/5</small></span></td></tr>) : <tr><td colSpan="6" className="mc-new-history-empty">Aucune leçon associée à ce moniteur.</td></tr>}</tbody></table>;
}

export default function MonitorCompetence({
  candidate,
  monitorName = "Humza",
  monitorId = null,
  onBack,
}) {
  const [activeCompetenceId, setActiveCompetenceId] = useState("c1");
  const [openQuestionId, setOpenQuestionId] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(() => getStudentId(candidate));
  const [progressData, setProgressData] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    http.get("/monitor/students", { params: monitorId ? { monitor_id: monitorId } : {} })
      .then((response) => {
        if (cancelled) return;
        const rawStudents = response.data?.data?.data ?? response.data?.data ?? response.data?.students ?? [];
        const uniqueStudents = Array.from(new Map((Array.isArray(rawStudents) ? rawStudents : [])
          .map((student) => [String(getStudentId(student) ?? ""), student])
          .filter(([id]) => id)).values());

        setStudents(uniqueStudents);
        const firstStudentId = getStudentId(uniqueStudents[0]) ?? null;
        setProgressLoading(Boolean(firstStudentId));
        setSelectedStudentId(firstStudentId);
      })
      .catch(() => {
        if (!cancelled) {
          setStudents([]);
          setSelectedStudentId(null);
          setProgressLoading(false);
        }
      })
      .finally(() => {
        if (!cancelled) setStudentsLoading(false);
      });

    return () => { cancelled = true; };
  }, [monitorId]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedStudentId) {
      return () => { cancelled = true; };
    }

    http.get(`/monitor/progress/${selectedStudentId}`, { params: monitorId ? { monitor_id: monitorId } : {} })
      .then((response) => {
        if (!cancelled) {
          const data = response.data?.data ?? null;
          setProgressData(data);
          setActiveCompetenceId(data?.competencies?.[0]?.id ?? "c1");
          setOpenQuestionId(null);
        }
      })
      .catch(() => {
        if (!cancelled) setProgressData(null);
      })
      .finally(() => {
        if (!cancelled) setProgressLoading(false);
      });

    return () => { cancelled = true; };
  }, [monitorId, selectedStudentId]);

  // Competency data is loaded for the selected student only.
  const competencesData = progressData?.competencies ?? (progressLoading ? INITIAL_COMPETENCES_DATA : []);
  const selectedStudent = students.find((student) => String(getStudentId(student)) === String(selectedStudentId));
  const studentName = progressData?.student?.name || getStudentName(selectedStudent);
  const studentInitials = studentName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "R";

  const toggleQuestion = (questionId) => {
    setOpenQuestionId((prev) => (prev === questionId ? null : questionId));
  };

  const handleStudentChange = (event) => {
    setProgressLoading(true);
    setProgressData(null);
    setSelectedStudentId(event.target.value);
  };

  const saveQuestionEvaluation = (question, changes = {}) => {
    if (!selectedStudentId || savingQuestionId) return;

    setSavingQuestionId(question.id);
    http.put(`/monitor/progress/${selectedStudentId}/competencies/${question.id}`, {
      rating: changes.rating ?? question.level ?? 0,
      observations: changes.observations ?? question.observations ?? "",
      student_evaluation: changes.studentEvaluation ?? question.studentEvaluation ?? false,
      student_response: changes.studentResponse ?? question.studentResponse ?? "",
      active_tab: changes.activeTab ?? question.activeTab ?? "pourquoi",
    }, { params: monitorId ? { monitor_id: monitorId } : {} })
      .then((response) => {
        const data = response.data?.data ?? null;
        if (data) setProgressData(data);
      })
      .finally(() => setSavingQuestionId(null));
  };

  const activeCompetence = competencesData.find((competence) => competence.id === activeCompetenceId) ?? competencesData[0] ?? null;
  const completedSkills = competencesData.flatMap((competence) => competence.questions).filter((question) => question.level >= 5 || question.status === "acquired" || question.status === "completed").length;
  const totalSkills = competencesData.reduce((total, competence) => total + competence.questions.length, 0);
  const overallPercentage = progressData?.overallPercentage ?? (totalSkills ? Math.round((completedSkills / totalSkills) * 100) : 0);
  const hours = progressData?.hours ?? { plannedMinutes: 0, completedMinutes: 0, remainingMinutes: 0 };
  const lessons = progressData?.lessons ?? RECENT_LESSONS;

  if (studentsLoading || progressLoading) {
    return <div className="mc-new-progress-loading">Chargement de la progression…</div>;
  }

  if (!selectedStudent || !activeCompetence) {
    return <div className="mc-new-progress-empty">Aucun candidat ayant une réservation avec ce moniteur.</div>;
  }

  return (
    <div className="mc-progress-page mc-new-progress-page">
      <section className="mc-new-overview-grid" aria-label="Vue d'ensemble de la progression">
        <article className="mc-new-panel mc-new-overview-card mc-new-global-card">
          <h2>Progression globale</h2>
          <div className="mc-new-global-body">
            <ProgressRing progress={overallPercentage} />
            <div className="mc-new-global-copy">
              <strong>{studentName}</strong>
              <span>{completedSkills} compétences acquises sur {totalSkills}.</span>
              <span>Le candidat est suivi par {monitorName}.</span>
              <button type="button" onClick={() => document.querySelector(".mc-new-detail-card")?.scrollIntoView({ behavior: "smooth", block: "start" })}><IconTarget />Voir les compétences</button>
            </div>
          </div>
        </article>

        <article className="mc-new-panel mc-new-overview-card mc-new-hours-card">
          <h2><IconClock />Heures de conduite</h2>
          <div className="mc-new-hours-values"><span><strong>{formatMinutes(hours.completedMinutes)}</strong><small>réalisées</small></span><span><b>sur {formatMinutes(hours.plannedMinutes)}</b><small>prévues</small></span></div>
          <div className="mc-new-hours-progress"><span style={{ width: `${hours.plannedMinutes ? Math.min(100, (hours.completedMinutes / hours.plannedMinutes) * 100) : 0}%` }} /></div>
          <div className="mc-new-next-review"><small>Heures restantes</small><strong><IconCalendar />{formatMinutes(hours.remainingMinutes)}</strong></div>
        </article>

        <article className="mc-new-panel mc-new-overview-card mc-new-candidate-card">
          <h2><IconCalendar />Candidat suivi</h2>
          <label className="mc-new-student-picker">Candidat<select value={selectedStudentId ?? ""} onChange={handleStudentChange}>{students.map((student) => <option key={getStudentId(student)} value={getStudentId(student)}>{getStudentName(student)}</option>)}</select></label>
          <div className="mc-new-candidate-body"><div className="mc-new-candidate-avatar">{studentInitials}</div><div className="mc-new-candidate-copy"><strong>{studentName}</strong><span>Moniteur : <b>{monitorName}</b></span><span>Livret de compétences actif</span><button type="button" onClick={onBack}><IconBack />Retour au tableau de bord</button></div></div>
        </article>
      </section>

      <section className="mc-new-competency-grid">
        <article className="mc-new-panel mc-new-breakdown-card">
          <div className="mc-new-manoeuvres-card" aria-label="Manœuvres effectuées lors des leçons">
            <h3>Manœuvres effectuées lors des leçons</h3>
            <div className="mc-new-manoeuvres-grid">
              {MANOEUVRES.map((manoeuvre) => (
                <div className="mc-new-manoeuvre-item" key={manoeuvre.id} title={manoeuvre.label}>
                  <span className="mc-new-manoeuvre-icon"><IconManoeuvre type={manoeuvre.id} /></span>
                  <strong>{manoeuvre.count}</strong>
                  <span>{manoeuvre.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mc-new-section-title"><h2>Répartition par compétence (REMC)</h2><span title="Référentiel pour l'éducation à une mobilité citoyenne">i</span></div>
          <div className="mc-new-competency-list">{competencesData.map((competence, index) => <button type="button" key={competence.id} className={`mc-new-competency-row mc-new-tone-${COMPETENCE_TONES[index]} ${activeCompetenceId === competence.id ? "active" : ""}`} onClick={() => { setActiveCompetenceId(competence.id); setOpenQuestionId(null); }}><span className="mc-new-competency-icon"><IconTarget /></span><span className="mc-new-competency-copy"><span className="mc-new-competency-title"><strong>{competence.code}</strong><span>{competence.title}</span></span><span className="mc-new-competency-progress"><i style={{ width: `${competence.progress}%` }} /></span><small>{competence.questions.length} sous-compétences</small></span><strong className="mc-new-competency-percent">{competence.progress}%</strong><span className="mc-new-competency-status">{competence.progress >= 80 ? "Acquis" : competence.progress >= 50 ? "En cours" : "À travailler"}</span></button>)}</div>
          <div className="mc-new-legend"><span><i className="green" />Acquis</span><span><i className="blue" />En cours</span><span><i className="amber" />En progression</span><span><i className="neutral" />À travailler</span></div>
        </article>

        <article className="mc-new-panel mc-new-detail-card">
          <h2>Détail de la compétence sélectionnée</h2>
          <div className="mc-new-competency-tabs" role="tablist" aria-label="Choisir une compétence">{competencesData.map((competence) => <button key={competence.id} type="button" role="tab" aria-selected={activeCompetenceId === competence.id} className={activeCompetenceId === competence.id ? "active" : ""} onClick={() => { setActiveCompetenceId(competence.id); setOpenQuestionId(null); }}><strong>{competence.code}</strong><span>{competence.title}</span></button>)}</div>
          <div className={`mc-new-detail-summary mc-new-tone-${COMPETENCE_TONES[competencesData.indexOf(activeCompetence)]}`}><div><h3>{activeCompetence.code} - {activeCompetence.title}</h3><p>Évaluation détaillée des compétences travaillées par le candidat.</p></div><span><strong>{activeCompetence.progress}%</strong><small>Niveau atteint</small></span></div>
          <div className="mc-new-detail-table" role="table" aria-label={`Détails de la compétence ${activeCompetence.code}`}><div className="mc-new-detail-row mc-new-detail-row--head" role="row"><span>Compétence</span><span>Niveau atteint</span><span>Statut</span><span aria-hidden="true" /></div>{activeCompetence.questions.map((question) => <div className="mc-new-question-wrap" key={question.id}><div className={`mc-new-detail-row ${openQuestionId === question.id ? "active" : ""}`}><span><b>{question.letter}</b>{question.title}</span><LevelSquares status={question.status} level={question.level} disabled={savingQuestionId === question.id} onChange={(level) => saveQuestionEvaluation(question, { rating: level })} /><span className={`mc-new-detail-status ${getQuestionTone(question.status)}`}>{savingQuestionId === question.id ? "Enregistrement…" : getQuestionStatus(question.status)}</span><button type="button" className={`mc-new-question-toggle ${openQuestionId === question.id ? "open" : ""}`} aria-label={`${openQuestionId === question.id ? "Fermer" : "Ouvrir"} les observations de ${question.title}`} aria-expanded={openQuestionId === question.id} onClick={() => toggleQuestion(question.id)}>⌄</button></div>{openQuestionId === question.id && <div className="mc-new-question-detail"><QuestionDetail letter={question.letter} title={question.title} status={question.status} observations={question.observations} lessonCount={question.lessonCount} studentEvaluation={question.studentEvaluation} studentResponse={question.studentResponse} activeTab={question.activeTab} onSave={(updatedData) => saveQuestionEvaluation(question, updatedData)} /></div>}</div>)}</div>
          <button type="button" className="mc-new-advice-button" onClick={() => setOpenQuestionId(activeCompetence.questions[0]?.id ?? null)}><IconMessage />Voir ou modifier l'évaluation</button>
        </article>
      </section>

      <section className="mc-new-panel mc-new-history-card" aria-label="Dernières leçons du candidat">
        <div className="mc-new-history-heading"><h2>Dernières leçons</h2><button type="button" onClick={() => setHistoryModalOpen(true)}>Voir tout l'historique <span>›</span></button></div>
        <div className="mc-new-history-scroll"><MonitorHistoryTable lessons={lessons} /></div>
        <button type="button" className="mc-new-load-more">Charger plus d'historique <span>⌄</span></button>
      </section>
      {historyModalOpen && <div className="mc-new-history-modal-backdrop" role="presentation" onMouseDown={() => setHistoryModalOpen(false)}><section className="mc-new-history-modal" role="dialog" aria-modal="true" aria-label="Historique complet des leçons" onMouseDown={(event) => event.stopPropagation()}><header><h2>Historique complet des leçons</h2><button type="button" aria-label="Fermer l'historique" onClick={() => setHistoryModalOpen(false)}>×</button></header><div className="mc-new-history-modal-table"><MonitorHistoryTable lessons={lessons} /></div></section></div>}
    </div>
  );
}
