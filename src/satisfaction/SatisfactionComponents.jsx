import { useState } from "react";

export function StarRating({ value = 0, onChange, label }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return <div className="sat-stars" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
    {[1,2,3,4,5].map((n) => <button key={n} type="button" className={`sat-star ${n <= active ? "is-active" : ""}`} role="radio" aria-checked={value === n} aria-label={`${n} sur 5`} onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => onChange(value === n ? 0 : n)} onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(Math.min(5, (value || 0) + 1)); } if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(Math.max(0, (value || 0) - 1)); } }}>{n <= active ? "★" : "☆"}</button>)}
  </div>;
}

export function ChoiceQuestion({ question, value, error, onChange }) {
  return <fieldset className="sat-question sat-choice"><legend className="sat-question-label">{question.label} <span className="sat-required">*</span></legend>{question.options.map(option => <label key={option} className="sat-choice-option"><input type="radio" name={question.id} checked={value === option} onChange={() => onChange(option)} /> <span>{option}</span></label>)}{error && <div className="sat-error">{error}</div>}</fieldset>;
}

export function CommentQuestion({ question, value, onChange }) {
  return <div className="sat-question"><label className="sat-question-label" htmlFor={question.id}>{question.label}</label><textarea id={question.id} className="sat-textarea" value={value || ""} onChange={e => onChange(e.target.value)} rows={4} placeholder="Votre commentaire (facultatif)" /></div>;
}

export function SurveyQuestion({ question, value, error, onChange }) {
  if (question.type === "star") return <div className="sat-question"><div className="sat-question-label">{question.label} <span className="sat-required">*</span></div>{question.hint && <div className="sat-hint">{question.hint}</div>}<StarRating value={value || 0} onChange={onChange} label={question.label} />{error && <div className="sat-error">{error}</div>}</div>;
  if (question.type === "choice") return <ChoiceQuestion question={question} value={value} error={error} onChange={onChange} />;
  return <CommentQuestion question={question} value={value} onChange={onChange} />;
}

export function SurveySection({ section, values, errors, onChange }) {
  return <section className="sat-section"><h2>{section.title}</h2>{section.questions.map(q => <SurveyQuestion key={q.id} question={q} value={values[q.id]} error={errors[q.id]} onChange={v => onChange(q.id, v)} />)}</section>;
}

export function Survey({ survey, values, errors, onChange, onSubmit, submitted, submitting, serverMessage }) {
  return <form className="sat-form" onSubmit={onSubmit} noValidate><h1>{survey.title}</h1>{survey.sections.map(section => <SurveySection key={section.title} section={section} values={values} errors={errors} onChange={onChange} />)}<button className="sat-submit" type="submit" disabled={submitting}>{submitting ? "Envoi de votre avis..." : "Envoyer mon avis"}</button>{submitted && <div className="sat-success" role="status">Merci pour votre participation ! Votre avis a bien été enregistré.</div>}{serverMessage && <div className="sat-error" role="alert">{serverMessage}</div>}</form>;
}
