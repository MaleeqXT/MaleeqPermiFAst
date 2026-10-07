import { useState } from "react";
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

export default function BilansPage({
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
