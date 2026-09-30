import React, { useState } from "react";
import "./MonitorCompetence.css";
import QuestionDetail from "./QuestionDetail.jsx";

// ── Icons ───────────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const IconChevronDown = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s ease",
    }}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const IconChevronRight = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#94a3b8"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.2s ease",
    }}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const IconCrossedSquare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="1.5" stroke="#4e6b2c" strokeWidth="2.2" fill="none" />
    <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" stroke="#4e6b2c" strokeWidth="2.2" />
    <line x1="20.5" y1="3.5" x2="3.5" y2="20.5" stroke="#4e6b2c" strokeWidth="2.2" />
  </svg>
);

const IconDiagonalSquare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="1.5" stroke="#d97706" strokeWidth="2.2" fill="none" />
    <line x1="4" y1="4" x2="20" y2="20" stroke="#d97706" strokeWidth="2.2" />
  </svg>
);

const IconEmptySquare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="1.5" stroke="#9ca3af" strokeWidth="2" fill="none" />
  </svg>
);

const StatusIcon = ({ status }) => {
  if (status === "acquired" || status === "completed") {
    return <IconCrossedSquare />;
  }
  if (status === "in_progress" || status === "partial") {
    return <IconDiagonalSquare />;
  }
  return <IconEmptySquare />;
};

// ── Top Summary Icons (Matching Mobile Screen) ──
const IconCar = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const IconEditPencil = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const IconClipboard = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

// ── Manoeuvre SVGs ──
const IconManoeuvrePerpendicular = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <line x1="6" y1="4" x2="6" y2="28" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="26" y1="4" x2="26" y2="28" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="16" y1="4" x2="16" y2="28" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
    <rect x="11" y="12" width="10" height="8" rx="2" fill="#1e293b" />
    <path d="M9 16H2M5 13L2 16L5 19" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <text x="14" y="9" fontSize="7" fontWeight="bold" fill="#64748b">P</text>
    <text x="14" y="27" fontSize="7" fontWeight="bold" fill="#64748b">P</text>
  </svg>
);

const IconManoeuvreParallel = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <line x1="4" y1="6" x2="28" y2="6" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="4" y1="26" x2="28" y2="26" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="8" y1="6" x2="8" y2="26" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
    <rect x="12" y="11" width="8" height="10" rx="2" fill="#1e293b" />
    <path d="M12 9V3M9 6L12 3L15 6" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <text x="14" y="23" fontSize="7" fontWeight="bold" fill="#64748b">P</text>
  </svg>
);

const IconManoeuvreStraight = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <line x1="16" y1="2" x2="16" y2="30" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
    <rect x="12" y="11" width="8" height="10" rx="2" fill="#1e293b" />
    <path d="M24 10V22M21 19L24 22L27 19" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconManoeuvreUturn = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <path d="M10 24V12a6 6 0 0 1 12 0v12" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 20l3 4 3-4" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconManoeuvreRoundabout = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="7" stroke="#0f172a" strokeWidth="2.2" />
    <circle cx="16" cy="16" r="3" fill="#0f172a" />
    <path d="M16 9a7 7 0 0 1 7 7" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    <path d="M9 16H2M5 13L2 16L5 19" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconManoeuvreStopPrecision = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <circle cx="22" cy="7" r="2.5" fill="#0f172a" />
    <line x1="6" y1="7" x2="18" y2="7" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 7l-3 0" />
    <rect x="12" y="13" width="8" height="10" rx="2" fill="#1e293b" />
  </svg>
);

