import { useState } from "react";
import "./MonitorCompetence.css";

const IconInfo = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#475569"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mc-info-icon"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const TABS = [
  { id: "pourquoi", label: "Pourquoi" },
  { id: "comment", label: "Comment" },
  { id: "risques", label: "Risques" },
  { id: "influences", label: "Influences" },
];

export default function QuestionDetail({
  observations = "",
  lessonCount = 0,
  studentEvaluation = "",
  studentResponse = "",
  activeTab: initialActiveTab = "pourquoi",
  role = "monitor",
  onSave,
}) {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [obsText, setObsText] = useState(observations);
  const [respText, setRespText] = useState(studentResponse);
  const [evalChecked, setEvalChecked] = useState(Boolean(studentEvaluation));
  const canEditObservations = role === "monitor";
  const canEditStudentResponse = role === "student";

  const handleModifyClick = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave({
        activeTab,
        observations: obsText,
        studentResponse: respText,
        studentEvaluation: evalChecked,
      });
    }
  };

  return (
    <div className="mc-question-detail-container" onClick={(e) => e.stopPropagation()}>
      {/* Observations Section */}
      <div className="mc-detail-block">
        <label className="mc-detail-label">Observations</label>
        <textarea
          className={`mc-detail-textarea ${canEditObservations ? "" : "mc-detail-textarea--readonly"}`.trim()}
          placeholder="Commentaires de l'enseignant"
          value={obsText}
          onChange={(e) => canEditObservations && setObsText(e.target.value)}
          readOnly={!canEditObservations}
          aria-readonly={!canEditObservations}
          rows={4}
        />
      </div>

      {/* Associated Lessons */}
      <div className="mc-detail-lessons">
        <span>Leçons associées ({lessonCount})</span>
      </div>

      {/* Student Point of View */}
      <div className="mc-detail-block mc-student-pov-block">
        <div className="mc-student-pov-title-row">
          <span className="mc-student-pov-title">Point de vue de l'élève</span>
          <IconInfo />
        </div>

        {/* Student Evaluation Checkbox */}
        <div className="mc-student-eval-row">
          <span className="mc-student-eval-label">Evaluation par l'élève :</span>
          <button
            type="button"
            className={`mc-eval-checkbox ${evalChecked ? "mc-eval-checkbox--checked" : ""} ${canEditStudentResponse ? "" : "mc-eval-checkbox--readonly"}`.trim()}
            onClick={() => canEditStudentResponse && setEvalChecked(!evalChecked)}
            disabled={!canEditStudentResponse}
            aria-label="Evaluation par l'élève"
          >
            {evalChecked && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="mc-pov-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`mc-pov-tab ${activeTab === tab.id ? "mc-pov-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="mc-detail-label">Réponse de l'élève / Student Comment</label>
        <textarea
          className={`mc-detail-textarea mc-response-textarea ${canEditStudentResponse ? "" : "mc-detail-textarea--readonly"}`.trim()}
          placeholder="Réponse de l'élève"
          value={respText}
          onChange={(e) => canEditStudentResponse && setRespText(e.target.value)}
          readOnly={!canEditStudentResponse}
          aria-readonly={!canEditStudentResponse}
          rows={3}
        />
      </div>

      {/* Modifier Button */}
      <div className="mc-detail-actions">
        <button
          type="button"
          className="mc-modify-btn"
          onClick={handleModifyClick}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
