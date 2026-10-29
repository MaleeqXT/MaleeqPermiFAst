export const SATISFACTION_STAGE_LABELS = Object.freeze({
  before_training: "Avant la formation",
  during_training: "Pendant la formation",
  after_training: "Après la formation",
});

export function satisfactionStageLabel(stage) {
  return SATISFACTION_STAGE_LABELS[stage] || "Enquête de satisfaction";
}

/**
 * The API is authoritative, but this prevents a stale repeated item from
 * creating two identical cards while a dashboard request is being refreshed.
 */
export function uniquePendingSurveys(items) {
  const seen = new Set();

  return (Array.isArray(items) ? items : []).filter((survey) => {
    // A survey template can be pending for more than one paid enrolment.
    // The response ID is the durable lifecycle key; the survey ID is only the
    // questionnaire definition used by the submit endpoint.
    const key = survey?.response_id || survey?.id || survey?.stage;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function selectPendingSurvey(items, requestedSurveyId) {
  const surveys = uniquePendingSurveys(items);
  return surveys.find((survey) => survey.response_id === requestedSurveyId || survey.id === requestedSurveyId) || surveys[0] || null;
}

export function removeSubmittedSurvey(items, submittedSurveyId) {
  return uniquePendingSurveys(items).filter((survey) => survey.response_id !== submittedSurveyId && survey.id !== submittedSurveyId);
}
