import { useEffect, useMemo, useState } from "react";
import "./SchedulingDrawer.css";

const DAY_NAMES = ["L", "M", "M", "J", "V", "S", "D"];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (v) => { const [y, m, d] = String(v).split("-").map(Number); return new Date(y, m - 1, d); };
const plusDays = (d, n) => { const next = new Date(d); next.setDate(next.getDate() + n); return next; };
const range = (from, to) => { const values = []; for (let d = new Date(from); d <= to; d = plusDays(d, 1)) values.push(iso(d)); return values; };
const hours = (start, end) => Math.max(1, Math.ceil(((Number(end.slice(0, 2)) * 60 + Number(end.slice(3))) - (Number(start.slice(0, 2)) * 60 + Number(start.slice(3)))) / 60));
const label = (place) => place?.name ?? place?.label ?? place?.title ?? place?.address ?? "Lieu sans nom";

export default function SchedulingDrawer({ open = true, onClose, onSubmit, places = [], defaultLieuId = null, initialDate }) {
  const initial = useMemo(() => initialDate ? parse(initialDate) : new Date(), [initialDate]);
  const [lieuId, setLieuId] = useState(defaultLieuId ?? "");
  const [startDate, setStartDate] = useState(iso(initial));
  const [endDate, setEndDate] = useState(iso(plusDays(initial, 6)));
  const [selectedDates, setSelectedDates] = useState(() => new Set(range(initial, plusDays(initial, 6))));
  const [slots, setSlots] = useState([{ id: crypto.randomUUID(), start_at: "07:00", end_at: "12:00" }, { id: crypto.randomUUID(), start_at: "14:00", end_at: "18:00" }]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!lieuId && defaultLieuId) setLieuId(String(defaultLieuId)); }, [defaultLieuId, lieuId]);
  useEffect(() => setSelectedDates(new Set(range(parse(startDate), parse(endDate)))), [startDate, endDate]);

  const dates = useMemo(() => range(parse(startDate), parse(endDate)), [startDate, endDate]);
  const weeks = useMemo(() => Array.from({ length: Math.ceil(dates.length / 7) }, (_, i) => dates.slice(i * 7, i * 7 + 7)), [dates]);
  const toggleDate = (date) => setSelectedDates((current) => { const next = new Set(current); next.has(date) ? next.delete(date) : next.add(date); return next; });
  const updateSlot = (id, key, value) => setSlots((current) => current.map((slot) => slot.id === id ? { ...slot, [key]: value } : slot));
  const addSlot = () => setSlots((current) => [...current, { id: crypto.randomUUID(), start_at: "09:00", end_at: "10:00" }]);
  const removeSlot = (id) => setSlots((current) => current.length > 1 ? current.filter((slot) => slot.id !== id) : current);

  const submit = async () => {
    setError("");
    if (!lieuId) return setError("Veuillez sélectionner un lieu.");
    if (!selectedDates.size) return setError("Sélectionnez au moins une date.");
    if (slots.some((slot) => !slot.start_at || !slot.end_at || slot.start_at >= slot.end_at)) return setError("Chaque créneau doit avoir une heure de début antérieure à l’heure de fin.");
    const payload = Array.from(selectedDates).flatMap((date) => slots.map((slot) => ({ date, start_at: slot.start_at, end_at: slot.end_at, hour: hours(slot.start_at, slot.end_at), is_active: true })));
    try { setSaving(true); await onSubmit?.({ lieu_id: lieuId, data: payload }); } catch (e) { setError(e?.message || "Impossible d’enregistrer les disponibilités."); } finally { setSaving(false); }
  };

  return <>
    <div className={`sd-backdrop ${open ? "sd-backdrop--open" : ""}`} onClick={saving ? undefined : onClose} />
    <aside className={`sd-drawer ${open ? "sd-drawer--open" : ""}`} aria-label="Créer des disponibilités">
      <div className="sd-header"><button type="button" className="sd-top-action" onClick={onClose} disabled={saving}>Fermer</button><div className="sd-header__heading"><strong>Planification des<br />disponibilités</strong><span className="sd-header__title">Choisir le lieu et la période concernée</span></div><button type="button" className="sd-top-action sd-top-action--save" onClick={submit} disabled={saving}>✓&nbsp; Enregistrer</button></div>
      <div className="sd-body">
        <div className="sd-config-card"><label className="sd-field sd-field--col"><span className="sd-label">Lieu:</span><select className="sd-control" value={lieuId} onChange={(e) => setLieuId(e.target.value)} disabled={saving}><option value="">Non défini</option>{places.map((place) => <option key={place.id ?? place.value} value={place.id ?? place.value}>{label(place)}</option>)}</select></label></div>
        <div className="sd-config-card"><span className="sd-label">Période:</span><div className="sd-date-range"><label className="sd-field sd-field--col"><span>Du</span><input className="sd-control" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={saving} /></label><label className="sd-field sd-field--col"><span>Au</span><input className="sd-control" type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={saving} /></label></div></div>
        <div className="sd-section-heading"><span>Dates de récurrence</span><button type="button" className="sd-link-button" onClick={() => setSelectedDates(new Set(dates))} disabled={saving}>Tout sélectionner</button></div>
        <div className="sd-calendar"><div className="sd-cal-head">{DAY_NAMES.map((day, index) => <div key={`${day}-${index}`} className="sd-cal-cell sd-cal-cell--head">{day}</div>)}</div>{weeks.map((week, weekIndex) => <div key={weekIndex} className="sd-cal-row">{Array.from({ length: 7 }, (_, index) => { const date = week[index]; return date ? <button type="button" key={date} className={`sd-cal-cell sd-day ${selectedDates.has(date) ? "sd-day--selected" : ""}`} onClick={() => toggleDate(date)} disabled={saving}>{parse(date).getDate()}</button> : <span key={index} className="sd-cal-cell" />; })}</div>)}</div>
        <p className="sd-hint">{selectedDates.size} date(s) sélectionnée(s). Les créneaux seront créés pour chaque date.</p>
        <div className="sd-config-card"><div className="sd-section-heading"><span>Heures:</span><button type="button" className="sd-link-button" onClick={addSlot} disabled={saving}>+ Ajouter</button></div><div className="sd-slots">{slots.map((slot, index) => <div className="sd-slot-row" key={slot.id}><span className="sd-slot-number">{index + 1}</span><input className="sd-control" type="time" value={slot.start_at} onChange={(e) => updateSlot(slot.id, "start_at", e.target.value)} disabled={saving} /><span>→</span><input className="sd-control" type="time" value={slot.end_at} onChange={(e) => updateSlot(slot.id, "end_at", e.target.value)} disabled={saving} /><button type="button" className="sd-remove-slot" onClick={() => removeSlot(slot.id)} disabled={saving || slots.length === 1} aria-label="Supprimer ce créneau">×</button></div>)}</div></div>
        <label className="sd-field sd-field--col"><span className="sd-label">Commentaire pour l’admin:</span><textarea className="sd-textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ajouter un commentaire pour l’admin (optionnel)" disabled={saving} /></label>
        {error && <p className="sd-error" role="alert">{error}</p>}
        <button type="button" className="sd-submit" onClick={submit} disabled={saving}>{saving ? "Enregistrement…" : `Créer ${selectedDates.size * slots.length} disponibilité(s)`}</button>
      </div>
    </aside>
  </>;
}
