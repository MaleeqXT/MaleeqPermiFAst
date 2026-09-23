import { useEffect, useRef, useState } from "react";
import blacklogo from './assets/logo.webp'
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import loginpage from './Components/loginpage/LoginPage.jsx'
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser,logoutUser } from "./redux/reducers/authReducer.jsx";
import { fetchSchools, setSelectedSchool,selectSchool } from "./redux/reducers/schoolReducer.jsx";
import CancellationRequests from './Components/request-cancellations/CancellationRequests.jsx'
import MessageClients from './Components/message-clients/MessageClients.jsx'
import ZonePlaces from "./Preferences/ZonePlaces.jsx";
import CandidateDashboard from "./new-student-dashboard/CandidateDashboard.jsx";
import CandidateCoursePage from "./new-student-dashboard/CandidateCoursePage.jsx";
import CandidateProgressPage from "./new-student-dashboard/CandidateProgressPage.jsx";
import CandidateExamPage from "./new-student-dashboard/CandidateExamPage.jsx";
import CandidateDocumentsPage from "./new-student-dashboard/CandidateDocumentsPage.jsx";
import CandidateAccountPage from "./new-student-dashboard/CandidateAccountPage.jsx";
import CandidatePaymentPage from "./new-student-dashboard/CandidatePaymentPage.jsx";
import CandidateContactPage from "./new-student-dashboard/CandidateContactPage.jsx";
import CandidateChatPage from "./new-student-dashboard/CandidateChatPage.jsx";
import AdminChatPage from "./Components/chat/AdminChatPage.jsx";

// ── Shared / layout
import Sidebar        from "./Components/shared/Sidebar.jsx";

// ── Dashboard
import Dashboard      from "./Components/dashboard/Dashboard.jsx";

// ── School
import AddSchoolModal from "./Components/school/AddSchoolModal.jsx";

// ── Profile / misc
import Profile        from "./Components/profile/Profile.jsx";
import Students       from "./Components/students/Students.jsx";
import WaitingStudents from "./Components/students/WaitingStudents.jsx";
import News           from "./Components/news/News.jsx";

// ── Candidates (feature folder + context)
import { CandidatesProvider } from "./Components/candidates/CandidatesContext.jsx";
import Candidates     from "./Components/candidates/Candidates.jsx";
import CandidateForm  from "./Components/candidates/CandidateForm.jsx";
import Info           from "./Components/candidates/Info.jsx";
import AdminDocumentsPage from "./Components/candidates/AdminDocumentsPage.jsx";

// ── Monitors (feature folder + context)
import { MonitorsProvider } from "./Components/monitors/MonitorsContext.jsx";
import Monitors       from "./Components/monitors/Monitors.jsx";
import AddMonitor     from "./Components/monitors/AddMonitor.jsx";
import MonitorsInfo   from "./Components/monitors/MonitorsInfo.jsx";

// ── Secretaries
import Secretaries    from "./Components/secretaries/Secretaries.jsx";
import SecretaryForm  from "./Components/secretaries/SecretaryForm.jsx";
import SecretaryInfo  from "./Components/secretaries/SecretaryInfo.jsx";
import SecretaryDashboardPage from "./Components/secretaries/SecretaryDashboardPage.jsx";

// ── Administrations
import Administrations   from "./Components/administrations/Administrations.jsx";
import AdministratorInfo  from "./Components/administrations/AdministratorInfo.jsx";
import AdministratorInfo1 from "./Components/administrations/AdministratorInfo1.jsx";
import AddAdministrator   from "./Components/administrations/AddAdministrator.jsx";

// ── Orders
import Orders     from "./Orders/Orders.jsx";
import OrdersInfo from "./Orders/OrdersInfo.jsx";
import Baskets    from "./Orders/Baskets.jsx";
import Offers     from "./Orders/Offers.jsx";
import OffersForm from "./Orders/OffersForm.jsx";
import OffersInfo from "./Orders/OffersInfo.jsx";
import BasketsInfo from "./Orders/BasketsInfo.jsx";
import Invoice from "./Orders/Invoice.jsx";

