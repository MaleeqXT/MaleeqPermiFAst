import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../helpers/http.jsx";
import StudentSidebar from "./StudentSidebar.jsx";
import StudentHeader from "./StudentHeader.jsx";
import "./CandidateDashboard.css";
import "./CandidateExamPage.css";

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /></svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.7 2.7L16.5 9" /></svg>
);
const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3.5h6V7H9zM9 11h6M9 15h6M9 19h4" /></svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
const IdCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8" cy="11" r="2" /><path d="M5.5 16c.7-1.6 1.5-2.3 2.5-2.3s1.8.7 2.5 2.3M13 10h5M13 14h4" /></svg>
);
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3v-4l2-2 2-4h10l2 4 2 2v4h-2M5 17h14M7 17v2M17 17v2M6 11h12" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 5 11 7-11 7z" /></svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H3zM21 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6z" /></svg>
);
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
);
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM12 13v4M8 21h8M9 17h6M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4" /></svg>
);
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);

const IMPORTANT_INFO = [
  { id: "identity", icon: <IdCardIcon />, title: "Pièce d'identité obligatoire", description: "Pensez à vous munir de votre pièce d'identité originale le jour de l'examen." },
  { id: "vehicle", icon: <CarIcon />, title: "Véhicule", description: "Le véhicule d'examen sera celui de l'auto-école." },
  { id: "arrival", icon: <ClockIcon />, title: "Arrivez 15 min avant", description: "Présentez-vous au moins 15 minutes avant l'heure de votre examen." },
];

const PREPARATION_ITEMS = [
  { id: "simulator", icon: <PlayIcon />, tone: "purple", title: "Simulateur d'examen", description: "Entraînez-vous avec des examens blancs." },
  { id: "guides", icon: <BookIcon />, tone: "green", title: "Fiches conseils", description: "Nos conseils pour réussir le jour J." },
  { id: "mistakes", icon: <WarningIcon />, tone: "amber", title: "Erreurs fréquentes", description: "Découvrez les erreurs à éviter." },
];

function apiDate(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value, options = {}) {
  const date = apiDate(value);
  if (!date) return "Date à confirmer";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(date);
}

