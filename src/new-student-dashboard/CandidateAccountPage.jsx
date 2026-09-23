import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import profilePhoto from "../mainsecretary/assets/portrait-beautiful.jpg";
import http from "../helpers/http.jsx";
import { fetchCurrentUser } from "../redux/reducers/authReducer.jsx";
import StudentSidebar from "./StudentSidebar.jsx";
import StudentHeader, { profileImageUrl } from "./StudentHeader.jsx";
import "./CandidateDashboard.css";
import "./CandidateAccountPage.css";

function StrokeIcon({ children, fill = "none", strokeWidth = 2 }) {
  return <svg viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

const BellIcon = () => <StrokeIcon><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></StrokeIcon>;
const ChevronDownIcon = () => <StrokeIcon><path d="m6 9 6 6 6-6" /></StrokeIcon>;
const ChevronRightIcon = () => <StrokeIcon><path d="m9 18 6-6-6-6" /></StrokeIcon>;
const HamburgerIcon = () => <StrokeIcon><path d="M4 6h16M4 12h16M4 18h16" /></StrokeIcon>;
const PencilIcon = () => <StrokeIcon><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></StrokeIcon>;
const CameraIcon = () => <StrokeIcon><path d="M14.5 5 13 3h-2L9.5 5H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Z" /><circle cx="12" cy="13" r="4" /></StrokeIcon>;
const UserIcon = () => <StrokeIcon><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></StrokeIcon>;
const MailIcon = () => <StrokeIcon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></StrokeIcon>;
const PhoneIcon = () => <StrokeIcon><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z" /></StrokeIcon>;
const CalendarIcon = () => <StrokeIcon><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /></StrokeIcon>;
const MapPinIcon = () => <StrokeIcon><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></StrokeIcon>;
const BuildingIcon = () => <StrokeIcon><path d="M4 21V5l8-3 8 3v16M8 9h1M8 13h1M8 17h1M15 9h1M15 13h1M15 17h1M2 21h20" /></StrokeIcon>;
const CarIcon = () => <StrokeIcon><path d="M5 17H3v-4l2-2 2-4h10l2 4 2 2v4h-2M5 17h14M7 17v2M17 17v2M6 11h12" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></StrokeIcon>;
const PlusIcon = () => <StrokeIcon><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></StrokeIcon>;
const TrashIcon = () => <StrokeIcon><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></StrokeIcon>;
const LanguageIcon = () => <StrokeIcon><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></StrokeIcon>;
const MessageIcon = () => <StrokeIcon><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></StrokeIcon>;
const SlidersIcon = () => <StrokeIcon><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></StrokeIcon>;
const LockIcon = () => <StrokeIcon><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></StrokeIcon>;
const ShieldIcon = () => <StrokeIcon><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M12 6v12" /></StrokeIcon>;
const MonitorIcon = () => <StrokeIcon><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></StrokeIcon>;
const InfoIcon = () => <StrokeIcon><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></StrokeIcon>;
const CloseIcon = () => <StrokeIcon><path d="m6 6 12 12M18 6 6 18" /></StrokeIcon>;

const INITIAL_PERSONAL_INFO = {
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
  school: "Non renseignée",
  registrationDate: "",
  license: "Non renseigné",
};

const PERSONAL_FIELDS = [
  { key: "fullName", label: "Nom complet", icon: <UserIcon />, type: "text" },
  { key: "email", label: "E-mail", icon: <MailIcon />, type: "email" },
  { key: "phone", label: "Téléphone", icon: <PhoneIcon />, type: "tel" },
  { key: "birthDate", label: "Date de naissance", icon: <CalendarIcon />, type: "date" },
  { key: "address", label: "Adresse", icon: <MapPinIcon />, type: "text" },
  { key: "school", label: "Auto-école", icon: <BuildingIcon />, type: "text", readOnly: true },
  { key: "registrationDate", label: "Date d'inscription", icon: <CalendarIcon />, type: "text", readOnly: true },
  { key: "license", label: "Permis préparé", icon: <CarIcon />, type: "text", readOnly: true },
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const INITIAL_AVAILABILITY = {
  Lundi: [{ id: "mon-1", start: "18:00", end: "20:00" }],
  Mardi: [{ id: "tue-1", start: "12:00", end: "14:00" }, { id: "tue-2", start: "18:00", end: "20:00" }],
  Mercredi: [{ id: "wed-1", start: "14:00", end: "20:00" }],
  Jeudi: [{ id: "thu-1", start: "18:00", end: "20:00" }],
  Vendredi: [{ id: "fri-1", start: "17:00", end: "20:00" }],
  Samedi: [{ id: "sat-1", start: "09:00", end: "13:00" }],
  Dimanche: [],
};

const INITIAL_PREFERENCES = {
  trainingType: "0",
  agency: "",
  instructor: "",
  language: "Français",
  communications: ["Email", "SMS", "Notifications"],
};

const PREFERENCE_ROWS = [
  { key: "trainingType", label: "Type de formation", icon: <CarIcon /> },
  { key: "agency", label: "Agence de formation", icon: <MapPinIcon /> },
  { key: "instructor", label: "Enseignant préféré", icon: <UserIcon /> },
  { key: "language", label: "Langue de l'application", icon: <LanguageIcon /> },
  { key: "communications", label: "Préférences de communication", icon: <MessageIcon /> },
];

const NOTIFICATION_ROWS = [
  { key: "courses", label: "Notifications de cours et rendez-vous", icon: <BellIcon /> },
  { key: "email", label: "Rappels par email", icon: <MailIcon /> },
  { key: "sms", label: "Rappels par SMS", icon: <MessageIcon /> },
  { key: "news", label: "Actualités et offres", icon: <SlidersIcon /> },
];

function cloneAvailability(source) {
  return Object.fromEntries(DAYS.map((day) => [day, source[day].map((slot) => ({ ...slot }))]));
}

function formatSlot(slot) {
  return `${slot.start.replace(":", "h")} – ${slot.end.replace(":", "h")}`;
}

function formatDate(value) {
  if (!value) return "Non renseignée";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function licenseLabel(boxType) {
  return String(boxType) === "1" ? "Permis BA (boîte automatique)" : "Permis BM (boîte manuelle)";
}

function ModalShell({ title, description, size = "medium", onClose, children }) {
  return (
    <div className="nsa-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`nsa-modal nsa-modal--${size}`} role="dialog" aria-modal="true" aria-labelledby="nsa-modal-title">
        <header className="nsa-modal-header"><div><h2 id="nsa-modal-title">{title}</h2>{description && <p>{description}</p>}</div><button type="button" onClick={onClose} aria-label="Fermer la fenêtre"><CloseIcon /></button></header>
        {children}
      </section>
    </div>
  );
}

function CardHeading({ title, onEdit }) {
  return <div className="nsa-card-heading"><h2>{title}</h2>{onEdit && <button type="button" onClick={onEdit}>Modifier <PencilIcon /></button>}</div>;
}

export default function CandidateAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.auth?.user);
  const connectedCandidate = location.state?.fromCandidateProfile ? location.state.candidate : null;
  const initialUser = connectedCandidate || authenticatedUser;

  const photoInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(() => {
    const fullName = initialUser?.name || [initialUser?.first_name, initialUser?.last_name].filter(Boolean).join(" ") || "";
    return {
      ...INITIAL_PERSONAL_INFO,
      fullName: fullName || INITIAL_PERSONAL_INFO.fullName,
      email: initialUser?.email || INITIAL_PERSONAL_INFO.email,
      phone: initialUser?.phone || INITIAL_PERSONAL_INFO.phone,
      birthDate: String(initialUser?.date_naissance || "").slice(0, 10) || INITIAL_PERSONAL_INFO.birthDate,
      address: initialUser?.adresse || INITIAL_PERSONAL_INFO.address,
    };
  });
  const [personalDraft, setPersonalDraft] = useState(INITIAL_PERSONAL_INFO);
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [availabilityDraft, setAvailabilityDraft] = useState(() => cloneAvailability(INITIAL_AVAILABILITY));
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityFocusDay, setAvailabilityFocusDay] = useState(null);
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const [preferencesDraft, setPreferencesDraft] = useState(INITIAL_PREFERENCES);
  const [notifications, setNotifications] = useState({ courses: true, email: true, sms: true, news: false });
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [zones, setZones] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [profileImage, setProfileImage] = useState(() => profileImageUrl(initialUser) || "");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [accountError, setAccountError] = useState("");

  const applyAccountData = (payload) => {
    const user = payload?.user ?? initialUser ?? {};
    const student = payload?.student ?? {};
    const agency = payload?.agency ?? {};
    const boxType = String(student.boite_type ?? 0);
    const userPhoto = profileImageUrl(user) || profileImageUrl(initialUser) || "";

    const nextPersonalInfo = {
      fullName: user.name || [user.first_name, user.last_name].filter(Boolean).join(" "),
      email: user.email || "",
      phone: user.phone || "",
      birthDate: String(user.date_naissance || "").slice(0, 10),
      address: user.adresse || "",
      school: agency.name || "Non renseignée",
      registrationDate: formatDate(student.created_at),
      license: licenseLabel(boxType),
    };

    setPersonalInfo(nextPersonalInfo);
    setPersonalDraft(nextPersonalInfo);
    setPreferences({
      trainingType: boxType,
      agency: user.zone_id || agency.id || "",
      instructor: student.preferred_monitor_id || "",
      language: student.app_language || "fr",
      communications: Array.isArray(student.communication_preferences) ? student.communication_preferences : [],
    });
    setPreferencesDraft((current) => ({
      ...current,
      trainingType: boxType,
      agency: user.zone_id || agency.id || "",
      instructor: student.preferred_monitor_id || "",
      language: student.app_language || "fr",
      communications: Array.isArray(student.communication_preferences) ? student.communication_preferences : [],
    }));
    setZones(Array.isArray(payload?.zones) ? payload.zones : []);
    setMonitors(Array.isArray(payload?.monitors) ? payload.monitors : []);
    setProfileImage(userPhoto || profilePhoto);
  };

  useEffect(() => {
    if (initialUser) {
      const currentPhoto = profileImageUrl(initialUser);
      if (currentPhoto && !selectedPhoto) {
        setProfileImage(currentPhoto);
      }
      setPersonalInfo((prev) => {
        const nextFullName = initialUser.name || [initialUser.first_name, initialUser.last_name].filter(Boolean).join(" ") || "";
        return {
          ...prev,
          fullName: prev.fullName || nextFullName,
          email: prev.email || initialUser.email || "",
          phone: prev.phone || initialUser.phone || "",
          birthDate: prev.birthDate || String(initialUser.date_naissance || "").slice(0, 10),
          address: prev.address || initialUser.adresse || "",
        };
      });
    }
  }, [initialUser, selectedPhoto]);

  useEffect(() => {
    let active = true;
    http.get("/student/profile/account")
      .then(({ data }) => active && applyAccountData(data.data))
      .catch((error) => active && setAccountError(error.response?.data?.message || "Impossible de charger votre profil."));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!activeModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => event.key === "Escape" && setActiveModal(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  const availabilityHasError = useMemo(() => DAYS.some((day) => availabilityDraft[day].some((slot) => slot.start >= slot.end)), [availabilityDraft]);

  const handleSidebarNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const openPersonalEditor = () => {
    setPersonalDraft({ ...personalInfo });
    setSelectedPhoto(null);
    setAccountError("");
    setActiveModal("personal");
  };

  const openAvailabilityEditor = (day = null) => {
    setAvailabilityDraft(cloneAvailability(availability));
    setAvailabilityError("");
    setAvailabilityFocusDay(day);
    setActiveModal("availability");
  };

  const openPreferencesEditor = () => {
    setPreferencesDraft({ ...preferences, communications: [...preferences.communications] });
    setAccountError("");
    setActiveModal("preferences");
  };

  const loadMonitorsForZone = async (zoneId) => {
    if (!zoneId) {
      setMonitors([]);
      return;
    }
    try {
      const { data } = await http.get("/student/profile/account", { params: { zone_id: zoneId } });
      setMonitors(Array.isArray(data?.data?.monitors) ? data.data.monitors : []);
    } catch {
      setAccountError("Impossible de charger les enseignants de cette agence.");
    }
  };

  const savePersonal = async (event) => {
    event.preventDefault();
    const parts = personalDraft.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      setAccountError("Veuillez renseigner votre prénom et votre nom.");
      return;
    }
    const body = new FormData();
    body.append("first_name", parts.shift());
    body.append("last_name", parts.join(" "));
    body.append("email", personalDraft.email);
    body.append("phone", personalDraft.phone || "");
    body.append("date_naissance", personalDraft.birthDate || "");
    body.append("adresse", personalDraft.address || "");
    if (selectedPhoto) body.append("media", selectedPhoto);

    setSaving(true);
    setAccountError("");
    try {
      const { data } = await http.post("/student/profile/account", body);
      applyAccountData(data.data);
      await dispatch(fetchCurrentUser());
      setSelectedPhoto(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
      setActiveModal(null);
    } catch (error) {
      setAccountError(error.response?.data?.message || "Impossible de mettre à jour vos informations.");
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async (event) => {
    event.preventDefault();
    setSaving(true);
    setAccountError("");
    try {
      const { data } = await http.put("/student/profile/account/preferences", {
        boite_type: Number(preferencesDraft.trainingType),
        zone_id: preferencesDraft.agency,
        preferred_monitor_id: preferencesDraft.instructor || null,
        app_language: preferencesDraft.language,
        communication_preferences: preferencesDraft.communications,
      });
      applyAccountData(data.data);
      await dispatch(fetchCurrentUser());
      setActiveModal(null);
    } catch (error) {
      setAccountError(error.response?.data?.message || "Impossible de mettre à jour vos préférences.");
    } finally {
      setSaving(false);
    }
  };

  const preferenceValue = (key, value) => {
    if (key === "trainingType") return licenseLabel(value);
    if (key === "agency") return zones.find((zone) => zone.id === value)?.name || "Non renseignée";
    if (key === "instructor") return monitors.find((monitor) => monitor.id === value)?.name || "Sans préférence";
    if (key === "language") return value === "en" ? "English" : "Français";
    return Array.isArray(value) && value.length ? value.join(", ") : "Aucune";
  };

  const updateAvailabilitySlot = (day, slotId, field, value) => {
    setAvailabilityDraft((current) => ({ ...current, [day]: current[day].map((slot) => slot.id === slotId ? { ...slot, [field]: value } : slot) }));
    setAvailabilityError("");
  };

  const addAvailabilitySlot = (day) => {
    setAvailabilityDraft((current) => ({ ...current, [day]: [...current[day], { id: crypto.randomUUID(), start: "09:00", end: "10:00" }] }));
    setAvailabilityError("");
  };

  const removeAvailabilitySlot = (day, slotId) => {
    setAvailabilityDraft((current) => ({ ...current, [day]: current[day].filter((slot) => slot.id !== slotId) }));
    setAvailabilityError("");
  };

  const toggleAvailabilityDay = (day, enabled) => {
    setAvailabilityDraft((current) => ({ ...current, [day]: enabled ? (current[day].length ? current[day] : [{ id: crypto.randomUUID(), start: "09:00", end: "10:00" }]) : [] }));
    setAvailabilityError("");
  };

  const saveAvailability = (event) => {
    event.preventDefault();
    const invalidDay = DAYS.find((day) => availabilityDraft[day].some((slot) => slot.start >= slot.end));
    if (invalidDay) {
      setAvailabilityError(`L’heure de début doit précéder l’heure de fin pour ${invalidDay}.`);
      return;
    }
    setAvailability(cloneAvailability(availabilityDraft));
    setActiveModal(null);
  };

  const toggleCommunication = (channel) => {
    setPreferencesDraft((current) => ({ ...current, communications: current.communications.includes(channel) ? current.communications.filter((item) => item !== channel) : [...current.communications, channel] }));
  };

  return (
    <div className="nsd-root nsa-root">
      <StudentSidebar activePath="/student-account" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleSidebarNavigate} />

      <main className="nsd-main nsa-main">
        <StudentHeader className="nsa-header" title="Mon compte" subtitle="Gérez vos informations personnelles et vos préférences." onMenuOpen={() => setSidebarOpen(true)} />

        <div className="nsa-top-grid">
          <section className="nsa-card nsa-personal-card">
            <CardHeading title="1. Mes informations personnelles" onEdit={openPersonalEditor} />
            <div className="nsa-personal-body">
              <div className="nsa-profile-photo">
                <img
                  src={profileImage || profileImageUrl(initialUser) || profilePhoto}
                  alt={personalInfo.fullName || "Photo de profil"}
                  onError={(event) => {
                    if (profilePhoto && event.currentTarget.src !== profilePhoto) {
                      event.currentTarget.src = profilePhoto;
                    }
                  }}
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setSelectedPhoto(file);
                      setProfileImage(URL.createObjectURL(file));
                      setPersonalDraft({ ...personalInfo });
                      setAccountError("");
                      setActiveModal("personal");
                    }
                  }}
                />
                <button
                  type="button"
                  aria-label="Modifier la photo de profil"
                  title="Modifier la photo"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <CameraIcon />
                </button>
              </div>
              <div className="nsa-personal-list">
                {PERSONAL_FIELDS.map((field) => <div key={field.key} className="nsa-personal-row"><span className="nsa-row-icon">{field.icon}</span><strong>{field.label}</strong><span>{field.key === "birthDate" ? formatDate(personalInfo[field.key]) : personalInfo[field.key]}</span></div>)}
              </div>
            </div>
          </section>

          <section className="nsa-card nsa-availability-card">
            <CardHeading title="2. Mes disponibilités" onEdit={() => openAvailabilityEditor()} />
            <p className="nsa-card-description">Indiquez vos créneaux disponibles pour faciliter la planification de vos cours.</p>
            <div className="nsa-availability-list">
              {DAYS.map((day) => <div key={day} className="nsa-availability-row"><strong>{day}</strong><div>{availability[day].length ? availability[day].map((slot) => <span key={slot.id}>{formatSlot(slot)}</span>) : <em>Indisponible</em>}</div><button type="button" onClick={() => openAvailabilityEditor(day)} aria-label={`Modifier les disponibilités du ${day}`}><PencilIcon /></button></div>)}
            </div>
            <button type="button" className="nsa-add-availability" onClick={() => openAvailabilityEditor("Dimanche")}>Ajouter une disponibilité <PlusIcon /></button>
          </section>
        </div>

        <div className="nsa-bottom-grid">
          <section className="nsa-card nsa-preferences-card">
            <CardHeading title="3. Mes préférences" />
            <div className="nsa-settings-list">
              {PREFERENCE_ROWS.map((row) => <button key={row.key} type="button" className="nsa-setting-row" onClick={openPreferencesEditor}><span className="nsa-row-icon">{row.icon}</span><strong>{row.label}</strong><span>{preferenceValue(row.key, preferences[row.key])}</span><ChevronRightIcon /></button>)}
            </div>
          </section>

          <section className="nsa-card nsa-notifications-card">
            <CardHeading title="4. Préférences de notifications" />
            <p className="nsa-card-description">Choisissez comment vous souhaitez être informé.</p>
            <div className="nsa-notification-list">
              {NOTIFICATION_ROWS.map((row) => <div key={row.key} className="nsa-notification-row"><span className="nsa-row-icon">{row.icon}</span><span>{row.label}</span><button type="button" role="switch" aria-checked={notifications[row.key]} aria-label={row.label} className={`nsa-switch${notifications[row.key] ? " is-on" : ""}`} onClick={() => setNotifications((current) => ({ ...current, [row.key]: !current[row.key] }))}><i /></button></div>)}
            </div>
          </section>

          <section className="nsa-card nsa-security-card">
            <CardHeading title="5. Sécurité & gestion du compte" />
            <div className="nsa-security-list">
              <div className="nsa-security-row"><span className="nsa-security-icon"><LockIcon /></span><span><strong>Mot de passe</strong><small>Dernière modification le 15/04/2025</small></span><ChevronRightIcon /></div>
              <div className="nsa-security-row"><span className="nsa-security-icon"><ShieldIcon /></span><span><strong>Authentification à deux facteurs</strong><small>Sécurisez votre compte</small></span><em>Désactivée</em><ChevronRightIcon /></div>
              <div className="nsa-security-row"><span className="nsa-security-icon"><MonitorIcon /></span><span><strong>Sessions actives</strong><small>3 sessions actives</small></span><ChevronRightIcon /></div>
              <button type="button" className="nsa-security-row nsa-security-row--danger" onClick={() => { setDeleteAcknowledged(false); setActiveModal("delete"); }}><span className="nsa-security-icon"><TrashIcon /></span><span><strong>Supprimer mon compte</strong><small>Supprimez définitivement votre compte</small></span><ChevronRightIcon /></button>
            </div>
          </section>
        </div>

        <section className="nsa-contact-strip"><span><InfoIcon /></span><p><strong>Une question ?</strong> Contactez votre équipe pédagogique, nous sommes là pour vous accompagner.</p><button type="button">Nous contacter</button></section>
        {accountError && !activeModal && <p className="nsa-form-error" role="alert">{accountError}</p>}
      </main>

      {activeModal === "personal" && (
        <ModalShell title="Modifier mes informations" description="Mettez à jour vos informations personnelles." size="large" onClose={() => setActiveModal(null)}>
          <form className="nsa-modal-form" onSubmit={savePersonal}>
            <div className="nsa-form-grid">{PERSONAL_FIELDS.map((field) => <label key={field.key}><span>{field.label}</span><input type={field.type} value={personalDraft[field.key]} onChange={(event) => setPersonalDraft((current) => ({ ...current, [field.key]: event.target.value }))} readOnly={field.readOnly} required={!field.readOnly && ["fullName", "email"].includes(field.key)} /></label>)}</div>
            {accountError && <p className="nsa-form-error" role="alert">{accountError}</p>}
            <footer className="nsa-modal-actions"><button type="button" onClick={() => setActiveModal(null)}>Annuler</button><button type="submit" className="primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button></footer>
          </form>
        </ModalShell>
      )}

      {activeModal === "availability" && (
        <ModalShell title="Modifier mes disponibilités" description="Activez les jours souhaités et ajustez chaque créneau." size="wide" onClose={() => setActiveModal(null)}>
          <form className="nsa-modal-form" onSubmit={saveAvailability}>
            <div className="nsa-availability-editor">
              {DAYS.map((day) => <section key={day} className={availabilityFocusDay === day ? "is-focused" : ""}><div className="nsa-editor-day"><label><input type="checkbox" checked={availabilityDraft[day].length > 0} onChange={(event) => toggleAvailabilityDay(day, event.target.checked)} /><i /><strong>{day}</strong></label><button type="button" onClick={() => addAvailabilitySlot(day)}><PlusIcon />Ajouter un créneau</button></div>{availabilityDraft[day].length ? <div className="nsa-editor-slots">{availabilityDraft[day].map((slot, index) => <div key={slot.id}><input type="time" aria-label={`Début ${day} créneau ${index + 1}`} value={slot.start} onChange={(event) => updateAvailabilitySlot(day, slot.id, "start", event.target.value)} autoFocus={availabilityFocusDay === day && index === 0} /><span>à</span><input type="time" aria-label={`Fin ${day} créneau ${index + 1}`} value={slot.end} onChange={(event) => updateAvailabilitySlot(day, slot.id, "end", event.target.value)} /><button type="button" onClick={() => removeAvailabilitySlot(day, slot.id)} title="Supprimer ce créneau" aria-label={`Supprimer le créneau ${index + 1} du ${day}`}><TrashIcon /></button></div>)}</div> : <p className="nsa-unavailable-editor">Indisponible</p>}</section>)}
            </div>
            {(availabilityError || availabilityHasError) && <p className="nsa-form-error" role="alert">{availabilityError || "Chaque heure de début doit précéder l’heure de fin."}</p>}
            <footer className="nsa-modal-actions"><button type="button" onClick={() => setActiveModal(null)}>Annuler</button><button type="submit" className="primary">Enregistrer</button></footer>
          </form>
        </ModalShell>
      )}

      {activeModal === "preferences" && (
        <ModalShell title="Modifier mes préférences" description="Personnalisez votre formation et vos communications." size="medium" onClose={() => setActiveModal(null)}>
          <form className="nsa-modal-form" onSubmit={savePreferences}>
            <div className="nsa-form-stack">
              <label><span>Type de formation</span><select value={preferencesDraft.trainingType} onChange={(event) => setPreferencesDraft((current) => ({ ...current, trainingType: event.target.value }))}><option value="0">Boîte manuelle (BM)</option><option value="1">Boîte automatique (BA)</option></select></label>
              <label><span>Agence de formation</span><select value={preferencesDraft.agency} onChange={(event) => { const zoneId = event.target.value; setPreferencesDraft((current) => ({ ...current, agency: zoneId, instructor: "" })); loadMonitorsForZone(zoneId); }}><option value="">Sélectionnez une agence</option>{zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></label>
              <label><span>Enseignant préféré</span><select value={preferencesDraft.instructor} disabled={!preferencesDraft.agency} onChange={(event) => setPreferencesDraft((current) => ({ ...current, instructor: event.target.value }))}><option value="">Sans préférence</option>{monitors.map((monitor) => <option key={monitor.id} value={monitor.id}>{monitor.name}</option>)}</select></label>
              <label><span>Langue de l'application</span><select value={preferencesDraft.language} onChange={(event) => setPreferencesDraft((current) => ({ ...current, language: event.target.value }))}><option value="fr">Français</option><option value="en">English</option></select></label>
              <fieldset><legend>Préférences de communication</legend><div>{["Email", "SMS", "Notifications"].map((channel) => <label key={channel}><input type="checkbox" checked={preferencesDraft.communications.includes(channel)} onChange={() => toggleCommunication(channel)} /><i />{channel}</label>)}</div></fieldset>
            </div>
            {accountError && <p className="nsa-form-error" role="alert">{accountError}</p>}
            <footer className="nsa-modal-actions"><button type="button" onClick={() => setActiveModal(null)}>Annuler</button><button type="submit" className="primary" disabled={saving || !preferencesDraft.agency}>{saving ? "Enregistrement…" : "Enregistrer"}</button></footer>
          </form>
        </ModalShell>
      )}

      {activeModal === "delete" && (
        <ModalShell title="Supprimer mon compte" description="Cette action est définitive et entraînerait la suppression de toutes vos données." size="small" onClose={() => setActiveModal(null)}>
          <div className="nsa-delete-content"><span><TrashIcon /></span><p>La suppression réelle nécessite une validation sécurisée par PermiFast. Aucune donnée ne sera supprimée depuis cette démonstration.</p>{deleteAcknowledged && <strong role="status">Aucune suppression n’a été effectuée.</strong>}</div>
          <footer className="nsa-modal-actions"><button type="button" onClick={() => setActiveModal(null)}>Annuler</button><button type="button" className="danger" disabled={deleteAcknowledged} onClick={() => setDeleteAcknowledged(true)}>{deleteAcknowledged ? "Demande non envoyée" : "Confirmer la suppression"}</button></footer>
        </ModalShell>
      )}
    </div>
  );
}