// __ Preferences
import Skills from "./Preferences/Skills.jsx";
import Zones from "./Preferences/Zones.jsx";

// ── CPF FORM
import CpfForm from "./Components/cpf form/CpfForm.jsx";

// ── Billing
import Billing from "./Components/billing/Billing.jsx";

// ── Students Report
import StudentsReport from "./Components/studentsreport/StudentsReport.jsx";
import ActiveAgency from "./Components/activeagency/ActiveAgency.jsx";

// ── Exams
import Exam from "./Components/exams/Exam.jsx";

// ── Sessions
import Sessions from "./sessions/Sessions.jsx";
import Cancellations from "./sessions/Cancellations.jsx";
import Propositions from "./Components/propositions/Propositions.jsx";

// ── Online site
import Online from "./Components/Online/Online.jsx";
import StudentDashboard from "./studentdashboard/StudentsDashboard.jsx";
import MonitorDashboard from "./monitordashboard/MonitorDashboard.jsx";
import SatisfactionPage from "./satisfaction/SatisfactionPage.jsx";
import AdminSatisfactionPage from "./satisfaction/AdminSatisfactionPage.jsx";
import SatisfactionSurveyPage from "./satisfaction/SatisfactionSurveyPage.jsx";
import VehicleManagementPage from "./vehicles/VehicleManagementPage.jsx";

import "./App.css";
import LoginPage from "./Components/loginpage/LoginPage.jsx";

// ── permis-web public landing site ──────────────────────────────────────────
import { CartProvider }            from "./permis-web/context/CartContext.jsx";
import PW_ScrollToTop              from "./permis-web/components/shared/ScrollToTop.jsx";
import PW_CartDrawer               from "./permis-web/components/shared/CartDrawer.jsx";
import PW_FloatingContactButton    from "./permis-web/components/shared/FloatingContactButton.jsx";
import PW_HomePage                 from "./permis-web/pages/HomePage.jsx";
import PW_AgencyPage               from "./permis-web/pages/AgencyPage.jsx";
import PW_ServicesPage             from "./permis-web/pages/ServicesPage.jsx";
import PW_PackagesPage             from "./permis-web/pages/PackagesPage.jsx";
import PW_ContactPage              from "./permis-web/pages/ContactPage.jsx";
import PW_VideoPage                from "./permis-web/pages/VideoPage.jsx";
import PW_CPFPage                  from "./permis-web/pages/CPFPage.jsx";
import PW_CodePage                 from "./permis-web/pages/CodePage.jsx";
import PW_LoginPage                from "./permis-web/pages/LoginPage.jsx";
import CPFPositioningPage from "./permis-web/pages/CPFPositioningPage.jsx";
import RegisterStudentForm from "./permis-web/pages/RegisterStudentForm.jsx";

const PAGE_TITLES = {
  "/dashboard":                "Tableau de bord",
  "/dashboard/general":        "Tableau de bord",
  "/dashboard/current":        "Tableau de bord",
  "/profile":                  "Mon profil PermiFast",
  "/students":                 "Mes élèves",
  "/waiting":                  "Mes élèves en attente",
  "/messaging":                "Messagerie",
  "/news":                     "Actualités",
  "/contact":                  "Nous Contacter",
  "/subscriptions":            "Mes abonnements",
  "/bills":                    "Mes factures",
  "/statistics":               "Statistiques",
  "/settings":                 "Paramètres",
  "/sessions":                 "Sessions",
  "/sessions/cancellations":   "Annulations",
  "/sessions/propositions":    "Propositions",
  "/orders":                   "Commandes",
  "/orders/baskets":           "Paniers",
  "/orders/offers":            "Offres",
  "/vehicles":                 "Gestion des véhicules",
  "/exams":                    "Examens",
  "/billing":                  "Facturation",
  "/form-cpf":                 "Form CPF",
  "/active-students":          "Rapport des élèves actifs",
  "/active-agency":            "Tableau de bord agence",
  "/administrations":          "Administrations",
  "/secretaries":              "Secrétaires",
  "/monitors":                 "Moniteurs",
  "/candidates":               "Candidats",
  "/admin/documents":          "Documents des élèves",
  "/admin/messages":           "Messages",
  "/skills":                   "Compétences",
  "/locations":                "Localisations",
  "/site-en-ligne":            "Site en ligne",
  "/admin/satisfaction":       "Satisfaction / Avis",
  "/satisfaction-survey":      "Enquêtes de satisfaction",
  "/cpf-positioning":          "Positionnement CPF",
};

