

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MonitorsModal from "../../sessions/MonitorsModal.jsx";
import { useMonitors } from "../monitors/MonitorsContext.jsx";
import http from "../../helpers/http.jsx";
import "./Propositions.css";

const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
const IconClock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IconPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IconMsg = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IconQuestion = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>;

const STATUS_TABS = ["Tous", "En attente", "Refusé", "Réservé"];
const STATUS_META = {
  "on-hold": { label: "En attente", pill: "pill--hold" },
  denied:    { label: "Refusé",     pill: "pill--denied" },
  reserve:   { label: "Réservé",    pill: "pill--reserve" },
};

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const formatDate = (value, options = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) => {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("fr-FR", options).format(date);
};

const relativeTime = (value) => {
  if (!value) return "";
  const diffHours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3600000));
  if (diffHours < 1) return "À l'instant";
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  const days = Math.floor(diffHours / 24);
  return days === 1 ? "Hier" : `Il y a ${days} jours`;
};

function normaliseProposals(payload) {
  const grouped = payload && !Array.isArray(payload) && typeof payload === "object" ? Object.values(payload) : [payload];
  const rows = grouped.flatMap((group) => Array.isArray(group) ? group : []);

  const proposalsBySlot = new Map();
  rows.forEach((proposal) => {
    const key = `${proposal.reservation_id ?? proposal.reservation?.id ?? ""}:${proposal.student_id ?? proposal.student?.id ?? ""}`;
    const existing = proposalsBySlot.get(key);
    if (!existing || new Date(proposal.created_at || 0) > new Date(existing.created_at || 0)) {
      proposalsBySlot.set(key, proposal);
    }
  });

  return [...proposalsBySlot.values()].map((proposal) => {
    const reservation = proposal.reservation ?? {};
    const monitor = reservation.monitor?.user ?? {};
    const student = proposal.student?.user ?? {};
    const monitorName = monitor.name || "Moniteur non attribué";
    const candidateName = student.name || "Candidat non attribué";
    const status = Number(proposal.status) === 3 ? "reserve" : Number(proposal.status) === 2 ? "denied" : "on-hold";
    const location = [reservation.lieu?.name, reservation.lieu?.zone?.name].filter(Boolean).join(", ") || "Lieu non défini";
    const requiredMinutes = Number(reservation.duration_minutes ?? Number(reservation.hour || 0) * 60);
    const products = (proposal.student?.wallets ?? []).map((wallet) => {
      const balanceMinutes = Number(wallet.balance_minutes ?? Number(wallet.balance || 0) * 60);
      return {
        id: wallet.offer_id,
        name: wallet.offer?.name || "Forfait sans nom",
        balanceMinutes,
        available: balanceMinutes >= requiredMinutes,
        selected: String(reservation.training?.offer_id ?? "") === String(wallet.offer_id),
      };
    });

    return {
      id: proposal.id,
      monitorId: reservation.monitor_id ?? reservation.monitor?.id ?? null,
      date: formatDate(reservation.date),
      timeFrom: String(reservation.start_at ?? "").slice(0, 5) || "—",
      timeTo: String(reservation.end_at ?? "").slice(0, 5) || "—",
      monitor: monitorName,
      monitorInitials: getInitials(monitorName),
      candidate: candidateName,
      candidateInitials: getInitials(candidateName),
      location,
      ago: relativeTime(proposal.created_at),
      status,
      validation: status === "reserve" ? "Cette proposition est réservée." : status === "denied" ? "Cette proposition a été refusée." : "Cette proposition est en attente de validation.",
      comment: proposal.comment ?? "",
      proposalDate: formatDate(proposal.created_at, { day: "numeric", month: "long", year: "numeric" }),
      dateReservation: formatDate(reservation.date, { day: "numeric", month: "long", year: "numeric" }),
      products,
    };
  });
}

