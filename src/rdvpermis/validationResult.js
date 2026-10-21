// Laravel forwards the provider body unchanged. Its `data` array is the list
// of per-slot results, NOT an application envelope to unwrap and throw away.
export function validationResult(response) {
  const data = response?.data ?? null;
  const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  const confirmedCount = items.filter((item) => item?.estReserve === true).length;
  const failedCount = items.filter((item) => item?.estReserve === false).length;
  const partial = response?.status === 207 || data?.contientAuMoinsUneErreur === true;

  return {
    data,
    items,
    partial,
    confirmedCount,
    failedCount,
    unknownCount: items.length - confirmedCount - failedCount,
    // A 2xx transport response (including an empty/unknown body) is not enough
    // to claim that every selected booking was created.
    confirmed: !partial && items.length > 0 && confirmedCount === items.length,
  };
}

export function validationMessage(result) {
  if (result.confirmed) return "RdvPermis a confirmé toutes les réservations affichées ci-dessous.";
  if (result.partial || result.failedCount > 0) {
    return `Résultat partiel ou refusé : ${result.confirmedCount} réservation(s) confirmée(s), ${result.failedCount} refusée(s), ${result.unknownCount} à vérifier. Consultez chaque résultat avant toute nouvelle action.`;
  }
  return "Réponse reçue, mais aucune réservation n’est confirmée. Vérifiez les examens auprès de RdvPermis avant de recommencer.";
}

export function isPanierExpired(panier, now) {
  const expiresAt = panier?.dateHeureExpiration ?? panier?.expiresAt ?? panier?.expiration;
  const timestamp = Date.parse(expiresAt ?? "");
  return Number.isFinite(timestamp) && timestamp <= now;
}

// Called only by a confirmed user action, never during React rendering.
export function assertPanierWritable(panier, previousResult, now = Date.now()) {
  if (isPanierExpired(panier, now)) throw new Error("Ce panier a expiré. Actualisez ses informations avant toute action.");
  if (previousResult) throw new Error("Vérifiez le résultat de la validation précédente avant toute nouvelle réservation.");
}