function formatExamDateTime(exam) {
  if (!exam?.date) return "Date et heure à confirmer";
  const formatted = formatDate(exam.date, { weekday: "long" });
  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}${exam.time ? ` à ${exam.time.replace(":", "h")}` : ""}`;
}

function daysUntil(value) {
  const date = apiDate(value);
  if (!date) return "Date à confirmer";
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const days = Math.ceil((date.getTime() - today.getTime()) / 86400000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  return `Dans ${days} jours`;
}

function resultLabel(exam) {
  if (exam?.result === "admitted" || exam?.status === "success") return "Admis";
  if (exam?.result === "refused" || exam?.status === "failed") return "Non admis";
  return "À venir";
}

function SummaryCard({ card }) {
  return (
    <article className="nse-summary-card">
      <span className={`nse-summary-icon nse-tone-${card.tone}`}>{card.icon}</span>
      <div className="nse-summary-copy">
        <span>{card.label}</span>
        <strong>{card.value}</strong>
        <small className={card.id === "practical" && card.accent ? "nse-summary-meta-accent" : ""}>{card.meta}</small>
      </div>
    </article>
  );
}

function ScoreRing({ score, tone }) {
  return <span className={`nse-score-ring nse-score-ring--${tone}`} style={{ "--nse-score-angle": `${score * 3.6}deg` }} aria-label={`${score} %`}><strong>{score}%</strong></span>;
}

export default function CandidateExamPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    http.get("/student/exams")
      .then(({ data }) => {
        if (active) setExamData(data?.data ?? null);
      })
      .catch(() => {
        if (active) {
          setExamData(null);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [reloadKey]);

  const handleSidebarNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const nextExam = examData?.next_exam ?? null;
  const latestExam = examData?.latest_exam ?? null;
  const mockExams = Array.isArray(examData?.mock_exams) ? examData.mock_exams : [];
  const completedExams = Math.max(0, Number(examData?.completed_exams) || 0);
  const attempts = Math.max(0, Number(examData?.attempts) || 0);
  const hasExamRecord = Boolean(examData?.has_exam_record);
  const hasResult = Boolean(latestExam?.result) || ["success", "failed"].includes(latestExam?.status);

  const summaryCards = [
    {
      id: "practical",
      icon: <CalendarIcon />,
      tone: "green",
      label: "Examen pratique prévu",
      value: loading ? "…" : loadError ? "Indisponible" : nextExam ? formatDate(nextExam.date) : "Non planifié",
      meta: loading ? "Chargement" : loadError ? "Actualisez les données" : nextExam ? daysUntil(nextExam.date) : "Aucune date enregistrée",
      accent: Boolean(nextExam),
    },
    {
      id: "mock",
      icon: <CheckCircleIcon />,
      tone: "success",
      label: "Examens blancs réalisés",
      value: loading ? "…" : loadError ? "—" : String(completedExams),
      meta: loadError ? "Données indisponibles" : completedExams ? `${completedExams} examen${completedExams > 1 ? "s" : ""} terminé${completedExams > 1 ? "s" : ""}` : "Aucun examen terminé",
    },
    {
      id: "attempts",
      icon: <ClipboardIcon />,
      tone: "purple",
      label: "Tentatives d'examen",
      value: loading ? "…" : loadError ? "—" : String(attempts),
      meta: loadError ? "Données indisponibles" : attempts ? `${attempts} présentation${attempts > 1 ? "s" : ""}` : "Pas encore présenté",
    },
  ];

  const timelineSteps = [
    {
      id: "registration",
      label: "Inscription",
      detail: examData?.registration_date ? `Le ${formatDate(examData.registration_date)}` : "Validée",
      state: "complete",
    },
    {
      id: "file",
      label: "Dossier enregistré",
      detail: hasExamRecord ? "Validé" : "En attente",
      state: hasExamRecord ? "complete" : "current",
    },
    {
      id: "exam",
      label: "Examen prévu",
      detail: nextExam ? formatDate(nextExam.date, { day: "2-digit", month: "2-digit", year: "numeric" }) : hasResult ? "Passé" : "À planifier",
      state: hasResult && !nextExam ? "complete" : nextExam ? "current" : "future",
    },
    {
      id: "result",
      label: "Résultat",
      detail: resultLabel(latestExam),
      state: hasResult ? "complete" : "future",
    },
  ];
  const timelineProgress = hasResult ? "75%" : nextExam ? "50%" : hasExamRecord ? "25%" : "0%";
  const examLocation = nextExam?.location || "Lieu à confirmer";
  const examZone = nextExam?.zone || (nextExam?.monitor_name ? `Moniteur : ${nextExam.monitor_name}` : "Votre auto-école vous confirmera le centre");

  return (
    <div className="nsd-root nse-root">
      <StudentSidebar activePath="/student-exams" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleSidebarNavigate} />

      <main className="nsd-main nse-main">
        <StudentHeader className="nse-header" headingClassName="nse-page-heading" titleNode={<div className="nse-title-row"><span className="nse-title-icon"><ClipboardIcon /></span><h1 className="nsd-greeting-title">Mes examens</h1></div>} subtitle="Suivez vos examens, simulez et préparez-vous sereinement." onMenuOpen={() => setSidebarOpen(true)} />

        {loadError && (
          <div className="nse-load-message" role="alert">
            <span>Les données d'examen n'ont pas pu être chargées.</span>
            <button type="button" onClick={() => {
              setLoading(true);
              setLoadError(false);
              setReloadKey((value) => value + 1);
            }}>Réessayer</button>
          </div>
        )}

        <section className="nse-summary-grid" aria-label="Résumé des examens" aria-busy={loading}>
          {summaryCards.map((card) => <SummaryCard key={card.id} card={card} />)}
        </section>

        <div className="nse-content-grid">
          <section className="nse-panel nse-practical-card">
            <h2>Mon examen pratique</h2>

            <ol className="nse-timeline" aria-label="Avancement de l'examen pratique" style={{ "--nse-timeline-progress": timelineProgress }}>
              {timelineSteps.map((step, index) => (
                <li key={step.id} className={`nse-timeline-step nse-timeline-step--${step.state}`}>
                  <span className="nse-timeline-marker">{step.state === "complete" ? <CheckIcon /> : step.state === "current" ? <CalendarIcon /> : index + 1}</span>
                  <strong>{step.label}</strong>
                  <small>{step.detail}</small>
                </li>
              ))}
            </ol>

            <div className="nse-exam-strip">
              <div className="nse-exam-strip-block"><span className="nse-strip-icon"><CalendarIcon /></span><p>{nextExam ? "Votre examen pratique est prévu le :" : "Prochain examen pratique :"}<strong>{loading ? "Chargement…" : nextExam ? formatExamDateTime(nextExam) : "Aucun examen programmé"}</strong></p></div>
              <div className="nse-exam-strip-block"><span className="nse-strip-icon"><MapPinIcon /></span><p><strong>{examLocation}</strong><small>{examZone}</small></p></div>
              <button type="button" className="nse-button nse-button--outline" onClick={() => navigate("/student-contact")}>Nous contacter</button>
            </div>

            <div className="nse-important">
              <h3>Informations importantes</h3>
              <div className="nse-important-list">
                {IMPORTANT_INFO.map((item) => <article key={item.id} className="nse-info-row"><span className="nse-info-icon">{item.icon}</span><div><strong>{item.title}</strong><p>{item.description}</p></div></article>)}
              </div>
            </div>

            <div className="nse-practical-actions">
              <button type="button" className="nse-button nse-button--outline" onClick={() => navigate("/student-account")}>Voir mon dossier</button>
              <button type="button" className="nse-button nse-button--solid" onClick={() => navigate("/student-contact")}>Modifier ou reporter</button>
            </div>
          </section>

          <aside className="nse-right-column">
            <section className="nse-panel nse-mock-card">
              <div className="nse-panel-heading"><h2>Mes examens blancs</h2></div>
              <div className="nse-mock-list">
                {mockExams.length ? mockExams.map((exam, index) => {
                  const score = Math.min(100, Math.max(0, Number(exam.score) || 0));
                  const tone = score >= 60 ? "green" : "amber";
                  return (
                    <article key={exam.id ?? index} className="nse-mock-row">
                      <ScoreRing score={score} tone={tone} />
                      <div className="nse-mock-copy"><strong>Examen blanc #{mockExams.length - index}</strong><span>{exam.date ? `Le ${formatDate(exam.date)}` : "Date non renseignée"}</span></div>
                      <span className={`nse-status-pill nse-status-pill--${tone}`}>{score >= 60 ? "Réussi" : "À améliorer"}</span>
                      <button type="button" className="nse-row-action" aria-label={`Voir l'examen blanc ${mockExams.length - index}`}><ChevronRightIcon /></button>
                    </article>
                  );
                }) : (
                  <div className="nse-empty-state">
                    <CheckCircleIcon />
                    <strong>Aucun examen blanc enregistré</strong>
                    <span>Vos prochains résultats apparaîtront ici automatiquement.</span>
                  </div>
                )}
              </div>
              <button type="button" className="nse-reserve-button" onClick={() => navigate("/student-contact")}><CalendarIcon />Demander un examen blanc</button>
            </section>

            <section className="nse-panel nse-preparation-card">
              <h2>Se préparer à l'examen</h2>
              <div className="nse-preparation-list">
                {PREPARATION_ITEMS.map((item) => (
                  <button key={item.id} type="button" className="nse-preparation-row">
                    <span className={`nse-preparation-icon nse-tone-${item.tone}`}>{item.icon}</span>
                    <span className="nse-preparation-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                    <ChevronRightIcon />
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="nse-advice-banner"><span><TrophyIcon /></span><div><strong>Conseil Permis Plus</strong><p>La régularité et la pratique sont vos meilleures alliées. Continuez vos cours et vos entraînements ! 💪</p></div></section>
      </main>
    </div>
  );
}
