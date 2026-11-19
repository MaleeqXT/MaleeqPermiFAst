import { useCallback, useEffect, useRef, useState } from "react";
import http from "../helpers/http.jsx";
import "./ExamReadyStudentsPage.css";

const EMPTY_FORM = { studentId: "", additionalHours: "", practiceFrequency: "", observation: "" };

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "ready", label: "Prêt pour un examen" },
  { value: "cancelled", label: "Annulé" },
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR");
};

const apiMessage = (error, fallback) => {
  const data = error?.response?.data;
  const first = data?.errors ? Object.values(data.errors).flat()[0] : null;
  return first || data?.message || fallback;
};

const toPayload = (form) => ({
  additional_hours: form.additionalHours === "" ? null : Number(form.additionalHours),
  practice_frequency: form.practiceFrequency.trim() || null,
  observation: form.observation.trim() || null,
});

function StatusBadge({ row }) {
  return (
    <span className={`erp-badge erp-badge--${row.status}`}>
      <span className="erp-badge-dot" aria-hidden="true" />
      {row.status_label}
    </span>
  );
}

function DetailFields({ form, onChange, idPrefix }) {
  return (
    <>
      <div className="erp-grid-2">
        <label className="erp-field" htmlFor={`${idPrefix}-hours`}>
          <span>Heures complémentaires</span>
          <input id={`${idPrefix}-hours`} type="number" min="1" max="100" inputMode="numeric" value={form.additionalHours} onChange={(e) => onChange({ additionalHours: e.target.value })} placeholder="Ex. 4" />
        </label>
        <label className="erp-field" htmlFor={`${idPrefix}-freq`}>
          <span>Fréquence de conduite</span>
          <input id={`${idPrefix}-freq`} type="text" maxLength={120} value={form.practiceFrequency} onChange={(e) => onChange({ practiceFrequency: e.target.value })} placeholder="Ex. 2 fois par semaine" />
        </label>
      </div>
      <label className="erp-field" htmlFor={`${idPrefix}-obs`}>
        <span>Remarques <em>(facultatif)</em></span>
        <textarea id={`${idPrefix}-obs`} rows={3} maxLength={2000} value={form.observation} onChange={(e) => onChange({ observation: e.target.value })} placeholder="Observations du moniteur…" />
      </label>
    </>
  );
}

