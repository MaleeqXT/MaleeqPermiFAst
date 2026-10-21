import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./CandidateProfileDrawer.css";
import { fetchStudentStats, selectStudentStatsById, selectStudentStatsLoadingById } from "../redux/reducers/studentStatsSlice.jsx";
import http from "../helpers/http";

const IconPhone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12a19.8 19.8 0 0 1-3.07-8.63A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>;
const IconDots = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>;
const IconChevR = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>;

function getInitials(name = "") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function StatBox({ num, label, accent }) {
  return (
    <div className="cpd-stat-box" style={{ borderTopColor: accent }}>
      <div className="cpd-stat-num" style={{ color: accent }}>{num}</div>
      <div className="cpd-stat-label">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="cpd-info-row">
      <span className="cpd-info-label">{label}</span>
      <span className="cpd-info-value">{value}</span>
    </div>
  );
}

function formatMinutes(minutes) {
  const total = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(total / 60);
  const remainder = total % 60;

  if (!remainder) return `${hours} h`;
  if (!hours) return `${remainder} min`;
  return `${hours} h ${remainder.toString().padStart(2, "0")}`;
}

function HourCounter({ label, minutes, tone = "default", loading }) {
  return (
    <div className={`cpd-hour-counter cpd-hour-counter--${tone}`}>
      <span className="cpd-hour-counter-label">{label}</span>
      <strong className="cpd-hour-counter-value">{loading ? "…" : formatMinutes(minutes)}</strong>
    </div>
  );
}

