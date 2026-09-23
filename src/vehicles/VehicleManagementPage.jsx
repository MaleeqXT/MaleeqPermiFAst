import { useEffect, useMemo, useState } from "react";
import http from "../helpers/http.jsx";
import vehicleImage from "../assets/vehicle-image.png";
import AddVehicleModal from "./AddVehicleModal";
import "./VehicleManagementPage.css";

function Icon({ children, className = "" }) {
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

const CarIcon = () => <Icon><path d="m5 11 2-5h10l2 5" /><path d="M3 13.5 5 11h14l2 2.5V18h-2v-1H5v1H3v-4.5Z" /><path d="M7 14h.01M17 14h.01" /></Icon>;
const CheckIcon = () => <Icon><circle cx="12" cy="12" r="9" /><path d="m8 12 2.6 2.6L16.5 9" /></Icon>;
const WarningIcon = () => <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></Icon>;
const AlertIcon = () => <Icon><path d="M10.3 3.4 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></Icon>;
const SearchIcon = () => <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>;
const FilterIcon = () => <Icon><path d="M4 6h16M7 12h10M10 18h4" /></Icon>;
const MoreIcon = () => <Icon><circle cx="5" cy="12" r=".7" fill="currentColor" /><circle cx="12" cy="12" r=".7" fill="currentColor" /><circle cx="19" cy="12" r=".7" fill="currentColor" /></Icon>;
const PlusIcon = () => <Icon><path d="M12 5v14M5 12h14" /></Icon>;
const FolderIcon = () => <Icon><path d="M3 7h7l2 2h9v10H3V7Z" /></Icon>;
const ShieldIcon = () => <Icon><path d="M12 3 5 6v5c0 4.8 2.8 8 7 10 4.2-2 7-5.2 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></Icon>;
const ClipboardIcon = () => <Icon><path d="M9 5h6M9 3h6v4H9V3Z" /><path d="M7 5H5v16h14V5h-2M8 11h8M8 15h6" /></Icon>;
const FileIcon = () => <Icon><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></Icon>;
const CalendarIcon = () => <Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></Icon>;
const GaugeIcon = () => <Icon><path d="M4.9 19a9 9 0 1 1 14.2 0" /><path d="m12 13 4-4M8 19h8" /></Icon>;
const MapPinIcon = () => <Icon><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.3" /></Icon>;
const UserIcon = () => <Icon><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></Icon>;
const FuelIcon = () => <Icon><path d="M5 21V4h10v17M3 21h14M7 8h6" /><path d="m15 9 3 3v6a2 2 0 0 0 4 0v-8l-2-2" /></Icon>;
const SettingsIcon = () => <Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></Icon>;
const PencilIcon = () => <Icon><path d="m4 20 4.2-1 10.7-10.7-3.2-3.2L5 15.8 4 20Z" /><path d="m14.5 6.3 3.2 3.2" /></Icon>;
const WrenchIcon = () => <Icon><path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L4 17l3 3 8.3-8.3a4 4 0 0 0 5-5L18 9l-2.4-2.4 2.3-2.3a4 4 0 0 0-3.2 2Z" /></Icon>;
const LandmarkIcon = () => <Icon><path d="m3 9 9-5 9 5M5 10v7M9 10v7M15 10v7M19 10v7M3 20h18M2 8h20" /></Icon>;
const HistoryIcon = () => <Icon><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></Icon>;
const CoinsIcon = () => <Icon><ellipse cx="9" cy="6" rx="6" ry="3" /><path d="M3 6v4c0 1.7 2.7 3 6 3 1.1 0 2.1-.1 3-.4M3 10v4c0 1.7 2.7 3 6 3" /><ellipse cx="15" cy="15" rx="6" ry="3" /><path d="M9 15v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" /></Icon>;

const VEHICLES = [
  {
    id: "clio-creil",
    name: "Clio 5",
    plate: "AB-123-CD",
    model: "Renault Clio V",
    agency: "Creil",
    mileage: "45 230 km",
    insurance: { label: "Valide", date: "15/03/2027", tone: "success" },
    technical: { label: "Valide", date: "12/04/2026", tone: "success" },
    registration: { label: "Valide", date: "", tone: "success" },
    maintenance: { label: "Dans 850 km", date: "12/07/2025", tone: "warning" },
    categories: [],
    circulation: "15/03/2022",
    instructor: "Jordy",
    fuel: "Essence",
    gearbox: "Manuelle",
  },
  {
    id: "i20-creil",
    name: "i20 II",
    plate: "EF-456-GH",
    model: "Hyundai i20",
    agency: "Creil",
    mileage: "62 100 km",
    insurance: { label: "Valide", date: "03/02/2027", tone: "success" },
    technical: { label: "Expiré", date: "25/06/2024", tone: "error" },
    registration: { label: "Valide", date: "", tone: "success" },
    maintenance: { label: "À jour", date: "08/2025", tone: "success" },
    categories: ["technical"],
    circulation: "08/06/2021",
    instructor: "Ahmed",
    fuel: "Essence",
    gearbox: "Automatique",
  },

  {
    id: "fiat-creil",
    name: "Fiat 500",
    plate: "IJ-789-KL",
    model: "Fiat 500 Hybrid",
    agency: "Creil",
    mileage: "38 450 km",
    insurance: { label: "Expire dans 32 j", date: "10/06/2025", tone: "warning" },
    technical: { label: "Valide", date: "30/04/2026", tone: "success" },
    registration: { label: "Valide", date: "", tone: "success" },
    maintenance: { label: "À jour", date: "05/2025", tone: "success" },
    categories: ["insurance"],
    circulation: "19/09/2023",
    instructor: "Sophie",
    fuel: "Hybride",
    gearbox: "Automatique",
  },

  {
    id: "clio-toulouse",
    name: "Clio 5",
    plate: "MN-321-OP",
    model: "Renault Clio V",
    agency: "Toulouse",
    mileage: "52 300 km",
    insurance: { label: "Valide", date: "28/11/2026", tone: "success" },
    technical: { label: "Valide", date: "18/02/2026", tone: "success" },
    registration: { label: "Valide", date: "", tone: "success" },
    maintenance: { label: "Dans 1 200 km", date: "15/07/2025", tone: "warning" },
    categories: ["maintenance"],
    circulation: "02/10/2022",
    instructor: "Jordy",
    fuel: "Diesel",
    gearbox: "Manuelle",
  },
  
  {
    id: "i20-toulouse",
    name: "i20 II",
    plate: "QR-654-ST",
    model: "Hyundai i20",
    agency: "Toulouse",
    mileage: "71 000 km",
    insurance: { label: "Valide", date: "21/01/2027", tone: "success" },
    technical: { label: "Valide", date: "05/03/2026", tone: "success" },
    registration: { label: "Valide", date: "", tone: "success" },
    maintenance: { label: "À jour", date: "04/2025", tone: "success" },
    categories: [],
    circulation: "14/01/2020",
    instructor: "Thomas",
    fuel: "Essence",
    gearbox: "Manuelle",
  },
];

const FILTER_TABS = [
  { id: "all", label: "Tous les véhicules", count: 9 },
  { id: "attention", label: "À traiter", count: 3 },
  { id: "insurance", label: "Assurance", count: 1 },
  { id: "technical", label: "Contrôle technique", count: 1 },
  { id: "maintenance", label: "Entretien", count: 1 },
];

const DETAIL_TABS = ["Documents", "Entretien", "Leasing", "Historique", "Coûts"];

const formatDate = (value) => {
  if (!value) return "—";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("fr-FR");
};

const formatKilometers = (value) => `${Number(value).toLocaleString("fr-FR")} km`;

const getDocumentStatus = (doc) => {
  if (!doc) {
    return { label: "Manquant", date: "", tone: "warning", subText: "", validDate: "" };
  }
  if (!doc.validity_date) {
    return { label: "Valide", date: "", tone: "success", subText: "À jour", validDate: "" };
  }
  
  // Parse validity_date
  let expDate = null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(doc.validity_date)) {
    const [y, m, d] = doc.validity_date.split("-");
    expDate = new Date(Number(y), Number(m) - 1, Number(d));
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(doc.validity_date)) {
    const [d, m, y] = doc.validity_date.split("/");
    expDate = new Date(Number(y), Number(m) - 1, Number(d));
  } else {
    expDate = new Date(doc.validity_date);
  }

  const formattedExpDate = formatDate(doc.validity_date);

  if (isNaN(expDate.getTime())) {
    return { label: "Valide", date: formattedExpDate, tone: "success", subText: "À jour", validDate: formattedExpDate };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Expired
    return {
      label: "Expiré",
      date: `- ${formattedExpDate}`,
      tone: "error",
      subText: "Expiré",
      validDate: formattedExpDate,
    };
  } else if (diffDays <= 35) {
    // Expiring soon (e.g. within 30-35 days)
    return {
      label: `Expire dans ${diffDays} j`,
      date: formattedExpDate,
      tone: "warning",
      subText: "À surveiller",
      validDate: formattedExpDate,
    };
  } else {
    // Valid
    return {
      label: "Valide",
      date: formattedExpDate,
      tone: "success",
      subText: "À jour",
      validDate: formattedExpDate,
    };
  }
};

