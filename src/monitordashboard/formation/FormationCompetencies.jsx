import { useCallback, useEffect, useState } from "react";
import http from "../../helpers/http.jsx";
import QuestionDetail from "../QuestionDetail.jsx";
import { Dialog } from "./FormationComponents.jsx";

export default function FormationCompetencies({ studentId, monitorId, lesson, onClose, onBusyChange, onDirtyChange }) {
  const [groups, setGroups] = useState([]);
  const [evaluations, setEvaluations] = useState(() => Object.fromEntries((lesson.competencies || []).map((item) => [item.id, item])));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [openQuestion, setOpenQuestion] = useState("");
  const [questionDirty, setQuestionDirty] = useState(false);
  useEffect(() => { onDirtyChange?.(questionDirty); return () => onDirtyChange?.(false); }, [questionDirty, onDirtyChange]);
  useEffect(() => { onBusyChange?.(Boolean(saving)); return () => onBusyChange?.(false); }, [saving, onBusyChange]);
  // The shared dialog keeps focus stable while inputs change.
  const close = useCallback(() => {
    if (!questionDirty || window.confirm("Fermer sans enregistrer les observations modifiées ?")) onClose();
  }, [onClose, questionDirty]);
  useEffect(() => {
    const controller = new AbortController();
    http.get("/monitor/progress/" + studentId, { params: monitorId ? { monitor_id: monitorId } : {}, signal: controller.signal })
      .then(({ data }) => setGroups(data.data?.competencies || []))
      .catch((requestError) => { if (!controller.signal.aborted) setError(requestError.response?.data?.message || "Impossible de charger les compétences."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [studentId, monitorId]);
  async function save(question, changes = {}) {
    if (saving) return;
    if (questionDirty && changes.rating !== undefined) { setError("Enregistrez les observations modifiées avant de changer le niveau."); return; }
    const previous = evaluations[question.id] || {};
    const next = {
      rating: changes.rating ?? previous.rating ?? 0,
      observations: changes.observations ?? previous.observations ?? "",
      student_evaluation: changes.studentEvaluation ?? previous.studentEvaluation ?? false,
      student_response: changes.studentResponse ?? previous.studentResponse ?? "",
      active_tab: changes.activeTab ?? previous.activeTab ?? "pourquoi",
      reservation_id: lesson.id,
    };
    setSaving(question.id); setError(""); setNotice("");
    try {
      await http.put("/monitor/progress/" + studentId + "/competencies/" + question.id, next, { params: monitorId ? { monitor_id: monitorId } : {} });
      setEvaluations((current) => ({ ...current, [question.id]: { id: question.id, title: question.title, rating: next.rating, observations: next.observations, studentEvaluation: next.student_evaluation, studentResponse: next.student_response, activeTab: next.active_tab } }));
      setQuestionDirty(false); setNotice("L’évaluation a été enregistrée pour cette leçon.");
    } catch (requestError) { setError(requestError.response?.data?.message || "Impossible d’enregistrer l’évaluation."); }
    finally { setSaving(""); }
  }
  return <Dialog title="Lier des compétences" className="mf-competency-modal" onClose={close} busy={Boolean(saving)} wide>
    {loading && <p role="status">Chargement des compétences…</p>}{error && <p role="alert" className="mf-error">{error}</p>}{notice && <p role="status" className="mf-success">{notice}</p>}
    {!loading && !groups.length && !error && <p>Aucune compétence active disponible.</p>}
    <div className="mf-competencies">{groups.map((group) => <section key={group.id}><h3>{group.code} — {group.title}</h3>{group.questions.map((question) => {
      const evaluation = evaluations[question.id] || {};
      return <article className="mf-competency" key={question.id}>
        <div><span><b>{question.letter}</b> {question.title}</span><label>Niveau<select aria-label={"Niveau de " + question.title} value={evaluation.rating ?? 0} disabled={Boolean(saving)} onChange={(event) => save(question, { rating: Number(event.target.value) })}>{[0, 1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value}/5</option>)}</select></label><button type="button" disabled={Boolean(saving)} onClick={() => {
          if (questionDirty && !window.confirm("Changer de compétence sans enregistrer les observations modifiées ?")) return;
          setQuestionDirty(false); setOpenQuestion(openQuestion === question.id ? "" : question.id);
        }}>Observations</button></div>
        {saving === question.id && <p role="status">Enregistrement…</p>}
        {openQuestion === question.id && <div className={saving ? "mf-competency-saving" : ""} onChangeCapture={(event) => { if (event.target.tagName === "TEXTAREA" && !event.target.readOnly) setQuestionDirty(true); }}><QuestionDetail key={question.id + ":" + (evaluation.rating ?? 0)} observations={evaluation.observations || ""} studentEvaluation={evaluation.studentEvaluation || false} studentResponse={evaluation.studentResponse || ""} activeTab={evaluation.activeTab || "pourquoi"} lessonCount={1} onSave={(changes) => save(question, changes)} /></div>}
      </article>;
    })}</section>)}</div>
    <div className="mf-modal-actions"><button type="button" disabled={Boolean(saving)} onClick={close}>Terminer</button></div>
  </Dialog>;
}
