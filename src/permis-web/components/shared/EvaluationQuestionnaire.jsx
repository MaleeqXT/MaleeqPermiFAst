import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./EvaluationQuestionnaire.css";
import { EVALUATION_SERVICES, QUESTIONS, serviceFromAnswers } from "./evaluationServices.js";

/*
 * Pre-registration questionnaire: the answers decide between Évaluation de
 * conduite and Bilan (see evaluationServices.js). The matching offer is the
 * one the administrator flagged with offers.evaluation_service for that
 * service and gearbox, so the two services are never mixed in the cart.
 */

const formatPrice = (value) => `${Number(value || 0).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;

/**
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 * @param {Function} props.loadOffers  async (service, isAuto) => [{ id, name, price, raw }]
 * @param {Function} props.onConfirm   ({ offer, service, answers }) => void | Promise
 * @param {number|null} [props.defaultIsAuto]  0 / 1 when the learner's gearbox is known
 * @param {string}   [props.confirmLabel]
 */
export default function EvaluationQuestionnaire({ open, onClose, loadOffers, onConfirm, defaultIsAuto = null, confirmLabel = "Ajouter au panier" }) {
  const initialAnswers = useMemo(() => (
    defaultIsAuto === null ? {} : { gearbox: Number(defaultIsAuto) === 1 ? "automatique" : "manuelle" }
  ), [defaultIsAuto]);
  const [answers, setAnswers] = useState(initialAnswers);
  const [step, setStep] = useState(0);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);
  const finished = step >= QUESTIONS.length;
  const service = serviceFromAnswers(answers);
  const isAuto = answers.gearbox === "automatique" ? 1 : 0;

  // Reset every time the dialog is opened so a previous result never leaks.
  const [openedAt, setOpenedAt] = useState(open);
  if (open !== openedAt) {
    setOpenedAt(open);
    if (open) { setAnswers(initialAnswers); setStep(0); setOffers([]); setError(""); }
  }

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => { if (event.key === "Escape" && !saving) onClose(); };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [open, onClose, saving]);

  useEffect(() => {
    if (!open || !finished) return undefined;
    let active = true;
    Promise.resolve()
      .then(() => { if (active) { setLoading(true); setError(""); } })
      .then(() => loadOffers(service, isAuto))
      .then((rows) => { if (active) setOffers(Array.isArray(rows) ? rows : []); })
      .catch((requestError) => { if (active) { setOffers([]); setError(requestError?.response?.data?.message || "Impossible de charger les offres. Réessayez."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, finished, service, isAuto, loadOffers]);

  if (!open) return null;

  const question = QUESTIONS[step];
  const offer = offers[0] || null;
  const choose = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setStep((current) => current + 1);
  };
  const confirm = async () => {
    if (!offer || saving) return;
    setSaving(true); setError("");
    try {
      await onConfirm({ offer, service, answers: { ...answers } });
    } catch (confirmError) {
      setError(confirmError?.message || "Impossible d’ajouter ce service. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="eq-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section ref={dialogRef} tabIndex={-1} className="eq-dialog" role="dialog" aria-modal="true" aria-labelledby="eq-title">
        <header className="eq-header">
          <div>
            <span className="eq-kicker">Avant votre inscription</span>
            <h2 id="eq-title">{finished ? "Le service adapté à votre situation" : "Évaluation de conduite ou Bilan ?"}</h2>
          </div>
          <button type="button" className="eq-close" aria-label="Fermer le questionnaire" disabled={saving} onClick={onClose}>×</button>
        </header>

        <div className="eq-progress" aria-hidden="true"><span style={{ width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%` }} /></div>

        {!finished && <div className="eq-body">
          <p className="eq-step">Question {step + 1} sur {QUESTIONS.length}</p>
          <h3 className="eq-question">{question.title}</h3>
          <div className="eq-options" role="group" aria-label={question.title}>
            {question.options.map((option) => (
              <button key={option.value} type="button" className={"eq-option" + (answers[question.id] === option.value ? " eq-option--selected" : "")} onClick={() => choose(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
          {step > 0 && <button type="button" className="eq-link" onClick={() => setStep((current) => current - 1)}>← Question précédente</button>}
        </div>}

        {finished && <div className="eq-body">
          <div className={`eq-result eq-result--${service}`}>
            <span className="eq-result-badge">{EVALUATION_SERVICES[service].short}</span>
            <h3>{EVALUATION_SERVICES[service].label}</h3>
            <p>{EVALUATION_SERVICES[service].description}</p>
            <small>{answers.gearbox === "automatique" ? "Boîte automatique" : "Boîte manuelle"}</small>
          </div>

          {loading && <p className="eq-status" role="status">Recherche de l’offre disponible…</p>}
          {!loading && offer && <div className="eq-offer">
            <div><strong>{offer.name}</strong><span>{EVALUATION_SERVICES[service].label}</span></div>
            <b>{formatPrice(offer.price)}</b>
          </div>}
          {!loading && !offer && !error && <p className="eq-status eq-status--warning" role="status">
            Ce service n’est pas encore réservable en ligne pour cette boîte de vitesses. <a href="/contact-page">Contactez votre agence</a> pour le réserver.
          </p>}
          {error && <p className="eq-status eq-status--error" role="alert">{error}</p>}

          <div className="eq-actions">
            <button type="button" className="eq-secondary" disabled={saving} onClick={() => setStep(0)}>Modifier mes réponses</button>
            <button type="button" className="eq-primary" disabled={!offer || loading || saving} onClick={confirm}>{saving ? "Ajout…" : confirmLabel}</button>
          </div>
        </div>}
      </section>
    </div>,
    document.body,
  );
}
