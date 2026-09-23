import { useEffect, useRef, useState } from "react";
import http from "../helpers/http.jsx";
import "./AddVehicleModal.css";

function ModalIcon({ children, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// Icons matching the screenshot designs
const HeaderCarIcon = () => (
  <ModalIcon>
    <path d="m5 11 2-5h10l2 5" />
    <path d="M3 13.5 5 11h14l2 2.5V18h-2v-1H5v1H3v-4.5Z" />
    <path d="M7 14h.01M17 14h.01" />
  </ModalIcon>
);

const CloseIcon = () => (
  <ModalIcon>
    <path d="M18 6 6 18M6 6l12 12" />
  </ModalIcon>
);

const CheckIcon = () => (
  <ModalIcon>
    <path d="m5 13 4 4L19 7" />
  </ModalIcon>
);

const CarSectionIcon = () => (
  <ModalIcon>
    <path d="m5 11 2-5h10l2 5" />
    <path d="M3 13.5 5 11h14l2 2.5V18h-2v-1H5v1H3v-4.5Z" />
    <path d="M7 14h.01M17 14h.01" />
  </ModalIcon>
);

const CameraIcon = () => (
  <ModalIcon>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </ModalIcon>
);

const CloudUploadIcon = () => (
  <ModalIcon>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m8 16 4-4 4 4" />
  </ModalIcon>
);

const UsersIcon = () => (
  <ModalIcon>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </ModalIcon>
);

const NoteIcon = () => (
  <ModalIcon>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </ModalIcon>
);

const DocumentHeaderIcon = () => (
  <ModalIcon>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </ModalIcon>
);

const SingleDocOutlineIcon = () => (
  <ModalIcon>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </ModalIcon>
);

const UploadSmallIcon = () => (
  <ModalIcon>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </ModalIcon>
);

const InfoCircleIcon = () => (
  <ModalIcon>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </ModalIcon>
);

const CalendarIcon = () => (
  <ModalIcon>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </ModalIcon>
);

const WrenchIcon = () => (
  <ModalIcon>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </ModalIcon>
);

const TireIcon = () => (
  <ModalIcon>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
  </ModalIcon>
);

const MessageSquareIcon = () => (
  <ModalIcon>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 9h8M8 13h5" />
  </ModalIcon>
);

const EditIcon = () => (
  <ModalIcon>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </ModalIcon>
);

const STEPS = [
  { id: 1, label: "Informations générales" },
  { id: 2, label: "Documents" },
  { id: 3, label: "Entretien" },
  { id: 4, label: "Validation" },
];

function DatePickerField({ value, onChange, placeholder = "jj/mm/aaaa", className = "av-input" }) {
  const hiddenDateInputRef = useRef(null);

  // Convert dd/mm/yyyy to yyyy-mm-dd for native date picker input
  const getIsoDate = (val) => {
    if (!val) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const parts = String(val).split("/");
    if (parts.length === 3 && parts[2]?.length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    return "";
  };

  // Convert yyyy-mm-dd to dd/mm/yyyy for text display and form data
  const handleNativeDateChange = (e) => {
    const raw = e.target.value;
    if (!raw) return;
    const [y, m, d] = raw.split("-");
    if (y && m && d) {
      onChange(`${d}/${m}/${y}`);
    }
  };

  const handleCalendarClick = () => {
    if (hiddenDateInputRef.current) {
      if (typeof hiddenDateInputRef.current.showPicker === "function") {
        hiddenDateInputRef.current.showPicker();
      } else {
        hiddenDateInputRef.current.focus();
        hiddenDateInputRef.current.click();
      }
    }
  };

  return (
    <div className="av-input-with-icon">
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="av-right-icon-btn"
        onClick={handleCalendarClick}
        title="Ouvrir le calendrier"
        aria-label="Ouvrir le calendrier"
      >
        <CalendarIcon />
      </button>
      <input
        ref={hiddenDateInputRef}
        type="date"
        className="av-hidden-native-date-picker"
        value={getIsoDate(value)}
        onChange={handleNativeDateChange}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

const ALLOWED_AGENCIES = new Set(["creil", "toulouse"]);
const AGENCY_ORDER = ["creil", "toulouse"];
const agencyKey = (name) => {
  const normalized = String(name || "").trim().toLowerCase();
  return AGENCY_ORDER.find((agency) => normalized.includes(agency)) || "";
};
const MAINTENANCE_TYPES = [
  "Vidange moteur", "Freins (plaquettes / disques)", "Pneumatiques",
  "Contrôle technique", "Distribution", "Embrayage", "Batterie",
  "Climatisation", "Éclairage / ampoules", "Essuie-glaces / lave-glace",
  "Niveaux / liquides", "Carrosserie / peinture", "Pare-brise / vitrage",
  "Mécanique / réparation", "Électronique / diagnostic",
  "Nettoyage / préparation", "Équipement auto-école / double commande", "Autre",
];
const TIRE_CONDITIONS = [
  { value: "good", label: "🟢 Bon — aucun remplacement à prévoir" },
  { value: "monitor", label: "🟠 À surveiller — usure présente, contrôle prochainement" },
  { value: "replace", label: "🔴 À remplacer — remplacement à prévoir rapidement" },
  { value: "unsafe", label: "⚫ HS / dangereux — véhicule à ne pas utiliser" },
];

export default function AddVehicleModal({ isOpen, onClose, onSaved, vehicleToEdit = null, selectedSchoolId = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [monitorsLoading, setMonitorsLoading] = useState(false);
  const [monitorLoadError, setMonitorLoadError] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [existingDocuments, setExistingDocuments] = useState({});
  const photoInputRef = useRef(null);
  const documentInputs = useRef({});

  // Form State initialized with realistic placeholder data as in screenshots
  const [formData, setFormData] = useState({
    // Step 1: Info véhicule
    make: "Renault",
    model: "Clio 5",
    trim: "Business, Zen, Intens...",
    immatriculation: "AB-123-CD",
    circulationDate: "15/03/2022",
    fuel: "Petrol",
    gearbox: "Manual",
    powerCv: "90",
    mileage: "45 230",
    color: "",
    agencyId: "",
    monitorId: "",
    notes: "",

    // Step 2: Documents (file names or uploaded state)
    docs: {
      carteGrise: null, assurance: null, controleTechnique: null,
      carteVerte: "",
      notice: "",
      certificat: "",
      photoInterieur: "",
    },
    assuranceExpiry: "15/09/2027",
    controleTechniqueExpiry: "20/04/2027",

    // Step 3: Entretien
    lastMaintenanceDate: "12/07/2025",
    nextMaintenanceDate: "12/07/2026",
    maintenanceMileage: "45 230",
    maintenanceKilometer: "15 000",
    maintenanceType: "Vidange moteur",
    maintenanceGarage: "Renault Creil",
    maintenanceCost: "320",
    tireFront: "good",
    tireRear: "good",
    tireChangeDate: "15/03/2024",
    tireMileage: "38 500",
    observations: "",
  });

  const isEditing = Boolean(vehicleToEdit);
  const toDisplayDate = (value) => value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value.split("-").reverse().join("/")
    : value || "";

  useEffect(() => {
    if (!isOpen || !vehicleToEdit) return;
    const maintenance = vehicleToEdit.maintenance || {};
    setCurrentStep(1);
    const storedUrl = (path) => path ? `${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/storage/${String(path).replace(/^\/?storage\//, "")}` : "";
    const documents = Object.fromEntries((vehicleToEdit.documents || []).map((document) => [document.document_type, document]));
    setExistingDocuments(documents);
    setPhotoPreview(vehicleToEdit.photo_url || storedUrl(vehicleToEdit.photo));
    setFormData((previous) => ({
      ...previous,
      make: vehicleToEdit.brand || "", model: vehicleToEdit.model || "", trim: vehicleToEdit.trim || "",
      immatriculation: vehicleToEdit.registration_number || "", circulationDate: toDisplayDate(vehicleToEdit.registration_date),
      fuel: vehicleToEdit.fuel_type || "Petrol", gearbox: vehicleToEdit.transmission || "Manual",
      powerCv: vehicleToEdit.power_cv ?? "", mileage: vehicleToEdit.current_mileage ?? "", color: vehicleToEdit.color || "",
      agencyId: vehicleToEdit.agency_id || "", monitorId: vehicleToEdit.monitor_id || "", notes: vehicleToEdit.notes || "", photo: null,
      assuranceExpiry: toDisplayDate(documents.assurance?.validity_date) || "15/09/2027",
      controleTechniqueExpiry: toDisplayDate(documents.controle_technique?.validity_date) || "20/04/2027",
      lastMaintenanceDate: toDisplayDate(maintenance.last_maintenance_date), nextMaintenanceDate: toDisplayDate(maintenance.next_maintenance_date),
      maintenanceMileage: maintenance.last_maintenance_mileage ?? "", maintenanceKilometer: maintenance.maintenance_kilometer ?? 15000,
      maintenanceType: maintenance.maintenance_type || "Vidange moteur",
      maintenanceGarage: maintenance.garage || "", maintenanceCost: maintenance.cost ?? "", tireFront: maintenance.tire_front_condition || "good",
      tireRear: maintenance.tire_rear_condition || "good", tireChangeDate: toDisplayDate(maintenance.tire_change_date),
      tireMileage: maintenance.tire_change_mileage ?? "", observations: maintenance.observations || "",
    }));
  }, [isOpen, vehicleToEdit]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setAgenciesLoading(true);
    http.get("/admin/locations/area")
      .then(({ data }) => {
        if (!active) return;
        const zones = Array.isArray(data?.data) ? data.data : [];
        const availableAgencies = zones
          .filter((zone) => ALLOWED_AGENCIES.has(agencyKey(zone.name)))
          .map((zone) => ({ ...zone, formLabel: agencyKey(zone.name) === "creil" ? "Creil" : "Toulouse" }))
          .sort((first, second) => AGENCY_ORDER.indexOf(agencyKey(first.name)) - AGENCY_ORDER.indexOf(agencyKey(second.name)));
        setAgencies(availableAgencies);
        const selectedAgency = availableAgencies.find((agency) => String(agency.id) === String(selectedSchoolId));
        setFormData((previous) => previous.agencyId || !availableAgencies[0]
          ? previous
          : { ...previous, agencyId: selectedAgency?.id || availableAgencies[0].id, monitorId: "" });
      })
      .catch(() => active && setAgencies([]))
      .finally(() => active && setAgenciesLoading(false));
    return () => { active = false; };
  }, [isOpen, selectedSchoolId]);

  useEffect(() => {
    if (!isOpen || !formData.agencyId) {
      setMonitors([]);
      return;
    }
    let active = true;
    setMonitorsLoading(true);
    setMonitorLoadError("");
    http.get("/admin/vehicles/monitors", { params: { zone_id: formData.agencyId } })
      .then(({ data }) => active && setMonitors(Array.isArray(data?.data) ? data.data : []))
      .catch(() => {
        if (!active) return;
        setMonitors([]);
        setMonitorLoadError("Impossible de charger les moniteurs de cette zone.");
      })
      .finally(() => active && setMonitorsLoading(false));
    return () => { active = false; };
  }, [isOpen, formData.agencyId]);

  if (!isOpen) return null;

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };
  const handlePhotoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Veuillez sélectionner une image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert("L'image ne doit pas dépasser 5 Mo.");
      return;
    }
    updateField("photo", file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  const selectedAgency = agencies.find((agency) => String(agency.id) === String(formData.agencyId));
  const selectedMonitor = monitors.find((monitor) => String(monitor.id) === String(formData.monitorId));
  const documentName = (field, type) => formData.docs[field]?.name || existingDocuments[type]?.file_name || "Ajouter un fichier";
  const tireConditionLabel = (value) => TIRE_CONDITIONS.find((condition) => condition.value === value)?.label || "-";
  const updateDocument = (key, file) => setFormData((prev) => ({ ...prev, docs: { ...prev.docs, [key]: file || null } }));
  const formatDate = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const [day, month, year] = String(value).split("/");
    return year && month && day ? `${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}` : value;
  };
  const maintenanceMileage = Number(String(formData.maintenanceMileage || "").replace(/\D/g, ""));
  const maintenanceInterval = Number(String(formData.maintenanceKilometer || "").replace(/\D/g, ""));
  const nextMaintenanceMileage = maintenanceMileage > 0 && maintenanceInterval > 0
    ? maintenanceMileage + maintenanceInterval
    : null;
  async function submitVehicle() {
    const missingFields = [
      !String(formData.make || "").trim() && "la marque",
      !String(formData.model || "").trim() && "le modèle",
      !String(formData.immatriculation || "").trim() && "l'immatriculation",
      !String(formData.circulationDate || "").trim() && "la date de mise en circulation",
      !String(formData.mileage || "").trim() && "le kilométrage",
    ].filter(Boolean);
    if (missingFields.length) {
      window.alert(`Veuillez renseigner ${missingFields.join(", ")}.`);
      setCurrentStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      const add = (key, value) => { if (value !== null && value !== undefined && value !== "") payload.append(key, value); };
      add("brand", formData.make); add("model", formData.model); add("trim", formData.trim); add("registration_number", formData.immatriculation);
      add("registration_date", formatDate(formData.circulationDate)); add("fuel_type", formData.fuel); add("transmission", formData.gearbox);
      add("power_cv", String(formData.powerCv).replace(/\D/g,"")); add("current_mileage", String(formData.mileage).replace(/\D/g,"")); add("color", formData.color); add("agency_id", formData.agencyId); add("monitor_id", formData.monitorId); add("notes", formData.notes);
      if (formData.photo) add("photo", formData.photo);
      const documents = { carte_grise: formData.docs.carteGrise, assurance: formData.docs.assurance, controle_technique: formData.docs.controleTechnique, carte_verte: formData.docs.carteVerte, notice_utilisation: formData.docs.notice, certificat_conformite: formData.docs.certificat, photo_interieur: formData.docs.photoInterieur };
      Object.entries(documents).forEach(([type, file]) => { if (file instanceof File) payload.append(`documents[${type}]`, file); });
      if (formData.assuranceExpiry) add("document_validity_dates[assurance]", formatDate(formData.assuranceExpiry));
      if (formData.controleTechniqueExpiry) add("document_validity_dates[controle_technique]", formatDate(formData.controleTechniqueExpiry));
      const maintenance = { last_maintenance_date: formatDate(formData.lastMaintenanceDate), next_maintenance_date: formatDate(formData.nextMaintenanceDate), last_maintenance_mileage: String(formData.maintenanceMileage).replace(/\D/g,""), maintenance_kilometer: String(formData.maintenanceKilometer).replace(/\D/g,""), maintenance_type: formData.maintenanceType, garage: formData.maintenanceGarage, cost: formData.maintenanceCost, tire_front_condition: formData.tireFront, tire_rear_condition: formData.tireRear, tire_change_date: formatDate(formData.tireChangeDate), tire_change_mileage: String(formData.tireMileage).replace(/\D/g,""), observations: formData.observations };
      Object.entries(maintenance).forEach(([key, value]) => add(`maintenance[${key}]`, value));
      if (isEditing) payload.append("_method", "PUT");
      const response = await http.post(isEditing ? `/admin/vehicles/${vehicleToEdit.id}` : "/admin/vehicles", payload, { headers: { "Content-Type": "multipart/form-data" } });
      onSaved?.(response.data.data); onClose();
    } catch (error) { window.alert(error.response?.data?.message || "Impossible d'ajouter le véhicule."); }
    finally { setSubmitting(false); }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  return (
    <div className="av-overlay" onClick={onClose}>
      <div
        className="av-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="av-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="av-header">
          <div className="av-header-left">
            <div className="av-header-icon-box">
              <HeaderCarIcon />
            </div>
            <div>
              <h2 id="av-modal-title" className="av-title">
                {isEditing ? "Modifier le véhicule" : "Ajouter un véhicule"}
              </h2>
              <p className="av-subtitle">
                Renseignez les informations de votre véhicule
              </p>
            </div>
          </div>
          <button
            type="button"
            className="av-close-btn"
            onClick={onClose}
            aria-label="Fermer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 4-STEP STEPPER */}
        <div className="av-stepper-container">
          <div className="av-stepper-line" />
          <div className="av-steps-row">
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`av-step-item ${isCompleted ? "is-completed" : ""} ${
                    isCurrent ? "is-current" : ""
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className="av-step-circle">
                    {isCompleted ? <CheckIcon /> : step.id}
                  </div>
                  <span className="av-step-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT BODY (SCROLLABLE) */}
        <div className="av-body">
          {/* ===================== STEP 1: INFORMATIONS GÉNÉRALES ===================== */}
          {currentStep === 1 && (
            <div className="av-step-layout">
              {/* Left Column */}
              <div className="av-col-left">
                {/* Card 1: Informations du véhicule */}
                <div className="av-card">
                  <div className="av-card-header">
                    <div className="av-card-icon">
                      <CarSectionIcon />
                    </div>
                    <div>
                      <h3 className="av-card-title">Informations du véhicule</h3>
                      <p className="av-card-desc">
                        Renseignez les caractéristiques de votre véhicule
                      </p>
                    </div>
                    {monitorLoadError && <span className="av-field-error">{monitorLoadError}</span>}
                  </div>

                  <div className="av-form-grid-2">
                    <div className="av-form-group">
                      <label className="av-label">
                        Marque <span className="av-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="av-input"
                        placeholder="Ex : Renault"
                        value={formData.make}
                        onChange={(e) => updateField("make", e.target.value)}
                      />
                    </div>

                    <div className="av-form-group">
                      <label className="av-label">
                        Modèle <span className="av-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="av-input"
                        placeholder="Ex : Clio 5"
                        value={formData.model}
                        onChange={(e) => updateField("model", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="av-form-group av-mt-12">
                    <label className="av-label">Finition</label>
                    <input
                      type="text"
                      className="av-input"
                      placeholder="Ex : Business, Zen, Intens..."
                      value={formData.trim}
                      onChange={(e) => updateField("trim", e.target.value)}
                    />
                  </div>

                  <div className="av-form-grid-2 av-mt-12">
                    <div className="av-form-group">
                      <label className="av-label">
                        Immatriculation <span className="av-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="av-input av-mono"
                        placeholder="AB-123-CD"
                        value={formData.immatriculation}
                        onChange={(e) => updateField("immatriculation", e.target.value)}
                      />
                    </div>

                    <div className="av-form-group">
                      <label className="av-label">
                        Date de mise en circulation <span className="av-required">*</span>
                      </label>
                      <DatePickerField
                        value={formData.circulationDate}
                        onChange={(val) => updateField("circulationDate", val)}
                        placeholder="15/03/2022"
                      />
                    </div>
                  </div>

                  <div className="av-form-grid-3 av-mt-12">
                    <div className="av-form-group">
                      <label className="av-label">
                        Carburant <span className="av-required">*</span>
                      </label>
                      <div className="av-select-wrapper">
                        <select
                          className="av-input av-select"
                          value={formData.fuel}
                          onChange={(e) => updateField("fuel", e.target.value)}
                        >
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Electric">Electric</option>
                        </select>
                      </div>
                    </div>

                    <div className="av-form-group">
                      <label className="av-label">
                        Boîte de vitesse <span className="av-required">*</span>
                      </label>
                      <div className="av-select-wrapper">
                        <select
                          className="av-input av-select"
                          value={formData.gearbox}
                          onChange={(e) => updateField("gearbox", e.target.value)}
                        >
                          <option value="Manual">Manual</option>
                          <option value="Automatic">Automatic</option>
                        </select>
                      </div>
                    </div>

                    <div className="av-form-group">
                      <label className="av-label">Puissance (CV)</label>
                      <input
                        type="text"
                        className="av-input"
                        placeholder="90"
                        value={formData.powerCv}
                        onChange={(e) => updateField("powerCv", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="av-form-grid-2 av-mt-12">
                    <div className="av-form-group">
                      <label className="av-label">
                        Kilométrage actuel <span className="av-required">*</span>
                      </label>
                      <div className="av-input-with-unit">
                        <input
                          type="text"
                          className="av-input"
                          placeholder="45 230"
                          value={formData.mileage}
                          onChange={(e) => updateField("mileage", e.target.value)}
                        />
                        <span className="av-unit-suffix">km</span>
                      </div>
                    </div>

                    <div className="av-form-group">
                      <label className="av-label">Couleur (optionnel)</label>
                      <div className="av-select-wrapper has-left-dot">
                        <span
                          className="av-color-preview-dot"
                          style={{
                            backgroundColor:
                              formData.color === "Grey"
                                ? "#77838f"
                                : formData.color === "White"
                                ? "#ffffff"
                                : formData.color === "Black"
                                ? "#1a1a1a"
                                : formData.color === "Blue"
                                ? "#2e6cf6"
                                : formData.color === "Green"
                                ? "#178a4c"
                                : formData.color === "Yellow"
                                ? "#eab308"
                                : formData.color === "Orange"
                                ? "#f97316"
                                : formData.color === "Brown"
                                ? "#7c4a2d"
                                : "#d03b3b",
                          }}
                        />
                        <select
                          className="av-input av-select"
                          value={formData.color}
                          onChange={(e) => updateField("color", e.target.value)}
                        >
                          <option value="">Non renseignée</option>
                          <option value="Blue">Blue</option>
                          <option value="White">White</option>
                          <option value="Black">Black</option>
                          <option value="Grey">Grey</option>
                          <option value="Silver">Silver</option>
                          <option value="Red">Red</option>
                          <option value="Green">Green</option>
                          <option value="Yellow">Yellow</option>
                          <option value="Orange">Orange</option>
                          <option value="Brown">Brown</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 (Bottom Left): Notes (optionnel) */}
                <div className="av-card av-mt-14">
                  <div className="av-card-header">
                    <div className="av-card-icon">
                      <NoteIcon />
                    </div>
                    <div>
                      <h3 className="av-card-title">Notes (optionnel)</h3>
                      <p className="av-card-desc">
                        Ajoutez des informations complémentaires
                      </p>
                    </div>
                  </div>

                  <div className="av-textarea-wrap">
                    <textarea
                      className="av-textarea"
                      rows={3}
                      placeholder="Ex : commentaire, particularités du véhicule, équipements, etc."
                      value={formData.notes}
                      maxLength={500}
                      onChange={(e) => updateField("notes", e.target.value)}
                    />
                    <div className="av-char-counter">
                      {formData.notes.length}/500
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="av-col-right">
                {/* Photo du véhicule */}
                <div className="av-card">
                  <div className="av-card-header">
                    <div className="av-card-icon">
                      <CameraIcon />
                    </div>
                    <div>
                      <h3 className="av-card-title">Photo du véhicule</h3>
                      <p className="av-card-desc">
                        Ajoutez une photo pour l'identifier facilement
                      </p>
                    </div>
                  </div>

                  <div
                    className="av-photo-dropzone"
                    role="button"
                    tabIndex={0}
                    onClick={() => photoInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") photoInputRef.current?.click();
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handlePhotoFile(event.dataTransfer.files?.[0]);
                    }}
                  >
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        handlePhotoFile(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                    <div className="av-dropzone-cloud-icon">
                      <CloudUploadIcon />
                    </div>
                    <button type="button" className="av-dropzone-link" onClick={(event) => { event.stopPropagation(); photoInputRef.current?.click(); }}>
                      {formData.photo?.name || "Cliquez pour ajouter une photo"}
                    </button>
                    <span className="av-dropzone-sub">
                      ou glissez-déposez une image ici
                    </span>
                    <span className="av-dropzone-hint">
                      Formats acceptés : JPG, PNG (max 5 Mo)
                    </span>
                    {photoPreview && <img className="av-photo-preview" src={photoPreview} onError={(event) => { event.currentTarget.style.display = "none"; }} alt="Aperçu du véhicule" />}
                  </div>
                </div>

                {/* Affectation */}
                <div className="av-card av-mt-14">
                  <div className="av-card-header">
                    <div className="av-card-icon">
                      <UsersIcon />
                    </div>
                    <div>
                      <h3 className="av-card-title">Affectation</h3>
                      <p className="av-card-desc">
                        Choisissez l'agence et le moniteur principal
                      </p>
                    </div>
                  </div>

                  <div className="av-form-group">
                    <label className="av-label">
                      Agence <span className="av-required">*</span>
                    </label>
                    <div className="av-select-wrapper">
                      <select
                        className="av-input av-select"
                        value={formData.agencyId}
                        disabled={agenciesLoading}
                        onChange={(e) => setFormData((previous) => ({
                          ...previous,
                          agencyId: e.target.value,
                          monitorId: "",
                        }))}
                      >
                        <option value="">{agenciesLoading ? "Chargement..." : "Sélectionnez une agence"}</option>
                        {agencies.map((agency) => (
                          <option key={agency.id} value={agency.id}>{agency.formLabel}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="av-form-group av-mt-12">
                    <label className="av-label">Moniteur principal</label>
                    <div className="av-select-wrapper">
                      <select
                        className="av-input av-select av-muted-select"
                        value={formData.monitorId}
                        disabled={!formData.agencyId || monitorsLoading}
                        onChange={(e) => updateField("monitorId", e.target.value)}
                      >
                        <option value="">
                          {!formData.agencyId
                            ? "Sélectionnez d'abord une agence"
                            : monitorsLoading
                            ? "Chargement..."
                            : monitors.length
                            ? "Aucun moniteur"
                            : "Aucun moniteur actif dans cette zone"}
                        </option>
                        {monitors.map((monitor) => (
                          <option key={monitor.id} value={monitor.id}>{monitor.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 2: DOCUMENTS ===================== */}
          {currentStep === 2 && (
            <div className="av-step-docs">
              <input ref={(node) => { documentInputs.current.carte_grise = node; }} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => updateDocument("carteGrise", e.target.files?.[0])} />
              <input ref={(node) => { documentInputs.current.assurance = node; }} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => updateDocument("assurance", e.target.files?.[0])} />
              <input ref={(node) => { documentInputs.current.controle_technique = node; }} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => updateDocument("controleTechnique", e.target.files?.[0])} />
              <input ref={(node) => { documentInputs.current.carte_verte = node; }} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => updateDocument("carteVerte", e.target.files?.[0])} />
              <input ref={(node) => { documentInputs.current.notice_utilisation = node; }} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => updateDocument("notice", e.target.files?.[0])} />
              <input ref={(node) => { documentInputs.current.certificat_conformite = node; }} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => updateDocument("certificat", e.target.files?.[0])} />
              <input ref={(node) => { documentInputs.current.photo_interieur = node; }} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => updateDocument("photoInterieur", e.target.files?.[0])} />
              {/* Section 1: Documents obligatoires */}
              <div className="av-card">
                <div className="av-card-header">
                  <div className="av-card-icon">
                    <DocumentHeaderIcon />
                  </div>
                  <div>
                    <h3 className="av-card-title">Documents obligatoires</h3>
                    <p className="av-card-desc">
                      Ajoutez les documents nécessaires pour votre véhicule
                    </p>
                  </div>
                </div>

                <div className="av-docs-grid-4">
                  {/* Doc 1: Carte grise */}
                  <div className="av-doc-card">
                    <div className="av-doc-card-icon">
                      <SingleDocOutlineIcon />
                    </div>
                    <h4 className="av-doc-card-title">
                      Carte grise <span className="av-required">*</span>
                    </h4>
                    <p className="av-doc-card-format">
                      Format : PDF, JPG, PNG
                      <br />
                      (max 5 Mo)
                    </p>
                    <button type="button" className="av-doc-upload-btn" onClick={() => documentInputs.current.carte_grise?.click()}>
                      <UploadSmallIcon /> {documentName("carteGrise", "carte_grise")}
                    </button>
                  </div>

                  {/* Doc 2: Assurance */}
                  <div className="av-doc-card">
                    <div className="av-doc-card-icon">
                      <SingleDocOutlineIcon />
                    </div>
                    <h4 className="av-doc-card-title">
                      Assurance <span className="av-required">*</span>
                    </h4>
                    <p className="av-doc-card-format">
                      Format : PDF, JPG, PNG
                      <br />
                      (max 5 Mo)
                    </p>
                    <button type="button" className="av-doc-upload-btn" onClick={() => documentInputs.current.assurance?.click()}>
                      <UploadSmallIcon /> {documentName("assurance", "assurance")}
                    </button>
                    <div className="av-doc-date-field">
                      <label className="av-doc-date-label">
                        Date de fin de validité <span className="av-required">*</span>
                      </label>
                      <DatePickerField
                        className="av-input av-doc-date-input"
                        value={formData.assuranceExpiry}
                        onChange={(val) => updateField("assuranceExpiry", val)}
                        placeholder="jj/mm/aaaa"
                      />
                    </div>
                  </div>

                  {/* Doc 3: Contrôle technique */}
                  <div className="av-doc-card">
                    <div className="av-doc-card-icon">
                      <SingleDocOutlineIcon />
                    </div>
                    <h4 className="av-doc-card-title">
                      Contrôle technique <span className="av-required">*</span>
                    </h4>
                    <p className="av-doc-card-format">
                      Format : PDF, JPG, PNG
                      <br />
                      (max 5 Mo)
                    </p>
                    <button type="button" className="av-doc-upload-btn" onClick={() => documentInputs.current.controle_technique?.click()}>
                      <UploadSmallIcon /> {documentName("controleTechnique", "controle_technique")}
                    </button>
                    <div className="av-doc-date-field">
                      <label className="av-doc-date-label">
                        Date de fin de validité <span className="av-required">*</span>
                      </label>
                      <DatePickerField
                        className="av-input av-doc-date-input"
                        value={formData.controleTechniqueExpiry}
                        onChange={(val) => updateField("controleTechniqueExpiry", val)}
                        placeholder="jj/mm/aaaa"
                      />
                    </div>
                  </div>

                  {/* Doc 4: Carte verte (optionnel) */}
                  <div className="av-doc-card">
                    <div className="av-doc-card-icon">
                      <SingleDocOutlineIcon />
                    </div>
                    <h4 className="av-doc-card-title">
                      Carte verte
                      <br />
                      <span className="av-opt-tag">(optionnel)</span>
                    </h4>
                    <p className="av-doc-card-format">
                      Format : PDF, JPG, PNG
                      <br />
                      (max 5 Mo)
                    </p>
                    <button type="button" className="av-doc-upload-btn" onClick={() => documentInputs.current.carte_verte?.click()}>
                      <UploadSmallIcon /> {documentName("carteVerte", "carte_verte")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Autres documents (optionnels) */}
              <div className="av-card av-mt-14">
                <div className="av-card-header">
                  <div className="av-card-icon">
                    <DocumentHeaderIcon />
                  </div>
                  <div>
                    <h3 className="av-card-title">Autres documents (optionnels)</h3>
                    <p className="av-card-desc">
                      Ajoutez d'autres documents si nécessaire
                    </p>
                  </div>
                </div>

                <div className="av-docs-grid-3">
                  {/* Option 1: Notice d'utilisation */}
                  <div className="av-doc-card">
                    <div className="av-doc-card-icon">
                      <SingleDocOutlineIcon />
                    </div>
                    <h4 className="av-doc-card-title">Notice d'utilisation</h4>
                    <p className="av-doc-card-format">
                      Format : PDF, JPG, PNG
                      <br />
                      (max 5 Mo)
                    </p>
                    <button type="button" className="av-doc-upload-btn" onClick={() => documentInputs.current.notice_utilisation?.click()}>
                      <UploadSmallIcon /> {documentName("notice", "notice_utilisation")}
                    </button>
                  </div>

                  {/* Option 2: Certificat de conformité */}
                  <div className="av-doc-card">
                    <div className="av-doc-card-icon">
                      <SingleDocOutlineIcon />
                    </div>
                    <h4 className="av-doc-card-title">Certificat de conformité</h4>
                    <p className="av-doc-card-format">
                      Format : PDF, JPG, PNG
                      <br />
                      (max 5 Mo)
                    </p>
                    <button type="button" className="av-doc-upload-btn" onClick={() => documentInputs.current.certificat_conformite?.click()}>
                      <UploadSmallIcon /> {documentName("certificat", "certificat_conformite")}
                    </button>
                  </div>

                  {/* Option 3: Photo intérieur */}
                  <div className="av-doc-card">
                    <div className="av-doc-card-icon">
                      <SingleDocOutlineIcon />
                    </div>
                    <h4 className="av-doc-card-title">Photo intérieur</h4>
                    <p className="av-doc-card-format">
                      Format : PDF, JPG, PNG
                      <br />
                      (max 5 Mo)
                    </p>
                    <button type="button" className="av-doc-upload-btn" onClick={() => documentInputs.current.photo_interieur?.click()}>
                      <UploadSmallIcon /> {documentName("photoInterieur", "photo_interieur")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bon à savoir Info Box */}
              <div className="av-info-box av-mt-14">
                <div className="av-info-icon">
                  <InfoCircleIcon />
                </div>
                <div className="av-info-content">
                  <h5 className="av-info-title">Bon à savoir</h5>
                  <p className="av-info-desc">
                    Les documents doivent être lisibles, complets et en cours de validité.
                    <br />
                    Formats acceptés : PDF, JPG, PNG (max 5 Mo par fichier).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 3: ENTRETIEN ===================== */}
          {currentStep === 3 && (
            <div className="av-step-maintenance">
              {/* Suivi de l'entretien Card */}
              <div className="av-card">
                <div className="av-card-header">
                  <div className="av-card-icon">
                    <WrenchIcon />
                  </div>
                  <div>
                    <h3 className="av-card-title">Suivi de l'entretien</h3>
                    <p className="av-card-desc">
                      Renseignez les informations d'entretien de votre véhicule
                    </p>
                  </div>
                </div>

                <div className="av-form-grid-2">
                  <div className="av-form-group">
                    <label className="av-label">
                      Date du dernier entretien <span className="av-required">*</span>
                    </label>
                    <DatePickerField
                      value={formData.lastMaintenanceDate}
                      onChange={(val) => updateField("lastMaintenanceDate", val)}
                      placeholder="12/07/2025"
                    />
                  </div>

                  <div className="av-form-group">
                    <label className="av-label">
                      Prochain entretien <span className="av-required">*</span>
                    </label>
                    <DatePickerField
                      value={formData.nextMaintenanceDate}
                      onChange={(val) => updateField("nextMaintenanceDate", val)}
                      placeholder="12/07/2026"
                    />
                  </div>
                </div>

                <div className="av-form-grid-2 av-mt-12">
                  <div className="av-form-group">
                    <label className="av-label">
                      Kilométrage lors du dernier entretien <span className="av-required">*</span>
                    </label>
                    <div className="av-input-with-unit">
                      <input
                        type="text"
                        className="av-input"
                        placeholder="45 230"
                        value={formData.maintenanceMileage}
                        onChange={(e) => updateField("maintenanceMileage", e.target.value)}
                      />
                      <span className="av-unit-suffix">km</span>
                    </div>
                  </div>

                  <div className="av-form-group">
                    <label className="av-label">Kilométrage de maintenance <span className="av-required">*</span></label>
                    <div className="av-input-with-unit">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="av-input"
                        placeholder="15 000"
                        value={formData.maintenanceKilometer}
                        onChange={(e) => updateField("maintenanceKilometer", e.target.value)}
                      />
                      <span className="av-unit-suffix">km</span>
                    </div>
                    {nextMaintenanceMileage && <small className="av-maintenance-km-preview">Prochain entretien à {nextMaintenanceMileage.toLocaleString("fr-FR")} km</small>}
                  </div>
                </div>

                <div className="av-form-grid-2 av-mt-12">
                  <div className="av-form-group">
                    <label className="av-label">
                      Type d'entretien <span className="av-required">*</span>
                    </label>
                    <div className="av-select-wrapper">
                      <select
                        className="av-input av-select"
                        value={formData.maintenanceType}
                        onChange={(e) => updateField("maintenanceType", e.target.value)}
                      >
                        {MAINTENANCE_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="av-form-grid-2 av-mt-12">
                  <div className="av-form-group">
                    <label className="av-label">Garage / Centre d'entretien</label>
                    <input
                      type="text"
                      className="av-input"
                      placeholder="Renault Creil"
                      value={formData.maintenanceGarage}
                      onChange={(e) => updateField("maintenanceGarage", e.target.value)}
                    />
                  </div>

                  <div className="av-form-group">
                    <label className="av-label">Coût de l'entretien</label>
                    <div className="av-input-with-unit">
                      <input
                        type="text"
                        className="av-input"
                        placeholder="320"
                        value={formData.maintenanceCost}
                        onChange={(e) => updateField("maintenanceCost", e.target.value)}
                      />
                      <span className="av-unit-suffix">€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pneumatiques Card */}
              <div className="av-card av-mt-14">
                <div className="av-card-header">
                  <div className="av-card-icon">
                    <TireIcon />
                  </div>
                  <div>
                    <h3 className="av-card-title">Pneumatiques</h3>
                    <p className="av-card-desc">
                      État et informations sur les pneus
                    </p>
                  </div>
                </div>

                <div className="av-form-grid-3">
                  <div className="av-form-group">
                    <label className="av-label">
                      État des pneus avant <span className="av-required">*</span>
                    </label>
                    <div className="av-select-wrapper">
                      <select
                        className="av-input av-select"
                        value={formData.tireFront}
                        onChange={(e) => updateField("tireFront", e.target.value)}
                      >
                        {TIRE_CONDITIONS.map((condition) => (
                          <option key={condition.value} value={condition.value}>{condition.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="av-form-group">
                    <label className="av-label">
                      État des pneus arrière <span className="av-required">*</span>
                    </label>
                    <div className="av-select-wrapper">
                      <select
                        className="av-input av-select"
                        value={formData.tireRear}
                        onChange={(e) => updateField("tireRear", e.target.value)}
                      >
                        {TIRE_CONDITIONS.map((condition) => (
                          <option key={condition.value} value={condition.value}>{condition.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

                <div className="av-form-grid-2 av-mt-12">
                  <div className="av-form-group">
                    <label className="av-label">Date de changement</label>
                    <DatePickerField
                      value={formData.tireChangeDate}
                      onChange={(val) => updateField("tireChangeDate", val)}
                      placeholder="15/03/2024"
                    />
                  </div>

                  <div className="av-form-group">
                    <label className="av-label">Kilométrage au changement</label>
                    <div className="av-input-with-unit">
                      <input
                        type="text"
                        className="av-input"
                        placeholder="38 500"
                        value={formData.tireMileage}
                        onChange={(e) => updateField("tireMileage", e.target.value)}
                      />
                      <span className="av-unit-suffix">km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observations Card */}
              <div className="av-card av-mt-14">
                <div className="av-card-header">
                  <div className="av-card-icon">
                    <MessageSquareIcon />
                  </div>
                  <div>
                    <h3 className="av-card-title">Observations (optionnel)</h3>
                    <p className="av-card-desc">
                      Ajoutez des commentaires sur l'état général du véhicule
                    </p>
                  </div>
                </div>

                <div className="av-textarea-wrap">
                  <textarea
                    className="av-textarea"
                    rows={3}
                    placeholder="Ex : état général, réparations récentes, points d'attention..."
                    value={formData.observations}
                    maxLength={500}
                    onChange={(e) => updateField("observations", e.target.value)}
                  />
                  <div className="av-char-counter">
                    {formData.observations.length}/500
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 4: VALIDATION (REVIEW SUMMARY) ===================== */}
          {currentStep === 4 && (
            <div className="av-step-validation">
              {/* Summary Card 1: Informations générales */}
              <div className="av-card">
                <div className="av-card-header av-card-header--between">
                  <div className="av-card-header-left">
                    <div className="av-card-icon">
                      <CarSectionIcon />
                    </div>
                    <div>
                      <h3 className="av-card-title">Informations générales</h3>
                      <p className="av-card-desc">
                        Caractéristiques et affectation du véhicule
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="av-btn-edit"
                    onClick={() => setCurrentStep(1)}
                  >
                    <EditIcon /> Modifier
                  </button>
                </div>

                <div className="av-val-grid">
                  <div className="av-val-item">
                    <span className="av-val-label">Véhicule</span>
                    <strong className="av-val-value">
                      {formData.make} {formData.model}
                    </strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Finition</span>
                    <strong className="av-val-value">{formData.trim || "-"}</strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Immatriculation</span>
                    <span className="av-plate-badge">{formData.immatriculation}</span>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Date 1ère mise en circulation</span>
                    <strong className="av-val-value">{formData.circulationDate}</strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Motorisation / Boîte</span>
                    <strong className="av-val-value">
                      {formData.fuel} • {formData.gearbox} ({formData.powerCv} CV)
                    </strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Kilométrage / Couleur</span>
                    <strong className="av-val-value">
                      {formData.mileage} km • {formData.color}
                    </strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Agence de rattachement</span>
                    <strong className="av-val-value">{selectedAgency?.formLabel || "Non renseignée"}</strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Moniteur principal</span>
                    <strong className="av-val-value">
                      {selectedMonitor?.name || "Non affecté"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Summary Card 2: Documents */}
              <div className="av-card av-mt-14">
                <div className="av-card-header av-card-header--between">
                  <div className="av-card-header-left">
                    <div className="av-card-icon">
                      <DocumentHeaderIcon />
                    </div>
                    <div>
                      <h3 className="av-card-title">Documents</h3>
                      <p className="av-card-desc">
                        Documents administratifs et justificatifs
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="av-btn-edit"
                    onClick={() => setCurrentStep(2)}
                  >
                    <EditIcon /> Modifier
                  </button>
                </div>

                <div className="av-val-docs-list">
                  <div className="av-val-doc-item">
                    <div className="av-val-doc-left">
                      <SingleDocOutlineIcon />
                      <div>
                        <strong>Carte grise</strong>
                        <small>Document fourni et vérifié</small>
                      </div>
                    </div>
                    <span className="av-badge-green">Valide</span>
                  </div>

                  <div className="av-val-doc-item">
                    <div className="av-val-doc-left">
                      <SingleDocOutlineIcon />
                      <div>
                        <strong>Attestation d'assurance</strong>
                        <small>Document fourni et vérifié</small>
                      </div>
                    </div>
                    <span className="av-badge-green">Valide</span>
                  </div>

                  <div className="av-val-doc-item">
                    <div className="av-val-doc-left">
                      <SingleDocOutlineIcon />
                      <div>
                        <strong>Contrôle technique</strong>
                        <small>Document fourni et vérifié</small>
                      </div>
                    </div>
                    <span className="av-badge-green">Valide</span>
                  </div>

                  <div className="av-val-doc-item">
                    <div className="av-val-doc-left">
                      <SingleDocOutlineIcon />
                      <div>
                        <strong>Carte verte & autres</strong>
                        <small>En attente d'ajout (optionnel)</small>
                      </div>
                    </div>
                    <span className="av-badge-gray">Optionnel</span>
                  </div>
                </div>
              </div>

              {/* Summary Card 3: Entretien */}
              <div className="av-card av-mt-14">
                <div className="av-card-header av-card-header--between">
                  <div className="av-card-header-left">
                    <div className="av-card-icon">
                      <WrenchIcon />
                    </div>
                    <div>
                      <h3 className="av-card-title">Entretien</h3>
                      <p className="av-card-desc">
                        Calendrier et historique des révisions
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="av-btn-edit"
                    onClick={() => setCurrentStep(3)}
                  >
                    <EditIcon /> Modifier
                  </button>
                </div>

                <div className="av-val-grid">
                  <div className="av-val-item">
                    <span className="av-val-label">Dernier entretien</span>
                    <strong className="av-val-value">
                      {formData.lastMaintenanceDate} ({formData.maintenanceMileage} km)
                    </strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Prochain entretien prévu</span>
                    <strong className="av-val-value">
                      {formData.nextMaintenanceDate}
                    </strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Type & Centre</span>
                    <strong className="av-val-value">
                      {formData.maintenanceType} - {formData.maintenanceGarage || "N/C"}
                    </strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Coût estimé</span>
                    <strong className="av-val-value">
                      {formData.maintenanceCost ? `${formData.maintenanceCost} €` : "N/C"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Summary Card 4: Pneumatiques */}
              <div className="av-card av-mt-14">
                <div className="av-card-header av-card-header--between">
                  <div className="av-card-header-left">
                    <div className="av-card-icon">
                      <TireIcon />
                    </div>
                    <div>
                      <h3 className="av-card-title">Pneumatiques</h3>
                      <p className="av-card-desc">
                        État général du train roulant
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="av-btn-edit"
                    onClick={() => setCurrentStep(3)}
                  >
                    <EditIcon /> Modifier
                  </button>
                </div>

                <div className="av-val-grid">
                  <div className="av-val-item">
                    <span className="av-val-label">Pneus avant</span>
                    <strong className="av-val-value">{tireConditionLabel(formData.tireFront)}</strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Pneus arrière</span>
                    <strong className="av-val-value">{tireConditionLabel(formData.tireRear)}</strong>
                  </div>
                  <div className="av-val-item">
                    <span className="av-val-label">Dernier changement</span>
                    <strong className="av-val-value">
                      {formData.tireChangeDate} ({formData.tireMileage} km)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Summary Card 5: Observations */}
              <div className="av-card av-mt-14">
                <div className="av-card-header av-card-header--between">
                  <div className="av-card-header-left">
                    <div className="av-card-icon">
                      <MessageSquareIcon />
                    </div>
                    <div>
                      <h3 className="av-card-title">Observations & Notes</h3>
                      <p className="av-card-desc">
                        Notes et remarques particulières
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="av-btn-edit"
                    onClick={() => setCurrentStep(formData.observations ? 3 : 1)}
                  >
                    <EditIcon /> Modifier
                  </button>
                </div>

                <div className="av-val-notes-box">
                  <p>
                    {formData.observations || formData.notes || "Aucune observation particulière enregistrée."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="av-footer">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                className="av-btn-cancel"
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                type="button"
                className="av-btn-primary"
                onClick={nextStep}
              >
                <span className="av-plus-sign">+</span> Ajouter le véhicule
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="av-btn-cancel"
                onClick={prevStep}
              >
                Retour
              </button>
              {currentStep < 4 ? (
                <button
                  type="button"
                  className="av-btn-primary"
                  onClick={nextStep}
                >
                  Suivant <span className="av-arrow">›</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="av-btn-primary"
                  onClick={submitVehicle}
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement..." : isEditing ? "Enregistrer les modifications" : "Ajouter le véhicule"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
