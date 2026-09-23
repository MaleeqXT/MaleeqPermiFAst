import { useEffect, useState } from "react";
import http from "../../helpers/http.jsx";
import "./AdminDocumentsPage.css";

const statusLabel = { pending: "En attente", approved: "Approuvé", rejected: "Refusé" };
const nephLabel = { sans_neph: "Sans NEPH", avec_neph: "Avec NEPH" };

function Status({ value }) {
  return <span className={`ad-doc-status ad-doc-status--${value}`}>{statusLabel[value] ?? "En attente"}</span>;
}

function StatusSelect({ value, onChange, disabled, ariaLabel }) {
  const currentVal = value || "pending";
  return (
    <div className={`ad-doc-select-wrapper ad-doc-select-wrapper--${currentVal} ${disabled ? "is-disabled" : ""}`}>
      <span className="ad-doc-status-dot" aria-hidden="true" />
      <select
        className="ad-doc-status-select"
        value={currentVal}
        disabled={disabled}
        onChange={onChange}
        aria-label={ariaLabel}
      >
        <option value="pending">En attente</option>
        <option value="approved">Approuvé</option>
        <option value="rejected">Refusé</option>
      </select>
      <span className="ad-doc-select-arrow" aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
  );
}

export default function AdminDocumentsPage() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data } = await http.get("/admin/student-documents");
      setStudents(data?.students ?? []);
    } catch {
      setError("Impossible de charger les documents des élèves.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadStudents(); }, []);

  const openStudent = async (student) => {
    setError(""); setSelected(student); setDocuments([]);
    try {
      const { data } = await http.get(`/admin/student-documents/${student.id}`);
      setSelected(data?.student ?? student);
      setDocuments(data?.documents ?? []);
    } catch { setError("Impossible de charger ce dossier."); }
  };

  const changeStatus = async (document, status) => {
    setSaving(document.type);
    try {
      await http.patch(`/admin/student-documents/${selected.id}/documents/${encodeURIComponent(document.type)}`, { status });
      await openStudent(selected);
      await loadStudents();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "La mise à jour du document a échoué.");
    } finally { setSaving(""); }
  };

  const changeStudentStatus = async (student, status) => {
    setSaving(`student-${student.id}`);
    try {
      await http.patch(`/admin/student-documents/${student.id}/status`, { status });
      await loadStudents();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "La mise à jour du statut de l'élève a échoué.");
    } finally { setSaving(""); }
  };

  const preview = async (document) => {
    try {
      const response = await http.get(`/admin/student-documents/${selected.id}/documents/${encodeURIComponent(document.type)}/download`, { responseType: "blob" });
      window.open(URL.createObjectURL(response.data), "_blank", "noopener,noreferrer");
    } catch { setError("Le fichier ne peut pas être ouvert."); }
  };

  if (selected) return (
    <section className="ad-doc-page">
      <button type="button" className="ad-doc-back" onClick={() => { setSelected(null); setDocuments([]); setError(""); }}>← Retour aux élèves</button>
      <div className="ad-doc-heading"><div><h1>Dossier documents</h1><p>{selected.name} · {selected.email}</p></div><span className="ad-doc-neph">{nephLabel[selected.neph_status] ?? "Sans NEPH"}</span></div>
      {error && <div className="ad-doc-alert">{error}</div>}
      <div className="ad-doc-card ad-doc-detail-table">
        {documents.map((document) => <article className="ad-doc-row" key={document.type}>
          <div className="ad-doc-file"><strong>{document.type}</strong><small>{document.required ? "Obligatoire" : "Optionnel"}{document.file_name ? ` · ${document.file_name}` : ""}{document.note ? ` · ${document.note}` : ""}</small></div>
          <div><Status value={document.status} /><small className="ad-doc-upload">{document.uploaded ? `Téléversé${document.uploaded_at ? ` le ${new Date(document.uploaded_at).toLocaleDateString("fr-FR")}` : ""}` : "Aucun fichier téléversé"}</small></div>
          <div className="ad-doc-actions">
            {document.uploaded && <button type="button" className="ad-doc-view" onClick={() => preview(document)}>Voir</button>}
            <StatusSelect
              value={document.status}
              disabled={!document.uploaded || saving === document.type}
              onChange={(event) => changeStatus(document, event.target.value)}
              ariaLabel={`Statut de ${document.type}`}
            />
          </div>
        </article>)}
      </div>
    </section>
  );

  return <section className="ad-doc-page">
    <div className="ad-doc-heading"><div><h1>Documents des élèves</h1><p>Consultez et validez les pièces des inscriptions.</p></div></div>
    {error && <div className="ad-doc-alert">{error}</div>}
    <div className="ad-doc-card ad-doc-list">
      {loading ? (
        <p className="ad-doc-empty">Chargement des dossiers…</p>
      ) : students.length === 0 ? (
        <p className="ad-doc-empty">Aucun élève inscrit.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Élève</th>
              <th>NEPH</th>
              <th>Documents</th>
              <th>Statut élève</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <strong>{student.student}</strong>
                  <small>{student.email}</small>
                </td>
                <td>{nephLabel[student.neph_status] ?? "Sans NEPH"}</td>
                <td>{student.approved_documents_count}/{student.documents_count} document(s) approuvé(s)</td>
                <td>
                  <StatusSelect
                    value={student.registration_status ?? "pending"}
                    disabled={saving === `student-${student.id}`}
                    onChange={(event) => changeStudentStatus(student, event.target.value)}
                    ariaLabel={`Statut de ${student.student}`}
                  />
                </td>
                <td>
                  <button type="button" className="ad-doc-view" onClick={() => openStudent(student)}>Voir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </section>;
}
