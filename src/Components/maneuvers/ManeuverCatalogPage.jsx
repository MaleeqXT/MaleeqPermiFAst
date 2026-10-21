import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Power, RefreshCw, X } from "lucide-react";
import http from "../../helpers/http.jsx";
import "./ManeuverCatalogPage.css";

const blank = { name: "", group_name: "Autres manœuvres", icon: "", sort_order: 0 };
const errorText = (error) => Object.values(error.response?.data?.errors || {}).flat().join(" ") || error.response?.data?.message || "Impossible de mettre à jour le répertoire.";

export default function ManeuverCatalogPage() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const isEditing = Boolean(editing);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await http.get("/admin/maneuvers");
      setItems(data?.data || []);
    } catch (requestError) { setError(errorText(requestError)); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const grouped = useMemo(() => items.reduce((groups, item) => {
    const title = item.group || item.group_name || "Autres manœuvres";
    groups[title] = [...(groups[title] || []), item];
    return groups;
  }, {}), [items]);
  const change = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const reset = () => { setDraft(blank); setEditing(null); setError(""); };

  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(""); setNotice("");
    const values = { ...draft, sort_order: Number(draft.sort_order || 0) };
    try {
      const { data } = isEditing
        ? await http.put(`/admin/maneuvers/${editing.id}`, values)
        : await http.post("/admin/maneuvers", values);
      const saved = data.data;
      setItems((current) => isEditing ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setNotice(isEditing ? "Manœuvre mise à jour." : "Manœuvre ajoutée au répertoire.");
      reset();
    } catch (requestError) { setError(errorText(requestError)); }
    finally { setSaving(false); }
  };
  const edit = (item) => {
    setEditing(item); setDraft({ name: item.name || "", group_name: item.group || item.group_name || "Autres manœuvres", icon: item.icon || "", sort_order: item.sort_order || 0 }); setError(""); setNotice("");
  };
  const setActive = async (item, isActive) => {
    if (!isActive && !window.confirm(`Désactiver « ${item.name} » ? Les historiques des élèves seront conservés.`)) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const { data } = isActive
        ? await http.put(`/admin/maneuvers/${item.id}`, { is_active: true })
        : await http.delete(`/admin/maneuvers/${item.id}`);
      const saved = data.data;
      setItems((current) => current.map((entry) => entry.id === saved.id ? saved : entry));
      setNotice(isActive ? "Manœuvre réactivée." : "Manœuvre désactivée. Son historique est conservé.");
    } catch (requestError) { setError(errorText(requestError)); }
    finally { setSaving(false); }
  };

  return <div className="maneuver-catalog-page">
    <header className="maneuver-catalog-header"><div><p>PARAMÈTRES PÉDAGOGIQUES</p><h1>Répertoire des manœuvres</h1><span>Les changements actifs sont proposés dans les leçons des moniteurs. Les historiques déjà saisis ne sont jamais supprimés.</span></div><button type="button" className="maneuver-refresh" onClick={load} disabled={loading || saving}><RefreshCw size={17} />Actualiser</button></header>
    {error && <p className="maneuver-message error">{error}</p>}
    {notice && <p className="maneuver-message success">{notice}</p>}
    <div className="maneuver-catalog-layout">
      <section className="maneuver-catalog-list" aria-label="Catalogue des manœuvres">
        {loading ? <p className="maneuver-empty">Chargement du répertoire…</p> : Object.keys(grouped).length ? Object.entries(grouped).map(([group, rows]) => <div className="maneuver-catalog-group" key={group}><h2>{group}</h2>{rows.map((item) => <article key={item.id} className={`maneuver-catalog-row ${!item.is_active ? "is-inactive" : ""}`}><div><strong>{item.name}</strong><span>{item.is_active ? "Active" : "Désactivée"}</span></div><div className="maneuver-row-actions"><button type="button" onClick={() => edit(item)} disabled={saving}><Pencil size={16} />Modifier</button><button type="button" className={item.is_active ? "deactivate" : "activate"} onClick={() => setActive(item, !item.is_active)} disabled={saving}>{item.is_active ? <Power size={16} /> : <Check size={16} />}{item.is_active ? "Désactiver" : "Réactiver"}</button></div></article>)}</div>) : <p className="maneuver-empty">Aucune manœuvre disponible.</p>}</section>
      <aside className="maneuver-catalog-form"><div className="maneuver-form-heading"><div><p>{isEditing ? "MODIFICATION" : "NOUVELLE MANŒUVRE"}</p><h2>{isEditing ? "Modifier une manœuvre" : "Ajouter une manœuvre"}</h2></div>{isEditing && <button type="button" aria-label="Annuler la modification" onClick={reset}><X size={18} /></button>}</div><form onSubmit={save}><label>Nom<input required maxLength="160" value={draft.name} onChange={(event) => change("name", event.target.value)} placeholder="Ex. Demi-tour en trois temps" /></label><label>Catégorie<input required maxLength="80" value={draft.group_name} onChange={(event) => change("group_name", event.target.value)} placeholder="Ex. Autres manœuvres" /></label><div className="maneuver-form-pair"><label>Icône <input maxLength="80" value={draft.icon} onChange={(event) => change("icon", event.target.value)} placeholder="Optionnel" /></label><label>Ordre<input type="number" min="0" max="9999" value={draft.sort_order} onChange={(event) => change("sort_order", event.target.value)} /></label></div><p className="maneuver-form-note">Désactiver une manœuvre la retire des nouveaux cours, sans supprimer les passages déjà enregistrés.</p><button type="submit" className="maneuver-submit" disabled={saving}>{isEditing ? <Pencil size={17} /> : <Plus size={17} />}{saving ? "Enregistrement…" : isEditing ? "Enregistrer" : "Ajouter au répertoire"}</button></form></aside>
    </div>
  </div>;
}
