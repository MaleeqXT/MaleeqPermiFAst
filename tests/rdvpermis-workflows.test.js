import assert from "node:assert/strict";
import process from "node:process";
import { after, afterEach, before, beforeEach, test } from "node:test";
import { chromium } from "playwright";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

const apiOrigin = "http://rdvpermis-mocked.invalid";
let server;
let browser;
let context;
let page;
let origin;
let calls;
let overrides;
let failures;

const centreId = "11111111-1111-4111-8111-111111111111";
const slotId = "22222222-2222-4222-8222-222222222222";
const basketId = "basket-1";
const candidate = { candidat: { id: "candidate-1", nom: "Candidate fixture" }, eligibilite: { estEligible: true } };
const exam = { id: "source-exam", nom: "Examen source", date: "2026-10-20" };
const target = { id: "target-exam", nom: "Examen cible", date: "2026-10-20" };
const response = (data, status = 200) => ({ status, data });
const writes = (suffix) => calls.filter((call) => call.method !== "GET" && call.path.endsWith(suffix));
const section = (name) => page.locator("section").filter({ has: page.getByRole("heading", { name, exact: true }) }).first();

function defaultResponse(call) {
  const { path, method } = call;
  if (path.endsWith("/status")) return response({ data: { status: "connected", connected: true, configured: true, environment: "mocked" } });
  if (path.endsWith("/admin/users/students")) return response({ data: { data: [{ id: 9, first_name: "Élève", last_name: "Fixture", email: "fixture@example.test", student: { id: "student-1", neph: "001234567890" } }], last_page: 1 } });
  if (path.endsWith("/centres/recherche")) return response([{ id: centreId, nom: "Centre fixture" }]);
  if (path.endsWith("/planning/recherche")) return response([{ creneauDuPlanning: { id: slotId, nom: "Créneau fixture", dateHeureDebut: "2026-10-20T10:00:00" } }]);
  if (path.endsWith("/candidats/recherche")) return response([candidate]);
  if (path.endsWith("/valider")) return response({ panierId: basketId, contientAuMoinsUneErreur: false, data: [{ creneauId: slotId, examenId: "created-exam", estReserve: true }] });
  if (path.endsWith("/examens/permutables")) return response([target]);
  if (path.endsWith("/examens/nombre-de-remplacement")) return response({ remplacementsRestants: 3 });
  if (path.endsWith("/examens") && method === "GET") return response([exam]);
  if (path.endsWith(`/examens/${exam.id}`) && method === "GET") return response({ ...exam, candidat: { id: "old-candidate" } });
  if (path.endsWith("/paniers") && method === "POST") return response({ id: basketId, elementsDuPanier: [] }, 201);
  if (path.endsWith("/paniers") && method === "GET") return response([]);
  if (path.endsWith(`/paniers/${basketId}`) && method === "GET") return response({ id: basketId, elementsDuPanier: [{ creneauId: slotId, candidatId: "candidate-1" }] });
  if (path.endsWith("/creneaux") && method === "POST") return response({ id: basketId, elementsDuPanier: [{ creneauId: slotId }] }, 201);
  if (method !== "GET") return response(null, 204);
  throw new Error(`Unmocked test read: ${method} ${path}`);
}

before(async () => {
  // No application .env/config/predev hook is loaded. This is a dedicated,
  // ephemeral loopback server, not an existing local/staging application.
  server = await createServer({
    configFile: false,
    envFile: false,
    mode: "test",
    plugins: [react()],
    optimizeDeps: { entries: ["tests/rdvpermis-browser.html"], include: ["react", "react-dom/client", "axios"] },
    define: { "import.meta.env.VITE_API_URL": JSON.stringify(apiOrigin) },
    server: { host: "127.0.0.1", port: 0, hmr: false },
  });
  await server.listen();
  origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ headless: true, channel: process.env.RDVPERMIS_TEST_BROWSER || "chrome" });
});

after(async () => {
  await browser?.close();
  await server?.close();
});

