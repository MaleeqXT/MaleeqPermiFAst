import assert from "node:assert/strict";
import test from "node:test";
import { localCalendarDate } from "../src/rdvpermis/localCalendarDate.js";

test("RdvPermis default dates use browser calendar fields rather than UTC", () => {
  const localDateAfterUtcMidnight = {
    getFullYear: () => 2026,
    getMonth: () => 9,
    getDate: () => 23,
  };

  assert.equal(localCalendarDate(localDateAfterUtcMidnight), "2026-10-23");
});
