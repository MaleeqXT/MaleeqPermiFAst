import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar.jsx";
import StudentHeader from "./StudentHeader.jsx";
import CandidateCourseDrawer from "./CandidateCourseDrawer.jsx";
import coursesImage from "./assets/courses.png";
import http from "../helpers/http.jsx";
import "./CandidateDashboard.css";
import "./CandidateCoursePage.css";

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
);
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"></path></svg>
);
const PinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
);

const COURSE_TABS = [
  { id: "upcoming", label: "À venir" },
  { id: "past", label: "Passés" },
  { id: "cancelled", label: "Annulés" },
];

const FRENCH_MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const toDateKey = (year, month, day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

function createCalendarDays(year, month, activityDates) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = firstWeekday + daysInMonth > 35 ? 42 : 35;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - firstWeekday + 1);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const day = date.getDate();
    const dateKey = toDateKey(dateYear, dateMonth, day);

    return {
      day,
      dateKey,
      year: dateYear,
      month: dateMonth,
      isCurrentMonth: dateYear === year && dateMonth === month,
      activity: activityDates.has(dateKey),
      related: false,
    };
  });
}

function formatCourse(course) {
  const date = new Date(`${course.date}T12:00:00`);
  const duration = Number(course.hour) || 0;
  const initials = String(course.instructor || "M").split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return {
    ...course,
    dow: new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date).replace(".", "").toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
    month: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date).replace(".", "").toUpperCase(),
    duration: Number.isInteger(duration) ? `${duration}h` : `${String(duration).replace(".", "h")}0`,
    time: `${String(course.start_at || "").replace(":", "h")} - ${String(course.end_at || "").replace(":", "h")}`,
    initials,
    training_type: course.type || course.offer_name || "Leçon de conduite",
    statusLabel: course.status === "cancelled" ? "Annulée" : "Terminée",
  };
}

function ProgressRing() {
  const radius = 29;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * 0.4;

  return (
    <div className="ncp-progress-ring" aria-label="Progression : 60 %">
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle className="ncp-progress-track" cx="36" cy="36" r={radius} />
        <circle className="ncp-progress-fill" cx="36" cy="36" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <strong>60%</strong>
    </div>
  );
}

function SummaryCard({ icon, tone = "green", label, value, meta }) {
  return (
    <article className="ncp-summary-card">
      <span className={`ncp-summary-icon ncp-summary-icon--${tone}`}>{icon}</span>
      <div className="ncp-summary-copy">
        <span className="ncp-summary-label">{label}</span>
        <strong className="ncp-summary-value">{value}</strong>
        <span className="ncp-summary-meta">{meta}</span>
      </div>
    </article>
  );
}

function CourseRow({ course, onSelectCourse }) {
  return (
    <article className="ncp-course-row">
      <div className="ncp-course-date" aria-label={`${course.dow} ${course.day} ${course.month}`}>
        <span>{course.dow}</span>
        <strong>{course.day}</strong>
        <small>{course.month}</small>
      </div>
      <div className="ncp-course-description">
        <strong>{course.title}</strong>
        {course.status !== "upcoming" ? (
          <span className="ncp-course-meta">
            <span className="ncp-duration">{course.duration}</span>
            <span className={`ncp-status ncp-status--${course.status === "cancelled" ? "cancelled" : "completed"}`}>{course.statusLabel}</span>
          </span>
        ) : <span className="ncp-duration">{course.duration}</span>}
      </div>
      <div className="ncp-course-schedule">
        <strong>{course.time}</strong>
        <span><PinIcon />{course.location}</span>
      </div>
      <div className="ncp-instructor">
        <span className="ncp-instructor-avatar" aria-hidden="true">{course.initials}</span>
        <span className="ncp-instructor-copy"><strong>{course.instructor}</strong><small>Moniteur</small></span>
      </div>
      <button type="button" className="ncp-details-btn" onClick={() => onSelectCourse && onSelectCourse(course)}>Voir détails</button>
    </article>
  );
}

