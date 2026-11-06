export const retryableStatuses = new Set(["pending", "failed", "needs_resync"]);

export function statusLabel(status) {
  return {
    pending: "En attente",
    sending: "Synchronisation…",
    synced: "Synchronisé",
    failed: "Échec",
    needs_resync: "À corriger",
    deleted: "Archivé",
  }[status] || "Inconnu";
}

export function pageItems(payload) {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data?.data ?? [];
}

export function canCreateLesson(contract, lesson) {
  if (contract?.sync_status !== "synced") return false;
  if (lesson.lessonType === "simulator") return Boolean(lesson.simulatorId && lesson.providerSimulatorId);
  return Boolean(lesson.trainerId && lesson.providerTrainerId && lesson.trainerAuthorization);
}
