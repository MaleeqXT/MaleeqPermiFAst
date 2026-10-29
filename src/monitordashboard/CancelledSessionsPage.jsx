import { useEffect, useMemo, useState } from "react";
import http from "../helpers/http.jsx";
import "./CancelledSessionsPage.css";
import BookingDrawer from "./BookingDrawer.jsx";

const IconArrowLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
const TABS = [{ id: "all", label: "Toutes" }, { id: "justified", label: "Justifiées" }, { id: "unjustified", label: "Non justifiées" }];
const nameOf = (user) => user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Candidat";
const dateText = (value) => value ? new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${String(value).slice(0, 10)}T12:00:00`)) : "Date non renseignée";
const timeText = (reservation) => {
  const start = reservation?.start_at || reservation?.start || reservation?.hour_start;
  const end = reservation?.end_at || reservation?.end || reservation?.hour_end;
  if (start && end) return `${String(start).slice(0, 5)} à ${String(end).slice(0, 5)}`;
  return start ? String(start).slice(0, 5) : (reservation?.hour ? `${reservation.hour} h` : "Heure non renseignée");
};

function mapCancellation(cancellation) {
  const training = cancellation?.training || {};
  const reservation = training?.reservation || cancellation?.reservation || {};
  const student = training?.student || {};
  const user = student?.user || {};
  const lieu = reservation?.lieu || {};
  const justified = cancellation?.is_justified === true || Number(cancellation?.is_justified) === 1;
  const bannerText = justified ? "L’annulation est justifiée." : "L’annulation n’est pas justifiée.";
  return {
    id: cancellation?.id,
    statusType: justified ? "justified" : "unjustified",
    bannerText,
    bannerColor: justified ? "#2a7d4f" : "#e07b00",
    booking: {
      id: reservation?.id || cancellation?.reservation_id || cancellation?.id,
      reservationId: reservation?.id,
      trainingId: training?.id,
      studentId: student?.id || training?.student_id,
      status: "cancelled",
      date: dateText(reservation?.date || training?.date || cancellation?.created_at),
      timeLabel: timeText(reservation),
      reminder: "",
      mapLocation: lieu?.name ? `${lieu.name}${lieu?.zone?.name ? `, ${lieu.zone.name}` : ""}` : "Lieu non renseigné",
      contextLabel: "Candidat",
      candidate: nameOf(user),
      candidateAvatar: user?.media || "",
      email: user?.email || "",
      phone: user?.phone || "",
      offer: training?.offer?.name || "Offre non renseignée",
      offerColor: training?.offer?.color || null,
      cancellationReason: cancellation?.reason || cancellation?.message || cancellation?.motif || "",
      displayStatus: bannerText,
      place: lieu?.name || "Lieu non renseigné",
      sourceCancellation: cancellation,
    },
  };
}

export default function CancelledSessionsPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("all");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    http.get("/monitor/cancellations", { params: { per_page: 100 } })
      .then((response) => {
        const records = response.data?.data ?? response.data?.cancellations?.data ?? response.data?.cancellations ?? [];
        if (active) setEntries(Array.isArray(records) ? records.map(mapCancellation) : []);
      })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Impossible de charger vos séances annulées."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredEntries = useMemo(() => activeTab === "all" ? entries : entries.filter((entry) => entry.statusType === activeTab), [activeTab, entries]);
  return <div className="cs-page">
    <header className="cs-header"><button className="cs-back-btn" onClick={onBack} aria-label="Retour"><IconArrowLeft /></button><div className="cs-header-info"><span className="cs-header-title">Mes séances annulées</span><span className="cs-header-sub">Suivez les annulations demandées et validées</span></div></header>
    <div className="cs-tabs-wrap"><div className="cs-tabs">{TABS.map((tab) => <button key={tab.id} type="button" className={`cs-tab ${activeTab === tab.id ? "cs-tab--active" : ""}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</div></div>
    <main className="cs-main">
      {loading ? <div className="cs-empty">Chargement des séances annulées…</div> : error ? <div className="cs-empty">{error}</div> : <>
        <span className="cs-count">{filteredEntries.length} séance{filteredEntries.length > 1 ? "s" : ""}</span>
        {filteredEntries.length === 0 ? <div className="cs-empty">Aucune séance annulée pour ce statut.</div> : <div className="cs-timeline">{filteredEntries.map((entry, index) => <div key={entry.id} className="cs-entry" style={{ "--i": index }}>
          <div className="cs-entry-meta"><span className="cs-entry-date">{entry.booking.date}</span><span className="cs-entry-time">{entry.booking.timeLabel}</span></div>
          <div className="cs-entry-body"><div className="cs-dot-col" aria-hidden="true"><span className="cs-dot" style={{ background: entry.bannerColor }} />{index < filteredEntries.length - 1 && <span className="cs-line" />}</div><button type="button" className="cs-card cs-card-button" onClick={() => setSelectedBooking(entry.booking)}><div className="cs-card-banner" style={{ background: entry.bannerColor }}>{entry.bannerText}</div><div className="cs-card-body"><div className="cs-card-field"><span className="cs-field-label">Candidat</span><span className="cs-field-value">{entry.booking.candidate}</span></div><div className="cs-card-divider" /><div className="cs-card-field"><span className="cs-field-label">Lieu</span><span className="cs-field-value">{entry.booking.place}</span></div><div className="cs-card-divider" /><div className="cs-card-field"><span className="cs-field-label">Offre</span><span className="cs-field-value">{entry.booking.offer}</span></div></div></button></div>
        </div>)}</div>}
      </>}
    </main>
    {selectedBooking && <BookingDrawer booking={selectedBooking} onClose={() => setSelectedBooking(null)} primaryActionLabel="Appel immédiat" />}
  </div>;
}
