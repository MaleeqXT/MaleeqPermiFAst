import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, ChevronDown, MoreVertical, CalendarDays, Plus, Save, Trash2, PenLine, Clock, Car, Landmark, BookOpen } from "lucide-react";
import http from "../../helpers/http.jsx";
import { profileImageUrl } from "../../new-student-dashboard/StudentHeader.jsx";
import { SearchPicker, LessonHistory, LessonStatus, Toggle, EditSection, Dialog, SignaturePad } from "./FormationComponents.jsx";
import { displayDate, FORMATION_DURATIONS, formatDuration } from "./formationUtils.js";
import FormationManeuvers, { SavedManeuvers } from "./FormationManeuvers.jsx";
import { maneuverLabel, RATING_LABELS } from "./FormationManeuverCatalog.js";
import FormationCompetencies from "./FormationCompetencies.jsx";
import FormationSchemaEditor from "./FormationSchemaEditor.jsx";
import LessonDistributionCalendar from "./LessonDistributionCalendar.jsx";
import FormationInitialEvaluationFiche from "./FormationInitialEvaluationFiche.jsx";
import FormationInitialEvaluationQuestions from "./FormationInitialEvaluationQuestions.jsx";
import "./FormationPage.css";

const emptyForm = (student, options = {}) => ({
  date: (() => { const date = new Date(); return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"); })(), start_at: "09:00", duration_minutes: 60,
  monitor_id: options.instructors?.[0]?.id || "", department: options.departments?.[0] || "",
  type: options.types?.[0] || "Prestation", offer_id: "", lieu_id: options.places?.[0]?.id || "",
  boite_auto: String(student?.raw?.student?.boite_type) === "1", evaluation_initiale: false, evaluation_permis: false,
  public_observation: "", teacher_observation: "", maneuvers: [], maneuver_counts: {}, maneuver_ratings: {}, is_absent: false,
});
const errorMessage = (error) => Object.values(error.response?.data?.errors || {}).flat().join(" ") || error.response?.data?.message || "Impossible de contacter le serveur. Réessayez.";
const same = (first, second) => JSON.stringify(first) === JSON.stringify(second);

export default function FormationPage({ monitorId, onBack, onDirtyChange, onBusyChange, onLessonChanged }) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");
  const [lessons, setLessons] = useState([]);
  const [options, setOptions] = useState({});
  const [draft, setDraft] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [competencyDirty, setCompetencyDirty] = useState(false);
  const [maneuverCounts, setManeuverCounts] = useState({});
  const [maneuverRatings, setManeuverRatings] = useState({});
  const [maneuverHistory, setManeuverHistory] = useState({ totals: {}, history: [] });
  const [maneuverHistoryLoading, setManeuverHistoryLoading] = useState(false);
  const [maneuverHistoryRevision, setManeuverHistoryRevision] = useState(0);
  const [strokes, setStrokes] = useState([]);
  const [accepted, setAccepted] = useState(false);
  const [retry, setRetry] = useState(0);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [evaluationMenuOpen, setEvaluationMenuOpen] = useState(false);
  const [bookletSending, setBookletSending] = useState(false);
  const generation = useRef(0);
  const actionsMenuRef = useRef(null);
  const currentStudent = students.find((student) => student.id === studentId);
  const draftDirty = draft !== null && baseline !== null && !same(draft, baseline);
  const dirty = draftDirty || (dialog === "competencies" && competencyDirty) || (dialog === "maneuvers" && (!same(maneuverCounts, draft?.maneuver_counts || {}) || !same(maneuverRatings, draft?.maneuver_ratings || {})));
  const params = monitorId ? { monitor_id: monitorId } : {};
  const signed = Boolean(draft?.signature);
  const closeDialog = useCallback(() => setDialog(null), []);

  useEffect(() => {
    onDirtyChange?.(dirty);
    const warn = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => { window.removeEventListener("beforeunload", warn); onDirtyChange?.(false); };
  }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange?.(busy); return () => onBusyChange?.(false); }, [busy, onBusyChange]);
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const closeActions = (event) => { if (!actionsMenuRef.current?.contains(event.target)) { setActionsMenuOpen(false); setEvaluationMenuOpen(false); } };
    document.addEventListener("mousedown", closeActions);
    return () => document.removeEventListener("mousedown", closeActions);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setStudentsLoading(true); setStudentsError(""); setStudentId(""); setDraft(null); setLessons([]);
    http.get("/monitor/students", { params: monitorId ? { monitor_id: monitorId } : {}, signal: controller.signal })
      .then(({ data }) => {
        const people = (data.data || []).filter((person) => person.student?.id).map((person) => ({
          id: person.student.id,
          name: [person.first_name, person.last_name].filter(Boolean).join(" ") || person.name || "Élève",
          photo: profileImageUrl(person), raw: person,
        }));
        setStudents(people); setStudentId(people[0]?.id || "");
      })
      .catch((requestError) => { if (!controller.signal.aborted) setStudentsError(errorMessage(requestError)); })
      .finally(() => { if (!controller.signal.aborted) setStudentsLoading(false); });
    return () => controller.abort();
  }, [monitorId]);

  useEffect(() => {
    const controller = new AbortController();
    const token = ++generation.current;
    setLessons([]); setOptions({}); setDraft(null); setBaseline(null); setManeuverCounts({}); setManeuverRatings({}); setError(""); setNotice(""); setDialog(null);
    if (!studentId) { setLoading(false); return () => { controller.abort(); generation.current = token + 1; }; }
    setLoading(true);
    http.get("/monitor/formation/" + studentId, { params: monitorId ? { monitor_id: monitorId } : {}, signal: controller.signal })
      .then(({ data }) => {
        if (token !== generation.current) return;
        const payload = data.data;
        setLessons(payload.lessons); setOptions(payload.options);
        const first = payload.lessons[0] || emptyForm(students.find((student) => student.id === studentId), payload.options);
        setDraft(first); setBaseline(first);
      })
      .catch((requestError) => { if (!controller.signal.aborted) setError(errorMessage(requestError)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); generation.current = token + 1; };
  }, [studentId, monitorId, retry, students]);

  useEffect(() => {
    const controller = new AbortController();
    if (!studentId) { setManeuverHistory({ totals: {}, history: [] }); setManeuverHistoryLoading(false); return () => controller.abort(); }
    setManeuverHistoryLoading(true);
    http.get(`/monitor/formation/${studentId}/maneuvers`, { params: monitorId ? { monitor_id: monitorId } : {}, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setManeuverHistory(data?.data || { totals: {}, history: [] }); })
      .catch(() => { if (!controller.signal.aborted) setManeuverHistory({ totals: {}, history: [] }); })
      .finally(() => { if (!controller.signal.aborted) setManeuverHistoryLoading(false); });
    return () => controller.abort();
  }, [studentId, monitorId, maneuverHistoryRevision]);

  const mayReplace = () => !dirty || window.confirm("Abandonner les modifications non enregistrées de cette leçon ?");
  const replaceDraft = (next) => { setDraft(next); setBaseline(next); setNotice(""); setError(""); };
  const selectStudent = (nextId) => {
    if (nextId !== studentId && !busy && mayReplace()) {
      generation.current++;
      setDraft(null); setBaseline(null); setLessons([]); setOptions({}); setManeuverCounts({}); setManeuverRatings({}); setError(""); setNotice("");
      setStudentId(nextId);
    }
  };
  const change = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const applyManeuvers = () => {
    const counts = Object.fromEntries(Object.entries(maneuverCounts).filter(([, count]) => Number(count) > 0));
    const labels = Object.entries(counts).map(([id, count]) => {
      const label = maneuverLabel(id, options.maneuvers || []);
      return Number(count) > 1 ? `${label} × ${count}` : label;
    });
    change("maneuver_counts", counts);
    change("maneuver_ratings", maneuverRatings);
    change("maneuvers", labels);
  };
  const changeDuration = (minutes) => setDraft((current) => ({
    ...current,
    duration_minutes: Number(minutes),
    evaluation_initiale: Number(minutes) === 60 ? current.evaluation_initiale : false,
  }));
  const selectInstructor = (id) => {
    const instructor = (options.instructors || []).find((candidate) => String(candidate.id) === String(id));
    setDraft((current) => ({ ...current, monitor_id: id, department: instructor?.department || "" }));
  };
  const newLesson = () => { if (!busy && mayReplace()) replaceDraft(emptyForm(currentStudent, options)); };
  const sendBooklet = async () => {
    if (!studentId || bookletSending) return;
    setBookletSending(true); setError(""); setNotice("");
    try {
      const { data } = await http.post(`/monitor/formation/${studentId}/livret`, {}, { params });
      setNotice(data?.data?.message || "Le livret PDF a été envoyé à votre adresse e-mail.");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBookletSending(false);
    }
  };

  const openSchema = () => {
    if (!draft?.id) { setError("Enregistrez d’abord la leçon avant de créer son schéma."); return; }
    if (draftDirty) { setError("Enregistrez les modifications de la leçon avant d’ouvrir son schéma."); return; }
    setError(""); setNotice(""); setDialog("schema");
  };
  const refresh = async (selectedId) => {
    const token = generation.current;
    const { data } = await http.get("/monitor/formation/" + studentId, { params });
    if (token !== generation.current) return;
    const payload = data.data;
    setLessons(payload.lessons); setOptions(payload.options);
    const selected = payload.lessons.find((lesson) => lesson.id === selectedId) || emptyForm(currentStudent, payload.options);
    setDraft(selected); setBaseline(selected);
  };
  const applySaved = (lesson) => {
    const number = lessons.find((row) => row.id === lesson.id)?.number || lessons.length + 1;
    const next = { ...lesson, number };
    setLessons((rows) => rows.some((row) => row.id === next.id) ? rows.map((row) => row.id === next.id ? next : row) : [next, ...rows]);
    setDraft(next); setBaseline(next);
  };
  async function save(event) {
    event.preventDefault();
    if (busy || signed || !draft) return;
    setBusy(true); setError(""); setNotice("");
    const token = generation.current;
    try {
      const url = "/monitor/formation/" + studentId + (draft.id ? "/" + draft.id : "");
      const { data } = await http[draft.id ? "put" : "post"](url, draft, { params });
      if (token !== generation.current) return;
      applySaved(data.data); setNotice("La leçon a été enregistrée."); onLessonChanged?.();
      try { await refresh(data.data.id); setManeuverHistoryRevision((value) => value + 1); } catch { setError("La leçon est enregistrée, mais l’historique n’a pas pu être actualisé."); }
    } catch (requestError) { if (token === generation.current) setError(errorMessage(requestError)); }
    finally { if (token === generation.current) setBusy(false); }
  }
  async function remove() {
    setBusy(true); setError(""); setNotice("");
    try {
      const { data } = await http.delete("/monitor/formation/" + studentId + "/" + draft.id, { params });
      if (!data.success) throw new Error("Delete not confirmed");
      setDialog(null); onLessonChanged?.();
      const remaining = lessons.filter((lesson) => lesson.id !== draft.id);
      setLessons(remaining); replaceDraft(emptyForm(currentStudent, options)); setNotice("La leçon a été supprimée.");
      try { await refresh(null); setManeuverHistoryRevision((value) => value + 1); } catch { setError("La suppression est confirmée, mais l’historique n’a pas pu être actualisé."); }
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setBusy(false); }
  }
  async function sign() {
    setBusy(true); setError("");
    try {
      const { data } = await http.post("/monitor/formation/" + studentId + "/" + draft.id + "/sign", { strokes, accepted }, { params });
      if (!data.data?.signature) throw new Error("Signature not confirmed");
      applySaved(data.data); setDialog(null); setNotice("La leçon a été signée."); onLessonChanged?.();
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setBusy(false); }
  }
  const openCompetencies = () => {
    // Competency updates are saved per lesson by the existing Progression API.
    // Keep any unsaved lesson fields in place instead of blocking the editor.
    setDialog("competencies");
  };
  const schedulingLocked = signed || Boolean(draft?.id && !draft.can_reschedule);
  const initialEvaluationAllowed = Number(draft?.duration_minutes) === 60;
  const durationOptions = options.durations?.length ? options.durations : FORMATION_DURATIONS;
  const allDisabled = busy || signed || draft?.status === "cancelled" || Boolean(draft?.id && draft?.can_manage === false);
  const offerOptions = [...(options.offers || [])];
  if (draft?.offer_id && !offerOptions.some((offer) => offer.id === draft.offer_id)) offerOptions.push({ id: draft.offer_id, name: draft.offer_name || "Forfait de cette leçon" });
  const field = (label, key, type, Icon, locked = false) => <label className="mf-field"><span>{label}</span><div><Icon size={19} /><input required type={type} value={draft[key]} min={type === "time" ? "07:00" : undefined} max={type === "time" ? "22:00" : undefined} disabled={allDisabled || locked} onChange={(event) => change(key, event.target.value)} /></div></label>;
  const select = (label, key, rows, Icon, required = true, locked = false) => <label className="mf-field"><span>{label}</span><div><Icon size={19} /><select required={required} value={draft[key] || ""} disabled={allDisabled || locked} onChange={(event) => change(key, key === "duration_minutes" ? Number(event.target.value) : event.target.value)}>
    <option value="">{rows.length ? "Sélectionner" : "Aucune donnée disponible"}</option>{rows.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
  </select></div></label>;

  return <section className="mf-page" aria-label="Formation">
    <header className="mf-page-heading"><button type="button" onClick={() => { if (!busy && mayReplace()) onBack(); }} aria-label="Retour à l’accueil"><ArrowLeft size={23} /></button><div><h1>Formation</h1><nav aria-label="Fil d’Ariane"><button type="button" onClick={() => { if (!busy && mayReplace()) onBack(); }}>Accueil</button><ChevronRight size={14} /><span>Formation</span></nav></div><div className="mf-heading-actions" ref={actionsMenuRef}><button type="button" className="mf-more-button" aria-label="Actions de formation" aria-haspopup="menu" aria-expanded={actionsMenuOpen} onClick={() => { setActionsMenuOpen((open) => !open); setEvaluationMenuOpen(false); }}><MoreVertical size={25} /></button>{actionsMenuOpen && <div className="mf-actions-menu" role="menu"><button type="button" role="menuitem" disabled={!studentId || bookletSending} onClick={() => { setActionsMenuOpen(false); sendBooklet(); }}>{bookletSending ? "Envoi du livret…" : "Recevoir le livret"}</button><button type="button" role="menuitem" disabled={!draft?.id || loading} onClick={() => { setActionsMenuOpen(false); openSchema(); }}>Schéma</button><div className="mf-actions-submenu"><button type="button" role="menuitem" aria-haspopup="menu" aria-expanded={evaluationMenuOpen} onClick={() => setEvaluationMenuOpen((open) => !open)}>Eval. Initiale &amp; Contrat <ChevronDown size={16} className={evaluationMenuOpen ? "open" : ""} /></button>{evaluationMenuOpen && <div className="mf-actions-submenu-items" role="menu"><button type="button" role="menuitem" disabled={!studentId || loading} onClick={() => { setActionsMenuOpen(false); setEvaluationMenuOpen(false); setError(""); setNotice(""); setDialog("initial-evaluation"); }}>Accès fiche</button><button type="button" role="menuitem" disabled={!studentId || loading} onClick={() => { setActionsMenuOpen(false); setEvaluationMenuOpen(false); setError(""); setNotice(""); setDialog("initial-questions"); }}>Accès Questions</button><button type="button" role="menuitem" onClick={() => { setActionsMenuOpen(false); setEvaluationMenuOpen(false); }}>Contrat DSR</button></div>}</div></div>}</div></header>
    <div className="mf-columns">
      <aside className="mf-left">
        <section className="mf-card mf-student-card"><SearchPicker id="formation-student" label="Élève" items={students} value={studentId} onChange={selectStudent} placeholder="Rechercher un élève..." disabled={studentsLoading || busy || !students.length} />
          {studentsLoading && <p role="status">Chargement des élèves…</p>}{studentsError && <p className="mf-error" role="alert">{studentsError}</p>}{!studentsLoading && !studentsError && !students.length && <p className="mf-muted">Aucun élève lié à ce moniteur.</p>}
        </section>
        <section className="mf-card mf-history-card"><h2><BookOpen size={18} />Historique des leçons <span>{lessons.length}</span></h2>
          {loading ? <p role="status">Chargement des leçons…</p> : <><LessonHistory lessons={lessons} selectedId={draft?.id} disabled={busy} onSelect={(lesson) => { if (lesson.id !== draft?.id && mayReplace()) replaceDraft(lesson); }} /><button type="button" className="mf-distribution-trigger" disabled={!studentId} onClick={() => setDialog("distribution")}><CalendarDays size={17} />Voir la répartition</button></>}
        </section>
      </aside>
      <section className="mf-card mf-editor-card">
        <header className="mf-new-heading"><CalendarDays size={25} /><h2>Nouvelle leçon</h2><button type="button" aria-label="Créer une nouvelle leçon" disabled={!studentId || loading || busy || !draft} onClick={newLesson}><Plus size={25} /></button></header>
        {notice && <p className="mf-success" role="status">{notice}</p>}{error && <p className="mf-error" role="alert">{error}{!draft && studentId && <button type="button" onClick={() => setRetry((value) => value + 1)}>Réessayer</button>}</p>}
        {!draft && <p className="mf-muted">{loading ? "Chargement de la leçon…" : "Sélectionnez un élève pour consulter ses leçons."}</p>}
        {draft && !loading && <form onSubmit={save}>
          {draft.id && <div className="mf-lesson-heading"><span className={"mf-lesson-number" + (draft.number === 20 ? " purple" : "")}>{draft.number}</span><strong>{displayDate(draft.date)}</strong><span>{formatDuration(draft.duration_minutes)}</span><LessonStatus status={draft.status} /><span className="mf-lesson-state">{draft.signature ? "Leçon signée" : "Leçon enregistrée"}</span></div>}
          <div className="mf-form-grid">
            {field("Date", "date", "date", CalendarDays, schedulingLocked)}
            <label className="mf-field"><span>Durée</span><div><Clock size={19} /><select required value={draft.duration_minutes || ""} disabled={allDisabled || schedulingLocked} onChange={(event) => changeDuration(event.target.value)}><option value="">Sélectionner</option>{durationOptions.map((duration) => <option key={duration.minutes} value={duration.minutes}>{duration.label}</option>)}</select></div></label>
            {field("Heure de départ", "start_at", "time", Clock, schedulingLocked)}
            <div className="mf-instructor-field"><SearchPicker id="formation-instructor" label="Enseignant" items={options.instructors || []} value={draft.monitor_id} onChange={selectInstructor} placeholder="Rechercher un enseignant..." disabled={allDisabled || schedulingLocked} /><button type="button" title="Afficher les enseignants autorisés" aria-label="Afficher les enseignants autorisés" disabled={allDisabled || schedulingLocked} onClick={() => document.getElementById("formation-instructor-label")?.parentElement.querySelector("button")?.click()}><Plus size={20} /></button></div>
            {select("Type", "type", [...new Set([...(options.types || []), draft.type])].filter(Boolean).map((type) => ({ id: type, name: type })), Car)}
            <label className="mf-field"><span>Enseignant Dpt</span><div><Landmark size={19} /><input readOnly value={draft.department || "—"} aria-label="Code postal ou département de l’enseignant" /></div></label>
            {select("Forfait", "offer_id", offerOptions, BookOpen, true, schedulingLocked)}
            {select("Lieu", "lieu_id", options.places || [], Landmark, true, schedulingLocked)}
          </div>
          <div className="mf-toggles"><Toggle label="Boite Auto" checked={draft.boite_auto} onChange={(value) => change("boite_auto", value)} disabled={allDisabled} /><Toggle label="Evaluation Initiale" checked={initialEvaluationAllowed && draft.evaluation_initiale} onChange={(value) => change("evaluation_initiale", value)} disabled={allDisabled || !initialEvaluationAllowed} hint={initialEvaluationAllowed ? undefined : "Disponible uniquement pour une durée exacte de 1 heure."} /><Toggle label="Evaluation Permis" checked={draft.evaluation_permis} onChange={(value) => change("evaluation_permis", value)} disabled={allDisabled} /></div>
          <EditSection title="Manœuvres effectuées lors de la leçon" disabled={allDisabled} onEdit={() => { setManeuverCounts(draft.maneuver_counts || {}); setManeuverRatings(draft.maneuver_ratings || {}); setDialog("maneuvers"); }} contentClassName="mf-saved-section"><SavedManeuvers counts={draft.maneuver_counts || {}} ratings={draft.maneuver_ratings || {}} maneuvers={options.maneuvers || []} /></EditSection>
          <section className="mf-maneuver-history" aria-label="Historique des manœuvres">
            <header><h3>Historique des manœuvres</h3><span>{maneuverHistoryLoading ? "Actualisation…" : `${(maneuverHistory.history || []).length} passage${(maneuverHistory.history || []).length > 1 ? "s" : ""}`}</span></header>
            {Object.keys(maneuverHistory.totals || {}).length > 0 && <div className="mf-maneuver-history-totals">{Object.entries(maneuverHistory.totals).map(([id, count]) => <span key={id}><b>{count}</b>{maneuverLabel(id, options.maneuvers || [])}</span>)}</div>}
            {!maneuverHistoryLoading && !(maneuverHistory.history || []).length && <p className="mf-muted">Aucun passage de manœuvre enregistré pour cet élève.</p>}
            {(maneuverHistory.history || []).map((item) => <article key={item.id} className="mf-maneuver-history-row"><time>{displayDate(item.date)}</time><strong>{item.maneuver_name || maneuverLabel(item.maneuver_id, options.maneuvers || [])}</strong><span className={`mf-maneuver-rating-badge rating-${item.rating}`}>Niv. {item.rating} · {RATING_LABELS[item.rating]?.split(" — ")[0] || "Niveau renseigné"}</span></article>)}
          </section>
          <div className="mf-observations"><label>Observations (visibles de tous)<textarea rows={3} maxLength={10000} disabled={allDisabled} value={draft.public_observation} onChange={(event) => change("public_observation", event.target.value)} /></label><label>Observations pour les enseignants<textarea rows={3} maxLength={10000} disabled={allDisabled} value={draft.teacher_observation} onChange={(event) => change("teacher_observation", event.target.value)} /></label></div>
          <label className="mf-absence"><input type="checkbox" checked={draft.is_absent} disabled={allDisabled} onChange={(event) => change("is_absent", event.target.checked)} />Élève absent</label>
          <EditSection title="Compétences évaluées" disabled={allDisabled || !draft.id} onEdit={openCompetencies} />
          {draft.signature && <p className="mf-signed-note">Signée le {new Date(draft.signature.signed_at).toLocaleString("fr-FR")}. Cette leçon est verrouillée.</p>}
          <div className="mf-actions"><button type="submit" className="save" disabled={allDisabled}><Save size={18} />{busy ? "Enregistrement…" : "Sauvegarder la leçon"}</button><button type="button" className="delete" disabled={busy || !draft.id || !draft.can_delete} onClick={() => setDialog("delete")}><Trash2 size={18} />Supprimer la leçon</button><button type="button" className="sign" disabled={busy || signed || !draft.id || !options.can_sign || draft.status === "upcoming" || draft.status === "cancelled" || draft.is_absent} onClick={() => {
            if (draftDirty) { setError("Enregistrez vos modifications avant de signer."); return; }
            setStrokes([]); setAccepted(false); setError(""); setDialog("sign");
          }}><PenLine size={18} />{signed ? "Leçon signée" : "Signer la leçon"}</button></div>
        </form>}
      </section>
    </div>
    {dialog === "maneuvers" && <Dialog title="Manœuvres effectuées lors de la leçon" onClose={closeDialog} wide><FormationManeuvers counts={maneuverCounts} ratings={maneuverRatings} maneuvers={options.maneuvers || []} onChange={setManeuverCounts} onRatingsChange={setManeuverRatings} disabled={allDisabled} /><div className="mf-modal-actions"><button type="button" onClick={closeDialog}>Annuler</button><button type="button" className="mf-primary" onClick={() => { applyManeuvers(); closeDialog(); }}>Appliquer à la leçon</button></div></Dialog>}
    {dialog === "distribution" && <LessonDistributionCalendar lessons={lessons} onLessonSelect={(lesson) => { if (lesson.id !== draft?.id && !mayReplace()) return false; replaceDraft(lesson); return true; }} onClose={closeDialog} />}
    {dialog === "schema" && <FormationSchemaEditor studentId={studentId} lesson={draft} monitorId={monitorId} readOnly={signed} onClose={closeDialog} onSaved={() => { refresh(draft.id).catch((requestError) => setError(errorMessage(requestError))); }} />}
    {dialog === "initial-evaluation" && <FormationInitialEvaluationFiche studentId={studentId} monitorId={monitorId} onClose={closeDialog} />}
    {dialog === "initial-questions" && <FormationInitialEvaluationQuestions studentId={studentId} monitorId={monitorId} onClose={closeDialog} />}
    {dialog === "delete" && <Dialog title="Supprimer cette leçon ?" onClose={closeDialog} busy={busy}><p>La leçon du {displayDate(draft.date)} sera supprimée. Les heures réservées seront rendues au forfait de l’élève.</p>{error && <p role="alert" className="mf-error">{error}</p>}<div className="mf-modal-actions"><button type="button" disabled={busy} onClick={closeDialog}>Annuler</button><button type="button" className="mf-danger" disabled={busy} onClick={remove}>{busy ? "Suppression…" : "Confirmer la suppression"}</button></div></Dialog>}
    {dialog === "sign" && <Dialog title="Signer la leçon" onClose={closeDialog} busy={busy}><p>Confirmez que cette leçon a été effectuée. La signature verrouille les informations de la leçon.</p><SignaturePad strokes={strokes} onChange={setStrokes} disabled={busy} /><label className="mf-absence"><input type="checkbox" checked={accepted} disabled={busy} onChange={(event) => setAccepted(event.target.checked)} />Je confirme le contenu de cette leçon et sa réalisation.</label>{error && <p role="alert" className="mf-error">{error}</p>}<div className="mf-modal-actions"><button type="button" disabled={busy} onClick={closeDialog}>Annuler</button><button type="button" className="mf-primary" disabled={busy || !accepted || !strokes.length} onClick={sign}>{busy ? "Signature…" : "Confirmer la signature"}</button></div></Dialog>}
    {dialog === "competencies" && <FormationCompetencies studentId={studentId} monitorId={monitorId} lesson={draft} onBusyChange={setBusy} onDirtyChange={setCompetencyDirty} onClose={() => { closeDialog(); if (!draftDirty) refresh(draft.id).catch((requestError) => setError(errorMessage(requestError))); }} />}
  </section>;
}
