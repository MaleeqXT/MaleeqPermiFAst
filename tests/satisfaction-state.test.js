import assert from "node:assert/strict";
import test from "node:test";
import {
  removeSubmittedSurvey,
  satisfactionStageLabel,
  selectPendingSurvey,
  uniquePendingSurveys,
} from "../src/satisfaction/satisfactionState.js";

const surveys = [
  { id: "before", stage: "before_training" },
  { id: "during", stage: "during_training" },
  { id: "after", stage: "after_training" },
];

test("returns French labels for each satisfaction stage", () => {
  assert.equal(satisfactionStageLabel("before_training"), "Avant la formation");
  assert.equal(satisfactionStageLabel("during_training"), "Pendant la formation");
  assert.equal(satisfactionStageLabel("after_training"), "Après la formation");
  assert.equal(satisfactionStageLabel("unknown"), "Enquête de satisfaction");
});

test("keeps all unique pending surveys for dashboard cards", () => {
  const pending = uniquePendingSurveys([...surveys, surveys[1], null, {}]);
  assert.deepEqual(pending.map((survey) => survey.id), ["before", "during", "after"]);
});

test("uses the requested pending survey or a safe first-survey fallback", () => {
  assert.equal(selectPendingSurvey(surveys, "during")?.id, "during");
  assert.equal(selectPendingSurvey(surveys, "missing")?.id, "before");
  assert.equal(selectPendingSurvey([], "during"), null);
});

test("removes only the submitted survey so other eligible stages remain", () => {
  assert.deepEqual(
    removeSubmittedSurvey(surveys, "during").map((survey) => survey.id),
    ["before", "after"],
  );
});

test("keeps separate pending responses for repeat purchases of one offer", () => {
  const repeatPurchases = [
    { id: "during", response_id: "enrolment-a", stage: "during_training" },
    { id: "during", response_id: "enrolment-b", stage: "during_training" },
  ];

  assert.deepEqual(uniquePendingSurveys(repeatPurchases).map((survey) => survey.response_id), ["enrolment-a", "enrolment-b"]);
  assert.equal(selectPendingSurvey(repeatPurchases, "enrolment-b")?.response_id, "enrolment-b");
  assert.deepEqual(removeSubmittedSurvey(repeatPurchases, "enrolment-a").map((survey) => survey.response_id), ["enrolment-b"]);
});
