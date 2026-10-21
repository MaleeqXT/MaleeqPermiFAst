import assert from "node:assert/strict";
import test from "node:test";
import { buildStudentExamSummary } from "../src/new-student-dashboard/studentExamInfo.js";

function values(summary) {
  return Object.fromEntries(summary.items.map((item) => [item.label, item.value]));
}

test("shows an empty examination state when the student has no history", () => {
  const summary = buildStudentExamSummary({ has_exam_record: false, attempts: 0, completed_exams: 0 });

  assert.equal(summary.hasExamRecord, false);
  assert.deepEqual(values(summary), {
    "Passage permis": "Aucune présentation planifiée",
    "Statut examen": "En attente",
    "Date d'examen": "Non programmée",
    "Résultat": "En attente",
    "Nombre de passages": "0 passages",
  });
});

test("shows a first reserved presentation", () => {
  const summary = buildStudentExamSummary({
    has_exam_record: true,
    attempts: 0,
    completed_exams: 0,
    next_exam: { date: "2026-11-12", time: "09:30", status: "pending" },
  });

  assert.deepEqual(values(summary), {
    "Passage permis": "1ère présentation",
    "Statut examen": "Réservé",
    "Date d'examen": "12 novembre 2026 à 09h30",
    "Résultat": "En attente",
    "Nombre de passages": "0 passages",
  });
});

test("shows the next presentation after completed attempts", () => {
  const summary = buildStudentExamSummary({
    has_exam_record: true,
    attempts: 1,
    completed_exams: 1,
    next_exam: { date: "2026-11-12", status: "pending" },
  });

  assert.equal(values(summary)["Passage permis"], "2ème présentation");
  assert.equal(values(summary)["Nombre de passages"], "1 passage");
});

test("shows completed passed and failed results", () => {
  const passed = values(buildStudentExamSummary({
    has_exam_record: true,
    attempts: 1,
    completed_exams: 1,
    latest_exam: { status: "success", result: "admitted" },
  }));
  const failed = values(buildStudentExamSummary({
    has_exam_record: true,
    attempts: 2,
    completed_exams: 2,
    latest_exam: { status: "failed", result: "refused" },
  }));

  assert.equal(passed["Statut examen"], "Terminé");
  assert.equal(passed.Résultat, "Réussi");
  assert.equal(failed["Passage permis"], "2ème présentation effectuée");
  assert.equal(failed.Résultat, "Échoué");
  assert.equal(failed["Nombre de passages"], "2 passages");
});
