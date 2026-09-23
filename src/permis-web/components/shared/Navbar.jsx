import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../assets/logo.webp";
import { useCart } from "../../context/CartContext";
import {
  FiShoppingBag,
  FiX,
  FiMenu,
  FiArrowRight,
  FiChevronDown,
} from "react-icons/fi";

/* ── Nav links config ───────────────────────────────── */
const NAV_LINKS = [
  { label: "Accueil",     to: "/"               },
  { label: "Nos agences", to: "/agency-page"    },
  { label: "Services",    to: "/services-page"  },
  { label: "Nos forfaits",to: "/packages-page"  },
  { label: "Le Code",     to: "/code-page"       },
  { label: "Vidéos",      to: "/video-page"     },
  { label: "CPF",         to: "/cpf-page"       },
  { label: "Contact",     to: "/contact-page"   },
];

function getDashboardPath(role) {
  switch (String(role ?? "").toLowerCase()) {
    case "admin":
    case "super-admin":
    case "super_admin":
      return "/dashboard/general";
    case "secretary":
      return "/secretary-dashboard";
    case "monitor":
      return "/monitor-dashboard";
    case "student":
      return "/student-dashboard";
    default:
      return "/";
  }
}

function getUserName(user) {
  return user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Mon compte";
}

function getProfileImage(user) {
  const media = user?.media ?? user?.profile_photo_url;
  const path = typeof media === "string" ? media : media?.path ?? media?.url ?? media?.storage_media?.path;
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${import.meta.env.VITE_API_URL}/storage/${String(path).replace(/^\/+/, "")}`;
}

const Navbar = () => {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);

  const { totalQty, openDrawer } = useCart();
  const user = useSelector((state) => state.auth.user);
  const userName = getUserName(user);
  const profileImage = getProfileImage(user);
  const dashboardPath = getDashboardPath(user?.role);

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ════════════════ DESKTOP HEADER ════════════════ */}
      <header className="nav-bar">
        <div className="nav-bar__inner">

          {/* Logo */}
          <NavLink to="/" className="nav-bar__logo" aria-label="Accueil">
            <img src={logo} alt="PassPermisFacile" />
          </NavLink>

          {/* Desktop nav links */}
          <nav className="nav-bar__links" aria-label="Navigation principale">
            {NAV_LINKS.map(({ label, to }) => label === "Nos forfaits" ? (
              <div className="nav-bar__packages" key={to + label}>
                <NavLink
                  to={`${to}?agency=creil`}
                  className={({ isActive }) => "nav-bar__link" + (isActive ? " nav-bar__link--active" : "")}
                >
                  {label}
                </NavLink>
                <button type="button" className="nav-bar__packages-toggle" onClick={() => setPackagesOpen((open) => !open)} aria-label="Choisir une agence" aria-expanded={packagesOpen}>
                  <FiChevronDown />
                </button>
                {packagesOpen && (
                  <div className="nav-bar__packages-menu">
                    <NavLink to={`${to}?agency=creil`} onClick={() => setPackagesOpen(false)}>Agence Creil</NavLink>
                    <NavLink to={`${to}?agency=toulouse`} onClick={() => setPackagesOpen(false)}>Agence Toulouse</NavLink>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={to + label}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  "nav-bar__link" + (isActive ? " nav-bar__link--active" : "")
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="nav-bar__actions">

            {/* Cart */}
            <button
              className="nav-bar__cart"
              onClick={openDrawer}
              aria-label="Ouvrir le panier"
            >
              <FiShoppingBag className="nav-bar__cart-icon" />
              {totalQty > 0 && (
                <span className="nav-bar__cart-badge" key={totalQty}>
                  {totalQty}
                </span>
              )}
            </button>

            {user ? (
              <NavLink to={dashboardPath} className="nav-bar__connected-account" aria-label={`Ouvrir l'espace de ${userName}`}>
                <span className="nav-bar__connected-avatar" aria-hidden="true">
                  {profileImage ? <img src={profileImage} alt="" /> : userName.slice(0, 1).toUpperCase()}
                </span>
                <span className="nav-bar__connected-name">{userName}</span>
              </NavLink>
            ) : (
              <NavLink to="/login-page" className="nav-bar__contact">
                Se connecter
                <FiArrowRight className="nav-bar__contact-arrow" />
              </NavLink>
            )}

            {/* Hamburger */}
            <button
              className="nav-bar__hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <span className="nav-bar__ham-line" />
              <span className="nav-bar__ham-line nav-bar__ham-line--mid" />
              <span className="nav-bar__ham-line" />
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════ MOBILE OVERLAY ════════════════ */}
      <div
        className={`nav-overlay${menuOpen ? " nav-overlay--show" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ════════════════ MOBILE PANEL ════════════════ */}
      <aside
        className={`nav-panel${menuOpen ? " nav-panel--open" : ""}`}
        aria-label="Menu mobile"
      >
        {/* Panel header */}
        <div className="nav-panel__header">
          <NavLink to="/" className="nav-panel__logo" onClick={closeMenu}>
            <img src={logo} alt="PassPermisFacile" />
          </NavLink>
          <button
            className="nav-panel__close"
            onClick={closeMenu}
            aria-label="Fermer le menu"
          >
            <FiX />
          </button>
        </div>

        {/* Panel links */}
        <nav className="nav-panel__links" aria-label="Navigation mobile">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to + label}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                "nav-panel__link" + (isActive ? " nav-panel__link--active" : "")
              }
              onClick={closeMenu}
            >
              {label}
              <FiArrowRight className="nav-panel__link-arrow" />
            </NavLink>
          ))}
        </nav>

        {/* Panel footer */}
        <div className="nav-panel__footer">
          <NavLink
            to={user ? dashboardPath : "/login-page"}
            className="nav-panel__cta"
            onClick={closeMenu}
          >
            {user ? userName : "Se connecter"}
            <FiArrowRight />
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
