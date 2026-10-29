import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../helpers/http.jsx";
import "./Tabbalance.css";

const PAGE_SIZE = 3;
const hours = (value) => `${Number(value ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} h`;

export default function TabBalance({ form, student, user }) {
  const navigate = useNavigate();
  const studentId = student?.id;
  const [balances, setBalances] = useState([]);
  const [zones, setZones] = useState(student?.zones ?? []);
  const [availableZones, setAvailableZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const candidateName = `${form?.first_name ?? user?.first_name ?? ""} ${form?.last_name ?? user?.last_name ?? ""}`.trim();

  const load = async () => {
    if (!studentId) return;
    setLoading(true); setError("");
    try {
      const [balanceResponse, zoneResponse] = await Promise.all([
        http.get(`/admin/users/students/${studentId}/zones`),
        http.get("/admin/locations/area"),
      ]);
      const balanceData = balanceResponse.data?.balances?.data ?? balanceResponse.data?.balances ?? [];
      const loadedUser = balanceResponse.data?.user;
      setBalances(Array.isArray(balanceData) ? balanceData : []);
      setZones(loadedUser?.student?.zones ?? student?.zones ?? []);
      const zoneData = zoneResponse.data?.data ?? zoneResponse.data ?? [];
      setAvailableZones(Array.isArray(zoneData) ? zoneData : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Impossible de charger le solde et les zones.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [studentId]);

  const freeZones = useMemo(() => availableZones.filter((zone) => !zones.some((assigned) => assigned.id === zone.id)), [availableZones, zones]);
  const visibleBalances = balances.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(balances.length / PAGE_SIZE));
  const totalBalance = balances.reduce((sum, wallet) => sum + Number(wallet.balance ?? wallet.total_balance ?? 0), 0);

  const attachZone = async () => {
    if (!selectedZoneId) return;
    setSaving(true); setError("");
    try {
      const response = await http.post(`/admin/locations/students/${studentId}/attach`, { zone_id: selectedZoneId });
      setZones(response.data?.student?.zones ?? zones);
      setSelectedZoneId("");
    } catch (requestError) { setError(requestError.response?.data?.message ?? "Impossible d’ajouter cette zone."); }
    finally { setSaving(false); }
  };
  const detachZone = async (zoneId) => {
    setSaving(true); setError("");
    try {
      const response = await http.post(`/admin/locations/students/${studentId}/detach`, { zone_id: zoneId });
      setZones(response.data?.student?.zones ?? zones.filter((zone) => zone.id !== zoneId));
    } catch (requestError) { setError(requestError.response?.data?.message ?? "Impossible de retirer cette zone."); }
    finally { setSaving(false); }
  };

  return <div className="tb-layout">
    <div className="tb-left"><div className="tb-table-card"><div className="tb-table-scroll"><table className="tb-table"><thead><tr><th>Offre</th><th>Tranche</th><th>Solde</th></tr></thead><tbody>
      {loading && <tr><td colSpan="3">Chargement…</td></tr>}
      {!loading && error && <tr><td colSpan="3">{error}</td></tr>}
      {!loading && !error && visibleBalances.length === 0 && <tr><td colSpan="3">Aucune offre attribuée.</td></tr>}
      {visibleBalances.map((wallet) => <tr key={wallet.id} className="tb-offer-row" onClick={() => navigate("/offersinfo", { state: { offer: wallet.offer } })}>
        <td><div className="tb-offer-cell"><div className="tb-offer-icon">🟢</div><span className="tb-offer-name">{wallet.offer?.name ?? "Offre"}</span></div></td>
        <td className="tb-tranche">{wallet.installments ?? wallet.offer?.multi_payment ?? wallet.multi_payment ?? 1}</td>
        <td className="tb-balance">{hours(wallet.balance ?? wallet.total_balance)}</td>
      </tr>)}
    </tbody></table></div>
      <div className="tb-pagination"><button className="tb-page-btn" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹</button><span className="tb-page-info">{balances.length ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, balances.length)} sur ${balances.length} élément${balances.length > 1 ? "s" : ""}` : "0 élément"}</span><button className="tb-page-btn" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>›</button></div>
    </div></div>
    <div className="tb-right"><div className="tb-zones-card">
      <label className="tb-zones-trigger">Zones<select value={selectedZoneId} onChange={(event) => setSelectedZoneId(event.target.value)}><option value="">Sélectionner une zone</option>{freeZones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></label>
      <div className="tb-student-summary"><p className="tb-zones-subtitle">Les zones disponibles pour <strong>{candidateName || "cet élève"}</strong></p><div className="tb-student-summary-row tb-student-summary-balance">{hours(student?.balance ?? totalBalance)} / {hours(totalBalance)}</div></div>
      <div className="tb-zones-list">{zones.length ? zones.map((zone) => <div key={zone.id} className="tb-zone-row"><span className="tb-zone-name">{zone.name}</span><button className="tb-zone-delete" disabled={saving} onClick={() => detachZone(zone.id)} title="Retirer la zone">×</button></div>) : <p className="tb-zones-none">Aucune zone sélectionnée</p>}</div>
      <button className="tb-new-area-btn" disabled={!selectedZoneId || saving} onClick={attachZone}>{saving ? "Enregistrement…" : "Nouvelle zone"}</button>
    </div></div>
  </div>;
}