beforeEach(async () => {
  calls = [];
  overrides = new Map();
  failures = [];
  context = await browser.newContext({ serviceWorkers: "block" });
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin && !url.pathname.startsWith("/api/")) return route.continue();
    if (url.origin !== apiOrigin || !url.pathname.startsWith("/api/")) {
      failures.push(`Blocked unexpected network request: ${url.origin}${url.pathname}`);
      return route.abort();
    }
    const headers = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS" };
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    const call = { method: request.method(), path: url.pathname, query: Object.fromEntries(url.searchParams), body: request.postDataJSON() };
    calls.push(call);
    try {
      const mock = overrides.get(`${call.method} ${call.path}`);
      const result = mock ? await mock(call) : defaultResponse(call);
      return route.fulfill({ status: result.status, headers, contentType: "application/json", ...(result.status === 204 ? {} : { body: JSON.stringify(result.data) }) });
    } catch (error) {
      failures.push(error.message);
      return route.abort();
    }
  });
  page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto(`${origin}/tests/rdvpermis-browser.html`);
  await page.getByText("Connecté", { exact: true }).waitFor();
});

afterEach(async () => {
  await context?.close();
  assert.deepEqual(failures, [], "No page exception, unmocked request or external network access is allowed");
});

async function confirm() {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Confirmer", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
}

async function chooseSlot() {
  const centres = section("Centres d’examen");
  await centres.getByLabel("Département").fill("75");
  await centres.getByRole("button", { name: "Rechercher les centres", exact: true }).click();
  await centres.getByRole("button", { name: "Choisir", exact: true }).click();
  const planning = section("Planning et créneaux disponibles");
  await planning.getByRole("button", { name: "Rechercher les créneaux", exact: true }).click();
  await planning.getByRole("button", { name: "Choisir", exact: true }).click();
}

async function chooseCandidate() {
  const eligibility = section("Éligibilité des candidats");
  await eligibility.getByRole("button", { name: "Vérifier l’éligibilité", exact: true }).click();
  await eligibility.getByRole("button", { name: "Choisir", exact: true }).click();
}

async function assignedPanier() {
  await chooseSlot();
  await page.getByRole("button", { name: "Créer le panier", exact: true }).click();
  assert.equal(writes("/paniers").length, 0);
  await confirm();
  await page.getByRole("button", { name: "Ajouter le créneau", exact: true }).click();
  await confirm();
  await chooseCandidate();
  await page.getByRole("button", { name: "Affecter le candidat", exact: true }).click();
  assert.equal(writes("/candidat").length, 0);
  await confirm();
}

async function selectExam() {
  const exams = section("Examens programmés");
  await exams.getByRole("button", { name: "Lister les examens", exact: true }).click();
  await exams.getByRole("button", { name: "Voir le détail", exact: true }).click();
  await exams.getByRole("button", { name: "Voir les options", exact: true }).click();
  await exams.getByRole("button", { name: "Permuter", exact: true }).waitFor();
  return exams;
}

test("mandate needs explicit confirmation, can be cancelled, and uses the selected local student", async () => {
  await page.getByRole("button", { name: "Charger les élèves", exact: true }).click();
  await page.getByRole("combobox", { name: /^Élève local/ }).selectOption("student-1");
  await page.getByRole("button", { name: "Créer le mandat", exact: true }).click();
  assert.equal(writes("/mandate").length, 0);
  await page.getByRole("dialog").getByRole("button", { name: "Annuler", exact: true }).click();
  assert.equal(writes("/mandate").length, 0);
  await page.getByRole("button", { name: "Créer le mandat", exact: true }).click();
  await confirm();
  assert.equal(writes("/students/student-1/rdvpermis/mandate").length, 1);
  await page.getByText("Le mandat a été transmis à RdvPermis.", { exact: false }).waitFor();
});

