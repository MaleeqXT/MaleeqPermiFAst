import { useEffect, useMemo, useState } from "react";
import http from "../helpers/http.jsx";
import { openProtectedDocument } from "../helpers/openProtectedDocument.js";
import "./InvoicesPage.css";

const IconArrowLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconReport = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/></svg>;
const currency = (value) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(value || 0));
const dateText = (value, options = { dateStyle: "long" }) => value ? new Intl.DateTimeFormat("fr-FR", options).format(new Date(`${String(value).slice(0, 10)}T12:00:00`)) : "—";
const hours = (value) => `${Number(value || 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} h`;

function normalizeInvoice(invoice) {
  const details = invoice?.details || {};
  return {
    ...invoice,
    id: invoice?.id,
    month: dateText(invoice?.from, { month: "long", year: "numeric" }),
    total: currency(details.total ?? invoice?.montant),
    invoiceNumber: invoice?.num_facture || "Facture",
    period: `${dateText(invoice?.from)} au ${dateText(invoice?.to)}`,
    facturable: hours(details.num_heures_f),
    nonFacturable: hours(details.num_heures_nf),
    totalDue: currency(details.total ?? invoice?.montant),
    pricePerHour: currency(details.prix_heure),
    paymentDate: dateText(invoice?.date_paiement),
    paymentStatus: invoice?.status ? "Payée" : "En attente",
  };
}

function reservationRows(payload) {
  const grouped = payload?.data ?? payload ?? {};
  const groups = Array.isArray(grouped) ? grouped : Object.values(grouped);
  return groups.flatMap((group) => Array.isArray(group) ? group : []);
}

