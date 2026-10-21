import assert from "node:assert/strict";
import test from "node:test";
import {
  eligibilityPayload,
  getSlotId,
  isSelectedSlot,
  normalizePlanningSlots,
} from "../src/rdvpermis/slotSelection.js";

test("planning slot selection keeps one provider UUID and sends it to eligibility", () => {
  const slots = normalizePlanningSlots([
    {
      creneauDuPlanning: {
        id: "7aad1453-6560-4d50-8fae-90b5ba73fa37",
        dateHeureDebut: "2026-09-29T08:00:00",
      },
    },
    {
      creneauDuPlanning: {
        id: "9a5b98cc-4354-4cc2-9fa2-3131bfd3533f",
        dateHeureDebut: "2026-09-29T08:30:00",
      },
    },
  ]);

  let selectedSlot = slots[0];
  assert.equal(getSlotId(selectedSlot), "7aad1453-6560-4d50-8fae-90b5ba73fa37");
  assert.equal(isSelectedSlot(selectedSlot, slots[0]), true);
  assert.equal(isSelectedSlot(selectedSlot, slots[1]), false);

  selectedSlot = slots[1];
  assert.equal(isSelectedSlot(selectedSlot, slots[0]), false);
  assert.equal(isSelectedSlot(selectedSlot, slots[1]), true);
  assert.deepEqual(eligibilityPayload(selectedSlot), {
    filtre: { creneauId: "9a5b98cc-4354-4cc2-9fa2-3131bfd3533f" },
  });
});