test("local student selector loads every local pagination page, not just the first page", async () => {
  overrides.set("GET /api/admin/users/students", (call) => response({ data: { data: [{ id: call.query.page, first_name: "Page", last_name: call.query.page, student: { id: `student-page-${call.query.page}` } }], last_page: 2 } }));
  await page.getByRole("button", { name: "Charger les élèves", exact: true }).click();
  await page.getByRole("combobox", { name: /^Élève local/ }).selectOption("student-page-2");
  assert.deepEqual(calls.filter((call) => call.path.endsWith("/admin/users/students")).map((call) => call.query.page), ["1", "2"]);
});

test("panier transitions and candidate assignment use the selected provider slot/candidate", async () => {
  await assignedPanier();
  assert.deepEqual(writes("/creneaux")[0].body, { creneauId: slotId });
  assert.deepEqual(writes("/candidat")[0].body, { candidatId: "candidate-1" });
  assert.equal(await page.getByRole("button", { name: "Valider le panier", exact: true }).isEnabled(), true);
  assert.equal(writes("/valider").length, 0);
});

test("confirmed validation displays the actual created exam and resets for a new basket", async () => {
  await assignedPanier();
  await page.getByRole("button", { name: "Valider le panier", exact: true }).click();
  assert.equal(writes("/valider").length, 0);
  await confirm();
  const result = page.getByRole("region", { name: "Résultat de validation du panier" });
  await result.getByText("Réservation confirmée", { exact: true }).waitFor();
  assert.match(await result.innerText(), /created-exam/);
  assert.equal(writes("/valider").length, 1);
  assert.equal(await page.getByRole("button", { name: "Valider le panier", exact: true }).isDisabled(), true);
  await chooseSlot();
  assert.equal(await page.getByRole("button", { name: "Créer le panier", exact: true }).isEnabled(), true);
});

test("HTTP 207 shows each success/refusal and nested reason without claiming full success", async () => {
  overrides.set(`POST /api/rdvpermis/paniers/${basketId}/valider`, () => response({ panierId: basketId, contientAuMoinsUneErreur: true, data: [
    { creneauId: slotId, examenId: "created-exam", estReserve: true },
    { creneauId: "failed-slot", estReserve: false, codeMessage: "CANDIDAT_SOUS_PENALITE", details: { raisons: ["délai non respecté"] } },
  ] }, 207));
  await assignedPanier();
  await page.getByRole("button", { name: "Valider le panier", exact: true }).click();
  await confirm();
  const result = page.getByRole("region", { name: "Résultat de validation du panier" });
  await result.getByText("Réservation refusée", { exact: true }).waitFor();
  assert.match(await result.innerText(), /délai non respecté/);
  assert.match(await result.innerText(), /created-exam/);
  assert.doesNotMatch(await result.innerText(), /confirmé toutes/);
  assert.equal(await page.getByRole("button", { name: "Valider le panier", exact: true }).isDisabled(), true);
});

test("an empty HTTP 200 validation response never displays a confirmed booking", async () => {
  overrides.set(`POST /api/rdvpermis/paniers/${basketId}/valider`, () => response(null));
  await assignedPanier();
  await page.getByRole("button", { name: "Valider le panier", exact: true }).click();
  await confirm();
  const result = page.getByRole("region", { name: "Résultat de validation du panier" });
  await result.getByText(/aucune réservation n’est confirmée/).waitFor();
  assert.equal(await result.getByText("Réservation confirmée", { exact: true }).count(), 0);
});

test("failed validation displays the provider error and does not display success", async () => {
  overrides.set(`POST /api/rdvpermis/paniers/${basketId}/valider`, () => response({ message: "Panier expiré (fixture)" }, 409));
  await assignedPanier();
  await page.getByRole("button", { name: "Valider le panier", exact: true }).click();
  await confirm();
  await page.getByRole("alert").getByText("Panier expiré (fixture)", { exact: true }).waitFor();
  assert.equal(await page.getByRole("region", { name: "Résultat de validation du panier" }).count(), 0);
});

