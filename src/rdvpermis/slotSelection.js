function validId(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asList(value, keys = []) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key];
  }

  return [];
}

// Planning responses wrap the actual provider slot in `creneauDuPlanning`.
// Normalized records copy that UUID to `id`, so all UI state uses one value.
export function getSlotId(slot) {
  return validId(slot?.creneauDuPlanning?.id) ?? validId(slot?.id);
}

export function normalizePlanningSlot(slot) {
  const providerSlotId = validId(slot?.creneauDuPlanning?.id);
  if (!providerSlotId) return null;

  return {
    ...slot,
    id: providerSlotId,
  };
}

export function normalizePlanningSlots(planning) {
  return asList(planning, ["creneaux", "slots", "items", "content", "data"])
    .map(normalizePlanningSlot)
    .filter(Boolean);
}

export function isSelectedSlot(selectedSlot, slot) {
  const selectedSlotId = getSlotId(selectedSlot);
  const slotId = getSlotId(slot);
  return selectedSlotId !== null && slotId !== null && selectedSlotId === slotId;
}

export function eligibilityPayload(selectedSlot) {
  const creneauId = getSlotId(selectedSlot);
  return creneauId ? { filtre: { creneauId } } : null;
}

export function slotDateTime(slot) {
  const providerSlot = slot?.creneauDuPlanning ?? slot;
  return providerSlot?.dateHeureDebut ?? providerSlot?.dateHeure ?? providerSlot?.date ?? "";
}
