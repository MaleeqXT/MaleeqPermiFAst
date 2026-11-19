import { useEffect, useState } from "react";
import BilanCompetences, { normalizeBilanEvaluation } from "../bilans/BilanCompetences.jsx";
import { Dialog, SignaturePad } from "./formation/FormationComponents.jsx";
import "./BilansPage.css";

const BILAN_SECTIONS = [
  {
    title: "Automatiser la manipulation des commandes",
    questions: [
      "Manipuler les commandes et maintenir la trajectoire",
      "Doser les pédales, démarrer et s'arrêter",
      "Utiliser la boîte de vitesses",
    ],
  },
  {
    title: "Se placer sur la chaussée",
    questions: [
      "En ligne droite, en tournant à droite et à gauche",
      "Sur un carrefour à sens giratoire",
      "Sur des voies affectées à des sens de circulation",
      "Lors des croisements",
    ],
  },
  {
    title: "Adapter l'allure en fonction des situations",
    questions: [
      "En agglomération (circulation fluide et dense)",
      "Sur voies rapides (entrée, circulation, sortie)",
    ],
  },
  {
    title: "Regarder vers l'avant, autour de soi et derrière",
    questions: [
      "Regarder loin devant et contrôler les intersections",
      "Utiliser les rétroviseurs et contrôler dans les angles morts",
    ],
  },
  {
    title: "Evaluer et maintenir les distances de sécurité",
    questions: ["Vers l'avant, latéralement, à l'arrêt"],
  },
  {
    title: "Rechercher et prendre en compte la signalisation",
    questions: ["Panneaux, marquages au sol, feux"],
  },
  {
    title: "Se comporter avec les autres catégories d'usagers",
    questions: ["Faire preuve de courtoisie au volant et de tolérance"],
  },
  {
    title: "Anticiper les situations de conduite",
    questions: [
      "Percevoir les indices utiles",
      "Prévoir l'évolution des situations, décider, agir",
    ],
  },
  {
    title: "Manœuvrer et stationner",
    questions: ["Manœuvrer (créneau, épi, bataille, ...)"],
  },
  {
    title: "Suivre un itinéraire",
    questions: ["En autonomie"],
  },
];

const BOX_STATES = ["empty", "orange", "green"];
const BOX_STATE_LABELS = {
  empty: "Non renseigné",
  orange: "Évaluation orange",
  green: "Évaluation verte",
};

function EvaluationBox({ bilan, question, state, onChange, disabled }) {
  const currentState = state ?? "empty";
  const nextState = BOX_STATES[(BOX_STATES.indexOf(currentState) + 1) % BOX_STATES.length];

  return (
    <button
      type="button"
      className={`mb-evaluation-box mb-evaluation-box--${currentState}`}
      aria-label={`${bilan}, ${question}: ${BOX_STATE_LABELS[currentState]}. Cliquer pour ${BOX_STATE_LABELS[nextState].toLowerCase()}.`}
      onClick={onChange}
      disabled={disabled}
    >
      {currentState !== "empty" && (
        <svg className="mb-evaluation-mark" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5 19 19" />
          {currentState === "green" && <path d="M19 5 5 19" />}
        </svg>
      )}
    </button>
  );
}