function ProposalDrawer({ proposal, onClose, onSave }) {
  const drawerTabs = ["En attente", "Refusé", "Réservé"];
  const [tab, setTab] = useState(STATUS_META[proposal.status]?.label || "En attente");
  const [comment, setComment] = useState(proposal.comment || "");
  const [offerId, setOfferId] = useState(() => proposal.products.find((product) => product.selected)?.id ?? proposal.products.find((product) => product.available)?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const selectedOffer = proposal.products.find((product) => String(product.id) === String(offerId));
  const isReserve = tab === "Réservé";
  const isDirty = comment !== (proposal.comment || "") || tab !== (STATUS_META[proposal.status]?.label || "En attente") || (isReserve && String(offerId) !== String(proposal.products.find((product) => product.selected)?.id ?? ""));

  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await onSave({ id: proposal.id, comment, tab, offerId: isReserve ? offerId : null });
      onClose();
    } catch (error) {
      setSaveError(error.response?.data?.message || error.message || "Impossible d’enregistrer la proposition.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="prop-overlay" onClick={onClose} />
      <aside className="prop-drawer">
        <div className="prop-drawer-header">
          <button className="prop-drawer-close" onClick={onClose}>Fermer</button>
          <span className="prop-drawer-title">Détails de la proposition</span>
          <button className="prop-drawer-register" disabled={!isDirty || saving} onClick={save}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>

        <div className="prop-drawer-tabs-wrap">
          <div className="prop-drawer-tabs">
            {drawerTabs.map((item) => (
              <button
                key={item}
                className={`prop-drawer-tab${tab === item ? ` prop-drawer-tab--active prop-drawer-tab--${item.toLowerCase().replace(" ", "-")}` : ""}`}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="prop-drawer-body">
          <div className="prop-info-card">
            {[
              ["Date de la proposition", proposal.proposalDate],
              ["Date de réservation",    proposal.dateReservation],
              ["Horaire",                `${proposal.timeFrom} à ${proposal.timeTo}`],
              ["Lieu",                   proposal.location],
            ].map(([label, value]) => (
              <div key={label} className="prop-info-row">
                <span className="prop-info-label">{label}</span>
                <span className="prop-info-val">{value}</span>
              </div>
            ))}
          </div>

          <div className="prop-people-row">
            <div className="prop-person-card">
              <div className="prop-person-label">Candidat</div>
              <div className="prop-person-chip">
                <div className="prop-avatar prop-avatar--sm">{proposal.candidateInitials}</div>
                <span>{proposal.candidate}</span>
              </div>
            </div>
            <div className="prop-person-card">
              <div className="prop-person-label">Moniteur</div>
              <div className="prop-person-chip">
                <div className="prop-avatar prop-avatar--sm prop-avatar--dark">{proposal.monitorInitials}</div>
                <span>{proposal.monitor}</span>
              </div>
            </div>
          </div>

          {tab === "Réservé" && (
            <div className="prop-products">
              <p className="prop-products-title">Forfaits actifs du candidat</p>
              {proposal.products.length === 0 ? <p className="prop-products-empty">Aucun forfait actif n’est disponible pour ce candidat.</p> : <div className="prop-products-list">
                {proposal.products.map((product) => (
                  <button key={product.id} type="button" disabled={!product.available || saving} onClick={() => setOfferId(product.id)} className={`prop-product-row prop-product-choice${String(offerId) === String(product.id) ? " prop-product-choice--selected" : ""}`}>
                    <span className="prop-product-icon">Forfait</span>
                    <span className="prop-product-name">{product.name}<small>Solde : {Math.floor(product.balanceMinutes / 60)} h{product.balanceMinutes % 60 ? ` ${product.balanceMinutes % 60} min` : ""}</small></span>
                    <span className={`prop-product-avail${product.available ? " prop-product-avail--yes" : ""}`}>
                      {product.available ? "Disponible" : "Solde insuffisant"}
                    </span>
                  </button>
                ))}
              </div>}
            </div>
          )}

          <div className="prop-comment-section">
            <p className="prop-comment-title">Commentaire</p>
            {proposal.comment && <p className="prop-comment-old">Précédent : {proposal.comment}</p>}
            <textarea
              className="prop-comment-input"
              placeholder="Ajouter un commentaire..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
        </div>

        <div className="prop-drawer-footer">
          {saveError && <p className="prop-save-error" role="alert">{saveError}</p>}
          <button
            className={`prop-apply-btn${isDirty ? " prop-apply-btn--active" : ""}`}
            disabled={!isDirty || saving || (isReserve && (!selectedOffer || !selectedOffer.available))}
            onClick={save}
          >
            {saving ? "Enregistrement…" : "Appliquer la modification"}
          </button>
        </div>
      </aside>
    </>
  );
}

export default function ProposalsPage() {
  const { monitors, AVATAR_COLORS } = useMonitors();
  const selectedZoneId = useSelector((state) => state.schools.selected?.id ?? null);
  const [proposals, setProposals]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState("");
  const [activeTab, setActiveTab]       = useState("Tous");
  const [searchQ,   setSearchQ]         = useState("");
  const [selected,  setSelected]        = useState(null);
  const [monitorModalOpen, setMonitorModalOpen] = useState(false);
  const [selectedMonitors, setSelectedMonitors] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");

    http.get("/admin/proposals", { params: selectedZoneId ? { zone_id: selectedZoneId } : undefined })
      .then(({ data }) => {
        if (active) setProposals(normaliseProposals(data?.data));
      })
      .catch(() => {
        if (active) setLoadError("Impossible de charger les propositions pour le moment.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [selectedZoneId]);

  const counts = {
    Tous:         proposals.length,
    "En attente": proposals.filter((p) => p.status === "on-hold").length,
    Refusé:       proposals.filter((p) => p.status === "denied").length,
    Réservé:      proposals.filter((p) => p.status === "reserve").length,
  };

  const monitorOptions = monitors.map((monitor) => {
    const fullName = `${monitor.prenom} ${monitor.nom}`.trim();
    return {
      id:       monitor.id,
      name:     fullName,
      initials: getInitials(fullName),
      color:    AVATAR_COLORS[monitor.id % AVATAR_COLORS.length],
      text:     "#111827",
    };
  });

  let filtered = proposals;
  if (activeTab !== "Tous") {
    filtered = filtered.filter((p) => STATUS_META[p.status]?.label === activeTab);
  }
  if (selectedMonitors.length > 0) {
    const selectedIds = new Set(selectedMonitors.map((m) => String(m.id)));
    filtered = filtered.filter((p) => selectedIds.has(String(p.monitorId)));
  }
  if (searchQ) {
    const q = searchQ.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.candidate.toLowerCase().includes(q) ||
        p.monitor.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }

  const grouped = filtered.reduce((acc, p) => {
    acc[p.date] = acc[p.date] || [];
    acc[p.date].push(p);
    return acc;
  }, {});

  async function handleSave({ id, comment, tab, offerId }) {
    const status = tab === "En attente" ? 1 : tab === "Refusé" ? 2 : 3;
    await http.post(`/admin/proposals/${id}`, {
      status,
      comment,
      ...(status === 3 ? { offer_id: offerId } : {}),
    });

    const nextStatus = status === 1 ? "on-hold" : status === 2 ? "denied" : "reserve";
    setProposals((current) => current.map((proposal) => proposal.id === id
      ? {
          ...proposal,
          comment,
          status: nextStatus,
          validation: nextStatus === "reserve" ? "Cette proposition est réservée." : nextStatus === "denied" ? "Cette proposition a été refusée." : "Cette proposition est en attente de validation.",
          products: proposal.products.map((product) => ({ ...product, selected: String(product.id) === String(offerId) })),
        }
      : proposal));
  }

  return (
    <div className="prop-page">
      <div className="prop-top">
        <h1 className="prop-title">Liste des propositions</h1>
      </div>

      <div className="prop-toolbar">
        <div className="prop-search-box">
          <IconSearch />
          <input
            value={searchQ}
            onChange={(event) => setSearchQ(event.target.value)}
            placeholder="Rechercher..."
          />
        </div>
        <button type="button" className="prop-btn-outline" onClick={() => setMonitorModalOpen(true)}>
          {selectedMonitors.length > 0
            ? `Filtrés (${selectedMonitors.length})`
            : "Filtrer par moniteur"}
        </button>
      </div>

      <div className="prop-tabs-wrap">
        <div className="prop-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              className={`prop-tab${activeTab === tab ? " prop-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {counts[tab] > 0 && (
                <span className={`prop-tab-count${activeTab === tab ? " prop-tab-count--active" : ""}`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="prop-timeline">
        {loading && <p className="prop-empty">Chargement des propositions…</p>}
        {loadError && <p className="prop-empty">{loadError}</p>}
        {!loading && !loadError && Object.keys(grouped).length === 0 && (
          <p className="prop-empty">Aucune proposition dans cette catégorie.</p>
        )}
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="prop-group">
            <div className="prop-group-date">
              <span className="prop-date-dot" />
              <span className="prop-date-label">{date}</span>
            </div>
            <div className="prop-group-entries">
              <span className="prop-time-dot-wrap">
                <span className="prop-time-icon"><IconClock /></span>
                <span className="prop-vert-line" />
              </span>
              <div className="prop-entries-list">
                {items.map((proposal, index) => (
                  <button
                    key={proposal.id}
                    className="prop-entry"
                    onClick={() => setSelected(proposal)}
                    style={{ "--i": index }}
                  >
                    <div className="prop-entry-time">
                      <span className="prop-entry-time-from">{proposal.timeFrom}</span>
                      <span className="prop-entry-time-to">{proposal.timeTo}</span>
                    </div>

                    <div className="prop-entry-people">
                      <div className="prop-entry-person">
                        <div className="prop-avatar prop-avatar--dark">{proposal.monitorInitials}</div>
                        <span className="prop-entry-name">{proposal.monitor}</span>
                      </div>
                      <div className="prop-entry-person">
                        <div className="prop-avatar">{proposal.candidateInitials}</div>
                        <span className="prop-entry-name">{proposal.candidate}</span>
                      </div>
                    </div>

                    <div className="prop-entry-meta">
                      <span className="prop-entry-meta-item"><IconClock /> {proposal.ago}</span>
                      <span className="prop-entry-meta-item">
                        <IconPin />{" "}
                        {proposal.location.length > 28
                          ? `${proposal.location.slice(0, 28)}…`
                          : proposal.location}
                      </span>
                    </div>

                    <div className="prop-entry-right">
                      <span className="prop-entry-meta-item"><IconQuestion /> {proposal.validation}</span>
                      {proposal.comment && (
                        <span className="prop-entry-meta-item"><IconMsg /> {proposal.comment}</span>
                      )}
                      <span className={`prop-status-pill ${STATUS_META[proposal.status]?.pill}`}>
                        {STATUS_META[proposal.status]?.label}
                      </span>
                    </div>

                    {proposal.status === "on-hold" && <div className="prop-stripe-overlay" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ProposalDrawer
          proposal={proposals.find((p) => p.id === selected.id)}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}

      {monitorModalOpen && (
        <MonitorsModal
          title="Filtrer par moniteur"
          monitors={monitorOptions}
          selected={selectedMonitors}
          onSave={setSelectedMonitors}
          onClose={() => setMonitorModalOpen(false)}
        />
      )}
    </div>
  );
}
