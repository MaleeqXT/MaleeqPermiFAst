// Mapping between a local student profile and the RdvPermis Swagger body
// CreerMandatApi (POST /api/v2/auto-ecole/mandats). Laravel builds the real
// provider request (StudentMandateService::payloadFor); this module mirrors it
// so the page can show and validate exactly what will be sent.
//
//   users.last_name -> nom            (surname only — never first or full name)
//   students.neph   -> numeroDossier  (kept as stored; only whitespace normalised)
//   users.email     -> email
//   permit group    -> groupePermis   (A | B; PassPermis handles category B)

export const MANDATE_PAYLOAD_KEYS = Object.freeze(["nom", "numeroDossier", "email", "groupePermis"]);
export const DEFAULT_MANDATE_GROUPE_PERMIS = "B";
const ALLOWED_GROUPES = new Set(["A", "B"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

/** Builds the provider body from a profile ({ lastName, neph, email }). */
export function mandatePayload(profile, groupePermis = DEFAULT_MANDATE_GROUPE_PERMIS) {
  return {
    nom: normalizeWhitespace(profile?.lastName),
    numeroDossier: normalizeWhitespace(profile?.neph),
    email: String(profile?.email ?? "").trim(),
    groupePermis,
  };
}

/** Returns French messages for every rule the payload breaks; empty when valid. */
export function mandatePayloadErrors(payload) {
  const errors = [];
  if (!payload?.nom) errors.push("Le nom (RdvPermis) est requis.");
  if (!payload?.numeroDossier) errors.push("Le NEPH / numéro de dossier est requis.");
  if (!payload?.email) errors.push("L’adresse e-mail est requise.");
  else if (!EMAIL_PATTERN.test(payload.email)) errors.push("L’adresse e-mail n’est pas valide.");
  if (!ALLOWED_GROUPES.has(payload?.groupePermis)) errors.push("Le groupe permis doit être A ou B.");
  return errors;
}

/** True when both payloads carry exactly the same keys and values. */
export function sameMandatePayload(left, right) {
  if (!left || !right) return false;
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
}

/** The payload debug panel is a local-development aid only, never production. */
export function isLocalDebugHost(isDev, hostname) {
  return Boolean(isDev) && ["localhost", "127.0.0.1", "[::1]", "::1"].includes(String(hostname ?? ""));
}
