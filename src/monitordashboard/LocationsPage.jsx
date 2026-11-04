import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./LocationsPage.css";
import {
  fetchMonitorLieux,
  storeMonitorLieux,
  selectMonitorLieuxZones,
  selectMonitorLieuxLoading,
  selectMonitorLieuxSaving,
} from "../redux/reducers/monitorLieuxSlice.jsx";
import {
  fetchMonitorProfile,
  selectMonitorProfile,
  selectMonitorProfileLoading,
} from "../redux/reducers/monitorProfileSlice.jsx";
import {
  fetchZones,
  fetchPlacesByZone,
  selectZones,
  selectZonesStatus,
  selectPlacesForZone,
  selectPlacesStatusForZone,
} from "../redux/reducers/locationSlice.jsx";

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// ─── ZoneSection inside the drawer ───────────────────────────────────────────

function ZoneSection({ zone, selectedIds, onToggle }) {
  const [open, setOpen] = useState(true);
  const lieux        = zone.lieux ?? [];
  const checkedCount = lieux.filter((l) => selectedIds.includes(String(l.id))).length;

  return (
    <div className="mp-zone-section">
      <button
        type="button"
        className="mp-zone-section-header"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mp-zone-section-name">{zone.name}</span>
        {checkedCount > 0 && (
          <span className="mp-zone-section-badge">{checkedCount}</span>
        )}
        <span className={`mp-zone-section-chev${open ? " mp-zone-section-chev--open" : ""}`}>
          <IconChevronDown />
        </span>
      </button>

      {open && (
        <div className="mp-zone-section-body">
          {lieux.length === 0 ? (
            <div className="mp-place-empty">Aucun lieu disponible</div>
          ) : (
            lieux.map((lieu) => {
              const pid     = String(lieu.id);
              const checked = selectedIds.includes(pid);
              return (
                <button
                  key={pid}
                  type="button"
                  className={`mp-place-row${checked ? " mp-place-row--checked" : ""}`}
                  onClick={() => onToggle(pid)}
                >
                  <div className={`mp-place-check-box${checked ? " mp-place-check-box--on" : ""}`}>
                    {checked && <IconCheck />}
                  </div>
                  <span className="mp-place-name">{lieu.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Drawer ──────────────────────────────────────────────────────────────────

function PlaceSelectionDrawer({ zones, loadingZones, selectedIds, onToggle, onClose, onSave, saving }) {
  const dispatch = useDispatch();
  const canSave = selectedIds.length > 0 && !saving;
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const selectedZone = zones.find((zone) => String(zone.id) === selectedZoneId) ?? null;
  const places = useSelector(selectPlacesForZone(selectedZoneId));
  const placesStatus = useSelector(selectPlacesStatusForZone(selectedZoneId));
  const placesLoading = Boolean(selectedZoneId) && placesStatus === "loading";

  useEffect(() => {
    if (selectedZoneId) dispatch(fetchPlacesByZone(selectedZoneId));
  }, [dispatch, selectedZoneId]);

  return (
    <>
      <div className="mp-overlay" onClick={onClose} />
      <aside className="mp-drawer">
        <div className="mp-drawer-header">
          <button className="mp-drawer-close" type="button" onClick={onClose}>Fermer</button>
          <span className="mp-drawer-title">Ajouter un lieu</span>
          <span style={{ width: 48 }} />
        </div>

        <div className="mp-drawer-body">
          <label className="mp-area-picker">
            <span>Select an area</span>
            <select
              value={selectedZoneId}
              onChange={(event) => setSelectedZoneId(event.target.value)}
              disabled={loadingZones || saving}
            >
              <option value="">Select an area</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </label>
          <div className="mp-zone-summary">
            <div className="mp-zone-summary-label">Sélection des lieux</div>
            <div className="mp-zone-summary-note">
              Sélectionnez un ou plusieurs lieux. Les lieux déjà ajoutés sont pré-cochés.
            </div>
          </div>

          <div className="mp-places-label">Zones et lieux</div>

          {loadingZones || placesLoading ? (
            <div className="mp-place-loading" style={{ padding: "24px 0", textAlign: "center" }}>
              Chargement des lieux...
            </div>
          ) : zones.length === 0 ? (
            <div className="mp-place-empty" style={{ padding: "24px 0", textAlign: "center" }}>
              Aucune zone disponible
            </div>
          ) : (
            <div className="mp-zones-sections">
              {selectedZone ? (
                <ZoneSection
                  key={selectedZone.id}
                  zone={{ ...selectedZone, lieux: places }}
                  selectedIds={selectedIds}
                  onToggle={onToggle}
                />
              ) : (
                <div className="mp-place-empty">Select an area to view meeting places.</div>
              )}
            </div>
          )}
        </div>

        <div className="mp-drawer-footer">
          <button
            type="button"
            className={`mp-save-btn${canSave ? " mp-save-btn--active" : ""}`}
            onClick={onSave}
            disabled={!canSave}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MeetingPlacesPage({ onBack, monitorId = null }) {
  const dispatch = useDispatch();

  // All available zones+lieux (for the drawer)
  const allZones    = useSelector(selectMonitorLieuxZones);
  const loadingAll  = useSelector(selectMonitorLieuxLoading);
  const saving      = useSelector(selectMonitorLieuxSaving);
  const availableZones = useSelector(selectZones);
  const availableZonesStatus = useSelector(selectZonesStatus);

  // Monitor profile — contains monitor.lieux (his selected places)
  const profile        = useSelector(selectMonitorProfile);
  const loadingProfile = useSelector(selectMonitorProfileLoading);

  // Derive selected place ids from profile.monitor.lieux
  const savedPlaceIds = useMemo(() => {
    const lieux = profile?.monitor?.lieux ?? [];
    return lieux.map((l) => String(l.id));
  }, [profile]);

  // Drawer state
  const [showDrawer,  setShowDrawer]  = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message,     setMessage]     = useState("");
  const [error,       setError]       = useState("");

  // ── Fetch both on mount ──────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchMonitorLieux(monitorId));    // all available zones+lieux
    dispatch(fetchMonitorProfile(monitorId));  // monitor's selected lieux
    dispatch(fetchZones());           // master areas from /locations
  }, [dispatch, monitorId]);

  // ── Pre-fill drawer with monitor's current selection when it opens ───────
  useEffect(() => {
    if (showDrawer) setSelectedIds([...savedPlaceIds]);
  }, [showDrawer, savedPlaceIds]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleToggle = (placeId) => {
    setSelectedIds((cur) =>
      cur.includes(placeId)
        ? cur.filter((id) => id !== placeId)
        : [...cur, placeId]
    );
  };

  const handleSave = async () => {
    if (!selectedIds.length) return;
    setError("");
    setMessage("");
    try {
      await dispatch(storeMonitorLieux({ lieux: selectedIds, monitorId })).unwrap();
      // Refresh both sources so the saved places render immediately below.
      await Promise.all([
        dispatch(fetchMonitorProfile(monitorId)).unwrap(),
        dispatch(fetchMonitorLieux(monitorId)).unwrap(),
      ]);
      setShowDrawer(false);
      setMessage("Les lieux de rendez-vous ont été enregistrés.");
    } catch (err) {
      setError(err?.message || "Impossible d'enregistrer les lieux.");
    }
  };

  // ── Build display: saved lieux grouped by zone name ──────────────────────
  // Cross-reference allZones (which has full zone+lieu details) with savedPlaceIds
  const savedByZone = useMemo(() => {
    const map = {};
    allZones.forEach((zone) => {
      const saved = (zone.lieux ?? []).filter((l) => savedPlaceIds.includes(String(l.id)));
      if (saved.length > 0) map[zone.name] = saved;
    });
    return map;
  }, [allZones, savedPlaceIds]);

  const hasSaved = Object.keys(savedByZone).length > 0;
  const isLoading = loadingAll || loadingProfile;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mp-page">
      <header className="mp-header">
        <button className="mp-back-btn" type="button" onClick={onBack} aria-label="Retour">
          <IconArrowLeft />
        </button>
        <h1 className="mp-title">Lieux de rendez-vous</h1>
      </header>

      <div className="mp-content">

        {/* ── Selected lieux on main page ── */}
        {isLoading && !hasSaved ? (
          <div className="mp-zone-card mp-zone-card--summary">
            <div className="mp-zone-card-bar" />
            <div className="mp-zone-card-body">
              <div className="mp-zone-name">Chargement...</div>
            </div>
          </div>
        ) : !hasSaved ? (
          <div className="mp-zone-card mp-zone-card--summary">
            <div className="mp-zone-card-bar" />
            <div className="mp-zone-card-body">
              <div className="mp-zone-name">Aucun lieu enregistré</div>
              <p className="mp-zone-empty-hint">
                Cliquez sur « + Ajouter un lieu » pour sélectionner vos lieux de rendez-vous.
              </p>
            </div>
          </div>
        ) : (
          Object.entries(savedByZone).map(([zoneName, lieux]) => (
            <div key={zoneName} className="mp-zone-card">
              <div className="mp-zone-card-bar" />
              <div className="mp-zone-card-body">
                <div className="mp-zone-name">{zoneName}</div>
                <ul className="mp-zone-places">
                  {lieux.map((lieu) => (
                    <li key={lieu.id} className="mp-zone-place">
                      <span className="mp-zone-place-dot">·</span>
                      <span>{lieu.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}

        {message && <div className="mp-message mp-message--success">{message}</div>}
        {error   && <div className="mp-message mp-message--error">{error}</div>}

        <div className="mp-add-wrap">
          <button
            type="button"
            className="mp-add-btn"
            onClick={() => { setMessage(""); setError(""); setShowDrawer(true); }}
          >
            + Ajouter un lieu
          </button>
        </div>
      </div>

      {showDrawer && (
        <PlaceSelectionDrawer
          zones={availableZones}
          loadingZones={availableZonesStatus === "loading"}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onClose={() => setShowDrawer(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
