import { CalendarDays, ChevronLeft, ChevronRight, Clock3, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { displayDate, formatDuration } from "./formationUtils.js";

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];
const MONTHS = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEP", "OCT", "NOV", "DÉC"];

const dateKey = (date) => String(date || "").slice(0, 10);
const labelStatus = (status) => ({ signed: "Signée", completed: "Terminée", upcoming: "À venir", absent: "Élève absent", cancelled: "Annulée" }[status] || "Enregistrée");

export default function LessonDistributionCalendar({ lessons = [], onClose, onLessonSelect, title = "Répartition des leçons" }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const activeLessons = useMemo(() => lessons.filter((lesson) => lesson?.date && lesson.status !== "cancelled"), [lessons]);
  const lessonsByDate = useMemo(() => activeLessons.reduce((all, lesson) => {
    const key = dateKey(lesson.date);
    (all[key] ||= []).push(lesson);
    return all;
  }, {}), [activeLessons]);
  const [selectedDate, setSelectedDate] = useState("");
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const lessonsThisMonth = activeLessons.filter((lesson) => dateKey(lesson.date).startsWith(monthKey));
  const selectedLessons = lessonsByDate[selectedDate] || [];
  const startOffset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = dateKey([new Date().getFullYear(), String(new Date().getMonth() + 1).padStart(2, "0"), String(new Date().getDate()).padStart(2, "0")].join("-"));

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const changeMonth = (direction) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
    setSelectedDate("");
  };
  const selectDate = (key) => {
    setSelectedDate(key);
    const lesson = lessonsByDate[key]?.[0];
    if (lesson && onLessonSelect?.(lesson) !== false) onClose();
  };

  return <div className="mf-distribution-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="mf-distribution-modal" role="dialog" aria-modal="true" aria-label={title}>
      <header className="mf-distribution-header"><div><span>Formation</span><h2>{title}</h2></div><button type="button" onClick={onClose} aria-label="Fermer"><X size={22} /></button></header>
      <div className="mf-distribution-body">
        <div className="mf-distribution-month"><button type="button" onClick={() => changeMonth(-1)} aria-label="Mois précédent"><ChevronLeft size={25} /></button><h3>{MONTHS[month.getMonth()]} {month.getFullYear()}</h3><button type="button" onClick={() => changeMonth(1)} aria-label="Mois suivant"><ChevronRight size={25} /></button></div>
        <div className="mf-distribution-weekdays">{WEEKDAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
        <div className="mf-distribution-grid">{Array.from({ length: startOffset }).map((_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}{Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          const key = `${monthKey}-${String(day).padStart(2, "0")}`;
          const count = lessonsByDate[key]?.length || 0;
          const hasLessons = count > 0;
          return <button key={key} type="button" disabled={!hasLessons} className={`mf-calendar-day${hasLessons ? " has-lessons" : ""}${selectedDate === key ? " selected" : ""}${today === key ? " today" : ""}`} aria-label={hasLessons ? `${day}, ${count} leçon${count > 1 ? "s" : ""}` : String(day)} onClick={() => selectDate(key)}>{day}</button>;
        })}</div>
        {!lessonsThisMonth.length && <p className="mf-distribution-empty"><CalendarDays size={18} />Aucune leçon programmée pour ce mois.</p>}
        {selectedDate && <section className="mf-distribution-details" aria-live="polite"><h4>Leçons du {displayDate(selectedDate)}</h4>{selectedLessons.map((lesson) => <article key={lesson.id}><div><strong>{lesson.start_at || "—"}</strong><span>{formatDuration(lesson.duration_minutes)}</span></div><p><UserRound size={15} />{lesson.monitor_name || "Enseignant non renseigné"}</p><p><Clock3 size={15} />{lesson.type || "Leçon"} · <b>{labelStatus(lesson.status)}</b></p></article>)}</section>}
      </div>
      <footer className="mf-distribution-footer"><button type="button" onClick={onClose}>Fermer</button></footer>
    </section>
  </div>;
}
