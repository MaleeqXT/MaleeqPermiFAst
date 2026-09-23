import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import http from "../helpers/http.jsx";
import StudentSidebar from "./StudentSidebar.jsx";
import StudentHeader from "./StudentHeader.jsx";
import "./CandidateDashboard.css";
import "./CandidateDocumentsPage.css";

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);
const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4M9 13h6M9 17h6" /></svg>
);
const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.7 2.7L16.5 9" /></svg>
);
const HourglassIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12M6 22h12M8 2v4a4 4 0 0 0 1.2 2.8L12 12l2.8-3.2A4 4 0 0 0 16 6V2M8 22v-4a4 4 0 0 1 1.2-2.8L12 12l2.8 3.2A4 4 0 0 1 16 18v4" /></svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const IdCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8" cy="11" r="2" /><path d="M5.5 16c.7-1.6 1.5-2.3 2.5-2.3s1.8.7 2.5 2.3M13 10h5M13 14h4" /></svg>
);
const MedicalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" /></svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H3zM21 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6z" /></svg>
);
const ExamDocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3.5h6V7H9zM8.5 12h7M8.5 16h4" /></svg>
);
const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 10 10-5 10 5-10 5Z" /><path d="M6 12.5V17c3 2.3 9 2.3 12 0v-4.5M22 10v6" /></svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" /></svg>
);
const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>
);
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
);
const UploadCloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16l-4-4-4 4M12 12v9" /><path d="M20.4 17.5A5 5 0 0 0 18 8.2 7 7 0 0 0 4.3 10.4 4.5 4.5 0 0 0 5.5 19H8" /></svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
);
const HeadsetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3a2 2 0 0 1 2 2v3H6a2 2 0 0 1-2-2zM20 14h-3a2 2 0 0 0-2 2v3h3a2 2 0 0 0 2-2zM15 19c0 1.1-.9 2-2 2h-1" /></svg>
);


const TABS = [
  { label: "Tous", category: null },
  { label: "Administratifs", category: "Administratif" },
  { label: "Pédagogiques", category: "Pédagogique" },
  { label: "Médicaux", category: "Médical" },
  { label: "Examens", category: "Examen" },
];

const DOCUMENT_ICONS = {
  file: <FileTextIcon />,
  identity: <IdCardIcon />,
  medical: <MedicalIcon />,
  book: <BookIcon />,
  exam: <ExamDocumentIcon />,
  graduation: <GraduationIcon />,
};