function ReportDrawer({ invoice, onClose }) {
  const [tab, setTab] = useState("Facturable");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const params = tab === "Facturable" ? { is_facturable: 1 } : { is_not_facturable: 1 };
    http.get(`/monitor/invoices/${invoice.id}`, { params })
      .then((response) => { if (active) setRows(reservationRows(response.data)); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Impossible de charger le rapport des heures."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [invoice.id, tab]);

  const grouped = useMemo(() => rows.reduce((result, row) => {
    const key = row?.date || "Date non renseignée";
    (result[key] ||= []).push(row);
    return result;
  }, {}), [rows]);

  return <><div className="inv-overlay" onClick={onClose} /><aside className="inv-drawer">
    <div className="inv-drawer-header"><button className="inv-drawer-close" onClick={onClose}>Fermer</button><span className="inv-drawer-title">Rapport des heures</span><span style={{ width: 48 }} /></div>
    <div className="inv-tabs">{["Facturable", "Non Facturable"].map((item) => <button key={item} className={`inv-tab${tab === item ? " inv-tab--active" : ""}`} onClick={() => setTab(item)}>{item}</button>)}</div>
    <div className="inv-drawer-body">{loading ? <p className="inv-report-empty">Chargement…</p> : error ? <p className="inv-report-empty">{error}</p> : Object.keys(grouped).length === 0 ? <p className="inv-report-empty">Aucune séance pour cette période.</p> : Object.entries(grouped).map(([date, items]) => <div key={date} className="inv-report-group"><div className="inv-report-date"><span className="inv-report-dot" />{dateText(date, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</div><div className="inv-report-items">{items.map((item) => {
      const student = item?.training?.student?.user || {};
      const candidate = student.name || [student.first_name, student.last_name].filter(Boolean).join(" ") || "Candidat";
      const lieu = item?.lieu?.name || "Lieu non renseigné";
      const range = `${String(item?.start_at || "").slice(0, 5)} - ${String(item?.end_at || "").slice(0, 5)}`;
      return <div key={item.id} className="inv-report-item"><div className="inv-report-item-top"><span className="inv-report-location">{lieu}</span><span className="inv-report-time">{range}</span></div><div className="inv-report-row"><div className="inv-report-avatar">{candidate.slice(0, 2).toUpperCase()}</div><div className="inv-report-desc"><span>{hours(item?.hour)} avec {candidate}</span>{item?.review_monitor?.comment && <span className="inv-report-note">{item.review_monitor.comment}</span>}</div></div></div>;
    })}</div></div>)}</div>
  </aside></>;
}

function InvoiceDetail({ invoice, onBack }) {
  const [showReport, setShowReport] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const download = async () => {
    setDownloadError("");
    try { await openProtectedDocument(`/download/monitor/invoices/${invoice.id}`); }
    catch { setDownloadError("Impossible de télécharger cette facture."); }
  };
  return <div className="inv-page"><header className="inv-header"><button className="inv-back-btn inv-back-btn--with-label" onClick={onBack} aria-label="Retour"><IconArrowLeft /></button><div className="inv-header-info"><span className="inv-header-id">{invoice.invoiceNumber}</span><span className="inv-header-period">{invoice.period}</span></div><button className="inv-report-btn" onClick={() => setShowReport(true)} title="Rapport des heures"><IconReport /></button></header>
    <main className="inv-main"><p className="inv-month-title">Mois : {invoice.month}</p><div className="inv-company-card"><div className="inv-company-icon">€</div><div className="inv-company-info"><span className="inv-company-name">SAS PASSPERMISFACILE, Nº SIREN : 979 143 294</span><span className="inv-company-addr">139 boulevard Déodat de Séverac, 31300 TOULOUSE</span></div></div>
      <div className="inv-summary-card"><div className="inv-summary-col"><span className="inv-summary-label">Facturable</span><span className="inv-summary-value">{invoice.facturable}</span></div><div className="inv-summary-divider" /><div className="inv-summary-col"><span className="inv-summary-label">Non facturable</span><span className="inv-summary-value">{invoice.nonFacturable}</span></div><div className="inv-summary-divider" /><div className="inv-summary-col inv-summary-col--right"><span className="inv-summary-label">Total dû</span><span className="inv-summary-value">{invoice.totalDue}</span></div></div>
      <div className="inv-details-section"><p className="inv-details-title">Détails</p><div className="inv-detail-list">{[["Prix par heure", invoice.pricePerHour], ["Date de paiement", invoice.paymentDate], ["Facture (EUR)", invoice.total], ["Statut de paiement", invoice.paymentStatus]].map(([label, value]) => <div key={label} className="inv-detail-row"><span className="inv-detail-label">{label}</span><span className="inv-detail-value">{label === "Statut de paiement" ? <span className={`inv-status-badge inv-status-badge--${invoice.status ? "paid" : "pending"}`}>{value}</span> : value}</span></div>)}</div></div>
      <div className="inv-terms"><p className="inv-terms-title">Conditions générales</p><p className="inv-terms-body">Le paiement est dû dans les 30 jours suivant la date de facture.</p></div><button className="inv-download-btn" onClick={download}><IconDownload /> Télécharger ma facture</button>{downloadError && <p className="inv-report-empty">{downloadError}</p>}
    </main>{showReport && <ReportDrawer invoice={invoice} onClose={() => setShowReport(false)} />}</div>;
}

export default function InvoicesPage({ onBack }) {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    http.get("/monitor/invoices", { params: { per_page: 100, status: "all" } })
      .then((response) => { const list = response.data?.data ?? []; if (active) setInvoices(Array.isArray(list) ? list.map(normalizeInvoice) : []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Impossible de charger vos factures."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  if (selected) return <InvoiceDetail invoice={selected} onBack={() => setSelected(null)} />;
  return <div className="inv-page"><header className="inv-header"><button className="inv-back-btn inv-back-btn--with-label" onClick={onBack} aria-label="Retour"><IconArrowLeft /></button><div className="inv-header-info"><span className="inv-header-id">Factures</span><span className="inv-header-period">Liste des factures</span></div></header><main className="inv-main">{loading ? <p className="inv-report-empty">Chargement des factures…</p> : error ? <p className="inv-report-empty">{error}</p> : invoices.length === 0 ? <p className="inv-report-empty">Aucune facture pour le moment.</p> : invoices.map((invoice) => <button key={invoice.id} className="inv-month-card" onClick={() => setSelected(invoice)}><div className="inv-month-card-header"><span className="inv-month-card-month">{invoice.month}</span><span className="inv-month-card-total">{invoice.total}</span></div><div className="inv-month-card-body"><div className="inv-month-card-id">{invoice.invoiceNumber}</div><div className="inv-month-card-label">{invoice.period}</div><div className="inv-month-card-rows"><div className="inv-month-card-row"><span>Heures facturables :</span><span className="inv-month-card-row-val">{invoice.facturable}</span></div><div className="inv-month-card-row"><span>Heures non facturables :</span><span className="inv-month-card-row-val">{invoice.nonFacturable}</span></div><div className="inv-month-card-row"><span>Total :</span><span className="inv-month-card-row-val">{invoice.total}</span></div></div></div></button>)}</main></div>;
}
