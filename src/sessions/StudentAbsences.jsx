import { useEffect, useMemo, useState } from "react";
import http from "../helpers/http.jsx";
import "./StudentAbsences.css";

const formatDate = (value) => value
  ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`))
  : "—";

export default function StudentAbsences() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const filters = useMemo(() => ({
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }), [search, from, to]);

  // A new filter always starts again from the first page.
  const filterChange = (setter) => (event) => { setter(event.target.value); setPage(1); };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const debounce = window.setTimeout(() => {
      http.get("/admin/student-absences", { params: { ...filters, page, per_page: 25 } })
        .then(({ data }) => {
          if (!active) return;
          setRows(Array.isArray(data?.data) ? data.data : []);
          setMeta(data?.meta || { current_page: 1, last_page: 1, total: Array.isArray(data?.data) ? data.data.length : 0 });
        })
        .catch((requestError) => active && setError(requestError.response?.data?.message || "Impossible de charger les absences."))
        .finally(() => active && setLoading(false));
    }, 180);

    return () => { active = false; window.clearTimeout(debounce); };
  }, [filters, page]);

  return <section className="sa-page" aria-labelledby="student-absences-title">
    <header className="sa-heading">
      <div><p>Suivi des élèves</p><h1 id="student-absences-title">Absences des élèves</h1><span>Les absences signalées depuis les leçons enregistrées.</span></div>
    </header>

    <div className="sa-filters" aria-label="Filtrer les absences">
      <input type="search" value={search} onChange={filterChange(setSearch)} placeholder="Rechercher un élève ou un moniteur" aria-label="Rechercher" />
      <label>Du <input type="date" value={from} onChange={filterChange(setFrom)} /></label>
      <label>Au <input type="date" value={to} onChange={filterChange(setTo)} /></label>
    </div>

    {error && <p className="sa-message sa-message--error" role="alert">{error}</p>}
    <div className="sa-table-wrap">
      <table className="sa-table">
        <thead><tr><th>Élève</th><th>Date / horaire</th><th>Moniteur</th><th>Lieu</th><th>Observation</th><th>Statut</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan="6" className="sa-empty">Chargement des absences…</td></tr> : rows.length ? rows.map((row) => <tr key={row.id}><td><strong>{row.student}</strong>{row.phone && <small>{row.phone}</small>}</td><td><strong>{formatDate(row.date)}</strong><small>{row.start_time && row.end_time ? `${row.start_time} - ${row.end_time}` : "Horaire non renseigné"}</small></td><td>{row.monitor}</td><td>{row.location}</td><td>{row.comment || "—"}</td><td><span className="sa-status">Absent</span></td></tr>) : <tr><td colSpan="6" className="sa-empty">Aucune absence enregistrée pour ces critères.</td></tr>}</tbody>
      </table>
    </div>
    {meta.last_page > 1 && <nav className="sa-pagination" aria-label="Pagination des absences">
      <button type="button" disabled={loading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Précédent</button>
      <span>Page {meta.current_page} sur {meta.last_page} · {meta.total} absence{meta.total > 1 ? "s" : ""}</span>
      <button type="button" disabled={loading || page >= meta.last_page} onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))}>Suivant</button>
    </nav>}
  </section>;
}
