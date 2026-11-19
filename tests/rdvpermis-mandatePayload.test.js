import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isLocalDebugHost,
  MANDATE_PAYLOAD_KEYS,
  mandatePayload,
  mandatePayloadErrors,
  sameMandatePayload,
} from "../src/rdvpermis/mandatePayload.js";

// Local student "LUCIE SIMON" as returned by /admin/users/students, flattened
// by the page into a profile. It deliberately carries local-only fields.
const lucie = Object.freeze({
  id: "8f5f3b7e-0000-4000-8000-000000000001",
  firstName: "LUCIE",
  lastName: "SIMON",
  neph: "8710857 7602",
  email: "simon.lucie.83@exemple.fr",
  boite_type: 1,
  name: "LUCIE SIMON",
});

test("LUCIE SIMON maps to the exact CreerMandatApi body", () => {
  assert.deepEqual(mandatePayload(lucie), {
    nom: "SIMON",
    numeroDossier: "8710857 7602",
    email: "simon.lucie.83@exemple.fr",
    groupePermis: "B",
  });
});

test("the full name or first name never becomes the provider nom", () => {
  const payload = mandatePayload(lucie);
  assert.equal(payload.nom, "SIMON");
  assert.notEqual(payload.nom, "LUCIE SIMON");
  assert.ok(!payload.nom.includes("LUCIE"));
});

test("numeroDossier is the student NEPH, never the local student UUID", () => {
  const payload = mandatePayload(lucie);
  assert.equal(payload.numeroDossier, lucie.neph);
  assert.notEqual(payload.numeroDossier, lucie.id);
});

test("groupePermis is the permit group, not the transmission type", () => {
  assert.equal(mandatePayload(lucie).groupePermis, "B");
  assert.equal(mandatePayload(lucie, "A").groupePermis, "A");
  assert.notEqual(mandatePayload(lucie).groupePermis, lucie.boite_type);
});

test("only the four Swagger fields are sent — no local-only field leaks", () => {
  assert.deepEqual(Object.keys(mandatePayload(lucie)).sort(), [...MANDATE_PAYLOAD_KEYS].sort());
});

test("only whitespace is normalised; the NEPH format is otherwise preserved", () => {
  const payload = mandatePayload({ lastName: "  SIMON  ", neph: " 8710857   7602 ", email: " simon.lucie.83@exemple.fr " });
  assert.equal(payload.nom, "SIMON");
  assert.equal(payload.numeroDossier, "8710857 7602");
  assert.equal(payload.email, "simon.lucie.83@exemple.fr");
  assert.equal(mandatePayload({ neph: "01234567890909" }).numeroDossier, "01234567890909");
});

test("validation blocks the mandate until every required value is usable", () => {
  assert.deepEqual(mandatePayloadErrors(mandatePayload(lucie)), []);
  assert.deepEqual(mandatePayloadErrors(mandatePayload({ ...lucie, lastName: " " })), ["Le nom (RdvPermis) est requis."]);
  assert.deepEqual(mandatePayloadErrors(mandatePayload({ ...lucie, neph: "" })), ["Le NEPH / numéro de dossier est requis."]);
  assert.deepEqual(mandatePayloadErrors(mandatePayload({ ...lucie, email: "" })), ["L’adresse e-mail est requise."]);
  assert.deepEqual(mandatePayloadErrors(mandatePayload({ ...lucie, email: "not-an-email" })), ["L’adresse e-mail n’est pas valide."]);
  assert.deepEqual(mandatePayloadErrors(mandatePayload(lucie, "CE")), ["Le groupe permis doit être A ou B."]);
});

test("payload comparison requires identical keys and values", () => {
  const payload = mandatePayload(lucie);
  assert.equal(sameMandatePayload(payload, { ...payload }), true);
  assert.equal(sameMandatePayload(payload, { ...payload, nom: "LUCIE SIMON" }), false);
  assert.equal(sameMandatePayload(payload, { ...payload, extra: "x" }), false);
  assert.equal(sameMandatePayload(payload, null), false);
});

test("the payload debug panel is limited to local development hosts", () => {
  assert.equal(isLocalDebugHost(true, "localhost"), true);
  assert.equal(isLocalDebugHost(true, "127.0.0.1"), true);
  assert.equal(isLocalDebugHost(false, "localhost"), false);
  assert.equal(isLocalDebugHost(true, "app.passpermis.fr"), false);
});
