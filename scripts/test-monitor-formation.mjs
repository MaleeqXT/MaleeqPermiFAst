import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { transformSync } from "rolldown/utils";

// Exercise the real page's hooks and event handlers with deferred API responses.
// This is a state/request regression test, not a browser layout test.
const source = (await fs.readFile(new URL("../src/monitordashboard/formation/FormationPage.jsx", import.meta.url), "utf8"))
  .replace(/^import .*;\r?\n/gm, "")
  .replace("export default function FormationPage", "function FormationPage");
const compiled = transformSync("FormationPage.jsx", source + "\nglobalThis.FormationPage = FormationPage;", { jsx: { runtime: "classic" } });
assert.equal(compiled.errors.length, 0);
const slots = [], pendingEffects = [], requests = [];
let index = 0, needsRender = true, tree, confirmAnswer = true;
const useState = (initial) => {
  const position = index++;
  if (!slots[position]) {
    slots[position] = { value: typeof initial === "function" ? initial() : initial };
    slots[position].set = (next) => {
      const value = typeof next === "function" ? next(slots[position].value) : next;
      if (!Object.is(value, slots[position].value)) { slots[position].value = value; needsRender = true; }
    };
  }
  return [slots[position].value, slots[position].set];
};
const useRef = (value) => { const position = index++; slots[position] ||= { current: value }; return slots[position]; };
const changed = (previous, next) => !previous || !next || previous.length !== next.length || next.some((value, position) => !Object.is(value, previous[position]));
const useEffect = (callback, dependencies) => {
  const position = index++;
  if (changed(slots[position]?.dependencies, dependencies)) {
    const previous = slots[position];
    slots[position] = { dependencies };
    pendingEffects.push(() => { previous?.cleanup?.(); slots[position].cleanup = callback(); });
  }
};
const useCallback = (callback, dependencies) => {
  const position = index++;
  if (changed(slots[position]?.dependencies, dependencies)) slots[position] = { dependencies, callback };
  return slots[position].callback;
};
const request = (method) => (...args) => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  requests.push({ method, url: args[0], body: args[1], resolve, reject });
  return promise;
};
const symbols = ["ArrowLeft", "ChevronRight", "ChevronDown", "MoreVertical", "CalendarDays", "Plus", "Save", "Trash2", "PenLine", "Clock", "Car", "Landmark", "BookOpen", "SearchPicker", "LessonHistory", "LessonStatus", "Toggle", "EditSection", "Dialog", "SignaturePad", "FormationCompetencies", "SavedManeuvers"];
const context = vm.createContext({
  ...Object.fromEntries(symbols.map((name) => [name, name])),
  React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
  useState, useEffect, useRef, useCallback, AbortController, Date,
  http: Object.fromEntries(["get", "put", "post", "delete"].map((method) => [method, request(method)])),
  profileImageUrl: () => "", displayDate: (date) => date, formatDuration: (minutes) => `${minutes} minutes`, FORMATION_DURATIONS: [{ minutes: 60, label: "1 heure" }],
  window: { addEventListener() {}, removeEventListener() {}, confirm: () => confirmAnswer },
});
vm.runInContext(compiled.code, context);
const props = { monitorId: null, onBack() {}, onDirtyChange() {}, onBusyChange() {}, onLessonChanged() {} };
const flush = async () => {
  for (let cycles = 0; cycles < 20; cycles++) {
    if (needsRender) { needsRender = false; index = 0; tree = context.FormationPage(props); }
    pendingEffects.splice(0).forEach((effect) => effect());
    await new Promise((resolve) => setImmediate(resolve));
    if (!needsRender && !pendingEffects.length) return;
  }
  throw new Error("Page did not settle.");
};
const find = (predicate, node = tree) => {
  if (node == null || typeof node !== "object") return null;
  if (Array.isArray(node)) { for (const child of node) { const result = find(predicate, child); if (result) return result; } return null; }
  if (predicate(node)) return node;
  return find(predicate, node.props?.children);
};
const last = (url) => [...requests].reverse().find((entry) => entry.url === url);
const payload = (id) => ({ data: { data: {
  lessons: [{ id: "lesson-" + id, date: "2026-10-07", duration_minutes: 60, hour: 1, start_at: "09:00", monitor_id: "monitor",
    department: "", type: "Prestation", offer_id: "offer", lieu_id: "place", maneuvers: [],
    public_observation: "Public-" + id, teacher_observation: "Teacher-" + id, status: "past", signature: null,
    can_delete: false, can_reschedule: false, is_absent: false, competencies: [], boite_auto: false,
    evaluation_initiale: false, evaluation_permis: false, number: 1 }],
  options: { durations: [{ minutes: 60, label: "1 heure" }], instructors: [{ id: "monitor", name: "Actual monitor", department: "060" }],
    offers: [{ id: "offer", name: "Purchased offer" }], places: [{ id: "place", name: "Actual place" }], types: ["Prestation"], departments: [], can_sign: true },
} } });
await flush();
last("/monitor/students").resolve({ data: { data: [
  { name: "First Student", student: { id: "first", boite_type: 0 } },
  { name: "Second Student", student: { id: "second", boite_type: 1 } },
] } });
await flush();
const staleFirst = last("/monitor/formation/first");
find((node) => node.props.id === "formation-student").props.onChange("second");
await flush();
assert.equal(find((node) => node.type === "form"), null, "Switching students must clear the old editor immediately.");
last("/monitor/formation/second").resolve(payload("second"));
await flush();
staleFirst.resolve(payload("first"));
await flush();
assert.equal(find((node) => node.type === "textarea").props.value, "Public-second", "An old response must not replace the current student's lesson.");
find((node) => node.type === "textarea").props.onChange({ target: { value: "Unsaved second note" } });
await flush();
confirmAnswer = false;
const before = requests.length;
find((node) => node.props.id === "formation-student").props.onChange("first");
await flush();
assert.equal(requests.length, before, "Refusing to discard must not fetch another student.");
assert.equal(find((node) => node.type === "textarea").props.value, "Unsaved second note");
const savePromise = find((node) => node.type === "form").props.onSubmit({ preventDefault() {} });
await flush();
const saving = last("/monitor/formation/second/lesson-second");
assert.equal(saving.method, "put");
assert.equal(saving.body.teacher_observation, "Teacher-second");
assert.equal(saving.body.public_observation, "Unsaved second note");
saving.reject({ response: { data: { message: "Test API rejection" } } });
await savePromise;
await flush();
assert.equal(find((node) => node.type === "textarea").props.value, "Unsaved second note", "Failed save must retain the user's changes.");
assert.ok(find((node) => node.props.role === "alert"));
assert.equal(find((node) => node.props.className === "mf-success"), null, "Failed save must not show success.");
confirmAnswer = true;
find((node) => node.props.id === "formation-student").props.onChange("first");
await flush();
assert.equal(find((node) => node.type === "form"), null);
last("/monitor/formation/first").resolve(payload("first"));
await flush();
assert.equal(find((node) => node.type === "textarea").props.value, "Public-first");
console.log("Formation page regression checks passed: stale responses, student isolation, pending edits, real save payload, failed-save retention.");