test("exam cancellation is confirmed before DELETE and removes only the selected exam", async () => {
  const exams = await selectExam();
  await exams.getByRole("button", { name: "Annuler l’examen", exact: true }).click();
  assert.equal(writes(`/examens/${exam.id}`).length, 0);
  await page.getByRole("dialog").getByRole("button", { name: "Annuler", exact: true }).click();
  assert.equal(writes(`/examens/${exam.id}`).length, 0);
  await exams.getByRole("button", { name: "Annuler l’examen", exact: true }).click();
  await confirm();
  assert.equal(writes(`/examens/${exam.id}`).length, 1);
  assert.equal(await exams.getByRole("button", { name: "Annuler l’examen", exact: true }).count(), 0);
});

test("permutation sends source and target IDs after confirmation, locks double submit and refreshes", async () => {
  const exams = await selectExam();
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  overrides.set("POST /api/rdvpermis/examens/permutation", async () => { await pending; return response(null, 204); });
  await exams.getByRole("button", { name: "Permuter", exact: true }).click();
  const dialog = page.getByRole("dialog");
  assert.match(await dialog.innerText(), /source-exam et target-exam/);
  assert.equal(writes("/permutation").length, 0);
  await dialog.getByRole("button", { name: "Confirmer", exact: true }).evaluate((button) => { button.click(); button.click(); });
  const busy = dialog.getByRole("button", { name: "En cours…", exact: true });
  await busy.waitFor();
  assert.equal(await busy.isDisabled(), true);
  assert.equal(await dialog.getByRole("button", { name: "Annuler", exact: true }).isDisabled(), true);
  const readsBefore = calls.filter((call) => call.method === "GET").length;
  release();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(writes("/permutation").length, 1);
  assert.deepEqual(writes("/permutation")[0].body, { examenId1: exam.id, examenId2: target.id });
  assert.ok(calls.filter((call) => call.method === "GET").length >= readsBefore + 4);
  await page.locator(".rdv-notice").filter({ hasText: "La permutation a été transmise à RdvPermis." }).waitFor();
});

test("permutation failure displays the error, releases loading and does not show success", async () => {
  const exams = await selectExam();
  overrides.set("POST /api/rdvpermis/examens/permutation", () => response({ message: "Permutation refusée (fixture)" }, 422));
  await exams.getByRole("button", { name: "Permuter", exact: true }).click();
  await confirm();
  await page.getByRole("alert").getByText("Permutation refusée (fixture)", { exact: true }).waitFor();
  assert.equal(await page.locator(".rdv-notice").filter({ hasText: "La permutation a été transmise à RdvPermis." }).count(), 0);
  assert.equal(await page.getByRole("button", { name: "En cours…", exact: true }).count(), 0);
});

test("replacement uses the selected exam and candidate only after confirmation and refreshes", async () => {
  await chooseSlot();
  await chooseCandidate();
  const exams = await selectExam();
  await exams.getByRole("button", { name: "Remplacer par le candidat sélectionné", exact: true }).click();
  assert.equal(writes("/remplacement").length, 0);
  await confirm();
  assert.deepEqual(writes("/remplacement")[0].body, { examenId: exam.id, candidatRemplacantId: "candidate-1" });
  assert.equal(writes("/remplacement").length, 1);
  assert.ok(calls.filter((call) => call.method === "GET" && call.path.endsWith(`/examens/${exam.id}`)).length >= 2);
});

test("mandate refusal is shown without a successful mandate notice", async () => {
  overrides.set("POST /api/admin/students/student-1/rdvpermis/mandate", () => response({ message: "Candidat inconnu (fixture)" }, 400));
  await page.getByRole("button", { name: "Charger les élèves", exact: true }).click();
  await page.getByRole("combobox", { name: /^Élève local/ }).selectOption("student-1");
  await page.getByRole("button", { name: "Créer le mandat", exact: true }).click();
  await confirm();
  await page.getByRole("alert").getByText("Candidat inconnu (fixture)", { exact: true }).waitFor();
  assert.equal(await page.locator(".rdv-notice").count(), 0);
});

