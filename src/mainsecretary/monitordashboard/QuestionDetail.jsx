import React, { useState } from "react";
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
  letter,
  title,
  status = "acquired",
  observations = "",
  lessonCount = 0,
  studentEvaluation = "",
  studentResponse = "",
  onSave,
}) {
  const [activeTab, setActiveTab] = useState("pourquoi");
  const [obsText, setObsText] = useState(observations);
  const [respText, setRespText] = useState(studentResponse);
  const [evalChecked, setEvalChecked] = useState(false);

  const handleModifyClick = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave({
        activeTab,
        observations: obsText,
        studentResponse: respText,
        evalChecked,
      });
    }
  };

  return (
    <div className="mc-question-detail-container" onClick={(e) => e.stopPropagation()}>
      {/* Observations Section */}
      <div className="mc-detail-block">
        <label className="mc-detail-label">Observations</label>
        <textarea
          className="mc-detail-textarea"
          placeholder="Commentaires de l'enseignant"
          value={obsText}
          onChange={(e) => setObsText(e.target.value)}
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
            className={`mc-eval-checkbox ${evalChecked ? "mc-eval-checkbox--checked" : ""}`}
            onClick={() => setEvalChecked(!evalChecked)}
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

        {/* Student Response Textarea */}
        <textarea
          className="mc-detail-textarea mc-response-textarea"
          placeholder="Réponse de l'élève"
          value={respText}
          onChange={(e) => setRespText(e.target.value)}
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
          Modifier
        </button>
      </div>
    </div>
  );
}
