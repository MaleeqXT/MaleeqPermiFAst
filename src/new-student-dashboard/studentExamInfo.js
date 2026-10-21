function formatDate(value) {
  if (!value) return "Non programmée";

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function presentationLabel(value) {
  const attempt = Math.max(1, Number(value) || 1);
  return attempt === 1 ? "1ère présentation" : `${attempt}ème présentation`;
}

export function examStatusLabel(nextExam, latestExam) {
  if (nextExam?.date) return "Réservé";
  if (["success", "failed", "completed"].includes(latestExam?.status)) return "Terminé";
  return "En attente";
}

export function examResultLabel(nextExam, latestExam) {
  if (nextExam?.date) return "En attente";
  if (latestExam?.result === "admitted" || latestExam?.status === "success") return "Réussi";
  if (latestExam?.result === "refused" || latestExam?.status === "failed") return "Échoué";
  return "En attente";
}

export function buildStudentExamSummary(examInfo) {
  const nextExam = examInfo?.next_exam ?? null;
  const latestExam = examInfo?.latest_exam ?? null;
  const completedExamAttempts = Math.max(0, Number(examInfo?.completed_exams) || 0);
  const presentationAttempts = Math.max(completedExamAttempts, Number(examInfo?.attempts) || 0);
  const hasExamRecord = Boolean(examInfo?.has_exam_record);
  const currentPresentation = nextExam?.date
    ? presentationLabel(presentationAttempts + 1)
    : presentationAttempts > 0
      ? `${presentationLabel(presentationAttempts)} effectuée`
      : "Aucune présentation planifiée";

  return {
    hasExamRecord,
    items: [
      { label: "Passage permis", value: currentPresentation },
      { label: "Statut examen", value: examStatusLabel(nextExam, latestExam) },
      { label: "Date d'examen", value: nextExam?.date ? `${formatDate(nextExam.date)}${nextExam.time ? ` à ${String(nextExam.time).replace(":", "h")}` : ""}` : "Non programmée" },
      { label: "Résultat", value: examResultLabel(nextExam, latestExam) },
      { label: "Nombre de passages", value: `${completedExamAttempts} passage${completedExamAttempts !== 1 ? "s" : ""}` },
    ],
  };
}