// Paths that do NOT require a school — used to guard navigation
// (Sidebar now handles its own enable/disable logic via alwaysEnabled flags,
//  but we still guard programmatic navigation here as a safety net.)
const ALWAYS_ENABLED_PATHS = new Set([
  "/dashboard", "/dashboard/general", "/dashboard/current",
  "/active-agency",
  "/admin/satisfaction",
  "/satisfaction-survey",
  "/skills", "/locations", "/site-en-ligne",
]);

// Public routes served by the permis-web landing site.
// These bypass authentication checks entirely.
const PUBLIC_ROUTES = new Set([
  "/",
  "/agency-page",
  "/services-page",
  "/packages-page",
  "/contact-page",
  "/video-page",
  "/cpf-page",
  "/cpf-positioning",
  "/code-page",
  "/login-page",
  "/register-student",
  "/register",
]);

const SECRETARY_DASHBOARD_SESSION_KEY = "permiFastSecretaryDashboardActive";

const SECRETARY_DASHBOARD_PATHS = new Set([
  "/dashboard", "/dashboard/general", "/dashboard/current",
  "/sessions", "/sessions/cancellations", "/sessions/propositions",
  "/orders", "/orders/info", "/orders/baskets", "/orders/offers",
  "/offersinfo", "/Basketsinfo", "/offersform", "/invoice",
  "/exams", "/billing", "/form-cpf", "/active-students", "/active-agency",
  "/monitors", "/monitors-info", "/add-monitor",
  "/candidates", "/info", "/candidateform",
  "/admin/messages",
  "/skills", "/locations", "/site-en-ligne",
]);

const ROLE_HOME_PATH = {
  admin: "/dashboard/general",
  secretary: "/secretary-dashboard",
  monitor: "/monitor-dashboard",
  student: "/new-student-dashboard",
};

const PRIVATE_ROLE_DASHBOARD_PATHS = new Set([
  "/student-dashboard",
  "/new-student-dashboard",
  "/student-courses",
  "/student-progress",
  "/student-exams",
  "/student-documents",
  "/student-account",
  "/student-payments",
  "/student-contact",
  "/student-messages",
  "/monitor-dashboard",
  "/secretary-dashboard",
]);

const NEW_STUDENT_DASHBOARD_PATHS = new Set([
  "/new-student-dashboard",
  "/student-courses",
  "/student-progress",
  "/student-exams",
  "/student-documents",
  "/student-account",
  "/student-payments",
  "/student-contact",
  "/student-messages",
]);

function normalizeRole(role) {
  const normalized = String(role ?? "").trim().toLowerCase();
  return ["super-admin", "super_admin", "superadmin"].includes(normalized)
    ? "admin"
    : ["secrétaire", "secretaire"].includes(normalized)
      ? "secretary"
      : normalized;
}

function getRoleHomePath(role) {
  return ROLE_HOME_PATH[normalizeRole(role)] ?? "/loginpage";
}

