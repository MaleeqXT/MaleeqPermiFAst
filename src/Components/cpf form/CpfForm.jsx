import { useState, useRef, useEffect } from "react";
import http from "../../helpers/http.jsx";
import "./CpfForm.css";
import CpfDrawer from "./CpfDrawer";

// ── Icons ─────────────────────────────────────────────────────────────────
const IconDots  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const IconEdit  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconSend  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
const IconCert  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
const IconChevL = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconChevR = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IconInfo  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>;

// ── Exact SVGs provided by user ───────────────────────────────────────────
const IconUploadGreen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="cpf-upload-icon cpf-upload-icon--green">
    <path fill="currentColor" d="M13.496 5.354a.5.5 0 0 0 0-.707l-1.06-1.061a.5.5 0 0 0-.707 0l-.957.957 1.767 1.768.957-.957Z"/>
    <path fill="currentColor" d="m11.832 7.018-1.768-1.768-2.449 2.45a2 2 0 0 0-.585 1.406l-.003.698a.25.25 0 0 0 .251.251l.698-.002a2 2 0 0 0 1.407-.586l2.45-2.45Z"/>
    <path fill="currentColor" d="M4.25 9.25c0-.69.56-1.25 1.25-1.25h.25a.75.75 0 1 0 0-1.5h-.25a2.75 2.75 0 0 0-2.75 2.75v4a2.75 2.75 0 0 0 2.75 2.75h9a2.75 2.75 0 0 0 2.75-2.75v-4.25a2.5 2.5 0 0 0-2.5-2.5.75.75 0 0 0 0 1.5 1 1 0 0 1 1 1v4.25c0 .69-.56 1.25-1.25 1.25h-9c-.69 0-1.25-.56-1.25-1.25v-4Z"/>
    <path fill="currentColor" d="M6.5 11.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z"/>
    <path fill="currentColor" d="M12.25 12.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z"/>
  </svg>
);

const IconUploadRed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="cpf-upload-icon cpf-upload-icon--red">
    <path fill="currentColor" d="M13.496 5.354a.5.5 0 0 0 0-.707l-1.06-1.061a.5.5 0 0 0-.707 0l-.957.957 1.767 1.768.957-.957Z"/>
    <path fill="currentColor" d="m11.832 7.018-1.768-1.768-2.449 2.45a2 2 0 0 0-.585 1.406l-.003.698a.25.25 0 0 0 .251.251l.698-.002a2 2 0 0 0 1.407-.586l2.45-2.45Z"/>
    <path fill="currentColor" d="M4.25 9.25c0-.69.56-1.25 1.25-1.25h.25a.75.75 0 1 0 0-1.5h-.25a2.75 2.75 0 0 0-2.75 2.75v4a2.75 2.75 0 0 0 2.75 2.75h9a2.75 2.75 0 0 0 2.75-2.75v-4.25a2.5 2.5 0 0 0-2.5-2.5.75.75 0 0 0 0 1.5 1 1 0 0 1 1 1v4.25c0 .69-.56 1.25-1.25 1.25h-9c-.69 0-1.25-.56-1.25-1.25v-4Z"/>
    <path fill="currentColor" d="M6.5 11.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z"/>
    <path fill="currentColor" d="M12.25 12.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z"/>
  </svg>
);

