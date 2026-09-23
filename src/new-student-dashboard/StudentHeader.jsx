import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/reducers/authReducer.jsx";
import http from "../helpers/http.jsx";

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" />
  </svg>
);

function fullName(user) {
  return user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Élève";
}

export function profileImageUrl(user) {
  if (!user) return null;
  let raw = null;
  if (typeof user.media === "string" && user.media.trim()) {
    raw = user.media.trim();
  } else if (Array.isArray(user.media) && user.media.length > 0) {
    const first = user.media[0];
    raw = typeof first === "string" ? first : (first?.path || first?.url || null);
  } else if (typeof user.media === "object" && user.media !== null) {
    raw = user.media.path || user.media.url || null;
  }

  if (!raw) {
    raw = user.profile_photo_url || user.avatar || user.photo;
  }

  if (!raw || typeof raw !== "string" || !raw.trim()) return null;

  const baseUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, "");
  const value = String(raw).trim();
  const storagePosition = value.indexOf("/storage/");

  if (storagePosition >= 0) return `${baseUrl}${value.slice(storagePosition)}`;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) return value;
  return `${baseUrl}/storage/${value.replace(/^\/?storage\//, "")}`;
}

export function StudentUserMenu({ user: previewUser }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const authenticatedUser = useSelector((state) => state.auth?.user);
  const connectedCandidate = location.state?.fromCandidateProfile ? location.state.candidate : null;
  const user = previewUser || connectedCandidate || authenticatedUser;
  const name = fullName(user);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const photo = profileImageUrl(user);

  useEffect(() => {
    setImgFailed(false);
  }, [photo]);

  useEffect(() => {
    const close = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const logout = async () => {
    setOpen(false);
    await dispatch(logoutUser());
    navigate("/login-page", { replace: true });
  };

  const hasPhoto = Boolean(photo) && !imgFailed;

  return (
    <div className="nsd-user-menu" ref={wrapperRef}>
      <button type="button" className="nsd-user" onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open}>
        <span className={`nsd-user-avatar${hasPhoto ? " nsd-user-avatar--has-img" : ""}`}>
          {hasPhoto ? (
            <img
              src={photo}
              alt={name || ""}
              onError={() => setImgFailed(true)}
            />
          ) : (
            initials
          )}
        </span>
        <span className="nsd-user-name">{name}</span>
        <span className={`nsd-user-chevron${open ? " is-open" : ""}`}><ChevronDownIcon /></span>
      </button>
      {open && (
        <div className="nsd-user-dropdown" role="menu">
          <button type="button" role="menuitem" onClick={logout}><LogoutIcon />Se déconnecter</button>
        </div>
      )}
    </div>
  );
}

function StudentNotifications() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const close = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    http.get("/student/dashboard")
      .then(({ data }) => setAppointments(Array.isArray(data?.dashboardProgress?.upcoming_appointments) ? data.dashboardProgress.upcoming_appointments : []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [open]);

  const notificationCount = appointments.length;
  const formatDate = (value) => {
    if (!value) return "Date à confirmer";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? "Date à confirmer" : new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date);
  };

  return (
    <div className="nsd-notification-menu" ref={wrapperRef}>
      <button type="button" className="nsd-bell" aria-label="Notifications" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <BellIcon />
        {notificationCount > 0 && <span className="nsd-bell-badge">{notificationCount}</span>}
      </button>
      {open && (
        <div className="nsd-notification-dropdown" role="menu">
          <div className="nsd-notification-title">Notifications</div>
          {loading ? <p className="nsd-notification-empty">Chargement…</p>
            : appointments.length ? appointments.map((appointment) => (
              <button key={appointment.id} type="button" className="nsd-notification-item" role="menuitem" onClick={() => { setOpen(false); navigate("/student-courses"); }}>
                <span className="nsd-notification-dot" />
                <span><strong>Réservation confirmée</strong><small>{appointment.title || "Leçon de conduite"} · {formatDate(appointment.date)}{appointment.start_at ? ` à ${String(appointment.start_at).slice(0, 5).replace(":", "h")}` : ""}</small></span>
              </button>
            )) : <p className="nsd-notification-empty">Aucune réservation à venir.</p>}
        </div>
      )}
    </div>
  );
}

export default function StudentHeader({
  className = "",
  headingClassName = "",
  iconClassName = "",
  icon,
  title,
  titleNode,
  subtitle,
  onMenuOpen,
  user,
}) {
  return (
    <header className={`nsd-header ${className}`.trim()}>
      <button type="button" className="nsd-hamburger" onClick={onMenuOpen} aria-label="Ouvrir le menu">
        <HamburgerIcon />
      </button>

      <div className={`nsd-greeting ${headingClassName}`.trim()}>
        {titleNode || <h1 className="nsd-greeting-title">{icon && <span className={iconClassName}>{icon}</span>}{title}</h1>}
        {subtitle && <p className="nsd-greeting-sub">{subtitle}</p>}
      </div>

      <div className="nsd-header-right">
        <StudentNotifications />
        <StudentUserMenu user={user} />
      </div>
    </header>
  );
}
