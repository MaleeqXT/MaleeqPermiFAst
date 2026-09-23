import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../../App.css";
import logo from "../../../assets/logo.webp";
import Sidebar from "../../../Components/shared/Sidebar.jsx";
import Dashboard from "../../../Components/dashboard/Dashboard.jsx";
import { CandidatesProvider } from "../../../Components/candidates/CandidatesContext.jsx";
import { MonitorsProvider } from "../../../Components/monitors/MonitorsContext.jsx";
import Sessions from "../../../sessions/Sessions.jsx";
import Cancellations from "../../../sessions/Cancellations.jsx";
import Propositions from "../../../Components/propositions/Propositions.jsx";
import Secretaries from "../../../Components/secretaries/Secretaries.jsx";
import SecretaryForm from "../../../Components/secretaries/SecretaryForm.jsx";
import SecretaryInfo from "../../../Components/secretaries/SecretaryInfo.jsx";
import SecretaryInfo1 from "../../../Components/secretaries/SecretaryInfo1.jsx";
import Orders from "../../../Orders/Orders.jsx";
import OrdersInfo from "../../../Orders/OrdersInfo.jsx";
import Baskets from "../../../Orders/Baskets.jsx";
import BasketsInfo from "../../../Orders/BasketsInfo.jsx";
import Offers from "../../../Orders/Offers.jsx";
import OffersInfo from "../../../Orders/OffersInfo.jsx";
import OffersForm from "../../../Orders/OffersForm.jsx";
import Invoice from "../../../Orders/Invoice.jsx";
import Exam from "../../../Components/exams/Exam.jsx";
import VehicleManagementPage from "../../../vehicles/VehicleManagementPage.jsx";
import Billing from "../../../Components/billing/Billing.jsx";
import CpfForm from "../../../Components/cpf form/CpfForm.jsx";
import StudentsReport from "../../../Components/studentsreport/StudentsReport.jsx";
import ActiveAgency from "../../../Components/activeagency/ActiveAgency.jsx";
import Monitors from "../../../Components/monitors/Monitors.jsx";
import AddMonitor from "../../../Components/monitors/AddMonitor.jsx";
import Candidates from "../../../Components/candidates/Candidates.jsx";
import CandidateForm from "../../../Components/candidates/CandidateForm.jsx";
import Info from "../../../Components/candidates/Info.jsx";
import MonitorsInfo from "../../../Components/monitors/MonitorsInfo.jsx";
import Administrations from "../../../Components/administrations/Administrations.jsx";
import AdministratorInfo from "../../../Components/administrations/AdministratorInfo.jsx";
import AdministratorInfo1 from "../../../Components/administrations/AdministratorInfo1.jsx";
import AddAdministrator from "../../../Components/administrations/AddAdministrator.jsx";
import Skills from "../../../Preferences/Skills.jsx";
import Zones from "../../../Preferences/Zones.jsx";
import Online from "../../../Components/Online/Online.jsx";
import AdminChatPage from "../../../Components/chat/AdminChatPage.jsx";
import { logoutUser } from "../../../redux/reducers/authReducer.jsx";
import { fetchSchools, selectSchool } from "../../../redux/reducers/schoolReducer.jsx";

const DASHBOARD_PATH = "/active-agency";

const HIDDEN_PATHS = ["/administrations", "/secretaries"];
const SECRETARY_DASHBOARD_SESSION_KEY = "permiFastSecretaryDashboardActive";

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const PAGE_TITLES = {
  "/dashboard": "Tableau de bord",
  "/dashboard/general": "Tableau de bord",
  "/dashboard/current": "Tableau de bord",
  "/sessions": "Sessions",
  "/sessions/cancellations": "Annulations",
  "/sessions/propositions": "Propositions",
  "/orders": "Commandes",
  "/orders/baskets": "Paniers",
  "/orders/offers": "Offres",
  "/vehicles": "Gestion des véhicules",
  "/exams": "Examens",
  "/billing": "Facturation",
  "/form-cpf": "Form CPF",
  "/active-students": "Rapport des ?l?ves actifs",
  "/active-agency": "Tableau de bord agence active",
  "/secretaries": "Secr?taires",
  "/secretaryform": "Nouvelle secr?taire",
  "/secretaryinfo": "Fiche secr?taire",
  "/secretaryinfo1": "Fiche secr?taire",
  "/administrations": "Administrations",
  "/administratorinfo": "D?D?tail administrateur",
  "/administratorinfo1": "D?D?tail administrateur",
  "/addadministrator": "Nouvel administrateur",
  "/monitors": "Moniteurs",
  "/candidates": "Candidats",
  "/admin/messages": "Messages",
  "/skills": "Comp?tences",
  "/locations": "Localisations",
  "/site-en-ligne": "Site en ligne",
};

