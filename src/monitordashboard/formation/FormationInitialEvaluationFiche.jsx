import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, LockKeyhole, Mail, Save, X } from "lucide-react";
import http from "../../helpers/http.jsx";
import { profileImageUrl } from "../../new-student-dashboard/StudentHeader.jsx";

const errorMessage = (error) => Object.values(error.response?.data?.errors || {}).flat().join(" ")
  || error.response?.data?.message
  || "Impossible de contacter le serveur. Réessayez.";

const same = (first, second) => JSON.stringify(first) === JSON.stringify(second);
const copy = (value) => JSON.parse(JSON.stringify(value));

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR");
}

function formatDuration(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [hours ? hours + " h" : "", remainder ? remainder + " min" : ""].filter(Boolean).join(" ");
}

function FicheSection({ number, title, children }) {
  return <section className="mf-fiche-section">
    <h3><span>{number}</span>{title}</h3>
    {children}
  </section>;
}

function FicheCheckbox({ label, checked, onChange, disabled = false }) {
  return <label className="mf-fiche-check">
    <span>{label}</span>
    <input type="checkbox" checked={Boolean(checked)} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
  </label>;
}

function FicheSwitch({ label, checked, onChange, disabled = false }) {
  return <label className="mf-fiche-switch">
    <span>{label}</span>
    <button type="button" role="switch" aria-label={label} aria-checked={Boolean(checked)} disabled={disabled} onClick={() => onChange(!checked)}><i /></button>
  </label>;
}

function FicheRadio({ label, checked, onChange, disabled = false }) {
  return <label className="mf-fiche-radio">
    <span>{label}</span>
    <input type="radio" checked={Boolean(checked)} disabled={disabled} onChange={() => onChange()} />
  </label>;
}

function FicheSlider({ label, value, onChange, disabled = false }) {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
  return <label className="mf-fiche-slider">
    <span>{label}: <b>{numeric}/10</b></span>
    <input type="range" min="0" max="10" step="1" value={numeric} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} />
  </label>;
}

