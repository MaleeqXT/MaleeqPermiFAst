import { useEffect, useState } from "react";
import http from "../helpers/http.jsx";
import "./CandidateCourseDrawer.css";

// ── Icons ────────────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 7.6a2 2 0 0 0-1.8-1.1H7.4a2 2 0 0 0-1.8 1.1L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M9 17h6" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const MessageSquareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ── Stylized Map Preview SVG ─────────────────────────────────────────────────
function MapPreview({ locationText }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText || "France")}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="ncd-map-thumbnail"
      title="Voir sur Google Maps"
    >
      <svg viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="140" fill="#e9eef2" />
        {/* City Blocks */}
        <rect x="10" y="10" width="110" height="55" fill="#f8fafc" rx="4" />
        <rect x="130" y="10" width="120" height="45" fill="#f8fafc" rx="4" />
        <rect x="260" y="10" width="130" height="60" fill="#f8fafc" rx="4" />
        <rect x="10" y="75" width="90" height="55" fill="#f8fafc" rx="4" />
        <rect x="110" y="65" width="130" height="65" fill="#f8fafc" rx="4" />
        <rect x="250" y="80" width="140" height="50" fill="#f8fafc" rx="4" />
        {/* Streets */}
        <rect x="120" y="0" width="10" height="140" fill="#ffffff" opacity="0.95" />
        <rect x="240" y="0" width="10" height="140" fill="#ffffff" opacity="0.95" />
        <rect x="0" y="55" width="400" height="10" fill="#ffffff" opacity="0.95" />
        {/* Accent road */}
        <path d="M 0 60 Q 120 54 200 62 Q 300 70 400 65" stroke="#93c5fd" strokeWidth="3.5" fill="none" />
        {/* Pin marker */}
        <circle cx="205" cy="48" r="10" fill="#ef4444" opacity="0.9" />
        <path d="M 205 48 L 205 64" stroke="#ef4444" strokeWidth="2.5" />
        <circle cx="205" cy="46" r="4" fill="#ffffff" />
      </svg>
      <div className="ncd-map-badge">
        <ExternalLinkIcon />
        <span>Ouvrir la carte</span>
      </div>
    </a>
  );
}