// ── Sort Arrows — identical pattern to Candidates ─────────────────────────
function SortArrows({ sortKey, colKey, onSort }) {
  const isActive = sortKey?.key === colKey;
  const dir = sortKey?.dir;
  return (
    <button className="cpf-sort-btn" onClick={() => onSort(colKey)}>
      <svg width="10" height="7" viewBox="0 0 10 7" fill="none"
        stroke={isActive && dir === 1 ? "#111827" : "#d1d5db"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6 L5 1 L9 6"/>
      </svg>
      <svg width="10" height="7" viewBox="0 0 10 7" fill="none"
        stroke={isActive && dir === -1 ? "#111827" : "#d1d5db"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 1 L5 6 L9 1"/>
      </svg>
    </button>
  );
}

const PAGE_SIZE = 15;

function DocumentIconButton({ available, url, label }) {
  if (!available) return <IconUploadRed />;

  return (
    <button
      type="button"
      className="cpf-document-link"
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      aria-label={label}
      title={label}
    >
      <IconUploadGreen />
    </button>
  );
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const months = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
  return `${String(d.getDate()).padStart(2,"0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function cpfDocumentUrl(type, cpfId) {
  if (!cpfId) return "";
  const baseUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, "");
  const paths = {
    posTest: `/admin/forms-cpf/test-positionnement/${cpfId}`,
    contactForm: `/admin/forms-cpf/contact-formation/${cpfId}/pdf`,
    attestation: `/admin/forms-cpf/attestation-honneur/${cpfId}/pdf`,
    reservations: `/admin/forms-cpf/reservations/${cpfId}/pdf`,
  };
  return paths[type] ? `${baseUrl}${paths[type]}` : "";
}

function mapCpfRecord(cpf) {
  const test = cpf.test_pro ?? {};
  const rawReservations = Array.isArray(cpf.reservations) ? cpf.reservations : [];
  const boxType = cpf.boite?.value ?? cpf.boite?.type ?? cpf.boite?.id ?? "";

  return {
    id: cpf.id,
    cpfId: cpf.id,
    name: test.name || "Demande CPF",
    offer: cpf.offre || "",
    startDate: cpf.created_at,
    posTest: Boolean(cpf.test_pro),
    contactForm: Boolean(cpf.offre || boxType),
    attestation: Boolean(cpf.attestation_honneur),
    reservations: rawReservations.length > 0,
    cpfNumber: cpf.numero_cpf || "",
    boxType,
    reservationList: rawReservations.map((reservation, index) => ({
      id: `${cpf.id}-${index}`,
      date: reservation.date || "",
      duration: reservation.duration ?? reservation.houre ?? "",
      startTime: reservation.startTime ?? reservation.start_at ?? "",
      endTime: reservation.endTime ?? reservation.end_at ?? "",
    })),
  };
}

// ── Toast ─────────────────────────────────────────────────────────────────
function InlineToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="cpf-toast">
      <div className="cpf-toast-top">
        <IconInfo /> Succès <button className="cpf-toast-close" onClick={onClose}>✕</button>
      </div>
      <div className="cpf-toast-bottom">{message}</div>
    </div>
  );
}

// ── 3-dot Row Menu ────────────────────────────────────────────────────────
function RowMenu({ onModifier, onSendDocs, onCertificate }) {
  const [open,   setOpen]   = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);
  const ref        = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function handleOpen() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(o => !o);
  }

  return (
    <div className="cpf-row-menu-wrapper" ref={ref}>
      <button ref={triggerRef} className="cpf-row-menu-trigger" onClick={handleOpen}>
        <IconDots />
      </button>
      {open && (
        <div className="cpf-row-menu-dropdown" style={{ top: coords.top, right: coords.right, left: "auto" }}>
          <button className="cpf-row-menu-item" onClick={() => { setOpen(false); onModifier(); }}>
            <IconEdit /> Modifier
          </button>
          <button className="cpf-row-menu-item" onClick={() => { setOpen(false); onSendDocs(); }}>
            <IconSend /> Envoyer les documents
          </button>
          <button className="cpf-row-menu-item" onClick={() => { setOpen(false); onCertificate(); }}>
            <IconCert /> Attestation de fin de formation
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function FormCpf() {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [fetchError,setFetchError]= useState("");
  const [page,      setPage]      = useState(1);
  const [drawerRow, setDrawerRow] = useState(null);
  const [toast,     setToast]     = useState(null);
  const [sort,      setSort]      = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    http.get("/admin/forms-cpf")
      .then(({ data: response }) => {
        if (active) setData((response?.data ?? []).map(mapCpfRecord));
      })
      .catch(() => {
        if (active) setFetchError("Impossible de charger les demandes CPF.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  // ── Sort handler — identical to Candidates ────────────────────────────
  function handleSort(key) {
    setSort(prev => prev?.key === key ? { key, dir: prev.dir * -1 } : { key, dir: 1 });
    setPage(1);
  }

  // ── Apply sort ────────────────────────────────────────────────────────
  let sorted = [...data];
  if (sort) {
    sorted.sort((a, b) => {
      let av = a[sort.key];
      let bv = b[sort.key];
      if (typeof av === "boolean") {
        return (av === bv ? 0 : av ? -1 : 1) * sort.dir;
      }
      av = String(av ?? "").toLowerCase();
      bv = String(bv ?? "").toLowerCase();
      return (av < bv ? -1 : av > bv ? 1 : 0) * sort.dir;
    });
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const TOAST_MSG = "Votre formulaire a bien été mis à jour. Vous recevrez un e-mail contenant le lien de téléchargement de votre document CPF.";

  async function handleSave(updated) {
    const { data: response } = await http.put(`/admin/forms-cpf/${drawerRow.id}`, {
      numero_cpf: updated.cpfNumber,
      box_type: updated.boxType,
      offre: updated.offer,
      reservations: updated.reservationList,
    });
    const saved = mapCpfRecord(response.data);
    setData(prev => prev.map(row => row.id === saved.id ? saved : row));
    setDrawerRow(null);
    setToast(response.message || "Le formulaire CPF a été mis à jour.");
  }

  async function handleMenuAction(row, endpoint) {
    try {
      const { data: response } = await http.post(`/admin/forms-cpf/${row.id}/${endpoint}`);
      setToast(response.message || TOAST_MSG);
    } catch (error) {
      setFetchError(error.response?.data?.message || "Cette action CPF n’a pas pu être réalisée.");
    }
  }

  return (
    <div className="cpf-page">

      <div className="cpf-header">
        <h1 className="cpf-title">Formulaire CPF</h1>
      </div>

      {toast && <InlineToast message={toast} onClose={() => setToast(null)} />}

      {fetchError && <div className="cpf-toast"><div className="cpf-toast-bottom">{fetchError}</div></div>}

      <div className="cpf-table-card">
        <div className="cpf-table-scroll">
          <table className="cpf-table">
            <thead>
              <tr>
                <th>Nom <SortArrows sortKey={sort} colKey="name" onSort={handleSort} /></th>
                <th>Offre <SortArrows sortKey={sort} colKey="offer" onSort={handleSort} /></th>
                <th>Date de début <SortArrows sortKey={sort} colKey="startDate" onSort={handleSort} /></th>
                <th>Test de positionnement <SortArrows sortKey={sort} colKey="posTest" onSort={handleSort} /></th>
                <th>Fiche de contact <SortArrows sortKey={sort} colKey="contactForm" onSort={handleSort} /></th>
                <th>Attestation sur l'honneur <SortArrows sortKey={sort} colKey="attestation" onSort={handleSort} /></th>
                <th>Réservations <SortArrows sortKey={sort} colKey="reservations" onSort={handleSort} /></th>
                <th className="cpf-th-action"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="cpf-date-cell">Chargement des élèves CPF...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan="8" className="cpf-date-cell">Aucun élève CPF trouvé.</td></tr>
              ) : paginated.map(row => (
                <tr key={row.id}>
                  <td className="cpf-name-cell">{row.name}</td>
                  <td className="cpf-offer-cell">{row.offer}</td>
                  <td className="cpf-date-cell">{fmtDate(row.startDate)}</td>
                  <td className="cpf-icon-cell"><DocumentIconButton available={row.posTest} url={cpfDocumentUrl("posTest", row.cpfId)} label="Ouvrir le test de positionnement" /></td>
                  <td className="cpf-icon-cell"><DocumentIconButton available={row.contactForm} url={cpfDocumentUrl("contactForm", row.cpfId)} label="Ouvrir la fiche de contact formation" /></td>
                  <td className="cpf-icon-cell"><DocumentIconButton available={row.attestation} url={cpfDocumentUrl("attestation", row.cpfId)} label="Ouvrir l'attestation sur l'honneur" /></td>
                  <td className="cpf-icon-cell"><DocumentIconButton available={row.reservations} url={cpfDocumentUrl("reservations", row.cpfId)} label="Ouvrir les réservations" /></td>
                  <td className="cpf-actions-cell">
                    <RowMenu
                      onModifier={() => setDrawerRow(row)}
                      onSendDocs={() => handleMenuAction(row, "send-documents")}
                      onCertificate={() => handleMenuAction(row, "send-completion-certificate")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cpf-pagination">
          <button className="cpf-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <IconChevL />
          </button>
          <span className="cpf-page-info">
            {`${(page - 1) * PAGE_SIZE + 1} – ${Math.min(page * PAGE_SIZE, sorted.length)} sur ${sorted.length} élément${sorted.length > 1 ? "s" : ""}`}
          </span>
          <button className="cpf-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <IconChevR />
          </button>
        </div>
      </div>

      {drawerRow && (
        <CpfDrawer
          row={drawerRow}
          onSave={handleSave}
          onClose={() => setDrawerRow(null)}
        />
      )}
    </div>
  );
}