export default function FormationInitialEvaluationFiche({ studentId, monitorId, onClose }) {
  const [payload, setPayload] = useState(null);
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openingContract, setOpeningContract] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const params = monitorId ? { monitor_id: monitorId } : {};
  const dirty = form !== null && baseline !== null && !same(form, baseline);
  const editable = Boolean(payload?.editable) && !saving;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await http.get("/monitor/formation/" + studentId + "/initial-evaluation", { params });
      setPayload(data.data);
      setForm(copy(data.data.evaluation.data));
      setBaseline(copy(data.data.evaluation.data));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [studentId, monitorId]);

  useEffect(() => { load(); }, [load]);

  const requestClose = useCallback(() => {
    if (!saving && (!dirty || window.confirm("Abandonner les modifications non enregistrées de cette fiche ?"))) onClose();
  }, [dirty, onClose, saving]);

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") requestClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [requestClose]);

  const update = (path, value) => setForm((current) => {
    const next = copy(current);
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((item, key) => item[key], next);
    target[last] = value;
    return next;
  });

  const chooseAttitude = (key) => setForm((current) => ({
    ...current,
    attitude: Object.fromEntries(Object.keys(current.attitude).map((name) => [name, name === key])),
  }));

  const save = async () => {
    if (!editable || !form) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data } = await http.put("/monitor/formation/" + studentId + "/initial-evaluation", { data: form }, { params });
      setPayload(data.data);
      setForm(copy(data.data.evaluation.data));
      setBaseline(copy(data.data.evaluation.data));
      setNotice("La fiche d’évaluation initiale a été enregistrée.");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const openContract = async () => {
    if (!payload?.contract?.available || openingContract) return;
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    setOpeningContract(true);
    setError("");
    try {
      const response = await http.get("/monitor/formation/" + studentId + "/initial-evaluation/contract", { params, responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/html" }));
      if (tab) tab.location.href = url;
      else window.location.assign(url);
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (requestError) {
      tab?.close();
      setError(errorMessage(requestError));
    } finally {
      setOpeningContract(false);
    }
  };

  const student = payload?.student;
  const formation = payload?.formation;
  const photo = profileImageUrl(student);
  const initials = useMemo(() => (student?.name || "Élève").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(), [student?.name]);
  const address = [student?.address, [student?.postal_code, student?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return <div className="mf-fiche-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
    <section className="mf-fiche-modal" role="dialog" aria-modal="true" aria-label="Évaluation initiale, Permis B">
      <header className="mf-fiche-header">
        <div><span>FORMATION · ÉVALUATION INITIALE</span><h2>Évaluation initiale, Permis B</h2></div>
        <button type="button" aria-label="Fermer la fiche" disabled={saving} onClick={requestClose}><X size={23} /></button>
      </header>

      {loading && <p className="mf-fiche-loading">Chargement de la fiche d’évaluation…</p>}
      {!loading && error && !form && <div className="mf-fiche-message mf-error" role="alert">{error}<button type="button" onClick={load}>Réessayer</button></div>}

      {!loading && form && <>
        <div className="mf-fiche-person">
          <span className="mf-fiche-avatar">{photo ? <img src={photo} alt="" /> : initials}</span>
          <div><strong>{student?.name}</strong><small>PASSPERMISFACILE</small></div>
          <button type="button" className="mf-fiche-mail" disabled title={payload?.email?.reason || "Recevoir par mail"}><Mail size={17} />Recevoir par mail</button>
        </div>

        <div className="mf-fiche-content">
          {payload?.locked_reason && <p className="mf-fiche-locked"><LockKeyhole size={17} />{payload.locked_reason}</p>}
          {notice && <p className="mf-fiche-message mf-success" role="status">{notice}</p>}
          {error && <p className="mf-fiche-message mf-error" role="alert">{error}</p>}

          <FicheSection number="1" title="Informations élève">
            <div className="mf-fiche-info-grid">
              <label><span>Nom-Prénom</span><input value={student?.name || ""} disabled /></label>
              <label><span>Date de naissance</span><input value={student?.date_of_birth ? formatDate(student.date_of_birth) : "—"} disabled /></label>
              <label><span>Téléphone</span><input value={student?.phone || "—"} disabled /></label>
              <label><span>E-mail</span><input value={student?.email || "—"} disabled /></label>
              <label><span>Adresse</span><input value={address || "—"} disabled /></label>
              <label><span>N° NEPH</span><input value={student?.neph || "—"} disabled /></label>
              <label><span>Profession ou ambition professionnelle</span><input value={form.student.profession} disabled={!editable} onChange={(event) => update("student.profession", event.target.value)} /></label>
              <FicheCheckbox label="Port de correction" checked={form.student.wears_correction} disabled={!editable} onChange={(value) => update("student.wears_correction", value)} />
              <label><span>Acuité visuelle</span><input value={form.student.visual_acuity} disabled={!editable} onChange={(event) => update("student.visual_acuity", event.target.value)} /></label>
            </div>
          </FicheSection>

          <FicheSection number="2" title="Formation choisie">
            <div className="mf-fiche-db-summary" aria-label="Données de formation liées">
              <div><span>Prestation</span><strong>{formation?.title || "—"}</strong></div>
              <div><span>Offre</span><strong>{formation?.offer_name || "—"}</strong></div>
              <div><span>Leçon liée</span><strong>{formatDate(formation?.date)} · {formation?.start_at || "—"}{formation?.end_at ? " – " + formation.end_at : ""}</strong></div>
              <div><span>Durée</span><strong>{formatDuration(formation?.duration_minutes)}</strong></div>
              <div><span>Lieu</span><strong>{formation?.location_name || "—"}</strong></div>
              <div><span>Moniteur</span><strong>{formation?.monitor_name || "—"}</strong></div>
              <div><span>Leçons réservées</span><strong>{formation?.booked_lessons ?? "—"}</strong></div>
              <div><span>Heures réservées</span><strong>{formation?.booked_hours ? formatDuration(Math.round(Number(formation.booked_hours) * 60)) : "—"}</strong></div>
            </div>
            <div className="mf-fiche-choice-grid">
              <FicheCheckbox label="Boite automatique" checked={form.training.automatic} disabled={!editable} onChange={(value) => update("training.automatic", value)} />
              <FicheCheckbox label="Boite mécanique" checked={form.training.manual} disabled={!editable} onChange={(value) => update("training.manual", value)} />
              <FicheCheckbox label="Véhicule aménagé" checked={form.training.adapted_vehicle} disabled={!editable} onChange={(value) => update("training.adapted_vehicle", value)} />
              <FicheCheckbox label="Conduite accompagnée" checked={form.training.accompanied_driving} disabled={!editable} onChange={(value) => update("training.accompanied_driving", value)} />
              <FicheCheckbox label="Conduite supervisée" checked={form.training.supervised_driving} disabled={!editable} onChange={(value) => update("training.supervised_driving", value)} />
            </div>
          </FicheSection>

          <FicheSection number="3" title="Expérience de conduite">
            <div className="mf-fiche-experience">
              <fieldset><legend>Permis</legend><FicheCheckbox label="AM" checked={form.experience.license.am} disabled={!editable} onChange={(value) => update("experience.license.am", value)} /><FicheCheckbox label="B1" checked={form.experience.license.b1} disabled={!editable} onChange={(value) => update("experience.license.b1", value)} /><FicheCheckbox label="A1" checked={form.experience.license.a1} disabled={!editable} onChange={(value) => update("experience.license.a1", value)} /></fieldset>
              <fieldset><legend>Conduite auto</legend><FicheCheckbox label="Déjà conduit" checked={form.experience.driving.already_driven} disabled={!editable} onChange={(value) => update("experience.driving.already_driven", value)} /><FicheCheckbox label="Avec parents" checked={form.experience.driving.with_parents} disabled={!editable} onChange={(value) => update("experience.driving.with_parents", value)} /><FicheCheckbox label="En auto-école" checked={form.experience.driving.with_driving_school} disabled={!editable} onChange={(value) => update("experience.driving.with_driving_school", value)} /></fieldset>
              <fieldset><legend>Autres véhicules</legend><FicheCheckbox label="Cyclomoteur" checked={form.experience.other_vehicles.moped} disabled={!editable} onChange={(value) => update("experience.other_vehicles.moped", value)} /><FicheCheckbox label="Vélo" checked={form.experience.other_vehicles.bike} disabled={!editable} onChange={(value) => update("experience.other_vehicles.bike", value)} /><FicheCheckbox label="Tracteur" checked={form.experience.other_vehicles.tractor} disabled={!editable} onChange={(value) => update("experience.other_vehicles.tractor", value)} /><FicheCheckbox label="Voiturette" checked={form.experience.other_vehicles.cart} disabled={!editable} onChange={(value) => update("experience.other_vehicles.cart", value)} /><FicheCheckbox label="Quad" checked={form.experience.other_vehicles.quad} disabled={!editable} onChange={(value) => update("experience.other_vehicles.quad", value)} /><FicheCheckbox label="Tondeuse" checked={form.experience.other_vehicles.lawnmower} disabled={!editable} onChange={(value) => update("experience.other_vehicles.lawnmower", value)} /><FicheCheckbox label="Caddie" checked={form.experience.other_vehicles.trolley} disabled={!editable} onChange={(value) => update("experience.other_vehicles.trolley", value)} /></fieldset>
            </div>
          </FicheSection>

          <FicheSection number="4" title="Connaissance du véhicule">
            <div className="mf-fiche-switch-grid">
              <FicheSwitch label="Direction" checked={form.vehicle_knowledge.steering} disabled={!editable} onChange={(value) => update("vehicle_knowledge.steering", value)} />
              <FicheSwitch label="Embrayage" checked={form.vehicle_knowledge.clutch} disabled={!editable} onChange={(value) => update("vehicle_knowledge.clutch", value)} />
              <FicheSwitch label="Boite de vitesse" checked={form.vehicle_knowledge.gearbox} disabled={!editable} onChange={(value) => update("vehicle_knowledge.gearbox", value)} />
              <FicheSwitch label="Freinage" checked={form.vehicle_knowledge.braking} disabled={!editable} onChange={(value) => update("vehicle_knowledge.braking", value)} />
            </div>
          </FicheSection>

          <FicheSection number="5" title="Attitude vis à vis de la formation à la conduite">
            <div className="mf-fiche-radio-list" role="radiogroup" aria-label="Attitude vis à vis de la formation">
              <FicheRadio label="Maîtriser le véhicule et le code" checked={form.attitude.master_car_and_code} disabled={!editable} onChange={() => chooseAttitude("master_car_and_code")} />
              <FicheRadio label="Prévoir les difficultés, savoir y faire face" checked={form.attitude.anticipate_difficulties} disabled={!editable} onChange={() => chooseAttitude("anticipate_difficulties")} />
              <FicheRadio label="C'est un passage inévitable" checked={form.attitude.inevitable_step} disabled={!editable} onChange={() => chooseAttitude("inevitable_step")} />
              <FicheRadio label="Envie/Désir de le faire" checked={form.attitude.desire_to_do_it} disabled={!editable} onChange={() => chooseAttitude("desire_to_do_it")} />
            </div>
          </FicheSection>

          <FicheSection number="6" title="Habiletés constatées lors de l’évaluation">
            <div className="mf-fiche-slider-grid">
              <FicheSlider label="Installation dans le véhicule" value={form.skills.vehicle_setup} disabled={!editable} onChange={(value) => update("skills.vehicle_setup", value)} />
              <FicheSlider label="Démarrages" value={form.skills.starting} disabled={!editable} onChange={(value) => update("skills.starting", value)} />
              <FicheSlider label="Arrêts" value={form.skills.stopping} disabled={!editable} onChange={(value) => update("skills.stopping", value)} />
              <FicheSlider label="Manipulation du volant" value={form.skills.steering_wheel} disabled={!editable} onChange={(value) => update("skills.steering_wheel", value)} />
            </div>
          </FicheSection>

          <FicheSection number="7" title="Compréhension / Restitution">
            <div className="mf-fiche-slider-grid">
              <FicheSlider label="Compréhension" value={form.understanding.comprehension} disabled={!editable} onChange={(value) => update("understanding.comprehension", value)} />
              <FicheSlider label="Restitution" value={form.understanding.restitution} disabled={!editable} onChange={(value) => update("understanding.restitution", value)} />
            </div>
          </FicheSection>

          <FicheSection number="8" title="Gestion de l’environnement">
            <div className="mf-fiche-slider-grid">
              <FicheSlider label="Maîtrise des trajectoires" value={form.environment.trajectory} disabled={!editable} onChange={(value) => update("environment.trajectory", value)} />
              <FicheSlider label="Orientation" value={form.environment.orientation} disabled={!editable} onChange={(value) => update("environment.orientation", value)} />
              <FicheSlider label="Observation" value={form.environment.observation} disabled={!editable} onChange={(value) => update("environment.observation", value)} />
              <FicheSlider label="Regard" value={form.environment.look} disabled={!editable} onChange={(value) => update("environment.look", value)} />
            </div>
          </FicheSection>

          <FicheSection number="9" title="Gestion des émotions">
            <div className="mf-fiche-slider-grid">
              <FicheSlider label="Relationnel" value={form.emotions.relationship} disabled={!editable} onChange={(value) => update("emotions.relationship", value)} />
              <FicheSlider label="Crispation" value={form.emotions.tension} disabled={!editable} onChange={(value) => update("emotions.tension", value)} />
            </div>
          </FicheSection>

          <FicheSection number="10" title="Résultat de l’évaluation">
            <div className="mf-fiche-results">
              <label><span>Nombre d’heures de leçon proposées</span><input type="number" min="0" max="999" value={form.results.lessons_proposed ?? ""} disabled={!editable} onChange={(event) => update("results.lessons_proposed", event.target.value === "" ? null : Number(event.target.value))} /></label>
              <label><span>Score de l’évaluation</span><input type="number" min="0" max="100" value={form.results.score ?? ""} disabled={!editable} onChange={(event) => update("results.score", event.target.value === "" ? null : Number(event.target.value))} /></label>
            </div>
          </FicheSection>

          <FicheSection number="11" title="Contrat">
            <div className="mf-fiche-contract">
              <div><span>Date de création</span><strong>{formatDate(payload?.contract?.created_at)}</strong></div>
              <div><span>Proposition acceptée</span><strong className={form.results.proposal_accepted === "Oui" ? "accepted" : ""}>{form.results.proposal_accepted}</strong></div>
              <button type="button" disabled={!payload?.contract?.available || openingContract} onClick={openContract}><FileText size={17} />{openingContract ? "Ouverture…" : "Créer le contrat DSR"}</button>
              {!payload?.contract?.available && <small>Disponible après la deuxième leçon réservée.</small>}
            </div>
          </FicheSection>
        </div>

        <footer className="mf-fiche-footer">
          <span>{dirty ? "Modifications non enregistrées" : "Fiche synchronisée avec le dossier de l’élève"}</span>
          <div><button type="button" disabled={saving} onClick={requestClose}>Fermer</button><button type="button" className="mf-fiche-save" disabled={!editable || !dirty} onClick={save}><Save size={17} />{saving ? "Enregistrement…" : "Sauvegarder"}</button></div>
        </footer>
      </>}
    </section>
  </div>;
}
