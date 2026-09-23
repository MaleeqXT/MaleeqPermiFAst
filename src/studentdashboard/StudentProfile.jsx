import { useEffect, useRef, useState } from "react";
import "./StudentProfile.css";
import FileManager from "../Components/shared/FileManeger.jsx";
import http from "../helpers/http.jsx";

// ── Icons ─────────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
  </svg>
);

function DrivingStatusIcons() {
  const items = [
    { label: "AAC", symbol: "AAC", kind: "text" },
    { label: "Conduite supervisée", symbol: "CS", kind: "text" },
    { label: "Code", symbol: "⌁", kind: "glasses" },
    { label: "Formule", symbol: "▰", kind: "car" },
    { label: "1 € par jour", symbol: "1€", kind: "money" },
    { label: "1/3", symbol: "1/3", kind: "text" },
    { label: "ANTS", symbol: "i", kind: "info" },
  ];

  return (
    <div className="sp-driving-status" aria-label="Statuts de formation">
      {items.map((item) => (
        <span key={item.label} className={`sp-status-icon sp-status-icon--${item.kind}`} title={item.label}>
          <span>{item.symbol}</span>
          {item.label === "ANTS" && <small>ANTS</small>}
        </span>
      ))}
    </div>
  );
}

const REQUIRED_DOCUMENTS = [
  "Cerfa02",
  "Code",
];

