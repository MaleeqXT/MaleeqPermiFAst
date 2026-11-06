import test from "node:test";
import assert from "node:assert/strict";
import { canCreateLesson, pageItems, retryableStatuses, statusLabel } from "../src/livret/livretPresentation.js";

test("Livret status presentation covers dashboard and failed-sync badges", () => {
  assert.equal(statusLabel("synced"), "Synchronisé");
  assert.equal(statusLabel("needs_resync"), "À corriger");
  assert.equal(retryableStatuses.has("needs_resync"), true);
  assert.equal(retryableStatuses.has("synced"), false);
});

test("Livret pages handle Laravel paginator and empty state payloads", () => {
  assert.deepEqual(pageItems({ data: { data: [{ id: "contract-1" }] } }), [{ id: "contract-1" }]);
  assert.deepEqual(pageItems({ data: [] }), []);
});

test("Livret lesson form blocks unsynced contracts and missing provider mappings", () => {
  assert.equal(canCreateLesson({ sync_status: "pending" }, { lessonType: "circulation", trainerId: "a", providerTrainerId: "b", trainerAuthorization: "c" }), false);
  assert.equal(canCreateLesson({ sync_status: "synced" }, { lessonType: "simulator", simulatorId: "a" }), false);
  assert.equal(canCreateLesson({ sync_status: "synced" }, { lessonType: "theoretical", trainerId: "a", providerTrainerId: "b", trainerAuthorization: "c" }), true);
});