export default function ExamReadyStudentsPage({ monitorId = null }) {
  const params = useCallback((extra = {}) => ({ ...(monitorId ? { monitor_id: monitorId } : {}), ...extra }), [monitorId]);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);

  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  const [modal, setModal] = useState(null); // { mode: "details" | "edit" | "cancel", row }
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [modalError, setModalError] = useState("");
  const [modalBusy, setModalBusy] = useState(false);

  const showNotice = (message) => {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 6000);
  };
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setListError("");
    http.get("/monitor/exam-ready", { params: params({ search: debouncedSearch || undefined, status, page, per_page: 10 }) })
      .then(({ data }) => {
        if (!active) return;
        setRows(Array.isArray(data?.data) ? data.data : []);
        setMeta(data?.meta ?? { current_page: 1, last_page: 1, total: 0 });
      })
      .catch((error) => {
        if (!active) return;
        setRows([]);
        setListError(apiMessage(error, "Impossible de charger la liste des élèves prêts pour un examen."));
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [debouncedSearch, status, page, reload, params]);

  useEffect(() => {
    let active = true;
    http.get("/monitor/exam-ready/candidates", { params: params() })
      .then(({ data }) => active && setCandidates(Array.isArray(data?.data) ? data.data : []))
      .catch(() => active && setCandidates([]));
    return () => { active = false; };
  }, [reload, params]);

  const selected = candidates.find((candidate) => candidate.id === form.studentId) ?? null;

  const submit = async (event) => {
    event.preventDefault();
    if (!form.studentId) {
      setFormError("Veuillez sélectionner un élève.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const { data } = await http.post("/monitor/exam-ready", { student_id: form.studentId, ...toPayload(form) }, { params: params() });
      setForm(EMPTY_FORM);
      showNotice(data?.message || "L’élève a été enregistré comme prêt pour un examen.");
      setPage(1);
      setReload((value) => value + 1);
    } catch (error) {
      setFormError(apiMessage(error, "Impossible d’enregistrer l’élève. Réessayez."));
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (mode, row) => {
    setModalError("");
    setEditForm({
      studentId: row.student_id,
      additionalHours: row.additional_hours ?? "",
      practiceFrequency: row.practice_frequency ?? "",
      observation: row.observation ?? "",
    });
    setModal({ mode, row });
  };
  const closeModal = () => { if (!modalBusy) setModal(null); };

  const saveEdit = async (event) => {
    event.preventDefault();
    setModalBusy(true);
    setModalError("");
    try {
      const { data } = await http.put(`/monitor/exam-ready/${modal.row.student_id}`, toPayload(editForm), { params: params() });
      setModal(null);
      showNotice(data?.message || "Les informations ont été mises à jour.");
      setReload((value) => value + 1);
    } catch (error) {
      setModalError(apiMessage(error, "Impossible de modifier cet enregistrement."));
    } finally {
      setModalBusy(false);
    }
  };

  const confirmCancel = async () => {
    setModalBusy(true);
    setModalError("");
    try {
      const { data } = await http.delete(`/monitor/exam-ready/${modal.row.student_id}`, { params: params() });
      setModal(null);
      showNotice(data?.message || "Le statut « Prêt pour un examen » a été annulé.");
      setReload((value) => value + 1);
    } catch (error) {
      setModalError(apiMessage(error, "Impossible d’annuler cet enregistrement."));
    } finally {
      setModalBusy(false);
    }
  };

  const filtering = Boolean(debouncedSearch) || status !== "all";

  return (
    <div className="erp-page">
      <header className="erp-heading">
        <p>Examens</p>
        <h1>Élèves prêts pour un examen</h1>
      </header>

      {notice && <p className="erp-notice erp-notice--success" role="status">{notice}</p>}

      <section className="erp-card" aria-labelledby="erp-form-title">
        <h2 id="erp-form-title">Enregistrer un élève prêt pour un examen</h2>
        <form onSubmit={submit} noValidate>
          <label className="erp-field" htmlFor="erp-student">
            <span>Élève</span>
            <select id="erp-student" value={form.studentId} onChange={(e) => { setForm((f) => ({ ...f, studentId: e.target.value })); setFormError(""); }}>
              <option value="">{candidates.length ? "Sélectionner un élève…" : "Aucun élève disponible"}</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>{candidate.name}{candidate.neph ? ` — NEPH ${candidate.neph}` : ""}</option>
              ))}
            </select>
          </label>

          {selected && (
            <dl className="erp-student-info">
              <div><dt>Nom et prénom</dt><dd>{selected.name}</dd></div>
              <div><dt>NEPH</dt><dd>{selected.neph || "Non renseigné"}</dd></div>
              <div><dt>Téléphone</dt><dd>{selected.phone || "Non renseigné"}</dd></div>
              <div><dt>Statut</dt><dd><span className="erp-badge erp-badge--ready"><span className="erp-badge-dot" aria-hidden="true" />Prêt pour un examen</span></dd></div>
            </dl>
          )}

          <DetailFields form={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} idPrefix="erp-new" />

          {formError && <p className="erp-notice erp-notice--error" role="alert">{formError}</p>}
          <div className="erp-form-footer">
            <p>La date d’enregistrement et le moniteur responsable sont ajoutés automatiquement. Aucun examen n’est réservé.</p>
            <button type="submit" className="erp-btn erp-btn--primary" disabled={submitting || !form.studentId}>
              {submitting ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>

      <section className="erp-card" aria-labelledby="erp-table-title">
        <div className="erp-table-head">
          <h2 id="erp-table-title">Élèves enregistrés <span className="erp-count">{meta.total}</span></h2>
          <div className="erp-filters">
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un élève…" aria-label="Rechercher un élève par nom" />
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filtrer par statut">
              {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>

        {listError && <p className="erp-notice erp-notice--error" role="alert">{listError}</p>}

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th scope="col">Nom et prénom</th>
                <th scope="col">NEPH</th>
                <th scope="col">Moniteur</th>
                <th scope="col">Date d’enregistrement</th>
                <th scope="col">Statut</th>
                <th scope="col"><span className="erp-sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="erp-empty">Chargement…</td></tr>
              ) : !rows.length ? (
                <tr><td colSpan={6} className="erp-empty">{filtering ? "Aucun élève ne correspond à votre recherche." : "Aucun élève prêt pour un examen n’est enregistré."}</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Nom et prénom"><strong>{row.candidate}</strong></td>
                  <td data-label="NEPH">{row.neph || "—"}</td>
                  <td data-label="Moniteur">{row.monitor || "—"}</td>
                  <td data-label="Date d’enregistrement">{formatDate(row.registered_at)}</td>
                  <td data-label="Statut"><StatusBadge row={row} /></td>
                  <td data-label="Actions" className="erp-actions">
                    <button type="button" className="erp-btn" onClick={() => openModal("details", row)}>Détails</button>
                    {row.is_ready && <button type="button" className="erp-btn" onClick={() => openModal("edit", row)}>Modifier</button>}
                    {row.is_ready && <button type="button" className="erp-btn erp-btn--danger" onClick={() => openModal("cancel", row)}>Annuler</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.last_page > 1 && (
          <nav className="erp-pagination" aria-label="Pagination">
            <button type="button" className="erp-btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Précédent</button>
            <span>Page {meta.current_page} sur {meta.last_page}</span>
            <button type="button" className="erp-btn" disabled={page >= meta.last_page || loading} onClick={() => setPage((p) => p + 1)}>Suivant</button>
          </nav>
        )}
      </section>

      {modal && (
        <div className="erp-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="erp-modal" role="dialog" aria-modal="true" aria-labelledby="erp-modal-title">
            <h2 id="erp-modal-title">
              {modal.mode === "details" ? "Détails de l’élève" : modal.mode === "edit" ? "Modifier l’enregistrement" : "Annuler le statut prêt"}
            </h2>
            <p className="erp-modal-sub">{modal.row.candidate}</p>

            {modal.mode === "details" && (
              <>
                <dl className="erp-student-info">
                  <div><dt>NEPH</dt><dd>{modal.row.neph || "Non renseigné"}</dd></div>
                  <div><dt>Téléphone</dt><dd>{modal.row.phone || "Non renseigné"}</dd></div>
                  <div><dt>Moniteur</dt><dd>{modal.row.monitor || "—"}</dd></div>
                  <div><dt>Enregistré le</dt><dd>{formatDate(modal.row.registered_at)}</dd></div>
                  <div><dt>Statut</dt><dd><StatusBadge row={modal.row} /></dd></div>
                  <div><dt>Heures complémentaires</dt><dd>{modal.row.additional_hours ?? "—"}</dd></div>
                  <div><dt>Fréquence</dt><dd>{modal.row.practice_frequency || "—"}</dd></div>
                </dl>
                <p className="erp-remarks"><strong>Remarques</strong><br />{modal.row.observation || "—"}</p>
                <div className="erp-modal-footer"><button type="button" className="erp-btn" onClick={closeModal}>Fermer</button></div>
              </>
            )}

            {modal.mode === "edit" && (
              <form onSubmit={saveEdit} noValidate>
                <DetailFields form={editForm} onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))} idPrefix="erp-edit" />
                {modalError && <p className="erp-notice erp-notice--error" role="alert">{modalError}</p>}
                <div className="erp-modal-footer">
                  <button type="button" className="erp-btn" onClick={closeModal} disabled={modalBusy}>Fermer</button>
                  <button type="submit" className="erp-btn erp-btn--primary" disabled={modalBusy}>{modalBusy ? "Enregistrement…" : "Enregistrer"}</button>
                </div>
              </form>
            )}

            {modal.mode === "cancel" && (
              <>
                <p>Cet élève ne sera plus indiqué comme prêt pour un examen. L’historique est conservé et aucun examen réservé n’est modifié.</p>
                {modalError && <p className="erp-notice erp-notice--error" role="alert">{modalError}</p>}
                <div className="erp-modal-footer">
                  <button type="button" className="erp-btn" onClick={closeModal} disabled={modalBusy}>Retour</button>
                  <button type="button" className="erp-btn erp-btn--danger-solid" onClick={confirmCancel} disabled={modalBusy}>{modalBusy ? "Annulation…" : "Confirmer l’annulation"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