export default function CandidateCourseDrawer({ course, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState("");

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Load comments if reservation ID exists
  useEffect(() => {
    const reservationId = course?.reservation_id || course?.id;

    if (!isOpen || !reservationId) {
      setComments([]);
      setCancellationMessage("");
      return;
    }

    let active = true;
    setCommentsLoading(true);

    http.get(`/reservations/${reservationId}/comments`)
      .then((res) => {
        if (active) setComments(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch(() => {
        if (active) setComments([]);
      })
      .finally(() => {
        if (active) setCommentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, course?.id, course?.reservation_id]);

  if (!course && !isOpen) return null;

  // Format details
  const courseDateObj = course?.date ? new Date(`${course.date}T12:00:00`) : null;
  const formattedFullDate = courseDateObj && !Number.isNaN(courseDateObj.getTime())
    ? new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(courseDateObj)
    : course?.date || "Date à confirmer";

  const capitalizedDate = formattedFullDate.charAt(0).toUpperCase() + formattedFullDate.slice(1);
  const locationText = course?.location || "Lieu de rendez-vous défini par l'auto-école";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;
  const instructorName = course?.instructor || "Moniteur assigné";
  const initials = course?.initials || String(instructorName).split(/\s+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "MO";
  const durationLabel = course?.duration || `${course?.hour || 1}h`;
  const timeLabel = course?.time || `${String(course?.start_at || "—").replace(":", "h")} - ${String(course?.end_at || "—").replace(":", "h")}`;
  const offerName = course?.offer_name || "Offre non renseignée";
  const offerColor = /^#[0-9a-f]{3,8}$/i.test(String(course?.offer_color || ""))
    ? course.offer_color
    : "#239a68";

  const status = course?.status || "upcoming";
  const isUpcoming = status === "upcoming";
  const isCancelled = status === "cancelled";
  const isCompleted = status === "past" || status === "completed";

  const statusBadgeText = isCancelled
    ? "Annulée"
    : isCompleted
    ? "Terminée"
    : "Confirmée / À venir";

  const statusPillClass = isCancelled
    ? "ncd-status-pill--cancelled"
    : isCompleted
    ? "ncd-status-pill--completed"
    : "ncd-status-pill--upcoming";

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(locationText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleCancelRequest = async () => {
    const reservationId = course?.reservation_id || course?.id;
    if (!reservationId || cancellationLoading) return;
    setCancellationLoading(true);
    setCancellationMessage("");

    try {
      await http.post("/student/approvels", {
        reservation_id: reservationId,
        hours_requested: Number(course.hour) || 1,
        comment: "Demande d'annulation de cours effectuée depuis l'espace élève.",
      });
      setCancellationMessage("Votre demande d'annulation a bien été transmise à votre auto-école.");
    } catch (err) {
      setCancellationMessage(err.response?.data?.message || err.response?.data?.error || "Une erreur est survenue lors de la demande d'annulation.");
    } finally {
      setCancellationLoading(false);
    }
  };

  return (
    <div
      className={`ncd-drawer-backdrop ${isOpen ? "open" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-hidden={!isOpen}
    >
      <aside
        className="ncd-drawer-container"
        role="dialog"
        aria-modal="true"
        aria-label="Détails du cours"
      >
        {/* ── Drawer Header ── */}
        <header className="ncd-drawer-header">
          <div className="ncd-drawer-header-left">
            <span className="ncd-drawer-icon-badge">
              <CalendarIcon />
            </span>
            <div className="ncd-drawer-title-group">
              <h2>Détails du cours</h2>
              <p>{capitalizedDate}</p>
            </div>
          </div>
          <button
            type="button"
            className="ncd-drawer-close-btn"
            onClick={onClose}
            aria-label="Fermer le panneau"
          >
            <CloseIcon />
          </button>
        </header>

        {/* ── Drawer Body ── */}
        <div className="ncd-drawer-body">
          {/* Hero Overview Card */}
          <section className={`ncd-card ncd-hero-card ${isCancelled ? "ncd-hero-card--cancelled" : isCompleted ? "ncd-hero-card--completed" : ""}`}>
            <div className="ncd-hero-top">
              <h3 className="ncd-hero-title">{course?.title || "Leçon de conduite"}</h3>
              <span className={`ncd-status-pill ${statusPillClass}`}>
                <span className="ncd-status-dot" />
                {statusBadgeText}
              </span>
            </div>

            <div className="ncd-hero-chips">
              <span className="ncd-chip">
                <CalendarIcon />
                {capitalizedDate}
              </span>
              <span className="ncd-chip">
                <ClockIcon />
                {timeLabel}
              </span>
              <span className="ncd-chip">
                <CarIcon />
                Durée : {durationLabel}
              </span>
            </div>
          </section>

          {/* Instructor Section */}
          <section>
            <div className="ncd-section-heading">
              <CheckCircleIcon />
              <span>Votre Moniteur</span>
            </div>
            <div className="ncd-card ncd-instructor-card">
              <div className="ncd-instructor-avatar" aria-hidden="true">
                {initials}
              </div>
              <div className="ncd-instructor-details">
                <h4 className="ncd-instructor-name">{instructorName}</h4>
                <span className="ncd-instructor-role">Enseignant de la conduite diplômé</span>
                <span className="ncd-instructor-badge">
                  <CheckCircleIcon />
                  Moniteur référent
                </span>
              </div>
            </div>
          </section>

          {/* Offer Section */}
          <section>
            <div className="ncd-section-heading">
              <CarIcon />
              <span>Votre offre</span>
            </div>
            <div className="ncd-card ncd-offer-card">
              <span className="ncd-offer-color" style={{ backgroundColor: offerColor }} aria-hidden="true" />
              <div className="ncd-offer-details">
                <span>Forfait associé à cette séance</span>
                <strong>{offerName}</strong>
              </div>
            </div>
          </section>

          {/* Meeting Point Section */}
          <section>
            <div className="ncd-section-heading">
              <MapPinIcon />
              <span>Lieu de rendez-vous</span>
            </div>
            <div className="ncd-card ncd-location-card">
              <div className="ncd-location-address">
                <MapPinIcon />
                <div className="ncd-location-text">
                  <strong>Point de départ</strong>
                  <span>{locationText}</span>
                </div>
              </div>

              <MapPreview locationText={locationText} />

              <div className="ncd-location-actions">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ncd-btn-secondary"
                >
                  <ExternalLinkIcon />
                  Google Maps
                </a>
                <button
                  type="button"
                  className={`ncd-btn-secondary ${copied ? "copied" : ""}`}
                  onClick={handleCopyLocation}
                >
                  {copied ? (
                    <>
                      <CheckIcon />
                      Copié !
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      Copier l'adresse
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Lesson Details Grid */}
          <section>
            <div className="ncd-section-heading">
              <CarIcon />
              <span>Informations sur la séance</span>
            </div>
            <div className="ncd-info-grid">
              <div className="ncd-info-box">
                <span className="ncd-info-box-label">Type d'apprentissage</span>
                <span className="ncd-info-box-value">{course?.training_type || "Conduite B (Manuel)"}</span>
              </div>
              <div className="ncd-info-box">
                <span className="ncd-info-box-label">Durée comptabilisée</span>
                <span className="ncd-info-box-value">{durationLabel}</span>
              </div>
              <div className="ncd-info-box">
                <span className="ncd-info-box-label">Horaires</span>
                <span className="ncd-info-box-value">{timeLabel}</span>
              </div>
              <div className="ncd-info-box">
                <span className="ncd-info-box-label">Statut du cours</span>
                <span className="ncd-info-box-value">{statusBadgeText}</span>
              </div>
            </div>
          </section>

          {/* Pedagogical Notes / Comments */}
          <section>
            <div className="ncd-section-heading">
              <MessageSquareIcon />
              <span>Notes & Commentaires</span>
            </div>
            <div className="ncd-card ncd-comment-box">
              {commentsLoading ? (
                <p>Chargement des commentaires…</p>
              ) : comments.length > 0 ? (
                <div className="ncd-comment-list">
                  {comments.map((item) => (
                    <div key={item.id} className="ncd-comment-item">
                      {item.comment}
                    </div>
                  ))}
                </div>
              ) : (
                <p>{course?.comment || "Aucun commentaire particulier pour cette séance."}</p>
              )}
            </div>
          </section>

          {/* Student Reminder Tip */}
          <div className="ncd-reminder-box">
            <InfoIcon />
            <p>
              <strong>Rappel important :</strong> N'oubliez pas d'apporter votre livret d'apprentissage ainsi que votre pièce d'identité. Présentez-vous 10 minutes avant le début de la leçon.
            </p>
          </div>
        </div>

        {/* ── Drawer Footer ── */}
        <footer className="ncd-drawer-footer">
          {cancellationMessage && (
            <div className="ncd-cancellation-msg">{cancellationMessage}</div>
          )}
          <div className="ncd-footer-actions">
            {isUpcoming && (
              <button
                type="button"
                className="ncd-btn-danger"
                onClick={handleCancelRequest}
                disabled={cancellationLoading}
              >
                {cancellationLoading ? "Envoi…" : "Demander l'annulation"}
              </button>
            )}
            <button
              type="button"
              className="ncd-btn-primary"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