test("assignment refusal never unlocks basket validation", async () => {
  overrides.set(`PUT /api/rdvpermis/paniers/${basketId}/creneaux/${slotId}/candidat`, () => response({ message: "Affectation refusée (fixture)" }, 422));
  await assignedPanier();
  await page.getByRole("alert").getByText("Affectation refusée (fixture)", { exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Valider le panier", exact: true }).isDisabled(), true);
  assert.equal(writes("/valider").length, 0);
});

test("unknown candidate eligibility cannot be selected or assigned", async () => {
  overrides.set("POST /api/rdvpermis/candidats/recherche", () => response([{ candidat: candidate.candidat }]));
  await chooseSlot();
  const eligibility = section("Éligibilité des candidats");
  await eligibility.getByRole("button", { name: "Vérifier l’éligibilité", exact: true }).click();
  const choose = eligibility.getByRole("button", { name: "Choisir", exact: true });
  await choose.waitFor();
  assert.equal(await choose.isDisabled(), true);
  assert.equal(writes("/candidat").length, 0);
});

test("expired basket is labelled and cannot add/assign/validate a slot", async () => {
  overrides.set("POST /api/rdvpermis/paniers", () => response({ id: basketId, dateHeureExpiration: "2000-01-01T00:00:00Z", elementsDuPanier: [] }, 201));
  await chooseSlot();
  await page.getByRole("button", { name: "Créer le panier", exact: true }).click();
  await confirm();
  await page.getByText("Expiré — actualisez le panier avant toute action", { exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Ajouter le créneau", exact: true }).isDisabled(), true);
  assert.equal(writes("/creneaux").length, 0);
});

test("unassigning a candidate clears the assignment state and locks validation", async () => {
  await assignedPanier();
  overrides.set(`GET /api/rdvpermis/paniers/${basketId}`, () => response({ id: basketId, elementsDuPanier: [{ creneauId: slotId, candidatId: "candidate-1" }] }));
  await page.getByRole("button", { name: "Lister les paniers", exact: true }).click();
  // The active basket is already shown after creation/addition; use its detail
  // read via a fixture list to expose the candidate-removal control.
  overrides.set("GET /api/rdvpermis/paniers", () => response([{ id: basketId }]));
  await page.getByRole("button", { name: "Lister les paniers", exact: true }).click();
  await section("Paniers RdvPermis").getByRole("button", { name: "Détail", exact: true }).click();
  await page.getByRole("button", { name: "Retirer le candidat", exact: true }).click();
  overrides.set(`GET /api/rdvpermis/paniers/${basketId}`, () => response({ id: basketId, elementsDuPanier: [{ creneauId: slotId }] }));
  await confirm();
  assert.deepEqual(writes("/candidat").at(-1).body, { candidatId: null });
  assert.equal(await page.getByRole("button", { name: "Valider le panier", exact: true }).isDisabled(), true);
});

test("cancellation refusal keeps the selected exam and shows the provider error", async () => {
  const exams = await selectExam();
  overrides.set(`DELETE /api/rdvpermis/examens/${exam.id}`, () => response({ message: "Annulation refusée (fixture)" }, 409));
  await exams.getByRole("button", { name: "Annuler l’examen", exact: true }).click();
  await confirm();
  await page.getByRole("alert").getByText("Annulation refusée (fixture)", { exact: true }).waitFor();
  assert.equal(await exams.getByRole("button", { name: "Annuler l’examen", exact: true }).count(), 1);
  assert.equal(await page.locator(".rdv-notice").count(), 0);
});

test("replacement refusal displays the error and no successful replacement notice", async () => {
  await chooseSlot();
  await chooseCandidate();
  const exams = await selectExam();
  overrides.set("POST /api/rdvpermis/examens/remplacement", () => response({ message: "Remplacement refusé (fixture)" }, 422));
  await exams.getByRole("button", { name: "Remplacer par le candidat sélectionné", exact: true }).click();
  await confirm();
  await page.getByRole("alert").getByText("Remplacement refusé (fixture)", { exact: true }).waitFor();
  assert.equal(await page.locator(".rdv-notice").count(), 0);
});
