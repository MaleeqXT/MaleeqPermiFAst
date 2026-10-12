# Monitor Formation implementation

Formation is available at `/monitor/formation`, inside the existing monitor dashboard. The existing sidebar and top navbar are retained. The new menu item sits between Séances and Progression and uses Lucide GraduationCap.

## Files created

Frontend, under `C:\wamp64\www\MaleeqPermiFAst`:

- `src/monitordashboard/formation/FormationPage.jsx`: student selection, lesson editor, API requests, pending-change protection.
- `src/monitordashboard/formation/FormationComponents.jsx`: searchable selectors, avatars, history, status indicators, toggles, modal, signature pad.
- `src/monitordashboard/formation/FormationCompetencies.jsx`: lesson-specific competency editing using the existing QuestionDetail component.
- `src/monitordashboard/formation/formationUtils.js`: date formatting.
- `src/monitordashboard/formation/FormationPage.css`: scoped desktop/tablet/mobile styles.
- `scripts/test-monitor-formation.mjs`: deferred-request regression checks against the real page's event handlers and state.
- `docs/monitor-formation.md`: this report.

Backend, under `C:\wamp64\www\Passpermislaravel`:

- `app/Http/Controllers/V1/EndPoint/Monitor/FormationController.php`: authorized lesson CRUD and monitor signing.
- `tests/Feature/MonitorFormationTest.php`: isolated database and authenticated HTTP integration tests.

## Files modified

- Frontend `src/monitordashboard/MonitorDashboard.jsx`: Formation navigation/content, schedule refresh, unsaved-change and in-flight request protection for dashboard navigation.
- Frontend `src/App.jsx`: adds the route to the existing monitor dashboard rendering and role/preview access rules.
- Backend `routes/monitor/api.php`: registers five Formation endpoints under existing authentication middleware.
- Backend `app/Http/Controllers/V1/EndPoint/Monitor/StudentProgressController.php`: serializes competency writes with lesson signing and rejects edits to signed lessons.

## APIs and components reused

- `GET /api/monitor/students`: existing students accessible to the monitor.
- `GET /api/monitor/progress/{student}`: existing REMC competency registry.
- `PUT /api/monitor/progress/{student}/competencies/{competency}`: existing evaluations, with the selected reservation ID.
- Existing HTTP client and authentication token handling.
- Existing profile photo helper and QuestionDetail evaluation interface.
- Existing ReservationInterface and TrainingInterface services for new bookings, and the existing wallet repository for hour changes/refunds.
- Existing monitor profile department (`monitor_information.departement`), monitor locations, and student purchased offers.
- Existing Redux schedule refresh after a confirmed lesson operation.
- Existing satisfaction trigger after an attended completed lesson is signed.

## Backend functionality added

The existing availability creation/deletion endpoints did not provide a complete student lesson editor; availability deletion also refuses booked lessons. No existing lesson-signing endpoint was found. These real endpoints were added:

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | /api/monitor/formation/{student} | Full authorized lesson history and actual editor options |
| POST | /api/monitor/formation/{student} | Book a new lesson through existing services |
| PUT | /api/monitor/formation/{student}/{reservation} | Update schedule and saved lesson metadata |
| DELETE | /api/monitor/formation/{student}/{reservation} | Delete an unsigned future lesson and return reserved hours |
| POST | /api/monitor/formation/{student}/{reservation}/sign | Validate and persist the monitor's signature |

No migration is required. Reservation/training records retain their existing IDs and associations. Separate public/private notes, maneuvers, toggles and signature data use the existing `document_evaluations.data` JSON column. Competencies use the existing ratings and evaluation-detail tables. Existing evaluation keys are preserved.

## Implemented behavior

- Searchable, scrollable student dropdown with real names/avatars, loading/error/empty states.
- Student changes clear the previous lesson immediately; obsolete responses cannot replace the current student's data.
- Newest-first history with chronological numbering, purple lesson 20, selected-row highlighting, and actual signed/reviewed/absent/cancelled/upcoming statuses.
- Blank new-lesson mode and saved-lesson selection.
- Date, whole-hour duration, start time, instructor, type, department, purchased offer and location fields.
- Blue/gray switches for automatic gearbox, initial evaluation and permit evaluation.
- Maneuver editor using saved text, without an invented fixed checklist.
- Separate public and instructor observation fields.
- Existing competency evaluation UI and database-driven skills, attached to the selected lesson. Existing student responses are preserved.
- Confirmed API success messages, delete confirmation, persisted monitor signature and signed state.
- Unsaved-change confirmation when replacing students/lessons, using dashboard navigation or closing edited competency observations; browser reload/close protection.
- Responsive column stacking and scoped styling; Formation does not render the old dashboard statistic cards.

## Existing authority and booking rules

- The instructor picker exposes the logged-in or authorized preview monitor. Its + button opens this authorized picker. It does not create instructors or grant access to other monitors' lessons.
- Admin/super-admin previews follow existing backend monitor-preview permissions; only the lesson's actual logged-in monitor can sign.
- Students come from the existing monitor/student relationship endpoint; this module does not assign previously unrelated students to a monitor.
- New lessons need an active purchased offer, sufficient hours, a linked location, a future time and no monitor/student overlap.
- Durations are whole hours, within 07:00–23:00.
- Past lessons retain their schedule and purchased offer; unsigned lesson observations/evaluations remain editable.
- Deletion applies to unsigned future lessons; past and signed lessons cannot be deleted.
- Signing requires a completed, attended, active lesson, a non-empty drawn signature and explicit confirmation. The stored record contains strokes, actor, timestamp and a content digest. This is monitor lesson confirmation; it does not change the separate CPF/contract signature workflows.
- Private notes added by Formation are kept out of the existing student lesson response. Public observations, maneuvers and evaluation switches are available through that existing response.

No backend endpoint remains missing for these implemented operations. Expanding instructor reassignment, past-lesson deletion or student co-signature would require a separately defined authorization/business workflow.

## Verification completed

- `npm run build`: passed. Vite reports the existing large main bundle warning.
- ESLint for the Formation module: passed.
- `node scripts/test-monitor-formation.mjs`: passed. Covers late responses, immediate student isolation, refusal to discard pending edits, correct save payload, and retained changes/no success message after a failed save. This harness does not replace a browser rendering test.
- `php vendor/bin/phpunit tests/Feature/MonitorFormationTest.php`: **10 tests, 73 assertions passed**, using a separate in-memory SQLite database and fake notifications; the project's real database was not modified.
- Tests exercise the real booking services and authenticated HTTP routes for create/update/delete/sign and competency updates. They verify wallet debit/refund, access scope, persisted metadata, department profile source, invalid signature rejection, completed/attended requirements, cancelled/signed edit restrictions, history ordering and private-note isolation on the student API.
- Route registration checked; PHP syntax checks passed.

## Verification limitation

The browser preview runtime exited during initialization on both attempts. An interactive desktop/mobile visual review and live-account walkthrough could not be completed in this environment. Responsive styles are implemented and the production build passes, but pixel-level screenshot matching has not been verified.
