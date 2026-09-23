import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatUnreadBadge from '../chat/ChatUnreadBadge.jsx';
import "../Components/shared/Sidebar.css";
import "./CandidateDashboard.css";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1020);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1020px)");
    const handleChange = (event) => setIsMobile(event.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

// ─── Icons ────────────────────────────────────────────────────────────────
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
);
const CoursesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const ProgressIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M7 16.5v-3"></path><path d="M12 16.5v-8"></path><path d="M17 16.5v-5"></path></svg>
);
const ExamsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m9 15 2 2 4-4"></path></svg>
);
const DocumentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
);
const MessagesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
);
const AccountIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const PaymentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
);
const HeadsetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M16 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2z"></path><path d="M3 14v-2a9 9 0 0 1 18 0v2"></path></svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
);

// ─── Student navigation ────────────────────────────────────────────────────
const STUDENT_NAV = [
  { path: "/new-student-dashboard", label: "Tableau de bord", icon: <DashboardIcon /> },
  { path: "/student-courses",       label: "Mes cours",       icon: <CoursesIcon />   },
  { path: "/student-progress",      label: "Ma progression",  icon: <ProgressIcon />  },
  { path: "/student-exams",         label: "Mes examens",     icon: <ExamsIcon />     },
  { path: "/student-documents",     label: "Documents",   icon: <DocumentsIcon /> },
  { path: "/student-messages",      label: "Messagerie",  icon: <MessagesIcon /> },
  { path: "/student-account",       label: "Mon compte",  icon: <AccountIcon />   },
  { path: "/student-payments",      label: "Paiements",   icon: <PaymentsIcon />  },
];

export default function StudentSidebar({ activePath, onNavigate, onLogout, isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const effectiveCollapsed = isMobile ? false : collapsed;
  const toggleLeft = effectiveCollapsed ? 62 : 246;
  const goTo = (path) => {
    onClose?.();
    navigate(path, { state: location.state });
  };

  return (
    <>
      {isOpen && <div className="nsd-overlay" onClick={onClose} />}

      <aside className={`sidebar ${effectiveCollapsed ? "collapsed" : "expanded"} ${isOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-logo">
          {effectiveCollapsed ? (
            <img src="https://passpermisfacile.fr/assets/logo.svg" alt="PassPermis" className="logo-img" />
          ) : (
            <img src="http://127.0.0.1:8000/assets/logo-permis-facile.webp" alt="Permis Facile" className="logo-img" />
          )}
        </div>

        <div className="sidebar-nav">
          {STUDENT_NAV.map((entry) => (
            <div
              key={entry.path}
              className={`nav-item ${activePath === entry.path ? "active" : ""}`}
              onClick={() => goTo(entry.path)}
              title={effectiveCollapsed ? entry.label : ""}
            >
              <span className="nav-icon">{entry.icon}</span>
              {!effectiveCollapsed && <span className="nav-label">{entry.label}</span>}
              {entry.path === '/student-messages' && <ChatUnreadBadge collapsed={effectiveCollapsed} />}
            </div>
          ))}
        </div>

        <div className="nsd-sidebar-footer">
          {!effectiveCollapsed && (
            <div className="nsd-help-card">
              <div className="nsd-help-head">
                <span className="nsd-help-icon"><HeadsetIcon /></span>
                <span className="nsd-help-title">Besoin d'aide ?</span>
              </div>
              <p className="nsd-help-text">Notre équipe est là pour vous accompagner.</p>
              <button type="button" className="nsd-help-btn" onClick={() => goTo("/student-contact")}>Nous contacter</button>
            </div>
          )}

         
        </div>
      </aside>

      <button
        type="button"
        className={`sidebar-toggle ${collapsed ? "collapsed" : "expanded"}`}
        style={{ left: toggleLeft }}
        onClick={() => setCollapsed((current) => !current)}
        title="Afficher ou réduire la barre latérale"
        aria-label="Afficher ou réduire la barre latérale"
        aria-expanded={!effectiveCollapsed}
      >
        {collapsed ? "›" : "‹"}
      </button>
    </>
  );
}