export default function SecretaryDashboardPage({ initialPath = DASHBOARD_PATH }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { list: schools, selected: selectedSchool } = useSelector((state) => state.schools);
  const [activePath, setActivePath] = useState(initialPath);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  // ── School selection state (mirrors App.jsx behaviour) ──────────────────
  const [schoolSelected, setSchoolSelected] = useState(false);

  const handleSchoolSelect = useCallback((id) => {
    setSchoolSelected(true);
  }, []);

  const handleSelectSchool = useCallback(async (id) => {
    await dispatch(selectSchool(id));
    setSchoolSelected(true);
    setAccountMenuOpen(false);
  }, [dispatch]);

  useEffect(() => {
    // Load the schools available in the secretary's zone for the header menu
    // and the active-agency page, just like the main dashboard.
    dispatch(fetchSchools());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSchool?.id) {
      setSchoolSelected(true);
    }
  }, [selectedSchool]);

  useEffect(() => {
    setActivePath(initialPath);
  }, [initialPath]);

  useEffect(() => {
    if (location.pathname !== activePath) {
      setActivePath(location.pathname);
    }
  }, [location.pathname, activePath]);

  const pageTitle = PAGE_TITLES[activePath] ?? PAGE_TITLES[DASHBOARD_PATH];

  const handleNavigate = useCallback((path) => {
    setActivePath(path);
    navigate(path);
    setSidebarOpen(false);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // The reducer still clears the local session when the server session
      // has already expired.
    }
    window.sessionStorage.removeItem(SECRETARY_DASHBOARD_SESSION_KEY);
    setAccountMenuOpen(false);
    navigate("/login-page", { replace: true });
  }, [dispatch, navigate]);

  useEffect(() => {
    window.sessionStorage.setItem(SECRETARY_DASHBOARD_SESSION_KEY, "true");
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const content = useMemo(() => {
    switch (activePath) {
      case "/dashboard":
      case "/dashboard/general":
      case "/dashboard/current":
        return (
          <Dashboard
            tab={activePath === "/dashboard/current" ? "current" : "general"}
            schools={schools}
            selectedSchoolId={selectedSchool?.id ?? null}
            onSelectSchool={handleSelectSchool}
            onNavigate={handleNavigate}
          />
        );
      case "/sessions":
        return <Sessions title="Sessions" />;
      case "/sessions/cancellations":
        return <Cancellations title="Annulations" />;
      case "/sessions/propositions":
        return <Propositions />;
      case "/orders":
        return <Orders title="Commandes" />;
      case "/orders/info":
        return <OrdersInfo onBack={() => handleNavigate("/orders")} />;
      case "/orders/baskets":
        return <Baskets />;
      case "/Basketsinfo":
        return <BasketsInfo onBack={() => handleNavigate("/orders/baskets")} />;
      case "/orders/offers":
        return <Offers />;
      case "/offersinfo":
        return <OffersInfo onBack={() => handleNavigate("/orders/offers")} />;
      case "/offersform":
        return <OffersForm onBack={() => handleNavigate("/orders/offers")} />;
      case "/invoice":
        return <Invoice />;
      case "/vehicles":
        return <VehicleManagementPage />;
      case "/exams":
        return <Exam title="Examens" />;
      case "/billing":
        return <Billing title="Facturation" />;
      case "/form-cpf":
        return <CpfForm title="Form CPF" />;
      case "/active-students":
        return <StudentsReport title="Rapport des élèves actifs" />;
      case "/active-agency":
        // Pass onSchoolSelect so selecting a school unlocks the sidebar
        return <ActiveAgency onSchoolSelect={handleSchoolSelect} />;
      case "/monitors":
        return <Monitors selectedSchoolId={selectedSchool?.id} isSecretaryDashboard />;
      case "/add-monitor":
        return <AddMonitor onBack={() => handleNavigate("/monitors")} />;
      case "/candidates":
        return <Candidates isSecretaryDashboard />;
      case "/candidateform":
        return <CandidateForm onBack={() => handleNavigate("/candidates")} />;
      case "/info":
        return <Info onBack={() => handleNavigate("/candidates")} />;
      case "/monitors-info":
        return <MonitorsInfo onBack={() => handleNavigate("/monitors")} />;
      case "/secretaries":
        return <Secretaries />;
      case "/secretaryform":
        return <SecretaryForm onBack={() => handleNavigate("/secretaries")} />;
      case "/secretaryinfo":
        return <SecretaryInfo />;
      case "/secretaryinfo1":
        return <SecretaryInfo1 />;
      case "/administrations":
        return <Administrations title="Administrations" />;
      case "/administratorinfo":
        return <AdministratorInfo onBack={() => handleNavigate("/administrations")} />;
      case "/administratorinfo1":
        return <AdministratorInfo1 onBack={() => handleNavigate("/administrations")} />;
      case "/addadministrator":
        return <AddAdministrator onBack={() => handleNavigate("/administrations")} />;
      case "/admin/messages":
        return <AdminChatPage />;
      case "/skills":
        return <Skills title="Compétences" />;
      case "/locations":
        return <Zones title="Localisations" />;
      case "/site-en-ligne":
        return <Online title="Site en ligne" />;
      default:
        return <ActiveAgency onSchoolSelect={handleSchoolSelect} />;
    }
  }, [activePath, handleNavigate, handleSchoolSelect, handleSelectSchool, schools, selectedSchool]);
  const activeSidebarPath = activePath.startsWith("/dashboard")
  ? "/dashboard"
  : activePath === "/secretary-dashboard"
    ? "/active-agency"
    : activePath;

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
            hiddenPaths={HIDDEN_PATHS}
          />

          <div className="right-panel">
            <div className="top-header">
              <div className="header-mobile-logo">
                <img className="header-mobile-logo-img" src={logo} alt="PermiFast" />
              </div>

              <span className="header-page-title">{pageTitle}</span>

              <div className="secretary-header-actions">
                <div className={`header-account${accountMenuOpen ? " is-open" : ""}`} ref={accountMenuRef}>
                  <button
                    type="button"
                    className="header-user"
                    onClick={() => setAccountMenuOpen((open) => !open)}
                    onMouseEnter={() => setAccountMenuOpen(true)}
                    aria-haspopup="menu"
                    aria-expanded={accountMenuOpen}
                  >
                  <div className="header-avatar">
                    {user?.media || user?.profile_photo_url ? (
                      <img
                        className="header-avatar-image"
                        src={user.media
                          ? `${import.meta.env.VITE_API_URL}/storage/${user.media}`
                          : user.profile_photo_url}
                        alt=""
                      />
                    ) : (
                      `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}` || "SR"
                    )}
                  </div>
                  <span className="header-username">
                    {user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.name : "..."}
                  </span>
                  <span className="header-chevron">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </span>
                </button>

                <div className="header-dropdown" role="menu">
                  {schools.map((school) => (
                    <button
                      key={school.id}
                      type="button"
                      className={`header-dropdown-item${selectedSchool?.id === school.id ? " active" : ""}`}
                      onClick={() => handleSelectSchool(school.id)}
                    >
                      <span>{school.name}</span>
                      {selectedSchool?.id === school.id && <span className="header-dropdown-check">✓</span>}
                    </button>
                  ))}
                  <div className="header-dropdown-divider" />
                  <button
                    type="button"
                    className="header-dropdown-item header-dropdown-item--logout"
                    onClick={handleLogout}
                  >
                    <span className="header-dropdown-icon">↪</span>
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
              </div>

              <button
                type="button"
                className="header-hamburger"
                onClick={() => setSidebarOpen(true)}
                title="Ouvrir le menu"
                aria-label="Open navigation menu"
              >
                <HamburgerIcon />
              </button>
            </div>

            <main className="main-content">
              {content}
            </main>
          </div>
        </div>
      </MonitorsProvider>
    </CandidatesProvider>
  );
}