export default function CandidateCoursePage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [courses, setCourses] = useState([]);
  const [activityDates, setActivityDates] = useState(new Set());
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const calendarDays = useMemo(() => createCalendarDays(calendarYear, calendarMonthIndex, activityDates), [calendarYear, calendarMonthIndex, activityDates]);
  const selectedDateKey = selectedDate ? toDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : null;
  const visibleCourses = courses.filter((course) => course.status === activeTab).map(formatCourse);

  useEffect(() => {
    let active = true;
    setCoursesLoading(true);
    http.get("/student/reservations/courses", { params: { date: selectedDateKey, month: `${calendarYear}-${String(calendarMonthIndex + 1).padStart(2, "0")}` } })
      .then(({ data }) => {
        if (!active) return;
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
        setActivityDates(new Set(Array.isArray(data?.activity_dates) ? data.activity_dates : []));
      })
      .catch(() => { if (active) { setCourses([]); setActivityDates(new Set()); } })
      .finally(() => { if (active) setCoursesLoading(false); });
    return () => { active = false; };
  }, [selectedDateKey, calendarYear, calendarMonthIndex]);

  const changeCalendarMonth = (offset) => {
    const nextMonth = new Date(calendarYear, calendarMonthIndex + offset, 1);
    setCalendarMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  const handleSidebarNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  return (
    <div className="nsd-root ncp-root">
      <StudentSidebar activePath="/student-courses" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleSidebarNavigate} />

      <main className="nsd-main ncp-main">
        <StudentHeader className="ncp-header" headingClassName="ncp-page-heading" titleNode={<div className="ncp-title-row"><span className="ncp-title-icon"><CalendarIcon /></span><h1 className="nsd-greeting-title">Mes cours</h1></div>} subtitle="Retrouvez ici la liste de vos leçons et votre progression." onMenuOpen={() => setSidebarOpen(true)} />

        <section className="ncp-summary-grid" aria-label="Résumé des cours">
          <SummaryCard icon={<CalendarIcon />} label="Prochains cours" value="2" meta="Cette semaine" />
          <SummaryCard icon={<ClockIcon />} label="Heures effectuées" value="18h" meta="sur 30h" />
          <article className="ncp-summary-card ncp-summary-card--progress"><ProgressRing /><div className="ncp-summary-copy"><span className="ncp-summary-label">Progression</span><strong className="ncp-progress-message">Bonne progression !</strong></div></article>
          <SummaryCard icon={<StarIcon />} tone="amber" label="Niveau actuel" value="En cours" meta="Conduite accompagnée" />
        </section>

        <div className="ncp-content-grid">
          <section className="ncp-panel ncp-course-panel">
            <div className="ncp-course-panel-head">
              <h2>Liste de mes cours</h2>
              <div className="ncp-tabs" role="tablist" aria-label="Filtrer les cours">
                {COURSE_TABS.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
              </div>
            </div>
            <div className="ncp-course-list" role="tabpanel">
              {coursesLoading ? <p className="ncp-empty-state">Chargement des cours…</p>
                : visibleCourses.length ? visibleCourses.map((course) => <CourseRow key={course.id} course={course} onSelectCourse={setSelectedCourse} />)
                  : <p className="ncp-empty-state">Aucun cours pour cette date.</p>}
            </div>
            <button type="button" className="ncp-more-btn">Voir plus de cours<ChevronDownIcon /></button>
          </section>

          <aside className="ncp-right-column">
            <section className="ncp-panel ncp-calendar-card">
              <h2>Mon planning</h2>
              <div className="ncp-calendar-nav"><button type="button" aria-label="Mois précédent" onClick={() => changeCalendarMonth(-1)}><ChevronLeftIcon /></button><strong>{FRENCH_MONTHS[calendarMonthIndex]} {calendarYear}</strong><button type="button" aria-label="Mois suivant" onClick={() => changeCalendarMonth(1)}><ChevronRightIcon /></button></div>
              <div className="ncp-calendar-weekdays" aria-hidden="true">{['LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.', 'DIM.'].map((day) => <span key={day}>{day}</span>)}</div>
              <div className="ncp-calendar-grid" aria-label={`Calendrier de ${FRENCH_MONTHS[calendarMonthIndex].toLowerCase()} ${calendarYear}`}>
                {calendarDays.map((entry) => {
                  const isSelected = Boolean(selectedDate) && entry.isCurrentMonth && selectedDate.getFullYear() === entry.year && selectedDate.getMonth() === entry.month && selectedDate.getDate() === entry.day;
                  const className = `${entry.isCurrentMonth ? "" : "muted "}${entry.related ? "related " : ""}${isSelected ? "selected " : ""}${entry.activity ? "activity" : ""}`.trim();

                  return <button key={entry.dateKey} type="button" className={className} disabled={!entry.isCurrentMonth} aria-label={`${entry.day} ${FRENCH_MONTHS[entry.month].toLowerCase()} ${entry.year}`} aria-pressed={isSelected} onClick={() => setSelectedDate(new Date(entry.year, entry.month, entry.day))}>{entry.day}</button>;
                })}
              </div>
            </section>

            <section className="ncp-panel ncp-reminder-card">
              <span className="ncp-reminder-icon"><BellIcon /></span><div><h3>Rappel</h3><p>Pensez à vous munir de votre pièce d'identité et d'être en avance 10 min avant le cours.</p></div><span className="ncp-reminder-close" aria-hidden="true">×</span>
            </section>

            <section className="ncp-booking-card">
              <img src={coursesImage} alt="Voiture de l'auto-école" className="ncp-booking-image" />
              <div className="ncp-booking-content"><h2>Besoin de réserver un cours ?</h2><p>Contactez votre auto-école pour planifier un nouveau créneau.</p><button type="button">Nous contacter</button></div>
            </section>
          </aside>
        </div>
      </main>

      <CandidateCourseDrawer
        course={selectedCourse}
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}
