import assert from "node:assert/strict";
import test from "node:test";
import { assertPanierWritable, isPanierExpired, validationMessage, validationResult } from "../src/rdvpermis/validationResult.js";

test("validation preserves the provider envelope and positively confirmed slot results", () => {
  const data = { panierId: "basket-1", contientAuMoinsUneErreur: false, data: [{ creneauId: "slot-1", examenId: "exam-1", estReserve: true }] };
  const result = validationResult({ status: 200, data });
  assert.equal(result.data, data);
  assert.equal(result.confirmed, true);
  assert.equal(result.confirmedCount, 1);
  assert.match(validationMessage(result), /confirmé toutes/);
});

test("207 preserves mixed success, failure, nested diagnostics and top-level metadata", () => {
  const data = { panierId: "basket-1", contientAuMoinsUneErreur: true, data: [
    { creneauId: "slot-1", examenId: "exam-1", estReserve: true },
    { creneauId: "slot-2", estReserve: false, codeMessage: "CANDIDAT_SOUS_PENALITE", details: { raisons: ["délai non respecté"] } },
  ] };
  const result = validationResult({ status: 207, data });
  assert.equal(result.data, data);
  assert.equal(result.partial, true);
  assert.equal(result.confirmed, false);
  assert.equal(result.confirmedCount, 1);
  assert.equal(result.failedCount, 1);
  assert.deepEqual(result.items[1].details, data.data[1].details);
  assert.match(validationMessage(result), /1 réservation\(s\) confirmée\(s\), 1 refusée/);
});

for (const response of [
  { status: 200, data: null },
  { status: 204 },
  { status: 200, data: {} },
  { status: 200, data: { data: [] } },
  { status: 200, data: { data: [{ creneauId: "slot-1", examenId: "exam-1" }] } },
  { status: 200, data: { data: [{ creneauId: "slot-1", estReserve: "true" }] } },
  { status: 200, data: { contientAuMoinsUneErreur: true, data: [{ estReserve: true }] } },
  { status: 207, data: { data: [{ estReserve: true }] } },
]) {
  test(`does not infer full booking success from ${JSON.stringify(response)}`, () => {
    assert.equal(validationResult(response).confirmed, false);
  });
}

test("an explicit refusal on HTTP 200 is not called a successful booking", () => {
  const result = validationResult({ status: 200, data: { data: [{ estReserve: false }] } });
  assert.equal(result.confirmed, false);
  assert.equal(result.failedCount, 1);
  assert.match(validationMessage(result), /0 réservation\(s\) confirmée/);
});

test("provider expiry uses only a supplied timestamp; unknown lifetime is provider-authoritative", () => {
  const now = Date.parse("2026-10-20T12:00:00Z");
  assert.equal(isPanierExpired({ dateHeureExpiration: "2026-10-20T11:59:59Z" }, now), true);
  assert.equal(isPanierExpired({ dateHeureExpiration: "2026-10-20T12:00:00Z" }, now), true);
  assert.equal(isPanierExpired({ dateHeureExpiration: "2026-10-20T12:01:00Z" }, now), false);
  assert.equal(isPanierExpired({}, now), false);
});

test("confirmed actions recheck actual expiry and refuse to repeat an already processed validation", () => {
  const now = Date.parse("2026-10-20T12:00:00Z");
  assert.throws(() => assertPanierWritable({ dateHeureExpiration: "2026-10-20T11:59:00Z" }, null, now), /expiré/);
  assert.throws(() => assertPanierWritable({}, { partial: true }, now), /validation précédente/);
  assert.doesNotThrow(() => assertPanierWritable({}, null, now));
});