const vehiclePhotoUrl = (path) => {
  if (!path) return vehicleImage;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const normalizedPath = String(path).replace(/^\/?storage\//, "");
  return `${baseUrl}/storage/${normalizedPath}`;
};

const vehicleDocumentUrl = (doc) => {
  if (!doc) return "";
  if (doc.file_url && /^https?:\/\//i.test(doc.file_url)) return doc.file_url;
  const path = doc.file_path || doc.path || "";
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  // If stored in vehicles/...
  const cleanPath = String(path).replace(/^\/?storage\//, "").replace(/^\//, "");
  return `${baseUrl}/vehicle-files/${cleanPath}`;
};

const normalizeVehicle = (item) => {
  const documents = item.documents || [];
  const getDocument = (type) => documents.find((document) => document.document_type === type);
  const insuranceDoc = getDocument("assurance");
  const technicalDoc = getDocument("controle_technique");
  const registrationDoc = getDocument("carte_grise");

  const insuranceStatus = getDocumentStatus(insuranceDoc);
  const technicalStatus = getDocumentStatus(technicalDoc);
  const registrationStatus = getDocumentStatus(registrationDoc);

  const maintenance = item.maintenance || {};
  const lastMaintenanceMileage = Number(maintenance.last_maintenance_mileage);
  const maintenanceInterval = Number(maintenance.maintenance_kilometer);
  const currentMileage = Number(item.current_mileage);
  const nextMaintenanceMileage = lastMaintenanceMileage > 0 && maintenanceInterval > 0
    ? lastMaintenanceMileage + maintenanceInterval
    : null;
  const remainingMaintenanceKm = nextMaintenanceMileage !== null && Number.isFinite(currentMileage)
    ? nextMaintenanceMileage - currentMileage
    : null;
  const maintenancePlanned = Boolean(maintenance.next_maintenance_date || nextMaintenanceMileage !== null);
  const maintenanceStatus = remainingMaintenanceKm === null
    ? { label: maintenancePlanned ? "Planifié" : "À planifier", tone: maintenancePlanned ? "success" : "warning" }
    : remainingMaintenanceKm <= 0
      ? { label: "Maintenance requise", tone: "error" }
      : remainingMaintenanceKm <= 1500
        ? { label: `Dans ${formatKilometers(remainingMaintenanceKm)}`, tone: "error" }
        : { label: `Dans ${formatKilometers(remainingMaintenanceKm)}`, tone: "success" };
  const categories = [
    insuranceStatus.tone !== "success" && "insurance",
    technicalStatus.tone !== "success" && "technical",
    maintenanceStatus.tone !== "success" && "maintenance",
  ].filter(Boolean);

  return {
    id: item.id,
    name: `${item.brand} ${item.model}`,
    plate: item.registration_number,
    model: [item.brand, item.model, item.trim].filter(Boolean).join(" "),
    agency: item.agency?.name || "Non affectée",
    mileage: formatKilometers(item.current_mileage || 0),
    insurance: insuranceStatus,
    technical: technicalStatus,
    registration: registrationStatus,
    maintenance: {
      ...maintenanceStatus,
      date: formatDate(maintenance.next_maintenance_date),
      nextMileage: nextMaintenanceMileage,
      remainingKm: remainingMaintenanceKm,
    },
    categories,
    circulation: formatDate(item.registration_date),
    instructor: [item.monitor?.user?.first_name, item.monitor?.user?.last_name].filter(Boolean).join(" ") || item.monitor?.user?.name || "Non affecté",
    fuel: item.fuel_type,
    gearbox: item.transmission,
    status: item.status,
    photo: item.photo_url || item.photo,
    documents,
    raw: item,
  };
};

function StateValue({ value }) {
  const StateIcon = value.tone === "success" ? CheckIcon : value.tone === "error" ? AlertIcon : WarningIcon;
  return (
    <div className={`vm-state vm-state-${value.tone}`}>
      <span><StateIcon /></span>
      <div><strong>{value.label}</strong>{value.date && <small>{value.date}</small>}</div>
    </div>
  );
}

function SummaryCard({ tone, value, label, percentage, icon }) {
  return (
    <article className={`vm-summary-card vm-summary-${tone}`}>
      <div><strong>{value}</strong><span>{label}</span>{percentage && <small>{percentage}</small>}</div>
      <span className="vm-summary-icon">{icon}</span>
    </article>
  );
}

function DocumentCards({ vehicle }) {
  const documents = vehicle.documents || [];
  const getDoc = (type) => documents.find((d) => d.document_type === type);

  const insuranceDoc = getDoc("assurance");
  const technicalDoc = getDoc("controle_technique");
  const registrationDoc = getDoc("carte_grise");
  const otherDocs = documents.filter((d) => !["assurance", "controle_technique", "carte_grise"].includes(d.document_type));

  const insStatus = getDocumentStatus(insuranceDoc);
  const techStatus = getDocumentStatus(technicalDoc);
  const regStatus = getDocumentStatus(registrationDoc);

  return (
    <div className="vm-detail-cards">
      {/* 1. Assurance */}
      <article className="vm-detail-mini-card vm-document-card">
        <div className="vm-mini-card-title">
          <span><ShieldIcon /></span>
          <strong>Assurance</strong>
        </div>
        <small>
          {insuranceDoc?.validity_date ? "Valide jusqu'au" : "Statut"}
        </small>
        <b>{insStatus.validDate || (insuranceDoc ? "Fourni" : "Non fourni")}</b>
        <em className={`vm-doc-status-${insStatus.tone}`}>
          {insStatus.tone === "success" ? <CheckIcon /> : insStatus.tone === "error" ? <AlertIcon /> : <WarningIcon />}
          {insStatus.subText || insStatus.label}
        </em>
        <button
          type="button"
          onClick={() => insuranceDoc && window.open(vehicleDocumentUrl(insuranceDoc), "_blank", "noopener,noreferrer")}
          disabled={!insuranceDoc}
        >
          Voir le document
        </button>
      </article>

      {/* 2. Contrôle technique */}
      <article className="vm-detail-mini-card vm-document-card">
        <div className="vm-mini-card-title">
          <span><SearchIcon /></span>
          <strong>Contrôle technique</strong>
        </div>
        <small>
          {technicalDoc?.validity_date ? "Valide jusqu'au" : "Statut"}
        </small>
        <b>{techStatus.validDate || (technicalDoc ? "Fourni" : "Non fourni")}</b>
        <em className={`vm-doc-status-${techStatus.tone}`}>
          {techStatus.tone === "success" ? <CheckIcon /> : techStatus.tone === "error" ? <AlertIcon /> : <WarningIcon />}
          {techStatus.subText || techStatus.label}
        </em>
        <button
          type="button"
          onClick={() => technicalDoc && window.open(vehicleDocumentUrl(technicalDoc), "_blank", "noopener,noreferrer")}
          disabled={!technicalDoc}
        >
          Voir le document
        </button>
      </article>

      {/* 3. Carte grise */}
      <article className="vm-detail-mini-card vm-document-card">
        <div className="vm-mini-card-title">
          <span><ClipboardIcon /></span>
          <strong>Carte grise</strong>
        </div>
        <small>Document</small>
        <b>{registrationDoc ? "Valide" : "Non fournie"}</b>
        <em className={`vm-doc-status-${regStatus.tone}`}>
          {regStatus.tone === "success" ? <CheckIcon /> : <WarningIcon />}
          {registrationDoc ? "À jour" : "Manquant"}
        </em>
        <button
          type="button"
          onClick={() => registrationDoc && window.open(vehicleDocumentUrl(registrationDoc), "_blank", "noopener,noreferrer")}
          disabled={!registrationDoc}
        >
          Voir le document
        </button>
      </article>

      {/* 4. Autres documents */}
      <article className="vm-detail-mini-card vm-document-card">
        <div className="vm-mini-card-title">
          <span><FolderIcon /></span>
          <strong>Autres documents</strong>
        </div>
        <small>Complémentaires</small>
        <b>{otherDocs.length} {otherDocs.length > 1 ? "documents" : "document"}</b>
        <em className="vm-doc-status-success">
          <CheckIcon /> {otherDocs.length > 0 ? "Disponible" : "Aucun fichier"}
        </em>
        <button
          type="button"
          onClick={() => otherDocs[0] && window.open(vehicleDocumentUrl(otherDocs[0]), "_blank", "noopener,noreferrer")}
          disabled={otherDocs.length === 0}
        >
          Voir les documents
        </button>
      </article>
    </div>
  );
}

function CompactTabContent({ activeTab, vehicle }) {
  const maintenance = vehicle.raw?.maintenance || {};
  const panels = {
    Entretien: [
      { icon: <WrenchIcon />, label: "Type d'entretien", value: maintenance.maintenance_type || "Non renseigné" },
      { icon: <CalendarIcon />, label: "Prochain entretien", value: vehicle.maintenance.date || "Non renseigné" },
      { icon: <GaugeIcon />, label: "Dernier entretien", value: maintenance.last_maintenance_mileage ? formatKilometers(maintenance.last_maintenance_mileage) : "Non renseigné" },
      { icon: <GaugeIcon />, label: "Prochain entretien à", value: vehicle.maintenance.nextMileage ? formatKilometers(vehicle.maintenance.nextMileage) : "Non renseigné" },
      { icon: <GaugeIcon />, label: "Intervalle d'entretien", value: maintenance.maintenance_kilometer ? formatKilometers(maintenance.maintenance_kilometer) : "Non renseigné" },
    ],
    Leasing: [{ icon: <LandmarkIcon />, label: "Aucune donnée", value: "Non renseigné" }],
    Historique: [{ icon: <HistoryIcon />, label: "Création", value: vehicle.raw?.created_at ? formatDate(vehicle.raw.created_at) : "Non renseigné" }],
    Coûts: [{ icon: <CoinsIcon />, label: "Dernier entretien", value: maintenance.cost ? `${maintenance.cost} €` : "Non renseigné" }],
  };

  return (
    <div className="vm-compact-tab-cards">
      {panels[activeTab].map((item) => (
        <article key={item.label}>
          <span>{item.icon}</span>
          <div><small>{item.label}</small><strong>{item.value}</strong></div>
        </article>
      ))}
    </div>
  );
}

export default function VehicleManagementPage({ selectedSchoolId }) {
  // Keep the supplied default fleet visible while persisted vehicles load.
  const [vehicles, setVehicles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("Documents");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);

  useEffect(() => {
    const handleGlobalClick = () => {
      setOpenActionId(null);
      setFilterOpen(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  useEffect(() => {
    let active = true;
    http.get("/admin/vehicles", { params: selectedSchoolId ? { zone_id: selectedSchoolId } : undefined })
      .then(({ data }) => {
        if (!active) return;
        const persisted = (data.data || []).map(normalizeVehicle);
        setVehicles(persisted);
        setSelectedVehicleId((id) => id || persisted[0]?.id || null);
      })
      .catch(() => active && setVehicles([]));
    return () => { active = false; };
  }, [selectedSchoolId]);

  const displayVehicles = vehicles;
  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return displayVehicles.filter((vehicle) => {
      const matchesTab = activeFilter === "all"
        || (activeFilter === "attention" && vehicle.categories.length > 0)
        || vehicle.categories.includes(activeFilter);
      const vehicleDate = vehicle.raw?.created_at ? new Date(vehicle.raw.created_at) : null;
      const now = new Date();
      const days = dateFilter === "week" ? 7 : dateFilter === "month" ? 30 : null;
      const matchesCustomDate = dateFilter === "custom" && vehicleDate && (!customDateFrom || vehicleDate >= new Date(`${customDateFrom}T00:00:00`)) && (!customDateTo || vehicleDate <= new Date(`${customDateTo}T23:59:59`));
      const matchesDate = dateFilter === "all" || (dateFilter === "year" && vehicleDate?.getFullYear() === now.getFullYear()) || (days && vehicleDate && (now - vehicleDate) <= days * 24 * 60 * 60 * 1000) || matchesCustomDate;
      const matchesSearch = !query || [vehicle.name, vehicle.model, vehicle.plate, vehicle.agency]
        .some((field) => field.toLocaleLowerCase("fr").includes(query));
      return matchesTab && matchesDate && matchesSearch;
    });
  }, [activeFilter, customDateFrom, customDateTo, dateFilter, search, displayVehicles]);

  const selectedVehicle = displayVehicles.find((vehicle) => vehicle.id === selectedVehicleId) || filteredVehicles[0] || null;
  const filterCount = (filterId) => filterId === "all"
    ? vehicles.length
    : filterId === "attention"
    ? vehicles.filter((vehicle) => vehicle.categories.length > 0).length
    : vehicles.filter((vehicle) => vehicle.categories.includes(filterId)).length;

  const selectVehicle = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setActiveDetailTab("Documents");
  };
  const beginEdit = (vehicle) => { if (!vehicle.raw) return; setEditingVehicle(vehicle.raw); setOpenActionId(null); setIsAddModalOpen(true); };
  const deleteVehicle = async (vehicle) => {
    if (!vehicle.raw || !window.confirm(`Supprimer ${vehicle.name} ?`)) return;
    try {
      await http.delete(`/admin/vehicles/${vehicle.id}`);
      setVehicles((current) => current.filter((item) => item.id !== vehicle.id));
      setSelectedVehicleId((current) => current === vehicle.id ? null : current);
    } catch (error) { window.alert(error.response?.data?.message || "Impossible de supprimer le véhicule."); }
    finally { setOpenActionId(null); }
  };

  return (
    <div className="vm-page">
      <div className="vm-shell">
        <header className="vm-page-heading">
          <div className="vm-title-line"><span><CarIcon /></span><h1>Gestion des véhicules</h1></div>
          <nav aria-label="Fil d’Ariane"><span>Accueil</span><b>›</b><strong>Véhicules</strong></nav>
        </header>

        <section className="vm-summary-grid" aria-label="Résumé du parc de véhicules">
          <SummaryCard tone="total" value={displayVehicles.length} label="VÉHICULES AU TOTAL" icon={<CarIcon />} />
          <SummaryCard tone="success" value={vehicles.filter((item) => item.maintenance.tone === "success").length} label="ENTRETIENS PLANIFIÉS" icon={<CheckIcon />} />
          <SummaryCard tone="warning" value={vehicles.filter((item) => item.maintenance.tone === "warning").length} label="À PLANIFIER" icon={<WarningIcon />} />
          <SummaryCard tone="error" value={vehicles.filter((item) => item.technical.tone === "error").length} label="CONTRÔLES EN RETARD" icon={<AlertIcon />} />
          <button
            className="vm-add-button"
            type="button"
            onClick={() => { setEditingVehicle(null); setIsAddModalOpen(true); }}
          >
            <PlusIcon /> Ajouter un véhicule
          </button>
        </section>

        <section className="vm-list-card">
          <div className="vm-list-toolbar">
            <div className="vm-filter-tabs" role="tablist" aria-label="Filtrer les véhicules">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={activeFilter === tab.id ? "active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                >
                  {tab.label} ({filterCount(tab.id)})
                </button>
              ))}
            </div>

            <div className="vm-toolbar-actions">
              <label className="vm-search-field">
                <SearchIcon />
                <span className="vm-sr-only">Rechercher un véhicule</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un véhicule..." />
              </label>
              <div className="vm-filter-menu-wrap" onClick={(event) => event.stopPropagation()}>
                <button
                  className={`vm-filter-button ${dateFilter !== "all" ? "is-filtered" : ""}`}
                  type="button"
                  aria-expanded={filterOpen}
                  onClick={(event) => {
                    event.stopPropagation();
                    setFilterOpen((open) => !open);
                  }}
                >
                  <FilterIcon /> Filtres
                </button>
                {filterOpen && (
                  <div className="vm-filter-popover" onClick={(event) => event.stopPropagation()}>
                    <strong>Date d'ajout</strong>
                    {[
                      { id: "all", label: "Toutes les dates" },
                      { id: "week", label: "Cette semaine" },
                      { id: "month", label: "Ce mois" },
                      { id: "custom", label: "Période personnalisée" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={dateFilter === option.id ? "active" : ""}
                        onClick={() => {
                          setDateFilter(option.id);
                          if (option.id !== "custom") setFilterOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                    {dateFilter === "custom" && (
                      <div className="vm-date-range">
                        <label>
                          Du
                          <input
                            type="date"
                            value={customDateFrom}
                            max={customDateTo || undefined}
                            onChange={(event) => setCustomDateFrom(event.target.value)}
                          />
                        </label>
                        <label>
                          Au
                          <input
                            type="date"
                            value={customDateTo}
                            min={customDateFrom || undefined}
                            onChange={(event) => setCustomDateTo(event.target.value)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="vm-table-scroll">
            <table className="vm-vehicle-table">
              <thead>
                <tr>
                  <th>VÉHICULE</th><th>AGENCE</th><th>KILOMÉTRAGE</th><th>ASSURANCE</th><th>CONTRÔLE TECHNIQUE</th><th>CARTE GRISE</th><th>ENTRETIEN</th><th><span className="vm-sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className={selectedVehicleId === vehicle.id ? "selected" : ""}
                    tabIndex="0"
                    aria-label={`Sélectionner ${vehicle.name} ${vehicle.plate}`}
                    onClick={() => selectVehicle(vehicle.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectVehicle(vehicle.id);
                      }
                    }}
                  >
                    <td>
                      <div className="vm-vehicle-cell">
                        <span className="vm-table-thumb"><img src={vehiclePhotoUrl(vehicle.photo)} onError={(event) => { event.currentTarget.src = vehicleImage; }} alt="" /></span>
                        <div><strong>{vehicle.name} <b>{vehicle.plate}</b></strong><small>{vehicle.model}</small></div>
                      </div>
                    </td>
                    <td>{vehicle.agency}</td>
                    <td>{vehicle.mileage}</td>
                    <td><StateValue value={vehicle.insurance} /></td>
                    <td><StateValue value={vehicle.technical} /></td>
                    <td><StateValue value={vehicle.registration} /></td>
                    <td><StateValue value={vehicle.maintenance} /></td>
                    <td className="vm-action-cell">
                      <button className="vm-row-action" type="button" aria-label={`Actions pour ${vehicle.name}`} onClick={(event) => { event.stopPropagation(); setOpenActionId((id) => id === vehicle.id ? null : vehicle.id); }}><MoreIcon /></button>
                      {openActionId === vehicle.id && vehicle.raw && <div className="vm-action-menu" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={() => beginEdit(vehicle)}>Modifier</button>
                        <button type="button" className="vm-action-delete" onClick={() => deleteVehicle(vehicle)}>Supprimer</button>
                      </div>}
                    </td>
                  </tr>
                ))}
                {filteredVehicles.length === 0 && (
                  <tr className="vm-empty-row"><td colSpan="8">Aucun véhicule ne correspond à votre recherche.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedVehicle && <section className="vm-detail-panel" aria-label={`Détails de ${selectedVehicle.name}`}>
          <div className="vm-selected-summary">
            <div className="vm-selected-title">
              <h2>{selectedVehicle.name} - {selectedVehicle.plate}</h2>
              <span className="vm-status-pill">{selectedVehicle.status}</span>
            </div>
            <div className="vm-selected-body">
              <div className="vm-hero-image"><img src={vehiclePhotoUrl(selectedVehicle.photo)} onError={(event) => { event.currentTarget.src = vehicleImage; }} alt={`${selectedVehicle.model} auto-école`} /></div>
              <div className="vm-vehicle-facts">
                <strong>{selectedVehicle.model}</strong>
                <span><CalendarIcon /> 1ère mise en circulation : <b>{selectedVehicle.circulation}</b></span>
                <span><GaugeIcon /> Kilométrage actuel : <b>{selectedVehicle.mileage}</b></span>
                <span><MapPinIcon /> Agence : <b>{selectedVehicle.agency}</b></span>
                <span><UserIcon /> Moniteur affecté : <b>{selectedVehicle.instructor}</b></span>
                <span><FuelIcon /> Carburant : <b>{selectedVehicle.fuel}</b></span>
                <span><SettingsIcon /> Boîte : <b>{selectedVehicle.gearbox}</b></span>
              </div>
            </div>
          </div>

          <div className="vm-selected-details">
            <div className="vm-detail-tabs" role="tablist" aria-label="Informations du véhicule">
              {DETAIL_TABS.map((tab) => (
                <button
                  key={tab}
                  className={activeDetailTab === tab ? "active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={activeDetailTab === tab}
                  onClick={() => setActiveDetailTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="vm-tab-panel" role="tabpanel">
              {activeDetailTab === "Documents" ? <DocumentCards vehicle={selectedVehicle} /> : <CompactTabContent activeTab={activeDetailTab} vehicle={selectedVehicle} />}
            </div>
            <div className="vm-detail-footer">
              <p><CheckIcon /><span>Prochain entretien : <strong>{selectedVehicle.maintenance.label} ou {selectedVehicle.maintenance.date}</strong></span></p>
              <button type="button" onClick={() => beginEdit(selectedVehicle)}><PencilIcon /> Modifier le véhicule</button>
            </div>
          </div>
        </section>}
      </div>

      <AddVehicleModal
        key={editingVehicle?.id || "new-vehicle"}
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingVehicle(null); }}
        vehicleToEdit={editingVehicle}
        selectedSchoolId={selectedSchoolId}
        onSaved={(saved) => { const vehicle = normalizeVehicle(saved); setVehicles((current) => current.some((item) => item.id === vehicle.id) ? current.map((item) => item.id === vehicle.id ? vehicle : item) : [vehicle, ...current]); setSelectedVehicleId(vehicle.id); setEditingVehicle(null); }}
      />
    </div>
  );
}