function canAccessPath(role, pathname, state) {
  const currentRole = normalizeRole(role);

  if (!currentRole) {
    return pathname === "/loginpage";
  }

  if (currentRole === "student") {
    return NEW_STUDENT_DASHBOARD_PATHS.has(pathname) || pathname === "/satisfaction";
  }

  if (currentRole === "monitor") {
    return pathname === "/monitor-dashboard";
  }

  // Staff users share the same Components and routes. The secretary has a
  // different landing dashboard, but once signed in can use the same admin
  // work areas without changing any admin-side component behaviour.
  if (currentRole === "admin" || currentRole === "secretary") {
    if (currentRole === "secretary" && pathname === "/secretary-dashboard") {
      return true;
    }

    // Dashboard previews are available only through their respective
    // candidate/monitor "Connecter" actions.
    if (pathname === "/student-dashboard" || NEW_STUDENT_DASHBOARD_PATHS.has(pathname)) {
      return currentRole === "secretary"
        ? Boolean(state?.fromSecretaryDashboard)
        : Boolean(state?.fromCandidateProfile);
    }
    if (pathname === "/monitor-dashboard") {
      return currentRole === "secretary"
        ? Boolean(state?.fromSecretaryDashboard)
        : Boolean(state?.fromMonitorProfile);
    }
    return !PRIVATE_ROLE_DASHBOARD_PATHS.has(pathname) && pathname !== "/loginpage";
  }

  return false;
}



// ─── Hamburger Icon ───────────────────────────────────────────────────────
const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="6"  y2="6"  />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

export default function App() {
    const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
    (async () => {
      try {
        // Schools is protected. Fetch it only after the current session has
        // been verified so an expired session does not create a second 401.
        const currentUser = await dispatch(fetchCurrentUser()).unwrap();
        const currentRole = normalizeRole(currentUser?.role);
        // Schools belong to the staff area. A monitor/student must not call
        // the restricted admin endpoint during login.
        if (currentRole === "admin" || currentRole === "secretary") {
          await dispatch(fetchSchools()).unwrap();
        }
      } catch {
        // The route guard below sends unauthenticated visitors to login.
      } finally {
        setAuthReady(true);
      }
    })();
  }, [dispatch]);

