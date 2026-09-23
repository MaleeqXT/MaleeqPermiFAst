import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import StudentSidebar from "./StudentSidebar.jsx";
import StudentHeader from "./StudentHeader.jsx";
import { logoutUser } from "../redux/reducers/authReducer.jsx";
import http from "../helpers/http.jsx";
import "./CandidateDashboard.css";

// ─── Icons ────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
);
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 7.6a2 2 0 0 0-1.8-1.1H7.4a2 2 0 0 0-1.8 1.1L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle><path d="M9 17h6"></path></svg>
);
const SteeringIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 15v6"></path><path d="M2.5 10h7"></path><path d="M14.5 10h7"></path></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
);
const PinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const MegaphoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
);
const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
);
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M7 16.5v-3"></path><path d="M12 16.5v-8"></path><path d="M17 16.5v-5"></path></svg>
);
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"></path></svg>
);
const BigBookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const BigCarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 7.6a2 2 0 0 0-1.8-1.1H7.4a2 2 0 0 0-1.8 1.1L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle><path d="M9 17h6"></path></svg>
);
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
);

// ─── Data ──────────────────────────────────────────────────────────────────
function formatAppointment(appointment) {
  const date = appointment?.date ? new Date(`${appointment.date}T12:00:00`) : null;
  const startAt = String(appointment?.start_at || "").slice(0, 5);
  const formattedDate = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date)
    : "Date à confirmer";

  return {
    ...appointment,
    dow: date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date).replace(".", "").toUpperCase()
      : "",
    day: date && !Number.isNaN(date.getTime()) ? String(date.getDate()).padStart(2, "0") : "--",
    when: `${formattedDate.charAt(0).toUpperCase()}${formattedDate.slice(1)}${startAt ? ` à ${startAt.replace(":", "h")}` : ""}`,
    location: [appointment?.location, appointment?.monitor_name ? `Moniteur : ${appointment.monitor_name}` : null]
      .filter(Boolean)
      .join(" · "),
  };
}

function formatRecentCourse(course) {
  const date = course?.date ? new Date(`${course.date}T12:00:00`) : null;
  const startAt = String(course?.start_at || "").slice(0, 5);
  const formattedDate = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date)
    : "Date à confirmer";
  const duration = Number(course?.hour) || 0;
  const durationLabel = Number.isInteger(duration) ? `${duration}h` : `${String(duration).replace(".", "h")}0`;

  return {
    ...course,
    meta: `${formattedDate.charAt(0).toUpperCase()}${formattedDate.slice(1)}${startAt ? ` à ${startAt.replace(":", "h")}` : ""}${duration ? ` | Durée : ${durationLabel}` : ""}`,
  };
}

const ANNOUNCEMENTS = [
  { id: 1, icon: <MegaphoneIcon />, title: "Fermeture exceptionnelle",       text: "Votre agence sera fermée le lundi 9 juin.", time: "Il y a 2 jours" },
  { id: 2, icon: <CarIcon />,       title: "Nouveau véhicule disponible !",  text: "Découvrez notre nouvelle Peugeot 208",       time: "Il y a 5 jours" },
];

const TOOLS = [
  { id: "courses",    icon: <BigBookIcon />, title: "Cours & Révisions", text: "Accédez à vos cours et fiches de révision", path: "/student-courses" },
  { id: "tests",      icon: <TargetIcon />,  title: "Tests de code",     text: "Entraînez-vous avec des séries d'examens" },
  { id: "driving",    icon: <BigCarIcon />,  title: "Suivi de conduite", text: "Retrouvez vos leçons et évaluations" },
  { id: "documents",  icon: <FileIcon />,    title: "Documents",         text: "Vos documents administratifs", path: "/student-documents" },
  { id: "statistics", icon: <ChartIcon />,   title: "Statistiques",      text: "Analysez votre progression" },
  { id: "messages",   icon: <ChatIcon />,    title: "Messagerie",        text: "Contactez votre équipe pédagogique", badge: 2, path: "/student-messages" },
];