function LegacyBilansPage({
  students = [],
  selectedStudentId = "",
  onStudentChange,
  initialEvaluations = {},
  initialHours = { bilan1: "0", bilan2: "0" },
  onEvaluationsChange,
  onHoursChange,
  readOnly = false,
  loading = false,
  error = "",
}) {
  const [openSections, setOpenSections] = useState(() => Object.fromEntries(BILAN_SECTIONS.map((_, index) => [index, true])));
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [hours, setHours] = useState(initialHours);
  const needsStudentSelection = typeof onStudentChange === "function";
  const isEditingDisabled = readOnly || loading || (needsStudentSelection && !selectedStudentId);

  const cycleEvaluation = (sectionIndex, questionIndex, bilan) => {
    const key = `${sectionIndex}-${questionIndex}-${bilan}`;
    setEvaluations((current) => {
      const currentState = current[key] ?? "empty";
      const nextState = BOX_STATES[(BOX_STATES.indexOf(currentState) + 1) % BOX_STATES.length];
      const nextEvaluations = { ...current, [key]: nextState };
      onEvaluationsChange?.(nextEvaluations);
      return nextEvaluations;
    });
  };

  const updateHours = (bilan, value) => {
    setHours((current) => {
      const nextHours = { ...current, [bilan]: value };
      onHoursChange?.(nextHours);
      return nextHours;
    });
  };

  return (
    <section className="mb-page" aria-labelledby="bilans-title">
      <header className="mb-page-heading">
        <div>
          <p>Suivi pédagogique</p>
          <h1 id="bilans-title">Bilans</h1>
        </div>
        <div className="mb-page-heading-actions">
          {needsStudentSelection && (
            <label className="mb-student-picker">
              <span>Élève</span>
              <select value={selectedStudentId} onChange={(event) => onStudentChange(event.target.value)} disabled={loading}>
                <option value="">Sélectionner un élève</option>
                {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </label>
          )}
          <div className="mb-column-legend" aria-label="Colonnes d'évaluation">
            <span>Bilan 1</span>
            <span>Bilan 2</span>
          </div>
        </div>
      </header>

      {error && <p className="mb-data-message" role="alert">{error}</p>}

      <div className="mb-sections">
        {BILAN_SECTIONS.map((section, sectionIndex) => {
          const isOpen = Boolean(openSections[sectionIndex]);

          return (
            <article className="mb-section" key={section.title}>
              <button
                type="button"
                className="mb-section-header"
                aria-expanded={isOpen}
                onClick={() => setOpenSections((current) => ({ ...current, [sectionIndex]: !current[sectionIndex] }))}
              >
                <span>{section.title}</span>
                <svg className={isOpen ? "mb-chevron mb-chevron--open" : "mb-chevron"} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isOpen && (
                <div className="mb-question-list">
                  {section.questions.map((question, questionIndex) => (
                    <div className="mb-question-row" key={question}>
                      <p>{question}</p>
                      <div className="mb-question-actions" aria-label={`Évaluation : ${question}`}>
                        <EvaluationBox
                          bilan="Bilan 1"
                          question={question}
                          state={evaluations[`${sectionIndex}-${questionIndex}-bilan1`]}
                          onChange={() => cycleEvaluation(sectionIndex, questionIndex, "bilan1")}
                          disabled={isEditingDisabled}
                        />
                        <EvaluationBox
                          bilan="Bilan 2"
                          question={question}
                          state={evaluations[`${sectionIndex}-${questionIndex}-bilan2`]}
                          onChange={() => cycleEvaluation(sectionIndex, questionIndex, "bilan2")}
                          disabled={isEditingDisabled}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <section className="mb-hours" aria-labelledby="hours-title">
        <h2 id="hours-title">Nombre d'heures</h2>
        <div className="mb-hours-fields">
          <label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={hours.bilan1}
              onChange={(event) => updateHours("bilan1", event.target.value)}
              aria-label="Nombre d'heures pour le Bilan 1"
              readOnly={isEditingDisabled}
            />
            <span>Bilan 1</span>
          </label>
          <label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={hours.bilan2}
              onChange={(event) => updateHours("bilan2", event.target.value)}
              aria-label="Nombre d'heures pour le Bilan 2"
              readOnly={isEditingDisabled}
            />
            <span>Bilan 2</span>
          </label>
        </div>
      </section>
    </section>
  );
}

const DECISION_LABELS = { pending: "En attente", accepted: "Accepté", rejected: "Refusé" };

function decisionDate(value) {
  return value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : null;
}

function BilanDecision({ bilan, onDecision }) {
  const [confirmation, setConfirmation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const status = bilan?.decision_status || "pending";
  const canDecide = Boolean(onDecision && bilan?.can_student_decide && status === "pending");
  const submit = async () => {
    if (!confirmation || saving) return;
    setSaving(true); setError("");
    try { await onDecision(confirmation); setConfirmation(null); }
    catch (requestError) { setError(requestError?.response?.data?.message || "Impossible d’enregistrer votre décision. Réessayez."); }
    finally { setSaving(false); }
  };

  if (!bilan?.id) return null;
  return <><section className={`mb-decision mb-decision--${status}`} aria-live="polite"><div><span>Décision de l’élève</span><strong>{DECISION_LABELS[status]}</strong>{bilan.decision_at && <small>Décision enregistrée le {decisionDate(bilan.decision_at)}</small>}{Array.isArray(bilan.decision_history) && bilan.decision_history.length > 0 && <small>Décision modifiée par l’élève ({bilan.decision_history.length} changement{bilan.decision_history.length > 1 ? "s" : ""}) · précédente : {DECISION_LABELS[bilan.decision_history[bilan.decision_history.length - 1]?.decision] || "—"}</small>}{!bilan.shared_at && <small>Ce bilan n’a pas encore été partagé avec l’élève.</small>}</div>{canDecide && <div className="mb-decision-actions"><button type="button" className="mb-decision-accept" onClick={() => setConfirmation("accepted")}>Accepter le bilan</button><button type="button" className="mb-decision-reject" onClick={() => setConfirmation("rejected")}>Refuser le bilan</button></div>}</section>{error && <p className="mb-data-message" role="alert">{error}</p>}{confirmation && <div className="mb-decision-dialog-backdrop" role="presentation"><section className="mb-decision-dialog" role="dialog" aria-modal="true" aria-labelledby="bilan-decision-title"><h2 id="bilan-decision-title">{confirmation === "accepted" ? "Accepter ce bilan ?" : "Refuser ce bilan ?"}</h2><p>{confirmation === "accepted" ? "Votre acceptation sera enregistrée. Vous pourrez la modifier plus tard." : "Votre refus sera enregistré et le moniteur pourra le consulter. Vous pourrez le modifier plus tard."}</p><div><button type="button" disabled={saving} onClick={() => setConfirmation(null)}>Annuler</button><button type="button" className={confirmation === "accepted" ? "mb-decision-accept" : "mb-decision-reject"} disabled={saving} onClick={submit}>{saving ? "Enregistrement…" : "Confirmer"}</button></div></section></div>}</>;
}

export default function BilansPage({ students = [], selectedStudentId = "", onStudentChange, initialBilan = null, onSave, onDecision, readOnly = false, loading = false, error = "" }) {
  const [draft, setDraft] = useState(() => normalizeBilanEvaluation(initialBilan?.evaluation ?? initialBilan));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const [decisionAction, setDecisionAction] = useState(null);
  const [decisionStrokes, setDecisionStrokes] = useState([]);
  const [decisionSaving, setDecisionSaving] = useState(false);
  const [decisionError, setDecisionError] = useState("");
  const needsStudentSelection = typeof onStudentChange === "function";

  useEffect(() => {
    setDraft(normalizeBilanEvaluation(initialBilan?.evaluation ?? initialBilan));
    setNotice(""); setSaveError("");
  }, [initialBilan]);

  const selectedStudent = students.find((student) => String(student.id) === String(selectedStudentId));
  const save = async () => {
    if (readOnly || !onSave || saving) return;
    setSaving(true); setSaveError(""); setNotice("");
    try {
      const saved = await onSave(draft);
      if (saved?.evaluation) setDraft(normalizeBilanEvaluation(saved.evaluation));
      setNotice("Bilan de compétences enregistré.");
    } catch (requestError) {
      setSaveError(requestError?.response?.data?.message || "Impossible d’enregistrer le bilan. Réessayez.");
    } finally { setSaving(false); }
  };
  const decide = async () => {
    if (!decisionAction || decisionSaving || (decisionAction === "accepted" && !decisionStrokes.length)) return;
    setDecisionSaving(true); setDecisionError("");
    try { await onDecision?.(decisionAction, decisionAction === "accepted" ? decisionStrokes : null); setDecisionAction(null); setDecisionStrokes([]); }
    catch (requestError) { setDecisionError(requestError?.response?.data?.message || "Impossible d’enregistrer votre décision. Réessayez."); }
    finally { setDecisionSaving(false); }
  };

  return <section className={`mb-page ${readOnly ? "mb-page--student" : "mb-page--monitor"}`} aria-labelledby="bilans-title">
    <header className="mb-page-heading"><div><p>Suivi pédagogique</p><h1 id="bilans-title">Bilans</h1></div>{needsStudentSelection && <label className="mb-student-picker"><span>Élève</span><select value={selectedStudentId} onChange={(event) => onStudentChange(event.target.value)} disabled={loading || saving}><option value="">Sélectionner un élève</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>}</header>
    {error && <p className="mb-data-message" role="alert">{error}</p>}{saveError && <p className="mb-data-message" role="alert">{saveError}</p>}{notice && <p className="mb-success" role="status">{notice}</p>}
    {loading && !initialBilan ? <p className="mb-loading">Chargement du bilan…</p> : <><BilanDecision bilan={initialBilan} /><BilanCompetences data={draft} onChange={setDraft} readOnly={readOnly || loading || (needsStudentSelection && !selectedStudentId)} studentName={initialBilan?.student_name || selectedStudent?.name || "—"} monitorName={initialBilan?.monitor_name || "—"} totalHours={initialBilan?.total_hours ?? "0"} studentDecision={readOnly && onDecision ? { status: initialBilan?.decision_status, signature: initialBilan?.student_signature, canDecide: Boolean(initialBilan?.id && initialBilan?.can_student_decide), onRequest: (decision) => { setDecisionError(""); setDecisionStrokes([]); setDecisionAction(decision); } } : null} />{!readOnly && <div className="mb-save-row"><button type="button" onClick={save} disabled={loading || saving || !selectedStudentId}>{saving ? "Enregistrement…" : "Sauvegarder le bilan"}</button></div>}</>}{decisionAction && <Dialog className="mb-signature-modal" title={decisionAction === "accepted" ? "Signer et accepter le bilan" : "Refuser le bilan"} onClose={() => !decisionSaving && setDecisionAction(null)} busy={decisionSaving}><p>{decisionAction === "accepted" ? "Tracez votre signature puis confirmez votre acceptation. Vous pourrez modifier votre décision plus tard." : "Confirmez votre refus. Le moniteur pourra consulter cette décision, et vous pourrez la modifier plus tard."}</p>{decisionAction === "accepted" && <SignaturePad strokes={decisionStrokes} onChange={setDecisionStrokes} disabled={decisionSaving} />}{decisionError && <p className="mb-data-message" role="alert">{decisionError}</p>}<div className="mb-decision-modal-actions"><button type="button" disabled={decisionSaving} onClick={() => setDecisionAction(null)}>Annuler</button><button type="button" className={decisionAction === "accepted" ? "mb-decision-accept" : "mb-decision-reject"} disabled={decisionSaving || (decisionAction === "accepted" && !decisionStrokes.length)} onClick={decide}>{decisionSaving ? "Enregistrement…" : decisionAction === "accepted" ? "Signer et accepter" : "Confirmer le refus"}</button></div></Dialog>}
  </section>;
}
