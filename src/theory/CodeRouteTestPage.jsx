import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../helpers/http.jsx";
import StudentSidebar from "../new-student-dashboard/StudentSidebar.jsx";
import StudentHeader from "../new-student-dashboard/StudentHeader.jsx";
import "../new-student-dashboard/CandidateDashboard.css";
import "./CodeRouteTestPage.css";

function mediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const root = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  return `${root}/${path.startsWith("theory/questions/") ? "storage/" : ""}${path.replace(/^\//, "")}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, seconds || 0);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" /></svg>;
const BookIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4zM20 4h-6a3 3 0 0 1 3-3h6z" /></svg>;

export default function CodeRouteTestPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [error, setError] = useState("");
  const expirySubmitStarted = useRef(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await http.get("/student/theory/dashboard");
      setDashboard(response.data?.data || null);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Le module Code de la route est indisponible pour le moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const openAttempt = async (id) => {
    setStarting(true);
    setError("");
    try {
      const response = await http.get(`/student/theory/attempts/${id}`);
      const data = response.data?.data;
      if (Object.prototype.hasOwnProperty.call(data || {}, "score")) {
        setResult(data);
        setAttempt(null);
      } else {
        setAttempt(data);
        setResult(null);
        setActiveIndex(0);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible d’ouvrir cette série.");
    } finally {
      setStarting(false);
    }
  };

  const start = async (series) => {
    expirySubmitStarted.current = false;
    setStarting(true);
    setError("");
    try {
      const response = await http.post("/student/theory/attempts", { mode: series.type, series_id: series.id });
      const data = response.data?.data;
      if (Object.prototype.hasOwnProperty.call(data || {}, "score")) {
        setResult(data);
        setAttempt(null);
      } else {
        setAttempt(data);
        setResult(null);
        setActiveIndex(0);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.series_id?.[0] || requestError.response?.data?.message || "Impossible de démarrer la série.");
    } finally {
      setStarting(false);
    }
  };

  const questions = attempt?.questions || [];
  const current = questions[activeIndex];
  const answeredCount = useMemo(() => questions.filter((item) => item.selected_option_ids?.length).length, [questions]);
  const validatedCount = useMemo(() => questions.filter((item) => item.training_correction).length, [questions]);

  const selectOption = (optionId) => {
    if (!current || saving || current.training_correction) return;
    setAttempt((existing) => ({
      ...existing,
      questions: existing.questions.map((item, index) => {
        if (index !== activeIndex) return item;
        const selected = item.selected_option_ids || [];
        const multiple = item.question.answer_type === "multiple";
        const next = multiple ? (selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId]) : [optionId];
        return { ...item, selected_option_ids: next };
      }),
    }));
  };

  const persistCurrent = async () => {
    const item = attempt?.questions?.[activeIndex];
    if (!attempt || !item || attempt.mode === "training") return;
    setSaving(true);
    try {
      await http.put(`/student/theory/attempts/${attempt.id}/answers/${item.answer_id}`, { selected_option_ids: item.selected_option_ids || [] });
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.attempt?.[0] || requestError.response?.data?.message || "Votre réponse n’a pas pu être enregistrée.");
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const move = async (nextIndex) => {
    try {
      await persistCurrent();
      setActiveIndex(nextIndex);
      setError("");
    } catch { /* The server message remains visible. */ }
  };

  const validateCurrent = async () => {
    const item = attempt?.questions?.[activeIndex];
    if (!attempt || !item || !item.selected_option_ids?.length || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await http.post(`/student/theory/attempts/${attempt.id}/answers/${item.answer_id}/validate`, { selected_option_ids: item.selected_option_ids });
      setAttempt((existing) => ({
        ...existing,
        questions: existing.questions.map((question, index) => index === activeIndex ? { ...question, training_correction: response.data?.data || null } : question),
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.selected_option_ids?.[0] || requestError.response?.data?.message || "Votre réponse n’a pas pu être validée.");
    } finally {
      setSaving(false);
    }
  };

  const submitAttempt = useCallback(async ({ auto = false } = {}) => {
    if (!attempt || saving || expirySubmitStarted.current) return;
    if (auto) expirySubmitStarted.current = true;
    setSaving(true);
    setError("");
    try {
      const item = attempt.questions[activeIndex];
      if (!auto && attempt.mode !== "training" && item) {
        await http.put(`/student/theory/attempts/${attempt.id}/answers/${item.answer_id}`, { selected_option_ids: item.selected_option_ids || [] });
      }
      const response = await http.post(`/student/theory/attempts/${attempt.id}/submit`);
      setResult(response.data?.data || null);
      setAttempt(null);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.attempt?.[0] || requestError.response?.data?.message || "La remise de la série a échoué. Vos réponses restent enregistrées.");
      expirySubmitStarted.current = false;
    } finally {
      setSaving(false);
    }
  }, [activeIndex, attempt, loadDashboard, saving]);

  useEffect(() => {
    if (!attempt?.expires_at) {
      setSecondsLeft(null);
      return undefined;
    }
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((new Date(attempt.expires_at).getTime() - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [attempt?.expires_at]);

  useEffect(() => {
    if (attempt?.mode === "exam" && secondsLeft === 0) submitAttempt({ auto: true });
  }, [attempt?.mode, secondsLeft, submitAttempt]);

  const exitToDashboard = () => {
    expirySubmitStarted.current = false;
    setAttempt(null);
    setResult(null);
    setActiveIndex(0);
    loadDashboard();
  };

  return <div className="nsd-root cdr-root">
    <StudentSidebar activePath="/student-code-route" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={(path) => { setSidebarOpen(false); navigate(path); }} />
    <main className="nsd-main cdr-main">
      <StudentHeader className="cdr-header" title="Code de la route" subtitle="Séries d’entraînement et examens blancs corrigés." onMenuOpen={() => setSidebarOpen(true)} />
      {error && <div className="cdr-alert" role="alert">{error}<button type="button" onClick={() => setError("")}>×</button></div>}
      {attempt && current && <TestPlayer attempt={attempt} current={current} questions={questions} activeIndex={activeIndex} answeredCount={answeredCount} validatedCount={validatedCount} secondsLeft={secondsLeft} onSelect={selectOption} onMove={move} onValidate={validateCurrent} onSubmit={submitAttempt} saving={saving} />}
      {result && <ResultView result={result} onRetry={() => result.series && start({ id: result.series.id, type: result.mode })} onBack={exitToDashboard} starting={starting} />}
      {!attempt && !result && <Dashboard data={dashboard} loading={loading} onStart={start} onResume={() => dashboard?.open_attempt && openAttempt(dashboard.open_attempt.id)} onOpen={openAttempt} starting={starting} />}
    </main>
  </div>;
}

function Dashboard({ data, loading, onStart, onResume, onOpen, starting }) {
  const [tab, setTab] = useState("training");
  const weak = [...(data?.categories || [])].filter((category) => category.answered > 0).sort((a, b) => (a.success_rate ?? 100) - (b.success_rate ?? 100)).slice(0, 3);
  const catalogue = tab === "training" ? data?.training_series || [] : data?.exam_series || [];

  return <>
    <section className="cdr-hero"><div><span className="cdr-kicker">CODE DE LA ROUTE · 40 QUESTIONS PAR SÉRIE</span><h1>Préparez votre examen à votre rythme</h1><p>Entraînez-vous avec correction immédiate ou passez un examen blanc chronométré. La réussite est fixée à 35 bonnes réponses sur 40.</p><div className="cdr-hero-actions">{data?.open_attempt ? <button className="cdr-primary" type="button" onClick={onResume} disabled={starting}>Reprendre « {data.open_attempt.series_title || "ma série"} »</button> : <span>{loading ? "Chargement…" : `${data?.published_question_count || 0} questions disponibles`}</span>}</div></div><div className="cdr-hero-score"><strong>{data?.average_success_rate ?? "—"}<small>{data?.average_success_rate === null || data?.average_success_rate === undefined ? "" : "%"}</small></strong><span>réussite moyenne</span></div></section>
    <section className="cdr-stat-grid"><article><span>Questions travaillées</span><strong>{data?.answered_questions ?? "—"}</strong></article><article><span>Examens terminés</span><strong>{data?.tests_completed ?? "—"}</strong></article><article><span>Réussite moyenne</span><strong>{data?.average_success_rate ?? "—"}{data?.average_success_rate !== null && data?.average_success_rate !== undefined ? "%" : ""}</strong></article></section>
    <section className="cdr-section cdr-series-section"><div className="cdr-section-title"><div><BookIcon /><h2>Mes séries</h2></div><span>{tab === "training" ? "Correction après chaque réponse" : "Chronométré · correction après la remise"}</span></div><div className="cdr-tabs"><button type="button" className={tab === "training" ? "active" : ""} onClick={() => setTab("training")}>Entraînement ({data?.training_series?.length || 0})</button><button type="button" className={tab === "exam" ? "active" : ""} onClick={() => setTab("exam")}>Examens blancs ({data?.exam_series?.length || 0})</button></div><div className="cdr-series-grid">{catalogue.map((series, index) => <article className="cdr-series-card" key={series.id}><span className="cdr-series-number">{String(index + 1).padStart(2, "0")}</span><h3>{series.title}</h3><p>{series.description || (tab === "training" ? "40 questions avec explications détaillées." : `${series.duration_minutes || 40} minutes pour 40 questions.`)}</p><small>{series.questions_count} questions{tab === "exam" ? ` · ${series.duration_minutes || 40} min` : " · correction immédiate"}</small>{series.attempt_count > 0 && <strong>Dernier score : {series.last_score}/40</strong>}<button type="button" className="cdr-primary" disabled={starting || Boolean(data?.open_attempt)} onClick={() => onStart(series)}>{series.attempt_count ? "Recommencer" : "Démarrer"}</button></article>)}</div></section>
    <section className="cdr-section"><div className="cdr-section-title"><div><BookIcon /><h2>Progression par thème</h2></div><span>{data?.categories?.length || 0} thèmes</span></div><div className="cdr-category-grid">{loading ? <p>Chargement des thèmes…</p> : (data?.categories || []).map((category) => <article key={category.id} className="cdr-category-card"><div><h3>{category.name}</h3><span>{category.available_questions_count} questions</span></div><strong>{category.success_rate === null ? "—" : `${category.success_rate}%`}</strong><div className="cdr-progress"><span style={{ width: `${category.success_rate || 0}%` }} /></div><small>{category.answered ? `${category.correct}/${category.answered} bonnes réponses` : "Pas encore pratiqué"}</small></article>)}</div></section>
    <div className="cdr-dashboard-columns"><section className="cdr-section"><div className="cdr-section-title"><h2>Mes résultats</h2></div>{data?.attempts?.length ? <div className="cdr-history">{data.attempts.map((item) => <button type="button" key={item.id} onClick={() => onOpen(item.id)}><span className={item.passed ? "cdr-result-dot cdr-result-dot--pass" : "cdr-result-dot cdr-result-dot--fail"}>{item.passed ? <CheckIcon /> : "!"}</span><span><strong>{item.series_title || "Série Code"} · {item.score}/40</strong><small>{item.mode === "training" ? "Entraînement" : "Examen blanc"} · {formatDate(item.submitted_at)}</small></span><span className="cdr-arrow">›</span></button>)}</div> : <p className="cdr-empty">Votre historique apparaîtra après votre première série.</p>}</section><aside className="cdr-section cdr-weak"><div className="cdr-section-title"><h2>À renforcer</h2></div>{weak.length ? weak.map((category) => <div key={category.id}><strong>{category.name}</strong><span>{category.success_rate}% de réussite</span></div>) : <p className="cdr-empty">Terminez une série pour identifier vos thèmes à renforcer.</p>}</aside></div>
  </>;
}

function TestPlayer({ attempt, current, questions, activeIndex, answeredCount, validatedCount, secondsLeft, onSelect, onMove, onValidate, onSubmit, saving }) {
  const question = current.question;
  const isTraining = attempt.mode === "training";
  const correction = current.training_correction;
  const isMultiple = question.answer_type === "multiple";
  const progress = ((activeIndex + 1) / questions.length) * 100;

  return <section className="cdr-test"><div className="cdr-test-top"><div><span>{isTraining ? "ENTRAÎNEMENT" : "EXAMEN BLANC"}</span><strong>{attempt.series?.title || "Série Code de la route"}</strong></div><div className="cdr-test-status"><span>Question {activeIndex + 1} sur {questions.length}</span>{!isTraining && <strong className={secondsLeft !== null && secondsLeft < 300 ? "cdr-timer cdr-timer--urgent" : "cdr-timer"}>⏱ {formatTimer(secondsLeft)}</strong>}{isTraining && <span>{validatedCount}/{questions.length} validées</span>}{!isTraining && <span>{answeredCount}/{questions.length} répondues</span>}</div></div><div className="cdr-progress cdr-progress--test"><span style={{ width: `${progress}%` }} /></div><div className="cdr-question-card"><div className="cdr-question-meta"><span>{question.difficulty === "easy" ? "Facile" : question.difficulty === "hard" ? "Difficile" : "Intermédiaire"}</span>{isMultiple && <span>Plusieurs réponses possibles</span>}</div><h1>{question.question_text}</h1>{question.media_path && (question.media_type === "video" ? <video controls src={mediaUrl(question.media_path)} /> : <img src={mediaUrl(question.media_path)} alt="Illustration de la situation routière" />)}<div className="cdr-answers">{(question.options || []).map((option, index) => { const selected = current.selected_option_ids?.includes(option.id); const correct = correction?.correct_option_ids?.includes(option.id); const classes = ["cdr-answer", selected && "cdr-answer--selected", correction && correct && "cdr-answer--correct", correction && selected && !correct && "cdr-answer--wrong"].filter(Boolean).join(" "); return <button type="button" key={option.id} className={classes} onClick={() => onSelect(option.id)} disabled={saving || Boolean(correction)}><span>{selected ? <CheckIcon /> : String.fromCharCode(65 + index)}</span>{option.label}</button>; })}</div>{isTraining && !correction && <div className="cdr-validation"><button type="button" className="cdr-primary" disabled={saving || !current.selected_option_ids?.length} onClick={onValidate}>{saving ? "Validation…" : "Valider ma réponse"}</button></div>}{correction && <div className={correction.is_correct ? "cdr-inline-correction cdr-inline-correction--correct" : "cdr-inline-correction cdr-inline-correction--incorrect"}><strong>{correction.is_correct ? "Bonne réponse !" : "Réponse à revoir"}</strong><p>{correction.explanation}</p>{correction.official_reference && <a href={correction.official_reference} target="_blank" rel="noreferrer">Voir la référence officielle</a>}</div>}</div><div className="cdr-test-nav"><button type="button" className="cdr-ghost" disabled={activeIndex === 0 || saving} onClick={() => onMove(activeIndex - 1)}>← Précédent</button><div className="cdr-indexes">{questions.map((item, index) => <button type="button" key={item.answer_id} aria-label={`Question ${index + 1}`} className={`${index === activeIndex ? "active" : ""} ${item.selected_option_ids?.length ? "answered" : ""} ${item.training_correction ? "validated" : ""}`} onClick={() => onMove(index)} disabled={saving}>{index + 1}</button>)}</div>{activeIndex < questions.length - 1 ? <button type="button" className="cdr-primary" disabled={saving} onClick={() => onMove(activeIndex + 1)}>Suivant →</button> : <button type="button" className="cdr-primary" disabled={saving} onClick={() => onSubmit()}>{saving ? "Remise…" : isTraining ? "Terminer la série" : "Terminer l’examen"}</button>}</div></section>;
}

function ResultView({ result, onRetry, onBack, starting }) {
  const training = result.mode === "training";
  const passed = training ? result.score >= 0 : result.passed;
  return <section className="cdr-result"><div className={passed ? "cdr-result-hero cdr-result-hero--pass" : "cdr-result-hero cdr-result-hero--fail"}><span>{passed ? <CheckIcon /> : "!"}</span><div><p>{training ? "SÉRIE TERMINÉE" : passed ? "EXAMEN RÉUSSI" : "EXAMEN À REFAIRE"}</p><h1>{training ? "Retrouvez les corrections détaillées pour continuer à progresser." : passed ? "Bravo, vous avez atteint le seuil requis." : "Continuez : chaque correction vous aide à progresser."}</h1><strong>{result.score}/40</strong><small>{result.correct_answers} bonnes réponses · {result.incorrect_answers} erreurs{training ? "" : ` · seuil ${result.pass_threshold}/40`}</small></div></div><div className="cdr-result-actions"><button type="button" className="cdr-primary" disabled={starting || !result.series?.id} onClick={onRetry}>Recommencer la série</button><button type="button" className="cdr-ghost" onClick={onBack}>Retour à mes séries</button></div><section className="cdr-review"><h2>Correction détaillée</h2>{result.questions?.map((item, index) => <article key={item.answer_id} className={item.is_correct ? "cdr-review-item cdr-review-item--correct" : "cdr-review-item cdr-review-item--incorrect"}><div className="cdr-review-head"><span>{item.is_correct ? <CheckIcon /> : "!"}</span><div><small>Question {index + 1}</small><h3>{item.question.question_text}</h3></div></div>{item.question.media_path && (item.question.media_type === "video" ? <video controls src={mediaUrl(item.question.media_path)} /> : <img className="cdr-review-media" src={mediaUrl(item.question.media_path)} alt="Illustration de la question" />)}<div className="cdr-review-options">{item.question.options?.map((option) => { const wasSelected = item.selected_option_ids?.includes(option.id); const correct = item.correct_option_ids?.includes(option.id); return <p key={option.id} className={correct ? "correct" : wasSelected ? "incorrect" : ""}>{correct ? "✓ " : wasSelected ? "× " : ""}{option.label}</p>; })}</div><div className="cdr-explanation"><strong>Explication</strong><p>{item.question.explanation}</p>{item.question.official_reference && <a href={item.question.official_reference} target="_blank" rel="noreferrer">Voir la référence officielle</a>}</div></article>)}</section></section>;
}