// ─── Donut progress ────────────────────────────────────────────────────────
function ProgressDonut({ percent }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="nsd-donut">
      <svg viewBox="0 0 140 140" className="nsd-donut-svg">
        <circle className="nsd-donut-track" cx="70" cy="70" r={radius} />
        <circle
          className="nsd-donut-fill"
          cx="70"
          cy="70"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="nsd-donut-center">
        <span className="nsd-donut-value">{percent}%</span>
        
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function CandidateDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardProgress, setDashboardProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [satisfactionNotification, setSatisfactionNotification] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const connectedCandidate = location.state?.fromCandidateProfile ? location.state.candidate : null;
  const displayUser = connectedCandidate || currentUser;
  const firstName = displayUser?.first_name || displayUser?.name?.split(" ")[0] || "";
  const fullName = [displayUser?.first_name, displayUser?.last_name].filter(Boolean).join(" ") || displayUser?.name || "Élève";
  const initials = fullName.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "É";
  const avatarPath = currentUser?.profile_photo_url || currentUser?.media;
  const avatarUrl = avatarPath && !/^https?:\/\//i.test(avatarPath)
    ? `${import.meta.env.VITE_API_URL}/storage/${String(avatarPath).replace(/^\/?storage\//, "")}`
    : avatarPath;

  useEffect(() => {
    let active = true;

    http.get("/student/dashboard")
      .then(({ data }) => {
        if (active) setDashboardProgress(data?.dashboardProgress ?? null);
      })
      .catch(() => {
        // Keep the dashboard usable if progress data is temporarily unavailable.
        if (active) setDashboardProgress(null);
      })
      .finally(() => {
        if (active) setProgressLoading(false);
      });

    return () => { active = false; };
  }, []);

  // Survey eligibility and its read state are decided and stored by the API.
  // The dashboard only renders the unread server-side notification; it never
  // derives eligibility from reservations or displayed progress.
  useEffect(() => {
    let active = true;

    const loadSatisfactionNotification = () => {
      http.get("/student/satisfaction/notifications/unread")
        .then(({ data }) => {
          if (active) setSatisfactionNotification(data?.data ?? null);
        })
        .catch(() => {
          if (active) setSatisfactionNotification(null);
        });
    };

    loadSatisfactionNotification();
    window.addEventListener("focus", loadSatisfactionNotification);

    return () => {
      active = false;
      window.removeEventListener("focus", loadSatisfactionNotification);
    };
  }, [currentUser?.id]);

  const openSatisfaction = async () => {
    const notificationId = satisfactionNotification?.id;

    if (notificationId) {
      try {
        await http.post(`/student/satisfaction/notifications/${notificationId}/read`);
      } catch {
        // Navigation remains available if the acknowledgement is temporarily unavailable.
      }
    }

    setSatisfactionNotification(null);
    navigate("/satisfaction");
  };

  const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));
  const competencyProgress = dashboardProgress?.competencies ?? {};
  const codePercent = clampPercent(dashboardProgress?.code?.percent);
  const conductPercent = clampPercent(dashboardProgress?.conduct?.percent);
  const overallProgress = clampPercent(competencyProgress.percent);
  const completedHours = Math.max(0, Number(dashboardProgress?.hours?.completed) || 0);
  const totalHours = Math.max(0, Number(dashboardProgress?.hours?.total) || 0);
  const areasToImprove = Math.max(0, (Number(competencyProgress.total) || 0) - (Number(competencyProgress.completed) || 0));
  const upcomingAppointments = Array.isArray(dashboardProgress?.upcoming_appointments)
    ? dashboardProgress.upcoming_appointments.map(formatAppointment)
    : [];
  const recentCourses = Array.isArray(dashboardProgress?.recent_courses)
    ? dashboardProgress.recent_courses.map(formatRecentCourse)
    : [];
  const progressDetails = [
    { id: "code", label: "Code", icon: <BookIcon />, value: progressLoading ? "…" : `${codePercent}%`, percent: codePercent },
    { id: "driving", label: "Conduite", icon: <SteeringIcon />, value: progressLoading ? "…" : `${conductPercent}%`, percent: conductPercent },
    { id: "hours", label: "Heures effectuées", icon: <ClockIcon />, value: progressLoading ? "…" : `${completedHours}h / ${totalHours}h` },
    { id: "focus", label: "Points à travailler", icon: <TargetIcon />, value: progressLoading ? "…" : String(areasToImprove) },
  ];

  const handleSidebarNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate("/login-page", { replace: true });
  }

  return (
    <div className="nsd-root">
      <StudentSidebar
        activePath="/new-student-dashboard"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNavigate}
        onLogout={handleLogout}
      />

      <main className="nsd-main">
        {/* ── Header ── */}
        <StudentHeader className="nsd-dashboard-header" title={`Bonjour ${firstName || ""} 👋`} subtitle="Bienvenue dans votre espace élève." onMenuOpen={() => setSidebarOpen(true)} user={displayUser} />

        <div className="nsd-grid">
          {satisfactionNotification && (
            <section className="nsd-satisfaction-card" aria-labelledby="nsd-satisfaction-title">
              <span className="nsd-satisfaction-icon" aria-hidden="true">🚗</span>
              <div className="nsd-satisfaction-copy">
                <h2 id="nsd-satisfaction-title">Votre avis compte</h2>
                <p>Votre formation avance ! Donnez-nous votre avis sur votre expérience chez PassPermisFacile.</p>
              </div>
              <button type="button" className="nsd-btn-dark" onClick={openSatisfaction}>Donner mon avis</button>
            </section>
          )}

          {/* ── Overall progress ── */}
          <section className="nsd-card nsd-progress-card">
            <h2 className="nsd-card-title">Ma progression globale</h2>

            <div className="nsd-progress-body">
              <div className="nsd-progress-left">
                <ProgressDonut percent={overallProgress} />
                <div className="nsd-progress-copy">
                  <p className="nsd-progress-headline">Vous êtes sur la bonne voie !</p>
                  <p className="nsd-progress-text">Continuez comme ça pour atteindre vos objectifs.</p>
                  <button type="button" className="nsd-btn-dark">Voir le détail</button>
                </div>
              </div>

              <div className="nsd-progress-divider" />

              <div className="nsd-progress-right">
                {progressDetails.map((detail) => (
                  <div
                    key={detail.id}
                    className={`nsd-cat${detail.percent !== undefined ? " nsd-cat--progress" : ""}`}
                  >
                    <span className="nsd-cat-icon">{detail.icon}</span>
                    <div className="nsd-cat-body">
                      <div className="nsd-cat-top">
                        <span className="nsd-cat-label">{detail.label}</span>
                        <span
                          className={`nsd-cat-value${detail.percent !== undefined ? " nsd-cat-value--progress" : ""}`}
                        >
                          {detail.value}
                        </span>
                      </div>
                      {detail.percent !== undefined && (
                        <div className="nsd-track">
                          <div className="nsd-track-fill" style={{ width: `${detail.percent}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" className="nsd-evaluation-link">
                  <span>Voir mon évaluation</span>
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </section>

          {/* ── Upcoming appointments ── */}
          <section className="nsd-card nsd-appt-card">
            <h2 className="nsd-card-title">Prochains rendez-vous</h2>

            <div className="nsd-appt-list">
              {progressLoading ? (
                <p className="nsd-appt-empty">Chargement des rendez-vous…</p>
              ) : upcomingAppointments.length === 0 ? (
                <p className="nsd-appt-empty">Aucun rendez-vous à venir.</p>
              ) : upcomingAppointments.map((appt) => (
                <div key={appt.id} className="nsd-appt-row">
                  <div className="nsd-appt-date">
                    <span className="nsd-appt-dow">{appt.dow}</span>
                    <span className="nsd-appt-day">{appt.day}</span>
                  </div>
                  <div className="nsd-appt-info">
                    <span className="nsd-appt-title">{appt.title}</span>
                    <span className="nsd-appt-when">{appt.when}</span>
                    <span className="nsd-appt-loc">
                      <PinIcon /> {appt.location}
                    </span>
                  </div>
                  <span className="nsd-chevron"><ChevronRightIcon /></span>
                </div>
              ))}
            </div>

            <button type="button" className="nsd-card-footer-link" onClick={() => navigate("/student-courses")}>
              Voir tous mes rendez-vous
            </button>
          </section>

          {/* ── Recent courses ── */}
          <section className="nsd-card nsd-courses-card">
            <div className="nsd-card-head">
              <h2 className="nsd-card-title">Mes derniers cours</h2>
              <button type="button" className="nsd-link" onClick={() => navigate("/student-courses")}>Voir tout</button>
            </div>

            <div className="nsd-course-list">
              {progressLoading ? (
                <p className="nsd-appt-empty">Chargement des cours…</p>
              ) : recentCourses.length === 0 ? (
                <p className="nsd-appt-empty">Aucun cours terminé.</p>
              ) : recentCourses.map((course) => (
                <div key={course.id} className="nsd-course-row">
                  <span className="nsd-course-icon"><CarIcon /></span>
                  <div className="nsd-course-info">
                    <span className="nsd-course-title">{course.title}</span>
                    <span className="nsd-course-meta">{course.meta}</span>
                  </div>
                  <span className="nsd-pill-done">Terminée</span>
                  <span className="nsd-chevron"><ChevronRightIcon /></span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Latest announcements ── */}
          <section className="nsd-card nsd-news-card">
            <div className="nsd-card-head">
              <h2 className="nsd-card-title">Dernières annonces</h2>
              <button type="button" className="nsd-link">Voir toutes</button>
            </div>

            <div className="nsd-news-list">
              {ANNOUNCEMENTS.map((item) => (
                <div key={item.id} className="nsd-news-row">
                  <span className="nsd-news-icon">{item.icon}</span>
                  <div className="nsd-news-info">
                    <span className="nsd-news-title">{item.title}</span>
                    <span className="nsd-news-text">{item.text}</span>
                    <span className="nsd-news-time">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Quick access tools ── */}
          <section className="nsd-card nsd-tools-card">
            <h2 className="nsd-card-title">Vos outils à portée de main</h2>

            <div className="nsd-tools-grid">
              {TOOLS.map((tool) => (
                <button key={tool.id} type="button" className="nsd-tool" onClick={() => tool.path && navigate(tool.path)}>
                  {tool.badge && <span className="nsd-tool-badge">{tool.badge}</span>}
                  <span className="nsd-tool-icon">{tool.icon}</span>
                  <span className="nsd-tool-title">{tool.title}</span>
                  <span className="nsd-tool-text">{tool.text}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Contact bar ── */}
          <section className="nsd-contact-bar">
            <div className="nsd-contact-left">
              <span className="nsd-contact-icon"><InfoIcon /></span>
              <span className="nsd-contact-text">
                <strong>Une question ?</strong> Contactez votre équipe pédagogique, nous sommes là pour vous accompagner.
              </span>
            </div>
            <button type="button" className="nsd-btn-outline">Nous contacter</button>
          </section>
        </div>
      </main>
    </div>
  );
}
