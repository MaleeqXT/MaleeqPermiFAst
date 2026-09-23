import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentHeader from "./StudentHeader.jsx";
import StudentSidebar from "./StudentSidebar.jsx";
import "./CandidateDashboard.css";
import "./CandidateContactPage.css";

function StrokeIcon({ children, strokeWidth = 2 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const MessageIcon = () => <StrokeIcon><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></StrokeIcon>;
const MailIcon = () => <StrokeIcon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></StrokeIcon>;
const PhoneIcon = () => <StrokeIcon><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z" /></StrokeIcon>;
const WhatsAppIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.956-6.58 6.591-6.58a6.544 6.544 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.96 6.588-6.592 6.588z" />
    <path d="M11.611 9.205c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.514.646-.627.775-.116.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.984-.59-.525-.986-1.173-1.102-1.37-.116-.198-.013-.306.086-.404.09-.088.197-.23.296-.345.1-.116.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.611-1.47-.16-.389-.323-.335-.445-.34-.116-.006-.247-.006-.38-.006a.729.729 0 0 0-.527.247c-.182.198-.691.677-.691 1.654s.708 1.916.81 2.049c.098.132 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.151.907.129 1.246.079.38-.058 1.171-.48 1.338-.943.164-.462.164-.857.114-.943-.049-.084-.182-.132-.38-.23z" />
  </svg>
);
const ClockIcon = () => <StrokeIcon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></StrokeIcon>;

export default function CandidateContactPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [whatsappNotice, setWhatsappNotice] = useState("");

  const handleSidebarNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  return (
    <div className="nsd-root nscontact-root">
      <StudentSidebar activePath="/student-contact" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleSidebarNavigate} />

      <main className="nsd-main nscontact-main">
        <StudentHeader
          className="nscontact-header"
          headingClassName="nscontact-heading"
          iconClassName="nscontact-heading-icon"
          icon={<MessageIcon />}
          title="Nous contacter"
          subtitle="Notre équipe est à votre écoute pour vous accompagner."
          onMenuOpen={() => setSidebarOpen(true)}
        />

        <section className="nscontact-content" aria-label="Moyens de contacter PermiFast">
          <div className="nscontact-visual-panel">
            <div className="nscontact-orbit">
              <svg className="nscontact-orbit-line" viewBox="0 0 500 500" aria-hidden="true">
                <path d="M102 405C205 478 378 464 442 343C509 217 438 76 306 51C223 35 151 57 102 96" />
                <circle cx="136" cy="426" r="6" />
                <circle cx="450" cy="298" r="6" />
                <circle cx="394" cy="91" r="6" />
              </svg>

              <div className="nscontact-central-shell">
                <button type="button" className="nscontact-central-button" onClick={() => navigate("/student-messages")} aria-label="Ouvrir la messagerie">
                  <MessageIcon />
                  <span>Nous contacter</span>
                </button>
              </div>

              <a className="nscontact-method nscontact-method--email" href="mailto:contact@permifast.fr" title="E-mail">
                <span><MailIcon /></span><strong>E-mail</strong>
              </a>
              <button type="button" className="nscontact-method nscontact-method--whatsapp" onClick={() => setWhatsappNotice("Le contact WhatsApp sera bientôt disponible.")} title="WhatsApp">
                <span><WhatsAppIcon /></span><strong>WhatsApp</strong>
              </button>
              <a className="nscontact-method nscontact-method--phone" href="tel:+33612345678" title="Téléphone">
                <span><PhoneIcon /></span><strong>Téléphone</strong>
              </a>
            </div>
          </div>

          <aside className="nscontact-details-card">
            <span className="nscontact-eyebrow">Équipe pédagogique</span>
            <h2>Une question sur vos cours, vos examens ou votre dossier&nbsp;?</h2>
            <p>Notre équipe pédagogique est disponible pour vous aider.</p>

            <div className="nscontact-detail-list">
              <a href="mailto:contact@permifast.fr" className="nscontact-detail-row">
                <span className="nscontact-detail-icon"><MailIcon /></span>
                <span><small>E-mail</small><strong>contact@permifast.fr</strong></span>
              </a>
              <a href="tel:+33612345678" className="nscontact-detail-row">
                <span className="nscontact-detail-icon"><PhoneIcon /></span>
                <span><small>Téléphone</small><strong>06 12 34 56 78</strong></span>
              </a>
              <div className="nscontact-detail-row">
                <span className="nscontact-detail-icon"><ClockIcon /></span>
                <span><small>Horaires</small><strong>Lundi - Vendredi : 09h00 - 19h00</strong><em>Samedi : 09h00 - 13h00</em></span>
              </div>
            </div>

            <p className={`nscontact-notice${whatsappNotice ? " is-visible" : ""}`} aria-live="polite">{whatsappNotice}</p>
          </aside>
        </section>
      </main>
    </div>
  );
}
