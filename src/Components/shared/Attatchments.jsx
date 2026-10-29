import { useCallback, useEffect, useState } from "react";
import "./Attatchments.css";
import FileManager from "./FileManeger.jsx";
import http from "../../helpers/http";
import { apiAssetUrl } from "../../config/api.js";

const DocIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>;

const toDocs = (items = []) => items.map((item) => {
  const stored = item.storage_media ?? item.storageMedia ?? item;
  return { id: stored.id ?? item.storage_media_id, name: stored.name ?? item.name ?? "Document", path: stored.path ?? item.path ?? "" };
}).filter((item) => item.id);
const fileUrl = (path) => /^https?:\/\//i.test(path ?? "") ? path : apiAssetUrl(String(path ?? "").replace(/^\/+/, ""));

function DocumentCard({ title, subtitle, bullets, documents, onAdd, onDelete }) {
  return <div className="tb-doc-card">
    <div className="tb-doc-card-header"><div><h3 className="tb-doc-title">{title}</h3>{subtitle && <p className="tb-doc-subtitle">{subtitle}</p>}{bullets && <ul className="tb-doc-bullets">{bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</div><button type="button" className="tb-add-doc-btn" onClick={onAdd}>+ Ajouter un document</button></div>
    <div className="tb-doc-empty-area">{!documents.length ? <div className="tb-doc-empty"><DocIcon/><span className="tb-doc-empty-title">Aucun document</span><span className="tb-doc-empty-sub">Aucun document n'a encore été ajouté.</span></div> : <div className="tb-doc-files">{documents.map((document) => <div key={document.id} className="tb-doc-file-row"><DocIcon/><a className="tb-doc-file-name" href={fileUrl(document.path)} target="_blank" rel="noreferrer">{document.name}</a><button type="button" onClick={() => onDelete(document)} style={{ marginLeft:"auto", border:0, background:"none", color:"#dc2626", cursor:"pointer", fontWeight:700 }}>Supprimer</button></div>)}</div>}</div>
  </div>;
}

export default function Attatchments({ monitorId }) {
  const [activeTab, setActiveTab] = useState("personal");
  const [documents, setDocuments] = useState({ identity: [], license: [], diploma: [], authorization: [] });
  const [professional, setProfessional] = useState({ denomination_social:"", date_creation:"", siret:"", num_autorisation:"", autorisation:"", visite:"" });
  const [target, setTarget] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!monitorId) return;
    const { data } = await http.get(`/admin/users/monitors/${monitorId}/documents`);
    const pro = data.professionel ?? {};
    const permission = pro.instructor_permission ?? pro.instructorPermission ?? {};
    setDocuments({ identity: toDocs(data.pieceIdentite?.media), license: toDocs(data.permis?.media), diploma: toDocs(data.diplom?.media), authorization: toDocs(permission.media) });
    setProfessional({ denomination_social:pro.denomination_social ?? "", date_creation:pro.date_creation ?? "", siret:pro.siret ?? "", num_autorisation:pro.num_autorisation ?? "", autorisation:permission.autorisation ?? "", visite:permission.visite ?? "" });
  }, [monitorId]);

  useEffect(() => { load().catch(() => setMessage("Impossible de charger les documents.")); }, [load]);
  const choose = (key) => { setTarget(key); setPickerOpen(true); };
  const upload = async (_src, selected) => {
    setPickerOpen(false);
    if (!target || !selected?.file) return;
    const formData = new FormData(); formData.append("media", selected.file);
    try {
      const { data } = await http.post("/media/store", formData, { headers: { "Content-Type":"multipart/form-data" } });
      const stored = data.storageMedia ?? data.data ?? data;
      setDocuments((current) => ({ ...current, [target]: [...current[target], { id:stored.id, name:stored.name || selected.file.name, path:stored.path || "" }] }));
      setMessage("Document ajouté. Enregistrez pour l'associer au moniteur.");
    } catch { setMessage("Impossible de téléverser ce document."); }
  };
  const remove = async (key, document) => {
    try { await http.delete(`/media/destroy/by/${document.id}`); setDocuments((current) => ({ ...current, [key]:current[key].filter((item) => item.id !== document.id) })); setMessage("Document supprimé."); }
    catch { setMessage("Impossible de supprimer ce document."); }
  };
  const save = async () => {
    if (!monitorId) return;
    setSaving(true); setMessage("");
    try {
      await http.put(`/admin/users/monitors/${monitorId}/documents`, {
        media_piece_identite:documents.identity.map((item) => item.id), media_permis:documents.license.map((item) => item.id), media_diplom:documents.diploma.map((item) => item.id),
        denomination_social:professional.denomination_social, date_creation:professional.date_creation, siret:professional.siret, num_autorisation:professional.num_autorisation,
        autorisations:{ media:documents.authorization.map((item) => item.id), autorisation:professional.autorisation, visite:professional.visite },
      });
      await load(); setMessage("Documents enregistrés.");
    } catch (error) { setMessage(error.response?.data?.message || "Impossible d'enregistrer les documents."); }
    finally { setSaving(false); }
  };
  const setField = (key, value) => setProfessional((current) => ({ ...current, [key]:value }));
  return <div className="tb-attach-page">
    <div className="tb-attach-header"><h1 className="tb-attach-title">Pièces jointes</h1></div>
    {message && <p style={{ color:message.includes("Impossible") ? "#dc2626" : "#15803d", margin:"0 0 12px" }}>{message}</p>}
    <div className="tb-attach-tabs"><div className="tb-attach-pill"><button type="button" className={`tb-attach-tab ${activeTab === "personal" ? "active" : ""}`} onClick={() => setActiveTab("personal")}>Documents personnels</button><button type="button" className={`tb-attach-tab ${activeTab === "professional" ? "active" : ""}`} onClick={() => setActiveTab("professional")}>Documents professionnels</button></div></div>
    {activeTab === "personal" ? <div className="tb-attach-body"><DocumentCard title="Document d'identité" subtitle={`${documents.identity.length} document(s) d'identité.`} bullets={["Carte d'identité (recto et verso)", "Le passeport"]} documents={documents.identity} onAdd={() => choose("identity")} onDelete={(doc) => remove("identity", doc)}/><DocumentCard title="Permis de conduire" subtitle="Veuillez fournir le recto et le verso de ce document." documents={documents.license} onAdd={() => choose("license")} onDelete={(doc) => remove("license", doc)}/><DocumentCard title="Diplôme d'enseignement | Titre professionnel ECSR" subtitle="BEPECASER ou Titre professionnel de conducteur" documents={documents.diploma} onAdd={() => choose("diploma")} onDelete={(doc) => remove("diploma", doc)}/></div> : <div className="tb-attach-body"><div className="tb-doc-card"><h3 className="tb-doc-title">Documents professionnels</h3><div className="tb-prof-grid"><input className="tb-prof-input" placeholder="Dénomination sociale" value={professional.denomination_social} onChange={(e) => setField("denomination_social", e.target.value)}/><input className="tb-prof-input" type="date" value={professional.date_creation} onChange={(e) => setField("date_creation", e.target.value)}/><input className="tb-prof-input" placeholder="SIRET" value={professional.siret} onChange={(e) => setField("siret", e.target.value)}/><input className="tb-prof-input" placeholder="Numéro d'autorisation d'enseigner" value={professional.num_autorisation} onChange={(e) => setField("num_autorisation", e.target.value)}/></div></div><DocumentCard title="Autorisation d'enseigner" subtitle="Veuillez fournir le recto et le verso de ce document." documents={documents.authorization} onAdd={() => choose("authorization")} onDelete={(doc) => remove("authorization", doc)}/></div>}
    <div className="tb-attach-footer"><button type="button" className="tb-save-docs-btn" disabled={saving} onClick={save}>{saving ? "Enregistrement…" : "Enregistrer les documents"}</button></div>
    <FileManager variant="hidden" selectedSrc={null} openOverride={pickerOpen} onRequestClose={() => setPickerOpen(false)} onSelect={upload}/>
  </div>;
}
