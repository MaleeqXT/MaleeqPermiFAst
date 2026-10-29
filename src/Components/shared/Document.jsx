import { useCallback, useEffect, useMemo, useState } from "react";
import "./Document.css";
import http from "../../helpers/http";
import { apiAssetUrl } from "../../config/api.js";

const money = (value) => new Intl.NumberFormat("fr-FR", { style:"currency", currency:"EUR" }).format(Number(value ?? 0));
const date = (value) => value ? new Intl.DateTimeFormat("fr-FR", { dateStyle:"medium" }).format(new Date(value)) : "—";
const PdfIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><path d="M8 15h8M8 18h5"/></svg>;

export default function Document({ monitorId }) {
  const [status, setStatus] = useState("1");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!monitorId) return;
    setLoading(true); setError("");
    try {
      const { data } = await http.get(`/admin/users/monitors/${monitorId}/factures`, { params:{ status } });
      setInvoices(data.invoices?.data ?? data.invoices ?? []);
    } catch { setError("Impossible de charger les factures."); }
    finally { setLoading(false); }
  }, [monitorId, status]);
  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => invoices.map((invoice) => ({
    ...invoice,
    // Laravel billing stores the worked, billable hours as num_heures_f.
    hours: invoice.details?.num_heures_f ?? invoice.details?.num_heures ?? invoice.num_heures ?? 0,
    total: invoice.details?.total ?? invoice.total ?? 0,
  })), [invoices]);
  const download = async (invoice) => {
    try {
      const response = await http.get(apiAssetUrl(`download/monitor/invoices/${invoice.id}`), { responseType:"blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type:"application/pdf" }));
      const link = document.createElement("a"); link.href = url; link.download = `facture-${invoice.num_facture ?? invoice.id}.pdf`; link.click(); URL.revokeObjectURL(url);
    } catch { setError("Impossible de télécharger cette facture."); }
  };
  return <div className="inv-page">
    <div className="inv-pill-tabs"><button type="button" className={`inv-pill-tab${status === "1" ? " inv-pill-tab--active" : ""}`} onClick={() => setStatus("1")}>Actif</button><button type="button" className={`inv-pill-tab${status === "0" ? " inv-pill-tab--active" : ""}`} onClick={() => setStatus("0")}>Archivé</button></div>
    {error && <p style={{ color:"#dc2626" }}>{error}</p>}
    <div className="inv-card"><div className="inv-table-wrap"><table className="inv-table"><thead><tr><th>Mois</th><th>Numéro</th><th>Heures travaillées</th><th>Total</th><th>Date de paiement</th><th>Statut</th><th>Facture</th></tr></thead><tbody>
      {loading ? <tr><td colSpan="7" className="inv-empty">Chargement…</td></tr> : !rows.length ? <tr><td colSpan="7" className="inv-empty">Aucune facture trouvée</td></tr> : rows.map((invoice) => <tr key={invoice.id}><td>{date(invoice.created_at)}</td><td><b>{invoice.num_facture ?? "—"}</b></td><td>{invoice.hours} h</td><td>{money(invoice.total)}</td><td>{date(invoice.date_paiement)}</td><td><span className="inv-muted">{invoice.date_paiement ? "Payée" : "En attente"}</span></td><td><button type="button" className="inv-page-btn" title="Télécharger la facture" aria-label={`Télécharger la facture ${invoice.num_facture ?? ""}`} onClick={() => download(invoice)}><PdfIcon /></button></td></tr>)}
    </tbody></table></div></div>
  </div>;
}