function RequiredDocuments({ initialDocuments = {}, onUpload }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [documents, setDocuments] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    setDocuments(initialDocuments ?? {});
  }, [initialDocuments]);

  const chooseDocument = (documentName) => {
    setActiveDocument(documentName);
    setMenuOpen(false);
    // Use the device's own file picker — no in-app file-manager popup.
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length && activeDocument) {
      try {
        const storedDocuments = await onUpload?.(activeDocument, files);
        if (storedDocuments) {
          setDocuments(storedDocuments);
        }
      } catch (error) {
        console.error("Impossible d'enregistrer le document.", error?.response?.data ?? error);
      }
    }
    event.target.value = "";
  };

  return (
    <section className="sp-required-documents">
      <div className="sp-required-documents-head">
        <span>Pièces à fournir</span>
        <div className="sp-document-picker">
          <button
            type="button"
            className="sp-document-plus"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Ajouter une pièce"
          >
            +
          </button>
          {menuOpen && (
            <div className="sp-document-menu" role="menu">
              {REQUIRED_DOCUMENTS.map((documentName) => (
                <button
                  key={documentName}
                  type="button"
                  className={documents[documentName] ? "sp-document-menu-option--selected" : ""}
                  onClick={() => chooseDocument(documentName)}
                >
                  {documentName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx"
        multiple
        className="sp-document-file-input"
        onChange={handleFileChange}
      />

      {Object.keys(documents).length > 0 && (
        <div className="sp-document-list">
          {Object.entries(documents).flatMap(([documentName, documentFiles]) => {
            const files = Array.isArray(documentFiles) ? documentFiles : [documentFiles];
            return files.map((file, index) => (
              <button key={`${documentName}-${file.path ?? file.name ?? index}`} type="button" onClick={() => chooseDocument(documentName)}>
                <span className="sp-document-selected-name">{documentName}</span>:
                <span>{file.name}</span>
                <span>Ajouter</span>
              </button>
            ));
          })}
        </div>
      )}
    </section>
  );
}

// ── Success Modal ─────────────────────────────────────────────────────────
function SuccessModal({ message, onClose }) {
  return (
    <div className="sp-modal-backdrop" onClick={onClose}>
      <div className="sp-modal" onClick={e => e.stopPropagation()}>
        {/* Header bar */}
        <div className="sp-modal-header">
          <IconInfo />
          <span className="sp-modal-header-text">Succès</span>
        </div>
        {/* Body */}
        <div className="sp-modal-body">
          <p className="sp-modal-msg">{message}</p>
        </div>
        {/* Footer */}
        <div className="sp-modal-footer">
          <button className="sp-modal-close-btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ── Initial form values ───────────────────────────────────────────────────
const INITIAL_FORM = {
  firstName:       "",
  name:            "",
  email:           "",
  genre:           "",
  phone:           "",
  dob:             "",
  would:           "",
  postal:          "",
  agency:          "",
  address:         "",
  password:        "",
  confirmPassword: "",
  formulaDueDate:  "",
  codeDueDate:     "",
};

export default function StudentProfile({
  studentId           = null,
  onBack              = () => {},
  onOpenNotifications = () => {},
  notifCount          = 0,
}) {
  const [photo,       setPhoto]       = useState(null);
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form,        setForm]        = useState(INITIAL_FORM);
  const [saved,       setSaved]       = useState(INITIAL_FORM); // tracks what was last saved
  const [showModal,   setShowModal]   = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading,     setLoading]     = useState(true);
  const [loadError,   setLoadError]   = useState("");
  const [profileStudentId, setProfileStudentId] = useState(null);
  const [requiredDocuments, setRequiredDocuments] = useState({});

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setLoadError("");

      try {
        let targetStudentId = studentId;
        if (!targetStudentId) {
          const { data } = await http.get("/auth/me");
          targetStudentId = data?.user?.student?.id;
        }

        if (!targetStudentId) {
          throw new Error("Profil élève introuvable.");
        }

        const { data } = await http.get(`/stats/students/${targetStudentId}`);
        const student = data?.data?.student;
        const user = student?.user;
        if (!user) throw new Error("Les informations de l'élève sont indisponibles.");

        const profile = {
          ...INITIAL_FORM,
          firstName: user.first_name ?? "",
          name: user.last_name ?? user.name ?? "",
          email: user.email ?? "",
          genre: user.sexe ?? "",
          phone: user.phone ?? "",
          dob: user.date_naissance ? String(user.date_naissance).slice(0, 10) : "",
          would: user.adresse ?? "",
          postal: user.postal ?? user.postal_code_1 ?? "",
          agency: user.ville ?? "",
          address: user.adresse ?? "",
          formulaDueDate: student?.date_formule ? String(student.date_formule).slice(0, 10) : "",
          codeDueDate: student?.date_code ? String(student.date_code).slice(0, 10) : "",
        };

        const rawPhoto = user.media || user.profile_photo_url;
        const photoUrl = rawPhoto && /^(https?:|data:|blob:)/i.test(rawPhoto)
          ? rawPhoto
          : rawPhoto ? `${import.meta.env.VITE_API_URL}/storage/${rawPhoto}` : null;

        if (active) {
          setForm(profile);
          setSaved(profile);
          setPhoto(photoUrl);
          setProfileStudentId(student.id);
          setRequiredDocuments(student.required_documents ?? {});
        }
      } catch (error) {
        if (active) setLoadError(error?.response?.data?.message || error.message || "Impossible de charger le profil.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, [studentId]);

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function uploadRequiredDocument(documentType, files) {
    if (!profileStudentId) throw new Error("Profil élève introuvable.");

    const formData = new FormData();
    formData.append("document_type", documentType);
    files.forEach((file) => formData.append("files[]", file));
    const { data } = await http.post(`/students/${profileStudentId}/required-documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const nextDocuments = data?.required_documents ?? {};
    setRequiredDocuments(nextDocuments);
    setSuccessMessage("Document ajouté avec succès.");
    setShowModal(true);
    return nextDocuments;
  }

  function handleSave() {
    // Only show modal if something actually changed
    const hasChanged = Object.keys(form).some(k => form[k] !== saved[k]);
    if (hasChanged) {
      setSaved(form); // commit the save
      setSuccessMessage("Profil élève mis à jour avec succès.");
      setShowModal(true);
    }
  }

  return (
    <div className="sp-page">

      {/* ── Header ── */}
      <div className="sp-hero">
        <div className="sp-hero-head">
          <button className="sp-back-btn" onClick={onBack} aria-label="Retour">
            <IconBack />
          </button>
          <h1 className="sp-title">Profil</h1>
          <button className="sp-bell-btn" onClick={onOpenNotifications} aria-label="Notifications">
            <IconBell />
            <span className="sp-bell-badge">{notifCount}</span>
          </button>
        </div>

        <div className="sp-photo-strip-wrap">
          <FileManager
            selectedSrc={photo}
            onSelect={setPhoto}
            variant="profile-strip"
            title="Photo de profil"
            subtitle="Mettre à jour votre photo de profil"
            actionLabel="Changer"
          />
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="sp-form-card">
        {loading && <p className="sp-loading-message">Chargement du profil…</p>}
        {loadError && <p className="sp-loading-message">{loadError}</p>}

        {/* Personal information */}
        <div className="sp-section">
          <h2 className="sp-section-title">Informations personnelles</h2>

          <div className="sp-grid sp-grid--two">
            <label className="sp-field">
              <span className="sp-label">Prénom</span>
              <input className="sp-input" value={form.firstName} onChange={e => setField("firstName", e.target.value)} />
            </label>
            <label className="sp-field">
              <span className="sp-label">Nom</span>
              <input className="sp-input" value={form.name} onChange={e => setField("name", e.target.value)} />
            </label>
          </div>

          <label className="sp-field">
            <span className="sp-label">E-mail</span>
            <input className="sp-input" value={form.email} onChange={e => setField("email", e.target.value)} />
          </label>

          <label className="sp-field">
            <span className="sp-label">Genre</span>
            <select className="sp-input" value={form.genre} onChange={e => setField("genre", e.target.value)}>
              {!form.genre && <option value="">Non renseigné</option>}
              {form.genre && !["Femme", "Homme", "Autre"].includes(form.genre) && <option value={form.genre}>{form.genre}</option>}
              <option>Femme</option>
              <option>Homme</option>
              <option>Autre</option>
            </select>
          </label>

          <label className="sp-field">
            <span className="sp-label">Numéro de téléphone</span>
            <input className="sp-input" value={form.phone} onChange={e => setField("phone", e.target.value)} />
          </label>

          <label className="sp-field">
            <span className="sp-label">Date de naissance</span>
            <input className="sp-input" value={form.dob} onChange={e => setField("dob", e.target.value)} />
          </label>

          <div className="sp-grid sp-grid--two">
            <label className="sp-field">
              <span className="sp-label">Échéance formule</span>
              <input
                type="date"
                className={`sp-input sp-date-input${form.formulaDueDate ? " sp-date-input--selected" : ""}`}
                value={form.formulaDueDate}
                onChange={e => setField("formulaDueDate", e.target.value)}
              />
            </label>
            <label className="sp-field">
              <span className="sp-label">Échéance code</span>
              <input
                type="date"
                className={`sp-input sp-date-input${form.codeDueDate ? " sp-date-input--selected" : ""}`}
                value={form.codeDueDate}
                onChange={e => setField("codeDueDate", e.target.value)}
              />
            </label>
          </div>

          <DrivingStatusIcons />
          <RequiredDocuments initialDocuments={requiredDocuments} onUpload={uploadRequiredDocument} />
        </div>

        {/* Address */}
        <div className="sp-section">
          <h2 className="sp-section-title">Adresse</h2>

          <label className="sp-field">
            <span className="sp-label">Adresse 1 <span className="sp-required">*</span></span>
            <input className="sp-input" value={form.would} onChange={e => setField("would", e.target.value)} />
          </label>

          <label className="sp-field">
            <span className="sp-label">Code postal 1 <span className="sp-required">*</span></span>
            <input className="sp-input" value={form.postal} onChange={e => setField("postal", e.target.value)} />
          </label>

          <label className="sp-field">
            <span className="sp-label">Agence</span>
            <select className="sp-input" value={form.agency} onChange={e => setField("agency", e.target.value)}>
              {!form.agency && <option value="">Non renseignée</option>}
              {form.agency && !["Creil", "Paris", "Toulouse"].includes(form.agency) && <option value={form.agency}>{form.agency}</option>}
              <option>Creil</option>
              <option>Paris</option>
              <option>Toulouse</option>
            </select>
          </label>

          <label className="sp-field">
            <span className="sp-label">Adresse</span>
            <textarea className="sp-input sp-textarea" value={form.address} onChange={e => setField("address", e.target.value)} />
          </label>
        </div>

        {/* Password */}
        <div className="sp-section">
          <h2 className="sp-section-title">Modifier votre mot de passe</h2>

          <label className="sp-field">
            <span className="sp-label">Mot de passe <span className="sp-required">*</span></span>
            <span className="sp-password-wrap">
              <input
                className="sp-input sp-password-input"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={e => setField("password", e.target.value)}
              />
              <button className="sp-password-toggle" type="button" onClick={() => setShowPass(v => !v)}>
                <IconEye />
              </button>
            </span>
          </label>

          <label className="sp-field">
            <span className="sp-label">Confirmer le mot de passe <span className="sp-required">*</span></span>
            <span className="sp-password-wrap">
              <input
                className="sp-input sp-password-input"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={e => setField("confirmPassword", e.target.value)}
              />
              <button className="sp-password-toggle" type="button" onClick={() => setShowConfirm(v => !v)}>
                <IconEye />
              </button>
            </span>
          </label>
        </div>
      </div>

      {/* ── Sticky save bar ── */}
      <div className="sp-save-bar">
        <button className="sp-save-btn" onClick={handleSave}>Enregistrer</button>
      </div>

      {/* ── Success Modal ── */}
      {showModal && <SuccessModal message={successMessage} onClose={() => setShowModal(false)} />}
    </div>
  );
}
