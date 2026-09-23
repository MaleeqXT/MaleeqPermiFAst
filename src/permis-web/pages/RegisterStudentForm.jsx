import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import http from "../../helpers/http.jsx";
import "./RegisterStudentForm.css";

/* ────────────────────────────────────────────────────────────────────────
   WHAT THIS FILE IS
   A standalone React component that recreates the Vue "RegisterStudentform"
   fields, but wrapped in the visual design language of StudentProfile.jsx
   (same white rounded cards, same grey inputs, same dark button, same
   success modal). It does NOT talk to any backend — it's frontend only,
   exactly as requested. Wire up `onSubmit` from the parent to actually
   send the data somewhere.
   ──────────────────────────────────────────────────────────────────────── */

// ── Icon (copied style from StudentProfile.jsx so the eye icon matches) ───
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
  </svg>
);

const UploadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// ── Success Modal (same pattern as StudentProfile.jsx) ─────────────────────
function SuccessModal({ message, onClose }) {
  return (
    <div className="sp-modal-backdrop" onClick={onClose}>
      <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sp-modal-header">
          <IconInfo />
          <span className="sp-modal-header-text">Succès</span>
        </div>
        <div className="sp-modal-body">
          <p className="sp-modal-msg">{message}</p>
        </div>
        <div className="sp-modal-footer">
          <button className="sp-modal-close-btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ── Every field from RegisterStudentform.vue, starting empty ──────────────
// NOTE: "gearbox_type" existed in the Vue form's data object but was never
// actually rendered as a visible input anywhere in the template, so it's
// left out here too. Ask if you want it added as a real field.
const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  boite_type: "",       // Boîte Manuelle (BM) / Boîte Automatique (BA)
  ville: "",             // Centre de formation — Creil / Toulouse
  neph_status: "",       // Sans NEPH / Avec NEPH
  neph_document_requirement: "",
  sexe: "",              // Homme / Femme
  date_naissance: "",
  postal: "",            // auto-filled from ville, hidden from the user (matches Vue's "hidden" div)
  postal_code_1: "",
  neph: "",
  date_code: "",
  how_know: "",
  adresse: "",
  password: "",
  password_confirmation: "",
};

// Same postal-code lookup table as the Vue file's `postalCodes` object
const POSTAL_CODES = {
  Creil: "60100",
  Toulouse: "31300",
};

const SANS_NEPH_DOCUMENTS = [
  {
    id: "identity",
    type: "Pièce d'identité",
    title: "Pièce d'identité",
    optional: false,
    description: "CNI recto-verso ou passeport — photo ou PDF.",
    buttonLabel: "Ajouter des fichiers (photo ou PDF)",
    multiple: true,
  },
  {
    id: "photo_ants",
    type: "Photo d'identité agréée ANTS",
    title: "Photo d'identité agréée ANTS",
    optional: true,
    warning: "⚠️ Photo d'identité NUMÉRIQUE agréée ANTS (avec code e-photo / signature numérique), prise en photomaton ou chez un photographe agréé — PAS une photo classique. Vous pourrez l'apporter plus tard.",
    description: "",
    buttonLabel: "Ajouter un fichier (photo ou PDF)",
    multiple: false,
  },
  {
    id: "proof_address",
    type: "Justificatif de domicile",
    title: "Justificatif de domicile (moins de 3 mois)",
    optional: false,
    description: "Facture d'électricité (EDF), ou eau + électricité, ou attestation du titulaire du contrat. Datée de moins de 3 mois.",
    buttonLabel: "Ajouter des fichiers (photo ou PDF)",
    multiple: true,
  },
  {
    id: "assr2",
    type: "ASSR 2",
    title: "ASSR2 (sécurité routière niveau 2)",
    optional: true,
    description: "Pour les moins de 21 ans. Délivrée par votre collège/lycée — à défaut, l'attestation ASR. Vous pourrez l'apporter plus tard.",
    buttonLabel: "Ajouter des fichiers (photo ou PDF)",
    multiple: true,
  },
  {
    id: "driving_test",
    type: "Résultat examen conduite",
    title: "Résultat de l'examen de conduite",
    optional: true,
    description: "Votre certificat/justificatif de passage à l'examen. Vous pourrez l'apporter plus tard.",
    buttonLabel: "Ajouter des fichiers (photo ou PDF)",
    multiple: true,
  },
  {
    id: "license_copy",
    type: "Copie permis de conduire",
    title: "Copie du permis de conduire",
    optional: true,
    description: "Votre permis de conduire valide (recto et verso). Vous pourrez l'apporter plus tard.",
    buttonLabel: "Ajouter des fichiers (photo ou PDF)",
    multiple: true,
  },
];

const AVEC_NEPH_DOCUMENTS = [
  {
    id: "cerfa_02",
    type: "Cerfa 02",
    title: "Cerfa 02",
    optional: false,
    description: "Votre attestation d'inscription au permis portant votre numéro NEPH (Cerfa 02).",
    buttonLabel: "Ajouter des fichiers (photo ou PDF)",
    multiple: true,
  },
  {
    id: "feuille_de_code",
    type: "Feuille de code",
    title: "Feuille de code",
    optional: true,
    description: "Votre justificatif ou résultat de l'examen du code de la route.",
    buttonLabel: "Ajouter des fichiers (photo ou PDF)",
    multiple: true,
  },
];

const NEPH_DOCUMENTS = {
  sans_neph: SANS_NEPH_DOCUMENTS,
  avec_neph: AVEC_NEPH_DOCUMENTS,
};

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Ko";
  const k = 1024;
  if (bytes < k) return `${bytes} o`;
  if (bytes < k * k) return `${(bytes / k).toFixed(0)} Ko`;
  return `${(bytes / (k * k)).toFixed(1)} Mo`;
}