// ── Circular Donut Progress Ring Component (C1, C2, C3, C4) ──
function DonutCircle({ code, progress, color, active, onClick }) {
  const size = 78;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      type="button"
      className={`mc-donut-btn ${active ? "mc-donut-btn--active" : ""}`}
      onClick={onClick}
      title={`${code} : ${progress}%`}
      aria-label={`${code} progression ${progress}%`}
    >
      <div className="mc-donut-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mc-donut-svg">
          {/* Background gray circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Active progress colored arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transformOrigin: "center",
              transform: "rotate(-90deg)",
              transition: "stroke-dashoffset 0.6s ease",
            }}
          />
        </svg>
        <span className="mc-donut-code">{code}</span>
      </div>
    </button>
  );
}

// ── Full Competence Questions Data ──────────────────────────────────────────
const INITIAL_COMPETENCES_DATA = [
  {
    id: "c1",
    code: "C1",
    title: "Maîtriser le maniement du véhicule dans un trafic faible ou nul",
    progress: 96,
    color: "#facc15",
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
    color: "#e05a47",
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
    color: "#f97316",
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
    color: "#cbd5e1",
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

const TOTAL_SEGMENTS = 14;

function ProgressBar({ percent }) {
  const filled = Math.round((percent / 100) * TOTAL_SEGMENTS);
  return (
    <div className="mc-overall-progress-bar">
      {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
        <div
          key={i}
          className={`mc-progress-seg ${i < filled ? "mc-progress-seg--filled" : ""}`}
        />
      ))}
    </div>
  );
}

export default function MonitorCompetence({
  candidate,
  monitorName = "Humza",
  onBack,
}) {
  const [openCompetences, setOpenCompetences] = useState({
    c1: true,
    c2: true,
    c3: false,
    c4: false,
  });

  const [openQuestionId, setOpenQuestionId] = useState("c1-b");
  const [competencesData, setCompetencesData] = useState(INITIAL_COMPETENCES_DATA);

  const studentName = candidate?.name || candidate?.first_name || "Raza";
  const studentInitials = studentName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "R";

  const toggleCompetence = (id) => {
    setOpenCompetences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDonutClick = (id) => {
    setOpenCompetences((prev) => ({
      ...prev,
      [id]: true,
    }));
    const el = document.getElementById(`comp-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleQuestion = (questionId) => {
    setOpenQuestionId((prev) => (prev === questionId ? null : questionId));
  };

  const handleSaveQuestionDetail = (questionId, updatedData) => {
    setCompetencesData((prev) =>
      prev.map((comp) => ({
        ...comp,
        questions: comp.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                observations: updatedData.observations,
                studentResponse: updatedData.studentResponse,
                activeTab: updatedData.activeTab,
              }
            : q
        ),
      }))
    );
  };

  const overallPercentage = Math.round(
    competencesData.reduce((acc, c) => acc + c.progress, 0) / competencesData.length
  );

  return (
    <div className="mc-progress-page">
      {/* ── Page Header ── */}
      <header className="mc-page-header">
        <div className="mc-header-left">
          {onBack && (
            <button
              type="button"
              className="mc-back-btn"
              onClick={onBack}
              aria-label="Retour"
            >
              <IconBack />
            </button>
          )}
          <div className="mc-header-text">
            <h1>{studentName}</h1>
            <p>PASSPERMISFACILE • Progression &amp; Compétences</p>
          </div>
        </div>
      </header>

      {/* ── Top Badges Row (Car Hours, Percentage, Evaluation - Reference Image) ── */}
      <section className="mc-quick-metrics-row">
        <div className="mc-metric-badge-group">
          <div className="mc-metric-icon-wrap">
            <IconCar />
          </div>
          <div className="mc-metric-tags">
            <span className="mc-tag mc-tag--yellow">23h</span>
            <span className="mc-tag mc-tag--green">30h</span>
          </div>
        </div>

        <div className="mc-metric-badge-group">
          <div className="mc-metric-icon-wrap">
            <IconEditPencil />
          </div>
          <div className="mc-metric-tags">
            <span className="mc-tag mc-tag--orange">57%</span>
          </div>
        </div>

        <div className="mc-metric-badge-group">
          <div className="mc-metric-icon-wrap">
            <IconClipboard />
          </div>
          <div className="mc-metric-tags">
            <span className="mc-tag mc-tag--gray">0 / 2</span>
          </div>
        </div>
      </section>

      {/* ── Section: Manoeuvres Card (Reference Image) ── */}
      <section className="mc-manoeuvres-card">
        <h3 className="mc-manoeuvres-title">Manoeuvres effectuées lors des leçons</h3>
        <div className="mc-manoeuvres-grid">
          <div className="mc-manoeuvre-item">
            <div className="mc-manoeuvre-icon-box">
              <IconManoeuvrePerpendicular />
            </div>
            <span className="mc-manoeuvre-count">1</span>
          </div>

          <div className="mc-manoeuvre-item">
            <div className="mc-manoeuvre-icon-box">
              <IconManoeuvreParallel />
            </div>
            <span className="mc-manoeuvre-count">1</span>
          </div>

          <div className="mc-manoeuvre-item">
            <div className="mc-manoeuvre-icon-box">
              <IconManoeuvreStraight />
            </div>
            <span className="mc-manoeuvre-count">1</span>
          </div>

          <div className="mc-manoeuvre-item">
            <div className="mc-manoeuvre-icon-box">
              <IconManoeuvreUturn />
            </div>
            <span className="mc-manoeuvre-count">2</span>
          </div>

          <div className="mc-manoeuvre-item">
            <div className="mc-manoeuvre-icon-box">
              <IconManoeuvreRoundabout />
            </div>
            <span className="mc-manoeuvre-count">3</span>
          </div>

          <div className="mc-manoeuvre-item">
            <div className="mc-manoeuvre-icon-box">
              <IconManoeuvreStopPrecision />
            </div>
            <span className="mc-manoeuvre-count">2</span>
          </div>
        </div>
      </section>

      {/* ── Section: C1 C2 C3 C4 Donut Progress Rings (Requested Feature) ── */}
      <section className="mc-donuts-section">
        <div className="mc-donuts-row">
          {competencesData.map((comp) => (
            <DonutCircle
              key={comp.id}
              code={comp.code}
              progress={comp.progress}
              color={comp.color}
              active={openCompetences[comp.id]}
              onClick={() => handleDonutClick(comp.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Section 1: Progress Overview Card ── */}
      <section className="mc-overview-card">
        <div className="mc-overview-top">
          <div className="mc-student-meta">
            <div className="mc-student-avatar">{studentInitials}</div>
            <div className="mc-student-info">
              <h2>{studentName}</h2>
              <p>Moniteur : <strong>{monitorName}</strong> • Date : <strong>28 Sep 2026</strong></p>
            </div>
          </div>
          <div>
            <span className="mc-status-badge mc-status-badge--completed">
              Status : Réalisé
            </span>
          </div>
        </div>

        <div className="mc-overview-stats-grid">
          <div className="mc-stat-item">
            <span className="mc-stat-item-label">Prévu (Planned)</span>
            <span className="mc-stat-item-value">1h</span>
          </div>
          <div className="mc-stat-item">
            <span className="mc-stat-item-label">Effectué (Completed)</span>
            <span className="mc-stat-item-value">1h</span>
          </div>
          <div className="mc-stat-item">
            <span className="mc-stat-item-label">Restant (Remaining)</span>
            <span className="mc-stat-item-value">0h</span>
          </div>
          <div className="mc-stat-item">
            <span className="mc-stat-item-label">Taux de réussite</span>
            <span className="mc-stat-item-value">{overallPercentage}%</span>
          </div>
        </div>

        <div className="mc-overall-progress-bar-wrap">
          <div className="mc-overall-progress-header">
            <span>Progression globale</span>
            <span>{overallPercentage}%</span>
          </div>
          <ProgressBar percent={overallPercentage} />
        </div>
      </section>

      {/* ── Section 2: Competences List (C1, C2, C3, C4) ── */}
      <section className="mc-competences-container">
        {competencesData.map((competence) => {
          const isCompOpen = openCompetences[competence.id];

          return (
            <div
              key={competence.id}
              id={`comp-card-${competence.id}`}
              className="mc-competence-card"
            >
              <button
                type="button"
                className="mc-competence-header"
                onClick={() => toggleCompetence(competence.id)}
                aria-expanded={isCompOpen}
              >
                <div className="mc-competence-header-left">
                  <span className="mc-competence-code">{competence.code}</span>
                  <span className="mc-competence-title">{competence.title}</span>
                </div>

                <div className="mc-competence-header-right">
                  <div
                    className={`mc-pct-badge ${
                      competence.badgeStyle === "black"
                        ? "mc-pct-badge--black"
                        : "mc-pct-badge--white"
                    }`}
                  >
                    {competence.progress}%
                  </div>
                  <div className="mc-header-chevron">
                    <IconChevronDown open={isCompOpen} />
                  </div>
                </div>
              </button>

              {isCompOpen && (
                <div className="mc-questions-list">
                  {competence.questions.map((question) => {
                    const isQuestionOpen = openQuestionId === question.id;

                    return (
                      <div key={question.id} className="mc-question-row-wrap">
                        <button
                          type="button"
                          className={`mc-question-row ${
                            isQuestionOpen ? "mc-question-row--active" : ""
                          }`}
                          onClick={() => toggleQuestion(question.id)}
                          aria-expanded={isQuestionOpen}
                        >
                          <div className="mc-question-left">
                            <span className="mc-question-letter">
                              {question.letter}
                            </span>
                            <span className="mc-question-title">
                              {question.title}
                            </span>
                          </div>

                          <div className="mc-question-right">
                            <div className="mc-eval-icon">
                              <StatusIcon status={question.status} />
                            </div>
                            <div className="mc-question-arrow">
                              <IconChevronRight open={isQuestionOpen} />
                            </div>
                          </div>
                        </button>

                        {isQuestionOpen && (
                          <QuestionDetail
                            letter={question.letter}
                            title={question.title}
                            status={question.status}
                            observations={question.observations}
                            lessonCount={question.lessonCount}
                            studentEvaluation={question.studentEvaluation}
                            studentResponse={question.studentResponse}
                            onSave={(updatedData) =>
                              handleSaveQuestionDetail(question.id, updatedData)
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}