const handleLogout=async()=>{
        await dispatch(logoutUser());
        setAccountMenuOpen(false);
        navigate("/login-page");
}
  // schoolSelected drives sidebar lock/unlock across the whole app
  // const [schoolSelected, setSchoolSelected]     = useState(false);
  // const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  //redux
  const { selected: selectedSchoolFromRedux } = useSelector((state) => state.schools);
 
  const [schoolSelected, setSchoolSelected] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  useEffect(() => {
    if (selectedSchoolFromRedux?.id) {
      setSchoolSelected(true);
      setSelectedSchoolId(selectedSchoolFromRedux.id);
    }
  }, [selectedSchoolFromRedux]);




  // Mobile sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  // Called by ActiveAgency when user clicks the radio button on a school row
  const handleSchoolSelect = (id) => {
    setSelectedSchoolId(id);
    setSchoolSelected(true);
  };

  // Legacy handler kept for Dashboard's own school-select flow
  const handleSelectSchool = async (id) => {
    await dispatch(selectSchool(id));
    setSelectedSchoolId(id);
    setSchoolSelected(true);
  };

  // const [schools, setSchools] = useState([
  //   { id: 1, name: "PASSPERMISFACILE",      address: "139 Bd Déodat de Sévérac, 31300 Toulouse, France", phone: "+33970701616", subscription: "Club 300", studentsWaiting: 1, unreadMessages: 0, status: "Actif" },
  //   { id: 2, name: "EASY DRIVER'S LICENSE", address: "15 Rue des Pierres, 60100 Creil, France",          phone: "+33970701616", subscription: "Club 300", studentsWaiting: 3, unreadMessages: 0, status: "Actif" },
  // ]);

  const { list: schools } = useSelector((state) => state.schools);

  const location = useLocation();
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);
  const homePath = getRoleHomePath(role);

  const handleDashboardExit = async ({ returnTo, isSecretaryReturn }) => {
    // A student or monitor leaving their own space must end their session and
    // return to the public website. Staff previews instead return to the page
    // from which that profile/dashboard was opened.
    if (!isSecretaryReturn && (role === "student" || role === "monitor")) {
      try {
        await dispatch(logoutUser()).unwrap();
      } catch (error) {
        // Clear the local session even when the API session is already expired.
        console.warn("Impossible de fermer la session côté serveur.", error);
      }
      navigate("/", { replace: true });
      return;
    }

    navigate(returnTo, {
      replace: true,
      state: isSecretaryReturn ? { fromSecretaryDashboard: true } : undefined,
    });
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleAddSchool = (data) => {
    setSchools((prev) => [...prev, {
      id: Date.now(),
      name: data.name.toUpperCase(),
      address: data.address || "—",
      phone: data.phone || "—",
      subscription: "Club 300",
      studentsWaiting: 0,
      unreadMessages: 0,
      status: "Actif",
    }]);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const pageTitle = PAGE_TITLES[location.pathname] ??
    (location.pathname.startsWith("/dashboard") ? "Tableau de bord" : "Tableau de bord");

  const activeSidebarPath =
  location.pathname === "/AddSchoolModal"
    ? "/active-agency"
    : location.pathname.startsWith("/dashboard")
      ? "/dashboard"
      : location.pathname;

  const isSecretaryDashboardRoute = location.pathname === "/secretary-dashboard";
  const hasSecretaryDashboardSession =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem(SECRETARY_DASHBOARD_SESSION_KEY) === "true";
  const isSecretaryDashboardContextRoute =
    (location.state?.fromSecretaryDashboard || hasSecretaryDashboardSession) &&
    SECRETARY_DASHBOARD_PATHS.has(location.pathname);

  const selectedSchool = schools.find((school) => school.id === selectedSchoolId);

  useEffect(() => {
    if (isSecretaryDashboardRoute || location.state?.fromSecretaryDashboard) {
      window.sessionStorage.setItem(SECRETARY_DASHBOARD_SESSION_KEY, "true");
    }
  }, [isSecretaryDashboardRoute, location.state]);

  // ── Full-page overrides (no shell) ──────────────────────────────────────

  // ── permis-web public routes (no auth required, no dashboard shell) ────────
  if (PUBLIC_ROUTES.has(location.pathname)) {
    // If user is already logged in and hits the public /login-page, redirect to their dashboard
    if (location.pathname === "/login-page" && authReady && user) {
      return <Navigate to={homePath} replace />;
    }
    return (
      <CartProvider>
        <PW_ScrollToTop />
        <Routes>
          <Route path="/"              element={<PW_HomePage />} />
          <Route path="/agency-page"   element={<PW_AgencyPage />} />
          <Route path="/services-page" element={<PW_ServicesPage />} />
          <Route path="/packages-page" element={<PW_PackagesPage />} />
          <Route path="/contact-page"  element={<PW_ContactPage />} />
          <Route path="/video-page"    element={<PW_VideoPage />} />
          <Route path="/cpf-page"      element={<PW_CPFPage />} />
          <Route path="/cpf-positioning" element={<CPFPositioningPage />} />
          <Route path="/code-page"     element={<PW_CodePage />} />
          <Route path="/login-page"    element={<PW_LoginPage />} />
          <Route path="/register-student" element={<RegisterStudentForm />} />
          <Route path="/register"      element={<RegisterStudentForm />} />
        </Routes>
        <PW_CartDrawer />
        <PW_FloatingContactButton />
      </CartProvider>
    );
  }
  // ────────────────────────────────────────────────────────────────────────────

  if (!authReady) {
    return (
      <div className="app-root">
        <div className="main-content">Chargement...</div>
      </div>
    );
  }

  if (!user && location.pathname !== "/loginpage") {
    return <Navigate to="/loginpage" replace />;
  }

  if (user && !canAccessPath(role, location.pathname, location.state)) {
    return <Navigate to={homePath} replace />;
  }

  // New student portal: students land here after login and can navigate only
  // inside this dedicated dashboard.
  if (location.pathname === "/new-student-dashboard") return <CandidateDashboard />;
  if (location.pathname === "/student-courses") return <CandidateCoursePage />;
  if (location.pathname === "/student-progress") return <CandidateProgressPage />;
  if (location.pathname === "/student-exams") return <CandidateExamPage />;
  if (location.pathname === "/student-documents") return <CandidateDocumentsPage />;
  if (location.pathname === "/student-account") return <CandidateAccountPage />;
  if (location.pathname === "/student-payments") return <CandidatePaymentPage />;
  if (location.pathname === "/student-contact") return <CandidateContactPage />;
  if (location.pathname === "/student-messages") return <CandidateChatPage />;

  if (location.pathname === "/student-dashboard") {
    const returnTo = location.state?.returnTo || "/dashboard/general";
    const isSecretaryReturn = Boolean(location.state?.fromSecretaryDashboard);
    const selectedStudentId =
      location.state?.candidate?.student?.id ?? location.state?.student?.id;

    // Staff members do not have their own student profile. This dashboard
    // must be opened from a selected candidate; otherwise the student API
    // correctly has no profile to load.
    if ((role === "admin" || role === "secretary") && !selectedStudentId) {
      return <Navigate to="/candidates" replace state={isSecretaryReturn ? { fromSecretaryDashboard: true } : undefined} />;
    }

    const DashboardComponent = StudentDashboard;
    return (
      <DashboardComponent
        openFilterOnOpen={Boolean(location.state?.openFilterOnOpen)}
        onClose={() => handleDashboardExit({ returnTo, isSecretaryReturn })}
      />
    );
  }

  if (location.pathname === "/satisfaction") {
    return <SatisfactionPage />;
  }

  if (location.pathname === "/monitor-dashboard") {
    const returnTo = location.state?.returnTo || "/dashboard/general";
    const isSecretaryReturn = Boolean(location.state?.fromSecretaryDashboard);
    const DashboardComponent = MonitorDashboard;
    return (
      <DashboardComponent
        onClose={() => handleDashboardExit({ returnTo, isSecretaryReturn })}
      />
    );
  }

  if (location.pathname === "/loginpage") {
  return <LoginPage />;
}


  // ── Secretary dashboard shell ───────────────────────────────────────────
  if (isSecretaryDashboardRoute || isSecretaryDashboardContextRoute) {
    return (
      
      <CandidatesProvider>
        <MonitorsProvider>
          <SecretaryDashboardPage
  initialPath={isSecretaryDashboardRoute ? "/active-agency" : location.pathname}
          />
        </MonitorsProvider>
      </CandidatesProvider>
    );
  }

  // ── Main shell ──────────────────────────────────────────────────────────
  return (
    <CandidatesProvider>
      <MonitorsProvider>
        <div className="app-root">
          <Sidebar
            activePath={activeSidebarPath}
            onNavigate={handleNavigate}
            schoolSelected={schoolSelected}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            hiddenPaths={role === "secretary" ? ["/administrations", "/secretaries"] : []}
          />

          <div className="right-panel">
            <div className="top-header">
              {/* Mobile logo */}
              {/* Page title — desktop only */}
              <div className="header-mobile-logo">
                <img className="header-mobile-logo-img" src={blacklogo} alt="PermiFast" />
              </div>

              <span className="header-page-title">{pageTitle}</span>

              {/* Quick actions + user info — desktop only */}
              <div className="header-desktop-actions">
                <button
                  type="button"
                  className="header-quick-action"
                  onClick={() => navigate("/approvel")}
                  title="Approbations"
                  aria-label="Ouvrir les approbations"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="header-quick-action"
                  onClick={() => navigate("/admin/documents")}
                  title="Documents"
                  aria-label="Ouvrir les documents des élèves"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M8 13h8M8 17h6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="header-quick-action"
                  onClick={() => navigate("/message/clients")}
                  title="Notifications"
                  aria-label="Ouvrir les notifications clients"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                </button>
              <div
                className={`header-account${accountMenuOpen ? " is-open" : ""}`}
                ref={accountMenuRef}
              >
                <button
                  type="button"
                  className="header-user"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  onMouseEnter={() => setAccountMenuOpen(true)}
                  aria-haspopup="menu"
                  aria-expanded={accountMenuOpen}
                >
                  <div className="header-avatar">AR</div>
                  <span className="header-username">{user ? `${user.first_name} ${user.last_name}` : "..."}</span>
                  <span className="header-chevron">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </span>
                </button>

                <div className="header-dropdown" role="menu">
                  {schools.map(school => (
                    <button
                      key={school.id}
                      type="button"
                      className={`header-dropdown-item${selectedSchoolId === school.id ? " active" : ""}`}
                      onClick={() => {  
                        handleSelectSchool(school.id);
                        setAccountMenuOpen(false);
                      }}
                    >
                      <span>{school.name}</span>
                      {selectedSchoolId === school.id && <span className="header-dropdown-check">✓</span>}
                    </button>
                  ))}
                  {/* <button
                    type="button"
                    className={`header-dropdown-item${selectedSchool?.id === 1 ? " active" : ""}`}
                    onClick={() => {
                      handleSelectSchool(1);
                      setAccountMenuOpen(false);
                    }}
                  >
                    <span>PASSPERMIS FACILE </span>
                    {selectedSchool?.id === 1 && <span className="header-dropdown-check">✓</span>}
                  </button>
                  <button
                    type="button"
                    className={`header-dropdown-item${selectedSchool?.id === 2 ? " active" : ""}`}
                    onClick={() => {
                      handleSelectSchool(2);
                      setAccountMenuOpen(false);
                    }}
                  >
                    <span>PASSPERMISFACILE</span>
                    {selectedSchool?.id === 2 && <span className="header-dropdown-check">✓</span>}
                  </button> */}
                  <div className="header-dropdown-divider" />
                  <button
                    type="button"
                    className="header-dropdown-item header-dropdown-item--logout"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      handleLogout();
                      // navigate("/");
                    }}
                  >
                    <span className="header-dropdown-icon">↪</span>
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
              </div>

              {/* Hamburger — mobile only */}
              <button
                className="header-hamburger"
                onClick={() => setSidebarOpen(true)}
                title="Ouvrir le menu"
                aria-label="Open navigation menu"
              >
                <HamburgerIcon />
              </button>
            </div>

            <main className={`main-content${location.pathname === "/satisfaction-survey" || location.pathname === "/vehicles" || location.pathname === "/admin/messages" ? " main-content--flush" : ""}`}>
              <Routes>
                <Route path="/" element={<Navigate to="/active-agency" replace />} />
                <Route path="/dashboard" element={<Navigate to="/dashboard/general" replace />} />
                <Route path="/dashboard/general"  element={<Dashboard tab="general"  schools={schools} selectedSchoolId={selectedSchoolId} onSelectSchool={handleSelectSchool} onNavigate={handleNavigate} />} />
                <Route path="/dashboard/current"  element={<Dashboard tab="current"  schools={schools} selectedSchoolId={selectedSchoolId} onSelectSchool={handleSelectSchool} onNavigate={handleNavigate} />} />
                <Route path="/AddSchoolModal"     element={<AddSchoolModal onAdd={handleAddSchool} />} />
                <Route path="/profile"            element={<Profile title="Mon profil PermiFast" />} />
                <Route path="/students"           element={<Students title="Mes élèves" />} />
                <Route path="/waiting"            element={<WaitingStudents title="Mes élèves en attente" />} />
                <Route path="/news"               element={<News title="Actualités" />} />



                {/* Login Page */}

                <Route path="/loginpage"    element={<LoginPage />} />
                {/* ── Active Agency — passes onSchoolSelect upward ── */}
                <Route
                  path="/active-agency" element={<ActiveAgency onSchoolSelect={handleSchoolSelect} />}
                />

                {/* ── Candidates ── */}
                <Route path="/candidates"    element={<Candidates selectedSchoolId={selectedSchoolId} />} />
                <Route path="/candidate-info/:id"          element={<Info />} />
                <Route path="/candidateform" element={<CandidateForm />} />
                <Route path="/admin/documents" element={<AdminDocumentsPage />} />
                <Route path="/admin/messages"  element={<AdminChatPage />} />

                {/* ── Monitors ── */}
                <Route path="/monitors"      element={<Monitors selectedSchoolId={selectedSchoolId} /> } />
                <Route path="/monitors-info/:id" element={<MonitorsInfo />} />
                <Route path="/add-monitor"   element={<AddMonitor />} />

                {/* ── Secretaries ── */}
                {/* <Route path="/secretaries"         element={<Secretaries />} /> */}
                  
              <Route path="/secretaries" element={<Secretaries selectedSchoolId={selectedSchoolId} />} />
                <Route path="/secretaryform"       element={<SecretaryForm />} />
                {/* <Route path="/secretaryinfo"       element={<SecretaryInfo />} /> */}
                <Route path="/secretaryinfo/:id" element={<SecretaryInfo />} />


                {/* ── Administrations ── */}
                <Route path="/administrations"    element={<Administrations title="Administrations" />} />
                <Route path="/administratorinfo"  element={<AdministratorInfo />} />
                <Route path="/administratorinfo1" element={<AdministratorInfo1 />} />
                <Route path="/addadministrator"   element={<AddAdministrator />} />

                {/* ── Orders ── */}
                <Route path="/orders"         element={<Orders selectedSchoolId={selectedSchoolFromRedux?.id} />} />
                <Route path="/orders/info"    element={<OrdersInfo />} />
                <Route path="/orders/info/:id" element={<OrdersInfo />} />
                <Route path="/orders/baskets" element={<Baskets selectedSchoolId={selectedSchoolFromRedux?.id} />} />
                <Route path="/orders/offers"  element={<Offers selectedSchoolId={selectedSchoolFromRedux?.id} />} />
                <Route path="/offersinfo"              element={<OffersInfo />} />
                <Route path="/offersinfo/edit/:id"     element={<OffersInfo />} />
                <Route path="/Basketsinfo"    element={<BasketsInfo />} />
                <Route path="/Basketsinfo/:id" element={<BasketsInfo />} />
                <Route path="/offersform"     element={<OffersForm />} />
                <Route path="/invoice"        element={<Invoice />} />
                <Route path="/approvel"        element={<CancellationRequests />} />
                <Route path="/message/clients"        element={<MessageClients />} />

                {/* ── Sessions ── */}
                <Route path="/sessions"               element={<Sessions title="Sessions" />} />
                <Route path="/sessions/cancellations" element={<Cancellations title="Annulations" />} />
                <Route path="/sessions/propositions"  element={<Propositions />} />

                {/* ── Preferences ── */}
                <Route path="/skills"    element={<Skills title="Compétences" />} />
                {/* <Route path="/locations" element={<Zones title="Localisations" />} /> */}
                <Route path="/locations" element={<ZonePlaces title="Localisations" />} />


                {/* ── CPF FORM ── */}
                <Route path="/form-cpf" element={<CpfForm title="Form CPF" />} />

                {/* ── Billing ── */}
                <Route path="/billing" element={<Billing title="Facturation" />} />

                {/* ── Students Report ── */}
                <Route path="/active-students" element={<StudentsReport title="Rapport des élèves actifs" />} />
                <Route path="/admin/satisfaction" element={<AdminSatisfactionPage />} />
                <Route path="/satisfaction-survey" element={<SatisfactionSurveyPage />} />

                {/* ── Vehicles ── */}
                <Route path="/vehicles" element={<VehicleManagementPage selectedSchoolId={selectedSchoolId} />} />

                {/* ── Exams ── */}
                <Route path="/exams" element={<Exam title="Examens" />} />

                {/* ── Online site ── */}
                <Route path="/site-en-ligne" element={<Online title="Site en ligne" />} />

                {/* ── Placeholders ── */}
                <Route path="/messaging"     element={<PlaceholderPage title="Messagerie" />} />
                <Route path="/contact"       element={<PlaceholderPage title="Nous Contacter" />} />
                <Route path="/subscriptions" element={<PlaceholderPage title="Mes abonnements" />} />
                <Route path="/bills"         element={<PlaceholderPage title="Mes factures" />} />
                <Route path="/statistics"    element={<PlaceholderPage title="Statistiques" />} />
                <Route path="/settings"      element={<PlaceholderPage title="Paramètres" />} />
                <Route path="*"              element={<Navigate to="/dashboard/general" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </MonitorsProvider>
    </CandidatesProvider>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div>
      <div className="placeholder-title">{title}</div>
      <div className="placeholder-card">Cette page sera bientôt disponible.</div>
    </div>
  );
}