const REGISTRATION_STEPS = [
  {
    title: "Faisons connaissance",
    description: "On commence par l’essentiel.",
  },
  {
    title: "Restons en contact",
    description: "Indiquez les coordonnées que nous utiliserons pour vous accompagner.",
  },
  {
    title: "Votre formation",
    description: "Choisissez le véhicule et le centre qui correspondent à votre projet.",
  },
  {
    title: "Votre dossier NEPH",
    description: "Précisez votre situation et ajoutez les documents déjà disponibles.",
  },
  {
    title: "Informations complémentaires",
    description: "Quelques précisions utiles pour préparer votre accompagnement.",
  },
  {
    title: "Créez votre accès",
    description: "Choisissez un mot de passe pour finaliser votre inscription.",
  },
];

const FIELD_STEP_INDEX = {
  first_name: 0,
  last_name: 0,
  email: 1,
  phone: 1,
  password: 5,
  password_confirmation: 5,
};

export default function RegisterStudentForm({ onSubmit = () => {} }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, _setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequirementDocuments, setSelectedRequirementDocuments] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRefs = useRef({});

  function getFilesForDoc(type) {
    const found = selectedRequirementDocuments.find((doc) => doc.type === type);
    return found ? found.files : [];
  }

  function handleFileChange(type, fileList) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    setSelectedRequirementDocuments((prev) => {
      const existing = prev.find((doc) => doc.type === type);
      if (existing) {
        return prev.map((doc) =>
          doc.type === type ? { ...doc, files: [...doc.files, ...files] } : doc
        );
      }
      return [...prev, { type, files }];
    });
  }

  function removeFile(type, fileIndex) {
    setSelectedRequirementDocuments((prev) =>
      prev
        .map((doc) => {
          if (doc.type === type) {
            const nextFiles = doc.files.filter((_, idx) => idx !== fileIndex);
            return { ...doc, files: nextFiles };
          }
          return doc;
        })
        .filter((doc) => doc.files.length > 0)
    );
  }

  // "Is anything different from the blank form?" — used to enable/disable
  // the submit button, same idea as Vue's `form.isDirty`.
  const isDirty = Object.keys(form).some((key) => form[key] !== INITIAL_FORM[key]);

  // Generic field updater: pass the field name and the new value.
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Equivalent of Vue's `watch(() => form.ville, ...)`:
  // whenever the chosen city changes, auto-fill the (hidden) postal code.
  useEffect(() => {
    setField("postal", POSTAL_CODES[form.ville] || "");
  }, [form.ville]);

  // Simple frontend-only validation, mirroring which fields the Vue
  // template actually marks as `required`.
  function validate(values) {
    const next = {};
    if (!values.first_name.trim()) next.first_name = "Le prénom est requis.";
    if (!values.last_name.trim()) next.last_name = "Le nom est requis.";
    if (!values.email.trim()) next.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Adresse e-mail invalide.";
    if (!values.phone.trim()) next.phone = "Le numéro de téléphone est requis.";
    if (!values.password) next.password = "Le mot de passe est requis.";
    if (!values.password_confirmation) {
      next.password_confirmation = "Merci de confirmer le mot de passe.";
    } else if (values.password && values.password !== values.password_confirmation) {
      next.password_confirmation = "Les mots de passe ne correspondent pas.";
    }
    return next;
  }

  // Same idea as the Vue file's `@blur="checkPassword(form)"` — check the
  // match as soon as the user leaves the confirm-password field.
  function checkPasswordMatch() {
    if (form.password_confirmation && form.password !== form.password_confirmation) {
      setErrors((prev) => ({ ...prev, password_confirmation: "Les mots de passe ne correspondent pas." }));
    } else {
      setErrors((prev) => ({ ...prev, password_confirmation: undefined }));
    }
  }

  function handleContinue() {
    const stepFields = currentStep === 0
      ? ["first_name", "last_name"]
      : currentStep === 1
        ? ["email", "phone"]
        : [];
    const validationErrors = validate(form);
    const stepErrors = Object.fromEntries(
      Object.entries(validationErrors).filter(([key]) => stepFields.includes(key)),
    );

    if (Object.keys(stepErrors).length > 0) {
      setErrors((previous) => ({ ...previous, ...stepErrors }));
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, REGISTRATION_STEPS.length - 1));
  }

  function handlePrevious() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstInvalidField = Object.keys(validationErrors)[0];
      setCurrentStep(FIELD_STEP_INDEX[firstInvalidField] ?? currentStep);
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value ?? ""));
      selectedRequirementDocuments.forEach((document, index) => {
        payload.append(`documents[${index}][type]`, document.type);
        document.files.forEach((file) => payload.append(`documents[${index}][files][]`, file));
      });
      await http.post("/public/register/student", payload, { headers: { "Content-Type": "multipart/form-data" } });
      onSubmit(form);
      navigate("/login-page", { replace: true });
    } catch (error) {
      const serverErrors = error.response?.data?.errors ?? {};
      const firstError = Object.values(serverErrors).flat()[0] ?? error.response?.data?.message ?? "Une erreur est survenue lors de l'inscription.";
      setErrors({ form: firstError });
    } finally {
      setSubmitting(false);
    }
  }

  const activeStep = REGISTRATION_STEPS[currentStep];
  const progress = ((currentStep + 1) / REGISTRATION_STEPS.length) * 100;

  return (
    <div className="sp-page rf-page">
      {/* ── Header, matching the text from RegisterStudentPage.vue ── */}
      <div className="rf-header">
        <h1 className="rf-title">S'inscrire à votre espace</h1>
        <p className="rf-subtitle">
          Tu es déjà membre ?{" "}
          <NavLink to="/login-page" className="rf-link">Se connecter</NavLink>
        </p>
      </div>

      <form className="rf-form" onSubmit={handleSubmit} noValidate>
        <div className="rf-wizard-card">
          <div className="rf-wizard-topline">
            <span>Votre inscription</span>
            <span aria-live="polite">Étape {currentStep + 1} / {REGISTRATION_STEPS.length}</span>
          </div>
          <div
            className="rf-progress"
            role="progressbar"
            aria-label="Progression de l’inscription"
            aria-valuemin="1"
            aria-valuemax={REGISTRATION_STEPS.length}
            aria-valuenow={currentStep + 1}
          >
            <span className="rf-progress__value" style={{ width: `${progress}%` }} />
          </div>

          <div className="rf-step-heading">
            <h2>{activeStep.title}</h2>
            <p>{activeStep.description}</p>
          </div>

          {(currentStep === 0 || currentStep === 1) && (
            <div className="sp-form-card">
              <div className="sp-section">
                {currentStep === 0 && (
                  <div className="rf-step-fields">
                    <div className="sp-grid sp-grid--two">
                      <label className="sp-field">
                        <span className="sp-label">Prénom <span className="sp-required">*</span></span>
                        <input
                          className="sp-input"
                          autoComplete="given-name"
                          value={form.first_name}
                          onChange={(e) => setField("first_name", e.target.value)}
                        />
                        {errors.first_name && <span className="rf-error">{errors.first_name}</span>}
                      </label>

                      <label className="sp-field">
                        <span className="sp-label">Nom <span className="sp-required">*</span></span>
                        <input
                          className="sp-input"
                          autoComplete="family-name"
                          value={form.last_name}
                          onChange={(e) => setField("last_name", e.target.value)}
                        />
                        {errors.last_name && <span className="rf-error">{errors.last_name}</span>}
                      </label>
                    </div>

                    <div className="sp-grid sp-grid--two">
                      <label className="sp-field">
                        <span className="sp-label">Date de naissance</span>
                        <input
                          type="date"
                          className="sp-input sp-date-input"
                          autoComplete="bday"
                          value={form.date_naissance}
                          onChange={(e) => setField("date_naissance", e.target.value)}
                        />
                      </label>

                      <label className="sp-field">
                        <span className="sp-label">Genre</span>
                        <select
                          className="sp-input"
                          value={form.sexe}
                          onChange={(e) => setField("sexe", e.target.value)}
                        >
                          <option value="">Genre</option>
                          <option value="Homme">Homme</option>
                          <option value="Femme">Femme</option>
                        </select>
                      </label>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="sp-grid sp-grid--two">
                    <label className="sp-field">
                      <span className="sp-label">Email <span className="sp-required">*</span></span>
                      <input
                        type="email"
                        className="sp-input"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                      />
                      {errors.email && <span className="rf-error">{errors.email}</span>}
                    </label>

                    <label className="sp-field">
                      <span className="sp-label">Numéro de téléphone <span className="sp-required">*</span></span>
                      <input
                        type="tel"
                        className="sp-input"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                      />
                      {errors.phone && <span className="rf-error">{errors.phone}</span>}
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* ── Card 2 : training details + address ── */}
        {(currentStep >= 2 && currentStep <= 4) && (
        <div className="sp-form-card">
          <div className="sp-section">
            {currentStep === 2 && (
              <div className="rf-step-fields">
            <label className="sp-field">
              <span className="sp-label">Pour votre formation, quel type de véhicule souhaitez-vous utiliser ?</span>
              <select
                className="sp-input"
                value={form.boite_type}
                onChange={(e) => setField("boite_type", e.target.value)}
              >
                <option value="">Choisir le type de boîte</option>
                <option value="0">Boîte Manuelle (BM)</option>
                <option value="1">Boîte Automatique (BA)</option>
              </select>
            </label>

            <label className="sp-field">
              <span className="sp-label">Centre de formation</span>
              <select
                className="sp-input"
                value={form.ville}
                onChange={(e) => setField("ville", e.target.value)}
              >
                <option value="">Choisissez votre centre de formation</option>
                <option value="Creil">Creil</option>
                <option value="Toulouse">Toulouse</option>
              </select>
            </label>

            {/* Warning box — same text as the Vue template */}
            <div className="rf-warning">
              <span className="rf-warning-icon">⚠️</span>
              <div className="rf-warning-text">
                <p className="rf-warning-title">Important – Choix de la ville</p>
                <p>Merci de bien sélectionner la ville la plus proche de chez vous lors de votre inscription.</p>
                <p>
                  En cas d'erreur (choix d'une autre ville), vous ne pourrez pas planifier vos heures de conduite
                  avec les enseignants rattachés à votre agence. Cela risque d'entraîner des retards dans votre
                  planning et dans votre préparation à l'examen.
                </p>
                <p className="rf-warning-strong">
                  👉 Vérifiez attentivement votre ville avant de valider votre inscription afin de bénéficier d'un
                  suivi optimal avec la bonne équipe pédagogique.
                </p>
              </div>
            </div>

            {/* NOTE: this second "Ville" dropdown is bound to the exact same
                `ville` field as "Centre de formation" above — that's how the
                original Vue file is written (looks like a leftover
                duplicate). Kept as-is so nothing is missing, per your
                request not to change behaviour. */}
            <label className="sp-field">
              <span className="sp-label">Ville</span>
              <select
                className="sp-input"
                value={form.ville}
                onChange={(e) => setField("ville", e.target.value)}
              >
                <option value="">Ville</option>
                <option value="Creil">Creil</option>
                <option value="Toulouse">Toulouse</option>
              </select>
            </label>

            <label className="sp-field">
              <span className="sp-label">Code postal 1</span>
              <input
                className="sp-input"
                inputMode="numeric"
                placeholder="Entrez un second code postal si besoin"
                value={form.postal_code_1}
                onChange={(e) => setField("postal_code_1", e.target.value)}
              />
            </label>
              </div>
            )}

            {currentStep === 3 && (
              <div className="rf-step-fields">
                <label className="sp-field">
                  <span className="sp-label">NEPH</span>
                  <select
                    className="sp-input"
                    value={form.neph_status}
                    onChange={(e) => {
                      setForm((previous) => ({ ...previous, neph_status: e.target.value }));
                    }}
                  >
                    <option value="">Sélectionnez une option</option>
                    <option value="sans_neph">Sans NEPH</option>
                    <option value="avec_neph">Avec NEPH</option>
                  </select>
                </label>

                {form.neph_status === "avec_neph" && (
                  <label className="sp-field">
                    <span className="sp-label">Numéro NEPH (si vous le possédez déjà)</span>
                    <input
                      className="sp-input"
                      placeholder="Entrez votre numéro NEPH (12 chiffres)"
                      value={form.neph}
                      onChange={(e) => setField("neph", e.target.value.replace(/\D/g, "").slice(0, 12))}
                      inputMode="numeric"
                      maxLength={12}
                    />
                  </label>
                )}

                {form.neph_status && (
                  <div className="rf-doc-section">
                    <div className="rf-doc-section-header">
                      <h3 className="rf-doc-section-title">Vos documents</h3>
                      <p className="rf-doc-section-subtitle">
                        Liste adaptée à votre situation. Photos ou PDF — les images sont automatiquement compressées.
                      </p>
                    </div>

                    <div className="rf-doc-list">
                      {(NEPH_DOCUMENTS[form.neph_status] || []).map((doc) => {
                        const docFiles = getFilesForDoc(doc.type);
                        return (
                          <div key={doc.id} className="rf-doc-card">
                            <div className="rf-doc-card-header">
                              <span className="rf-doc-card-title">
                                {doc.title}
                                {doc.optional && <span className="rf-doc-optional">(facultatif)</span>}
                              </span>
                              {doc.description && <p className="rf-doc-desc">{doc.description}</p>}
                              {doc.warning && <p className="rf-doc-warning">{doc.warning}</p>}
                            </div>

                            <button
                              type="button"
                              className="rf-doc-upload-pill"
                              onClick={() => fileInputRefs.current[doc.id]?.click()}
                            >
                              <span className="rf-doc-upload-icon-wrap">
                                <UploadIcon />
                              </span>
                              <span className="rf-doc-upload-text">
                                {docFiles.length > 0
                                  ? `${doc.buttonLabel} (${docFiles.length} sélectionné${docFiles.length > 1 ? "s" : ""})`
                                  : doc.buttonLabel}
                              </span>
                            </button>
                            <input
                              ref={(el) => {
                                fileInputRefs.current[doc.id] = el;
                              }}
                              type="file"
                              className="rf-hidden-file-input"
                              accept=".pdf,.jpg,.jpeg,.png"
                              multiple={doc.multiple}
                              onChange={(e) => {
                                handleFileChange(doc.type, e.target.files);
                                e.target.value = "";
                              }}
                            />

                            {docFiles.length > 0 && (
                              <div className="rf-doc-file-list">
                                {docFiles.map((file, fileIdx) => (
                                  <div key={`${file.name}-${fileIdx}`} className="rf-doc-file-chip">
                                    <FileIcon />
                                    <span className="rf-doc-file-name" title={file.name}>{file.name}</span>
                                    <span className="rf-doc-file-size">({formatFileSize(file.size)})</span>
                                    <button
                                      type="button"
                                      className="rf-doc-file-remove"
                                      onClick={() => removeFile(doc.type, fileIdx)}
                                      title="Supprimer ce fichier"
                                      aria-label={`Supprimer ${file.name}`}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="rf-step-fields">
            <div className="sp-grid sp-grid--two">
              <label className="sp-field">
                <span className="sp-label">Date d'obtention du code de la route ?</span>
                <input
                  type="date"
                  className="sp-input sp-date-input"
                  value={form.date_code}
                  onChange={(e) => setField("date_code", e.target.value)}
                />
              </label>

              <label className="sp-field">
                <span className="sp-label">Comment avez-vous connu PassPermisFacile ?</span>
                <select
                  className="sp-input"
                  value={form.how_know}
                  onChange={(e) => setField("how_know", e.target.value)}
                >
                  <option value="">Choisir une option</option>
                  <option value="Internet">Internet</option>
                  <option value="Publicité">Publicité</option>
                  <option value="Bouche à oreilles">Bouche à oreilles</option>
                  <option value="Flyers">Flyers</option>
                  <option value="Auto école">Auto école</option>
                  <option value="Autres">Autres</option>
                </select>
              </label>
            </div>

            <label className="sp-field">
              <span className="sp-label">Adresse complète</span>
              <textarea
                className="sp-input sp-textarea"
                value={form.adresse}
                onChange={(e) => setField("adresse", e.target.value)}
              />
            </label>
              </div>
            )}
          </div>
        </div>
        )}

        {/* ── Card 3 : password + terms ── */}
        {currentStep === 5 && (
        <div className="sp-form-card">
          <div className="sp-section">
            <div className="sp-grid sp-grid--two">
              <label className="sp-field">
                <span className="sp-label">Mot de passe <span className="sp-required">*</span></span>
                <span className="sp-password-wrap">
                  <input
                    className="sp-input sp-password-input"
                    type={showPass ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                  />
                  <button
                    className="sp-password-toggle"
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    <IconEye />
                  </button>
                </span>
                {errors.password && <span className="rf-error">{errors.password}</span>}
              </label>

              <label className="sp-field">
                <span className="sp-label">Mot de passe confirmation <span className="sp-required">*</span></span>
                <span className="sp-password-wrap">
                  <input
                    className="sp-input sp-password-input"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password_confirmation}
                    onChange={(e) => setField("password_confirmation", e.target.value)}
                    onBlur={checkPasswordMatch}
                  />
                  <button
                    className="sp-password-toggle"
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    <IconEye />
                  </button>
                </span>
                {errors.password_confirmation && <span className="rf-error">{errors.password_confirmation}</span>}
              </label>
            </div>

            <div className="rf-terms">
              <p><span className="sp-required">*</span> Champs obligatoires</p>
              <p>
                En vous inscrivant, vous confirmez avoir lu et accepté les{" "}
                <a href="/conditions-utilisation" className="rf-link">conditions générales d'utilisation</a>.
              </p>
            </div>
          </div>
        </div>
        )}

        <div className={`rf-navigation${currentStep === 0 ? " rf-navigation--single" : ""}`}>
          {errors.form && <span className="rf-error">{errors.form}</span>}
          {currentStep > 0 && (
            <button className="rf-button rf-button--secondary" type="button" onClick={handlePrevious}>
              Précédent
            </button>
          )}
          {currentStep < REGISTRATION_STEPS.length - 1 ? (
            <button className="rf-button rf-button--primary" type="button" onClick={handleContinue}>
              Continuer
            </button>
          ) : (
            <button className="rf-button rf-button--primary" type="submit" disabled={!isDirty || submitting}>
              {submitting ? "Inscription en cours…" : "S'inscrire maintenant"}
            </button>
          )}
        </div>
        </div>
      </form>

      {showModal && (
        <SuccessModal message={successMessage} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
