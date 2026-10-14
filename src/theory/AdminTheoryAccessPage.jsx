import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import http from "../helpers/http.jsx";
import "./TheoryAccessAdmin.css";

const toDateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";
const formatDate = (value) => value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value)) : "Sans date d’expiration";

function errorMessage(error, fallback) {
  return Object.values(error?.response?.data?.errors || {}).flat()[0]
    || error?.response?.data?.message
    || fallback;
}

export default function AdminTheoryAccessPage() {
  const selectedSchool = useSelector((state) => state.schools.selected);
  const selectedZoneId = selectedSchool?.id || null;
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await http.get("/admin/theory/accesses", { params: { search: appliedSearch || undefined, page, zone_id: selectedZoneId || undefined } });
      setResult(response.data || { data: [] });
    } catch (requestError) {
      setError(errorMessage(requestError, "Impossible de charger les élèves."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { setPage(1); }, [selectedZoneId]);
  useEffect(() => { load(); }, [page, appliedSearch, selectedZoneId]);

  function openGrant(student) {
    setSelected(student);
    setExpiresAt(toDateInput(student.manual_access?.expires_at));
    setNote(student.manual_access?.note || "Paiement en espèces confirmé par l’agence.");
    setNotice("");
    setError("");
  }

  async function grant(event) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const response = await http.patch(`/admin/theory/accesses/${selected.id}`, {
        expires_at: expiresAt || null,
        note: note.trim() || null,
      });
      setNotice(response.data?.message || "Accès Code activé.");
      setSelected(null);
      await load();
    } catch (requestError) {
      setError(errorMessage(requestError, "Impossible d’activer l’accès Code."));
    } finally {
      setSaving(false);
    }
  }

  async function revoke(student) {
    if (!window.confirm(`Retirer l’accès Code manuel de ${student.name} ?`)) return;
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const response = await http.delete(`/admin/theory/accesses/${student.id}`);
      setNotice(response.data?.message || "Accès manuel retiré.");
      await load();
    } catch (requestError) {
      setError(errorMessage(requestError, "Impossible de retirer l’accès manuel."));
    } finally {
      setSaving(false);
    }
  }

  return <div className="theory-access-admin">
    <header className="theory-access-heading">
      <div>
        <p className="theory-eyebrow">CODE DE LA ROUTE</p>
        <h1>Accès Code en espèces</h1>
        <p>Donnez l’accès à un élève ayant réglé directement à l’agence. Son menu Code et ses séries apparaîtront immédiatement à sa prochaine actualisation.</p>
        <strong className="theory-access-agency">Agence sélectionnée : {selectedSchool?.name || "Toutes les agences"}</strong>
      </div>
    </header>

    {notice && <p className="theory-access-notice theory-access-notice--success">{notice}</p>}
    {error && <p className="theory-access-notice theory-access-notice--error">{error}</p>}

    <form className="theory-access-search" onSubmit={(event) => { event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); }}>
      <label>
        <span>Rechercher un élève</span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom ou e-mail" />
      </label>
      <button type="submit" className="theory-primary" disabled={loading}>Rechercher</button>
      {appliedSearch && <button type="button" className="theory-secondary" onClick={() => { setSearch(""); setAppliedSearch(""); setPage(1); }}>Effacer</button>}
    </form>

    <section className="theory-access-list" aria-busy={loading}>
      {loading && <p className="theory-access-empty">Chargement des élèves…</p>}
      {!loading && !result.data?.length && <p className="theory-access-empty">Aucun élève trouvé.</p>}
      {!loading && result.data?.map((student) => <article className="theory-access-row" key={student.id}>
        <div className="theory-access-student">
          <strong>{student.name}</strong>
          <span>{student.email || "E-mail non renseigné"}</span>
        </div>
        <div className="theory-access-state">
          {student.has_paid_code_access && <span className="theory-access-badge theory-access-badge--online">Forfait web payé</span>}
          {student.has_manual_code_access && <span className="theory-access-badge theory-access-badge--manual">Accès espèces</span>}
          {!student.has_code_access && <span className="theory-access-badge theory-access-badge--none">Pas d’accès</span>}
          {student.manual_access && <small>{formatDate(student.manual_access.expires_at)}{student.manual_access.granted_by ? ` · donné par ${student.manual_access.granted_by}` : ""}</small>}
        </div>
        <div className="theory-access-actions">
          {student.has_manual_code_access ? <>
            <button type="button" className="theory-secondary" onClick={() => openGrant(student)} disabled={saving}>Modifier</button>
            <button type="button" className="theory-danger" onClick={() => revoke(student)} disabled={saving}>Retirer</button>
          </> : student.has_paid_code_access ? <span className="theory-access-included">Déjà inclus</span> : <button type="button" className="theory-primary" onClick={() => openGrant(student)} disabled={saving}>Donner accès</button>}
        </div>
      </article>)}
    </section>

    {result.last_page > 1 && <nav className="theory-access-pagination" aria-label="Pagination des élèves">
      <button type="button" className="theory-secondary" disabled={loading || page <= 1} onClick={() => setPage((current) => current - 1)}>Précédent</button>
      <span>Page {result.current_page} sur {result.last_page} · {result.total} élève(s)</span>
      <button type="button" className="theory-secondary" disabled={loading || page >= result.last_page} onClick={() => setPage((current) => current + 1)}>Suivant</button>
    </nav>}

    {selected && <div className="theory-access-modal-backdrop" onMouseDown={() => !saving && setSelected(null)}>
      <form className="theory-access-modal" onSubmit={grant} onMouseDown={(event) => event.stopPropagation()}>
        <p className="theory-eyebrow">PAIEMENT À L’AGENCE</p>
        <h2>Donner l’accès à {selected.name}</h2>
        <p>Cette action ne crée pas de paiement en ligne. Elle garde une trace interne de l’accès accordé par l’agence.</p>
        <label>Date de fin facultative<input type="date" min={new Date().toISOString().slice(0, 10)} value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label>
        <label>Note / référence espèces<textarea value={note} maxLength="500" onChange={(event) => setNote(event.target.value)} placeholder="Ex. reçu espèces n°…" /></label>
        <div className="theory-access-modal-actions">
          <button type="button" className="theory-secondary" onClick={() => setSelected(null)} disabled={saving}>Annuler</button>
          <button type="submit" className="theory-primary" disabled={saving}>{saving ? "Enregistrement…" : "Confirmer l’accès"}</button>
        </div>
      </form>
    </div>}
  </div>;
}
