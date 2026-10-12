import { displayDate } from "./formationUtils.js";
import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Check, Clock, CloudCheck, CircleX, PenLine, X, Info } from "lucide-react";

export function SearchPicker({ label, items, value, onChange, placeholder = "Rechercher...", disabled = false, id }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const box = useRef(null);
  const search = useRef(null);
  const selected = items.find((item) => String(item.id) === String(value));
  const filtered = items.filter((item) => item.name.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr")));
  useEffect(() => {
    if (!open) return undefined;
    search.current?.focus();
    const close = (event) => { if (!box.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return <div className="mf-picker" ref={box}>
    <label id={id + "-label"}>{label}</label>
    <button type="button" className="mf-picker-trigger" aria-labelledby={id + "-label"} aria-haspopup="listbox" aria-expanded={open} aria-controls={id + "-list"} disabled={disabled} onClick={() => { setQuery(""); setOpen(!open); }} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      {selected && <Avatar key={selected.id} person={selected} />}<span>{selected?.name || "Sélectionner"}</span><ChevronDown size={16} />
    </button>
    {open && !disabled && <div className="mf-picker-menu">
      <div className="mf-search"><Search size={17} /><input ref={search} value={query} placeholder={placeholder} aria-label={placeholder} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
        if (event.key === "Escape") { setOpen(false); box.current?.querySelector("button")?.focus(); }
        if (event.key === "ArrowDown") { event.preventDefault(); box.current?.querySelector('[role="option"]')?.focus(); }
      }} /></div>
      <div role="listbox" id={id + "-list"} aria-labelledby={id + "-label"} className="mf-picker-options">
        {filtered.map((item) => <button type="button" role="option" key={item.id} aria-selected={String(item.id) === String(value)} className={String(item.id) === String(value) ? "selected" : ""} onKeyDown={(event) => {
          if (event.key === "Escape") { setOpen(false); box.current?.querySelector("button")?.focus(); }
          if (event.key === "ArrowDown") { event.preventDefault(); event.currentTarget.nextElementSibling?.focus(); }
          if (event.key === "ArrowUp") { event.preventDefault(); event.currentTarget.previousElementSibling?.focus(); }
        }} onClick={() => { onChange(item.id); setOpen(false); }}>
          <Avatar person={item} /><span>{item.name}</span>{String(item.id) === String(value) && <Check size={16} />}
        </button>)}
        {!filtered.length && <p>Aucun résultat.</p>}
      </div>
    </div>}
  </div>;
}

function Avatar({ person }) {
  const [failed, setFailed] = useState(false);
  return <span className="mf-avatar">{person.photo && !failed
    ? <img src={person.photo} alt="" onError={() => setFailed(true)} />
    : person.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>;
}

const STATUS_LABELS = { signed: "Signée", completed: "Terminée et évaluée", absent: "Élève absent", cancelled: "Annulée", upcoming: "À venir", past: "À évaluer" };
export function LessonStatus({ status }) {
  const Icon = status === "upcoming" ? Clock : ["absent", "cancelled"].includes(status) ? CircleX : CloudCheck;
  return <span className={"mf-status mf-status-" + status} title={STATUS_LABELS[status]} aria-label={STATUS_LABELS[status]}><Icon size={18} /></span>;
}
const historyDuration = (minutes) => {
  const total = Number(minutes || 0);
  if (!total) return "—";
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return remainder ? (hours ? `${hours}h${String(remainder).padStart(2, "0")}` : `${remainder}min`) : `${hours}h`;
};

export function LessonHistory({ lessons, selectedId, onSelect, disabled }) {
  return <div className="mf-history" aria-label="Historique des leçons">
    {lessons.map((lesson) => <button type="button" key={lesson.id} className={"mf-history-row" + (selectedId === lesson.id ? " selected" : "")} disabled={disabled} onClick={() => onSelect(lesson)}>
      <span className={"mf-lesson-number" + (lesson.number === 20 ? " purple" : "")}>{lesson.number}</span>
      <time dateTime={lesson.date}>{displayDate(lesson.date)}</time>
      <span className="mf-history-duration">{historyDuration(lesson.duration_minutes ?? Number(lesson.hour || 0) * 60)}</span>
      <LessonStatus status={lesson.status} />
      <span className="mf-history-arrow" aria-hidden="true">›</span>
    </button>)}
    {!lessons.length && <p className="mf-muted">Aucune leçon pour cet élève.</p>}
  </div>;
}

export function Toggle({ label, checked, onChange, disabled, hint }) {
  return <div className="mf-toggle" title={hint}><span><span>{label}</span>{hint && <small className="mf-toggle-help">{hint}</small>}</span><button type="button" role="switch" aria-label={hint ? `${label}. ${hint}` : label} aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}><i /></button></div>;
}
export function EditSection({ title, children, onEdit, disabled, contentClassName = "" }) {
  return <section className="mf-edit-section"><header><h3>{title} <Info size={15} /></h3><button type="button" disabled={disabled} onClick={onEdit}><PenLine size={15} />Editer</button></header>{children ? <div className={"mf-section-content" + (contentClassName ? " " + contentClassName : "")}>{children}</div> : null}</section>;
}

export function Dialog({ title, children, onClose, busy = false, wide = false, className = "" }) {
  const ref = useRef(null);
  const callbacks = useRef({ busy, onClose });
  useEffect(() => { callbacks.current = { busy, onClose }; }, [busy, onClose]);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape" && !callbacks.current.busy) callbacks.current.onClose();
      if (event.key === "Tab") {
        const items = [...ref.current.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')];
        if (!items.length) { event.preventDefault(); return; }
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); previous?.focus(); };
  }, []);
  return <div className="mf-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={"mf-modal" + (wide ? " wide" : "") + (className ? " " + className : "")}>
      <header><h2>{title}</h2><button type="button" disabled={busy} aria-label="Fermer" onClick={onClose}><X size={20} /></button></header>{children}
    </section>
  </div>;
}

export function SignaturePad({ strokes, onChange, disabled }) {
  const active = useRef(null);
  const point = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(600, (event.clientX - bounds.left) * 600 / bounds.width)), y: Math.max(0, Math.min(180, (event.clientY - bounds.top) * 180 / bounds.height)) };
  };
  const finish = (event) => {
    if (!active.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const stroke = active.current;
    active.current = null;
    if (stroke.length >= 2) onChange([...strokes, stroke]);
  };
  const [drawing, setDrawing] = useState([]);
  return <div className="mf-signature-pad">
    <svg viewBox="0 0 600 180" role="img" aria-label="Tracez votre signature" onPointerDown={(event) => {
      if (disabled || strokes.length >= 50) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      active.current = [point(event)]; setDrawing(active.current);
    }} onPointerMove={(event) => {
      if (!active.current || disabled || active.current.length >= 500) return;
      active.current = [...active.current, point(event)]; setDrawing(active.current);
    }} onPointerUp={(event) => { finish(event); setDrawing([]); }} onPointerCancel={(event) => { finish(event); setDrawing([]); }}>
      {[...strokes, drawing].filter((stroke) => stroke.length > 1).map((stroke, index) => <polyline key={index} points={stroke.map((p) => p.x + "," + p.y).join(" ")} fill="none" stroke="#17233d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />)}
      {!strokes.length && !drawing.length && <text x="300" y="95" textAnchor="middle" fill="#94a3b8" fontSize="16">Signez avec votre souris ou votre doigt</text>}
    </svg>
    <button type="button" disabled={disabled} onClick={() => { active.current = null; setDrawing([]); onChange([]); }}>Effacer la signature</button>
  </div>;
}