const ACCEPTED_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const ACCEPTED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function parseDate(value) {
  if (value === "—") return null;
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeCategory(category) {
  const value = String(category ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (["administratif", "administrative"].includes(value)) return "Administratif";
  if (["pedagogique", "pedagogical", "education"].includes(value)) return "Pédagogique";
  if (["medical", "medicale"].includes(value)) return "Médical";
  if (["examen", "exam", "examination"].includes(value)) return "Examen";
  return null;
}

function statusPresentation(status) {
  return ({ valid: ["À jour", "green"], pending: ["En attente", "amber"], expiring: ["Expirant bientôt", "amber"], expired: ["Expiré", "neutral"] })[status] ?? ["—", "neutral"];
}

function SummaryCard({ card }) {
  return (
    <article className="nsdoc-summary-card">
      <span className={`nsdoc-summary-icon nsdoc-tone-${card.tone}`}>{card.icon}</span>
      <div className="nsdoc-summary-copy"><span>{card.label}</span><strong>{card.value}</strong><small>{card.meta}</small></div>
    </article>
  );
}

function DocumentRow({ document, onDownload, onPreview, onInfo, onDelete, menuOpen, onToggleMenu }) {
  const [statusLabel, tone] = statusPresentation(document.status);
  return (
    <article className={`nsdoc-document-row${menuOpen ? " is-menu-open" : ""}`}>
      <div className="nsdoc-document-main">
        <div className="nsdoc-document-identity">
          <span className={`nsdoc-document-icon nsdoc-tone-${document.iconTone}`}>{DOCUMENT_ICONS[document.icon]}</span>
          <div><strong>{document.title}</strong><span>{document.category}<i aria-hidden="true">•</i>{document.type}</span></div>
        </div>
        <div className="nsdoc-added-date"><span>Ajouté le</span><strong>{document.added_at}</strong></div>
        <span className={`nsdoc-status nsdoc-status--${tone}`}>{statusLabel}</span>
        {document.downloadable ? <button type="button" className="nsdoc-icon-action nsdoc-download" title="Télécharger" aria-label={`Télécharger ${document.title}`} onClick={() => onDownload(document)}><DownloadIcon /></button> : <span className="nsdoc-action-placeholder" />}
        <div className="nsdoc-more-wrap">
          <button type="button" className={`nsdoc-icon-action nsdoc-more${menuOpen ? " is-active" : ""}`} title="Plus d'options" aria-label={`Plus d'options pour ${document.title}`} onClick={() => onToggleMenu(document.id)}><MoreIcon /></button>
          {menuOpen && <div className="nsdoc-action-menu" role="menu">
            {document.downloadable && (
              <button type="button" role="menuitem" onClick={() => onPreview(document)}>
                <EyeIcon />
                <span>Voir le document</span>
              </button>
            )}
            {document.downloadable && (
              <button type="button" role="menuitem" onClick={() => onDownload(document)}>
                <DownloadIcon />
                <span>Télécharger</span>
              </button>
            )}
            <button type="button" role="menuitem" onClick={() => onInfo(document)}>
              <InfoIcon />
              <span>Informations</span>
            </button>
            {document.deletable && (
              <button type="button" role="menuitem" className="is-danger" onClick={() => onDelete(document)}>
                <TrashIcon />
                <span>Supprimer</span>
              </button>
            )}
          </div>}
        </div>
      </div>
      {document.warning && (
        <div className="nsdoc-expiry-warning"><span><WarningIcon /></span><p><strong>Expire le {document.expiresAt}</strong><i aria-hidden="true">•</i>Pensez à renouveler ce document.</p></div>
      )}
    </article>
  );
}

export default function CandidateDocumentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const previewStudentId = location.state?.fromCandidateProfile ? location.state.candidate?.student?.id : null;
  const fileInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Tous");
  const [sortOrder, setSortOrder] = useState("recent");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, valid: 0, pending: 0, expiring: 0 });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [infoDocument, setInfoDocument] = useState(null);
  const [deleteDocument, setDeleteDocument] = useState(null);
  const [feedback, setFeedback] = useState("");
  const documentListRef = useRef(null);

  const loadDocuments = async () => {
    setLoading(true);
    setApiError("");
    try {
      const { data } = await http.get("/student/documents", { params: previewStudentId ? { student_id: previewStudentId } : undefined });
      setDocuments((data?.documents ?? []).map((document) => ({ ...document, category: normalizeCategory(document.category) })));
      setRequiredDocuments(data?.required_documents ?? []);
      setSummary(data?.summary ?? { total: 0, valid: 0, pending: 0, expiring: 0 });
    } catch (error) {
      setApiError(error.response?.data?.message ?? "Impossible de charger vos documents. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocuments(); }, []);
  useEffect(() => {
    const closeMenu = (event) => {
      if (!event.target.closest(".nsdoc-more-wrap")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const summaryCards = [
    { id: "all", icon: <FolderIcon />, tone: "purple", label: "Tous mes documents", value: String(summary.total), meta: "documents disponibles" },
    { id: "valid", icon: <CheckCircleIcon />, tone: "green", label: "À jour", value: String(summary.valid), meta: "documents à jour" },
    { id: "pending", icon: <HourglassIcon />, tone: "amber", label: "En attente", value: String(summary.pending), meta: "documents à fournir" },
    { id: "expiring", icon: <ClockIcon />, tone: "green", label: "Expirant bientôt", value: String(summary.expiring), meta: "documents à renouveler" },
  ];

  const visibleDocuments = useMemo(() => {
    const selectedCategory = TABS.find((tab) => tab.label === activeTab)?.category;
    const filtered = selectedCategory ? documents.filter((document) => document.category === selectedCategory) : documents;

    return [...filtered].sort((first, second) => {
      if (sortOrder === "name") return first.title.localeCompare(second.title, "fr");
      const firstDate = parseDate(first.added_at);
      const secondDate = parseDate(second.added_at);
      if (firstDate === null) return 1;
      if (secondDate === null) return -1;
      return sortOrder === "oldest" ? firstDate - secondDate : secondDate - firstDate;
    });
  }, [activeTab, documents, sortOrder]);

  const handleSidebarNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const addFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;

    let nextError = "";
    const validFiles = [];

    files.forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (file.size > MAX_FILE_SIZE) {
        nextError ||= "Le fichier dépasse la limite de 10 Mo.";
        return;
      }
      if (!ACCEPTED_FILE_TYPES.has(file.type) && !ACCEPTED_EXTENSIONS.has(extension)) {
        nextError ||= "Format non pris en charge.";
        return;
      }

      validFiles.push({
        file,
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: extension.toUpperCase(),
      });
    });

    setUploadError(nextError);
    if (!validFiles.length) return;

    setIsUploading(true);
    try {
      const body = new FormData();
      if (previewStudentId) body.append("student_id", previewStudentId);
      validFiles.forEach(({ file }) => body.append("files[]", file));
      await http.post("/student/documents", body, { headers: { "Content-Type": "multipart/form-data" } });
      setUploadedFiles((current) => [...current, ...validFiles.map(({ file, ...display }) => display)]);
      await loadDocuments();
    } catch (error) {
      setUploadError(error.response?.data?.message ?? Object.values(error.response?.data?.errors ?? {}).flat()[0] ?? "L’importation a échoué. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleDownload = async (document) => {
    if (!document.download_url) return;
    try {
      const response = await http.get(document.download_url, { responseType: "blob", params: previewStudentId ? { student_id: previewStudentId } : undefined });
      const url = URL.createObjectURL(response.data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.title;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setApiError(error.response?.data?.message ?? "Le téléchargement est indisponible.");
    }
  };

  const handlePreview = async (document) => {
    setOpenMenuId(null);
    try {
      const response = await http.get(document.download_url, { responseType: "blob", params: { ...(previewStudentId ? { student_id: previewStudentId } : {}), preview: 1 } });
      const url = URL.createObjectURL(response.data);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) { setApiError(error.response?.data?.message ?? "L’aperçu est indisponible."); }
  };

  const handleDelete = async () => {
    if (!deleteDocument) return;
    try {
      await http.delete(`/student/documents/${encodeURIComponent(deleteDocument.id)}`, { params: previewStudentId ? { student_id: previewStudentId } : undefined });
      setFeedback("Document supprimé avec succès.");
      setDeleteDocument(null);
      await loadDocuments();
    } catch (error) { setApiError(error.response?.data?.message ?? "La suppression a échoué."); setDeleteDocument(null); }
  };

  return (
    <div className="nsd-root nsdoc-root">
      <StudentSidebar activePath="/student-documents" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleSidebarNavigate} />

      <main className="nsd-main nsdoc-main">
        <StudentHeader className="nsdoc-header" headingClassName="nsdoc-page-heading" titleNode={<div className="nsdoc-title-row"><span className="nsdoc-title-icon"><FileTextIcon /></span><h1 className="nsd-greeting-title">Mes documents</h1></div>} subtitle="Retrouvez ici tous vos documents importants." onMenuOpen={() => setSidebarOpen(true)} />

        <section className="nsdoc-summary-grid" aria-label="Résumé des documents">
          {summaryCards.map((card) => <SummaryCard key={card.id} card={card} />)}
        </section>

        <div className="nsdoc-content-grid">
          <section className="nsdoc-panel nsdoc-list-card">
            <div className="nsdoc-list-toolbar">
              <div className="nsdoc-tabs" role="tablist" aria-label="Filtrer les documents">
                {TABS.map((tab) => <button key={tab.label} type="button" role="tab" aria-selected={activeTab === tab.label} className={activeTab === tab.label ? "active" : ""} onClick={() => setActiveTab(tab.label)}>{tab.label}</button>)}
              </div>
              <label className="nsdoc-sort"><span>Trier par</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Trier les documents"><option value="recent">Plus récent</option><option value="oldest">Plus ancien</option><option value="name">Nom A-Z</option></select><ChevronDownIcon /></label>
            </div>

            <div className="nsdoc-document-list" ref={documentListRef} role="tabpanel" aria-label={`Documents ${activeTab.toLowerCase()}`}>
              {loading && <p>Chargement de vos documents…</p>}
              {!loading && apiError && <p role="alert">{apiError}</p>}
              {!loading && !apiError && !visibleDocuments.length && <p>Aucun document dans cette catégorie.</p>}
              {!loading && !apiError && visibleDocuments.map((document) => <DocumentRow key={document.id} document={document} onDownload={handleDownload} onPreview={handlePreview} onInfo={(item) => { setInfoDocument(item); setOpenMenuId(null); }} onDelete={(item) => { setDeleteDocument(item); setOpenMenuId(null); }} menuOpen={openMenuId === document.id} onToggleMenu={(id) => setOpenMenuId((current) => current === id ? null : id)} />)}
            </div>
          </section>

          <aside className="nsdoc-right-column">
            <section className="nsdoc-panel nsdoc-upload-card">
              <h2>Ajouter un document</h2>
              <div className={`nsdoc-upload-zone${isDragging ? " is-dragging" : ""}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" multiple onChange={handleFileChange} aria-label="Choisir des documents à importer" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}><span className="nsdoc-upload-icon"><UploadCloudIcon /></span><strong>{isUploading ? "Importation en cours…" : "Glissez-déposez votre fichier ici"}</strong><span>ou cliquez pour parcourir</span><small>PDF, JPG, PNG (max. 10 Mo)</small></button>
              </div>
              {uploadError && <p className="nsdoc-upload-error" role="alert">{uploadError}</p>}
              {uploadedFiles.length > 0 && (
                <div className="nsdoc-uploaded-list" aria-label="Documents importés">
                  {uploadedFiles.map((file) => <article key={file.id} className="nsdoc-uploaded-file"><span className="nsdoc-uploaded-icon"><FileTextIcon /></span><div><strong>{file.name}</strong><span>{file.type} <i aria-hidden="true">•</i> {file.size}</span></div><span className="nsdoc-uploaded-status">Importé</span><button type="button" title="Supprimer" aria-label={`Supprimer ${file.name}`} onClick={() => setUploadedFiles((current) => current.filter((item) => item.id !== file.id))}><TrashIcon /></button></article>)}
                </div>
              )}
            </section>

            <section className="nsdoc-panel nsdoc-required-card">
              <h2>Documents requis</h2>
              <p>Voici les documents demandés pour votre formation.</p>
              <div className="nsdoc-required-list">
                {requiredDocuments.map((document) => <button key={document.id} type="button" className="nsdoc-required-row"><span className={`nsdoc-required-state nsdoc-required-state--${document.state}`}>{document.state === "valid" ? <CheckCircleIcon /> : <HourglassIcon />}</span><span><strong>{document.title}</strong><small>{document.detail}</small></span><ChevronRightIcon /></button>)}
                {!loading && !requiredDocuments.length && <p>Aucun document requis n’est actuellement configuré.</p>}
              </div>
            </section>

            <section className="nsdoc-help-card">
              <span className="nsdoc-help-icon"><HeadsetIcon /></span>
              <div><strong>Une question sur vos documents ?</strong><p>Contactez votre auto-école, nous sommes là pour vous aider.</p><button type="button">Nous contacter <span aria-hidden="true">→</span></button></div>
            </section>
          </aside>
        </div>
      </main>
      {feedback && <div className="nsdoc-feedback" role="status">{feedback}<button type="button" onClick={() => setFeedback("")}>×</button></div>}
      {infoDocument && <div className="nsdoc-dialog-backdrop" role="presentation" onMouseDown={() => setInfoDocument(null)}><section className="nsdoc-dialog" role="dialog" aria-modal="true" aria-label="Informations du document" onMouseDown={(event) => event.stopPropagation()}><h2>Informations</h2><dl><dt>Nom</dt><dd>{infoDocument.title || "—"}</dd><dt>Catégorie</dt><dd>{infoDocument.category || "—"}</dd><dt>Type</dt><dd>{infoDocument.type || "—"}</dd><dt>Ajouté le</dt><dd>{infoDocument.added_at || "—"}</dd><dt>Statut</dt><dd>{statusPresentation(infoDocument.status)[0]}</dd>{infoDocument.expiresAt && <><dt>Expiration</dt><dd>{infoDocument.expiresAt}</dd></>}{infoDocument.size && <><dt>Taille</dt><dd>{formatFileSize(infoDocument.size)}</dd></>}</dl><button type="button" onClick={() => setInfoDocument(null)}>Fermer</button></section></div>}
      {deleteDocument && <div className="nsdoc-dialog-backdrop" role="presentation" onMouseDown={() => setDeleteDocument(null)}><section className="nsdoc-dialog" role="dialog" aria-modal="true" aria-label="Confirmer la suppression" onMouseDown={(event) => event.stopPropagation()}><h2>Supprimer ce document ?</h2><p>Êtes-vous sûr de vouloir supprimer ce document ?</p><div className="nsdoc-dialog-actions"><button type="button" onClick={() => setDeleteDocument(null)}>Annuler</button><button type="button" className="is-danger" onClick={handleDelete}>Supprimer</button></div></section></div>}
    </div>
  );
}