function formatExamDate(value) {
  if (!value) return "Non renseignée";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Non renseignée";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function CandidateProfileDrawer({
  candidate,
  onClose,
  onPropose,
  onOpenCompetence,
  onOpenAllSessions,
  onOpenPedagogicalComments,
  monitorId,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileHours, setProfileHours] = useState(null);
  const [profileHoursLoading, setProfileHoursLoading] = useState(false);
  const [profileHoursError, setProfileHoursError] = useState("");
  const [profileExam, setProfileExam] = useState(null);
  const [profileExamLoading, setProfileExamLoading] = useState(false);
  const [profileExamError, setProfileExamError] = useState("");
  const [examReadiness, setExamReadiness] = useState(null);
  const [examReadinessLoading, setExamReadinessLoading] = useState(false);
  const [examReadinessSaving, setExamReadinessSaving] = useState(false);
  const [examReadinessError, setExamReadinessError] = useState("");
  const [examReadinessSuccess, setExamReadinessSuccess] = useState("");
  const [readinessForm, setReadinessForm] = useState({
    is_ready: false,
    additional_hours: "",
    practice_frequency: "",
    observation: "",
  });
  const studentId = candidate?.id ?? candidate?.studentId ?? candidate?.user?.id ?? null;
  const studentStats = useSelector((state) => selectStudentStatsById(state, studentId));
  const studentStatsLoading = useSelector((state) => selectStudentStatsLoadingById(state, studentId));

  useEffect(() => {
    if (!studentId) return;
    dispatch(fetchStudentStats(studentId));
  }, [dispatch, studentId]);

  useEffect(() => {
    let active = true;

    if (!studentId) {
      return () => { active = false; };
    }

    // Start after the effect has committed. This avoids a cascading render
    // while keeping the data tied to the currently opened student fiche.
    Promise.resolve()
      .then(() => {
        if (!active) return null;
        setProfileHoursLoading(true);
        setProfileHoursError("");
        return http.get(`/monitor/formation/${studentId}/profile-hours`, {
          params: monitorId ? { monitor_id: monitorId } : undefined,
        });
      })
      .then((response) => {
        if (!response) return;
        if (active) setProfileHours(response.data?.data ?? null);
      })
      .catch((error) => {
        if (active) {
          setProfileHours(null);
          setProfileHoursError(error.response?.data?.message || "Impossible de charger les heures de formation.");
        }
      })
      .finally(() => {
        if (active) setProfileHoursLoading(false);
      });

    return () => { active = false; };
  }, [studentId, monitorId]);

  useEffect(() => {
    let active = true;

    if (!studentId) {
      return () => { active = false; };
    }

    Promise.resolve()
      .then(() => {
        if (!active) return null;
        setExamReadinessLoading(true);
        setExamReadinessError("");
        setExamReadinessSuccess("");
        return http.get(`/monitor/formation/${studentId}/exam-readiness`, {
          params: monitorId ? { monitor_id: monitorId } : undefined,
        });
      })
      .then((response) => {
        if (!response || !active) return;
        const payload = response.data?.data ?? null;
        const preparation = payload?.preparation ?? {};
        setExamReadiness(payload);
        setReadinessForm({
          is_ready: Boolean(preparation.is_ready),
          additional_hours: preparation.additional_hours ?? "",
          practice_frequency: preparation.practice_frequency ?? "",
          observation: preparation.observation ?? "",
        });
      })
      .catch((error) => {
        if (active) {
          setExamReadiness(null);
          setExamReadinessError(error.response?.data?.message || "Impossible de charger la préparation à l’examen.");
        }
      })
      .finally(() => {
        if (active) setExamReadinessLoading(false);
      });

    return () => { active = false; };
  }, [studentId, monitorId]);

  useEffect(() => {
    let active = true;

    if (!studentId) {
      return () => { active = false; };
    }

    Promise.resolve()
      .then(() => {
        if (!active) return null;
        setProfileExamLoading(true);
        setProfileExamError("");
        return http.get(`/monitor/formation/${studentId}/profile-exam`, {
          params: monitorId ? { monitor_id: monitorId } : undefined,
        });
      })
      .then((response) => {
        if (response && active) setProfileExam(response.data?.data ?? null);
      })
      .catch((error) => {
        if (active) {
          setProfileExam(null);
          setProfileExamError(error.response?.data?.message || "Impossible de charger les informations d’examen.");
        }
      })
      .finally(() => {
        if (active) setProfileExamLoading(false);
      });

    return () => { active = false; };
  }, [studentId, monitorId]);

  const reservationsStats = studentStats?.reservations ?? {};
  const balanceStats = studentStats?.balance ?? {};
  const competenceStats = studentStats?.competences ?? {};

  const data = {
    name: candidate?.name ?? "Keita El hadji",
    email: candidate?.email ?? "ekeita934@gmail.com",
    phone: candidate?.phone ?? candidate?.tel ?? candidate?.telephone ?? "",
    neph: candidate?.neph ?? "220331300974",
    progress: Number(competenceStats.done ?? candidate?.progress ?? 0),
    seancePasse: Number(reservationsStats.passed ?? candidate?.seancePasse ?? 0),
    seanceAvenir: Number(reservationsStats.upcoming ?? candidate?.seanceAvenir ?? 0),
    balanceUtilise: Number(balanceStats.used ?? candidate?.balanceUtilise ?? 0),
    balanceReste: Number(balanceStats.rest ?? candidate?.balanceReste ?? 0),
  };

  const menuOptions = [
    { label: "Toutes les séances", action: () => { setMenuOpen(false); onOpenAllSessions?.(data); } },
    { label: "Commentaires pédagogiques", action: () => { setMenuOpen(false); onOpenPedagogicalComments?.(data); } },
    { label: "Compétences", action: () => { setMenuOpen(false); onOpenCompetence?.(data); } },
    { label: "Proposer une séance", action: () => { setMenuOpen(false); onPropose?.(data); } },
  ];

  const initials = getInitials(data.name);
  const segments = 14;
  const filledCount = Math.round((data.progress / 100) * segments);
  const profileStudentId = candidate?.student?.id ?? candidate?.student_id ?? studentId;
  const hours = profileHours?.hours ?? {};
  const estimatedHours = profileHours?.initial_evaluation?.estimated_hours;
  const transmission = profileExam?.transmission ?? {};
  const exam = profileExam?.exam ?? {};
  const transmissionType = transmission.type === "manual" || transmission.type === "automatic"
    ? transmission.type
    : "neutral";
  const examTone = exam.tone === "light" || exam.tone === "dark" ? exam.tone : "neutral";
  const readinessExam = examReadiness?.exam ?? {};
  const isMoreHours = Number(readinessForm.additional_hours) > 5;

  const updateReadinessForm = (field, value) => {
    setReadinessForm((current) => ({ ...current, [field]: value }));
    setExamReadinessSuccess("");
  };

  const saveExamReadiness = async (event) => {
    event.preventDefault();
    if (!studentId || examReadinessSaving) return;

    const parsedHours = readinessForm.additional_hours === "" ? null : Number(readinessForm.additional_hours);
    if (parsedHours !== null && (!Number.isInteger(parsedHours) || parsedHours < 1 || parsedHours > 100)) {
      setExamReadinessError("Indiquez un nombre d’heures compris entre 1 et 100.");
      return;
    }

    setExamReadinessSaving(true);
    setExamReadinessError("");
    setExamReadinessSuccess("");

    try {
      const response = await http.put(`/monitor/formation/${studentId}/exam-readiness`, {
        is_ready: readinessForm.is_ready,
        additional_hours: parsedHours,
        practice_frequency: readinessForm.practice_frequency.trim() || null,
        observation: readinessForm.observation.trim() || null,
      }, {
        params: monitorId ? { monitor_id: monitorId } : undefined,
      });
      const payload = response.data?.data ?? null;
      const preparation = payload?.preparation ?? {};
      setExamReadiness(payload);
      setReadinessForm({
        is_ready: Boolean(preparation.is_ready),
        additional_hours: preparation.additional_hours ?? "",
        practice_frequency: preparation.practice_frequency ?? "",
        observation: preparation.observation ?? "",
      });
      setExamReadinessSuccess(payload?.notification_created
        ? "Préparation enregistrée et Secrétariat informé."
        : "Préparation à l’examen enregistrée.");
    } catch (error) {
      setExamReadinessError(error.response?.data?.message || "Impossible d’enregistrer la préparation à l’examen.");
    } finally {
      setExamReadinessSaving(false);
    }
  };

  const openFullProfile = () => {
    if (!profileStudentId) return;
    onClose?.();
    navigate(`/candidate-info/${profileStudentId}`, {
      state: { candidate },
    });
  };

  return (
    <>
      <div className="cpd-overlay" onClick={onClose} />

      <aside className={`cpd-drawer cpd-drawer--${transmissionType} cpd-drawer--attempt-${examTone}`}>
        <header className="cpd-header">
          <button className="cpd-header-link" onClick={onClose}>Fermer</button>
          <h2 className="cpd-header-title">Détails du candidat</h2>
          <div className="cpd-header-menu-wrapper">
            <button
              className="cpd-header-menu"
              aria-label="Plus d’options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <IconDots />
            </button>
            {menuOpen && (
              <div className="cpd-header-menu-dropdown">
                {menuOptions.map((option) => (
                  <button
                    key={option.label}
                    className="cpd-header-menu-item"
                    type="button"
                    onClick={option.action}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="cpd-body">
          <div className="cpd-avatar-card">
            <div className="cpd-avatar">{initials}</div>
            <div className="cpd-avatar-info">
              <div className="cpd-name">{data.name}</div>
              <div className="cpd-email">{data.email}</div>
            </div>
            <button className="cpd-phone-btn" aria-label="Appeler le candidat">
              <IconPhone />
            </button>
          </div>

          <section className="cpd-card cpd-permit-code-card" aria-live="polite" aria-busy={profileExamLoading}>
            <div className="cpd-section-title">Permis de conduire</div>
            {profileExamError ? (
              <p className="cpd-permit-code-fallback">Informations d’examen non disponibles.</p>
            ) : (
              <div className="cpd-permit-code-grid">
                <div className="cpd-permit-code-item">
                  <span>Type de boîte</span>
                  <strong className="cpd-permit-badge cpd-permit-badge--transmission">
                    {profileExamLoading ? "Chargement…" : (transmission.label || "Type de boîte non renseigné")}
                  </strong>
                </div>
                <div className="cpd-permit-code-item">
                  <span>Passage permis</span>
                  <strong className="cpd-permit-badge cpd-permit-badge--attempt">
                    {profileExamLoading ? "Chargement…" : (exam.presentation_label || "Présentation non renseignée")}
                  </strong>
                </div>
              </div>
            )}
          </section>

          <div className="cpd-card">
            <div className="cpd-progress-header">
              <span className="cpd-progress-title">Progression des compétences</span>
              <span className="cpd-progress-pct">{studentStatsLoading ? "..." : `${data.progress}%`}</span>
            </div>
            <div className="cpd-progress-bar">
              {Array.from({ length: segments }, (_, index) => (
                <div key={index} className={`cpd-progress-seg${index < filledCount ? " cpd-progress-seg--filled" : ""}`} />
              ))}
            </div>
            <div className="cpd-stats-grid">
              <StatBox num={data.seancePasse} label="Dernière séance" accent="#f59e0b" />
              <StatBox num={data.seanceAvenir} label="Séance à venir" accent="#3b82f6" />
              <StatBox num={data.balanceUtilise} label="Solde utilisé" accent="#f97316" />
              <StatBox num={data.balanceReste} label="Solde restant" accent="#22c55e" />
            </div>
          </div>

          <div className="cpd-card cpd-hours-card">
            <div className="cpd-section-title">Formation et heures de conduite</div>
            <div className="cpd-evaluation-estimate">
              <span>Évaluation de départ</span>
              <strong>
                {profileHoursLoading ? "…" : (estimatedHours === null || estimatedHours === undefined
                  ? "Non renseigné"
                  : `Heures estimées : ${estimatedHours} h`)}
              </strong>
            </div>
            {profileHoursError ? (
              <p className="cpd-hours-error" role="alert">{profileHoursError}</p>
            ) : (
              <>
                <div className="cpd-hours-grid">
                  <HourCounter label="Heures effectuées" minutes={hours.completed_minutes} loading={profileHoursLoading} tone="completed" />
                  <HourCounter label="Heures planifiées" minutes={hours.planned_minutes} loading={profileHoursLoading} tone="planned" />
                  <HourCounter label="Heures restant à poser" minutes={hours.remaining_minutes} loading={profileHoursLoading} tone="remaining" />
                  <HourCounter label="Heures d'absence" minutes={hours.absence_minutes} loading={profileHoursLoading} tone="absence" />
                </div>
                <div className="cpd-consumed-hours">
                  <span>Heures consommées</span>
                  <strong>{profileHoursLoading ? "…" : formatMinutes(hours.consumed_minutes)}</strong>
                </div>
              </>
            )}
          </div>

          <section className="cpd-card cpd-exam-readiness-card" aria-busy={examReadinessLoading}>
            <div className="cpd-exam-readiness-heading">
              <div>
                <div className="cpd-section-title">Préparation à l’examen</div>
                <p>Recommandation du moniteur et suivi du passage du permis.</p>
              </div>
              <span className={`cpd-exam-status cpd-exam-status--${readinessExam.status || "waiting"}`}>
                {examReadinessLoading ? "Chargement…" : (readinessExam.status_label || "En attente")}
              </span>
            </div>

            {examReadinessError && <p className="cpd-exam-readiness-error" role="alert">{examReadinessError}</p>}

            {!examReadinessError && (
              <>
                <div className="cpd-exam-summary-grid">
                  <div>
                    <span>Date d’examen</span>
                    <strong>{examReadinessLoading ? "…" : formatExamDate(readinessExam.date)}</strong>
                  </div>
                  <div>
                    <span>Résultat</span>
                    <strong>{examReadinessLoading ? "…" : (readinessExam.result_label || "En attente")}</strong>
                  </div>
                </div>

                <form className="cpd-exam-readiness-form" onSubmit={saveExamReadiness}>
                  <label className="cpd-ready-toggle">
                    <input
                      type="checkbox"
                      checked={readinessForm.is_ready}
                      disabled={examReadinessLoading || examReadinessSaving}
                      onChange={(event) => updateReadinessForm("is_ready", event.target.checked)}
                    />
                    <span>Élève prêt pour l’examen</span>
                  </label>

                  <label>
                    <span>Heures complémentaires avant l’examen</span>
                    <select
                      value={isMoreHours ? "more" : readinessForm.additional_hours}
                      disabled={examReadinessLoading || examReadinessSaving}
                      onChange={(event) => {
                        const value = event.target.value;
                        updateReadinessForm("additional_hours", value === "more" ? (isMoreHours ? readinessForm.additional_hours : 6) : value);
                      }}
                    >
                      <option value="">Non renseigné</option>
                      {[1, 2, 3, 4, 5].map((hours) => <option key={hours} value={hours}>{hours} h</option>)}
                      <option value="more">6 h ou plus</option>
                    </select>
                  </label>

                  {isMoreHours && (
                    <label>
                      <span>Nombre d’heures complémentaires</span>
                      <input
                        type="number"
                        min="6"
                        max="100"
                        value={readinessForm.additional_hours}
                        disabled={examReadinessLoading || examReadinessSaving}
                        onChange={(event) => updateReadinessForm("additional_hours", event.target.value)}
                      />
                    </label>
                  )}

                  <label>
                    <span>Fréquence d’entraînement</span>
                    <input
                      list="cpd-practice-frequencies"
                      value={readinessForm.practice_frequency}
                      placeholder="Ex. 1 heure par semaine"
                      maxLength="120"
                      disabled={examReadinessLoading || examReadinessSaving}
                      onChange={(event) => updateReadinessForm("practice_frequency", event.target.value)}
                    />
                    <datalist id="cpd-practice-frequencies">
                      <option value="1 heure par semaine" />
                      <option value="1 heure tous les 10 jours" />
                      <option value="1 heure toutes les 2 semaines" />
                    </datalist>
                  </label>

                  <label>
                    <span>Observation</span>
                    <textarea
                      rows="3"
                      maxLength="2000"
                      value={readinessForm.observation}
                      placeholder="Précisez les conditions de préparation à l’examen."
                      disabled={examReadinessLoading || examReadinessSaving}
                      onChange={(event) => updateReadinessForm("observation", event.target.value)}
                    />
                  </label>

                  <button type="submit" className="cpd-exam-readiness-save" disabled={examReadinessLoading || examReadinessSaving}>
                    {examReadinessSaving ? "Enregistrement…" : "Enregistrer la préparation"}
                  </button>
                  {examReadinessSuccess && <p className="cpd-exam-readiness-success" role="status">{examReadinessSuccess}</p>}
                </form>
              </>
            )}
          </section>

          <div className="cpd-card">
            <div className="cpd-section-title">Informations personnelles</div>
            <div className="cpd-info-rows">
              <InfoRow label="Numéro NEPH" value={data.neph} />
              <InfoRow label="Téléphone" value={data.phone || "—"} />
            </div>
          </div>

          <button type="button" className="cpd-see-profile-btn" onClick={openFullProfile}>
            Voir le profil complet <IconChevR />
          </button>
        </div>

        <footer className="cpd-footer">
          <button className="cpd-call-btn">
            <IconPhone /> Appel immédiat
          </button>
        </footer>
      </aside>
    </>
  );
}
