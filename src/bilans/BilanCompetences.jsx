import "./BilanCompetences.css";
import { Brain, CarFront, CircleDotDashed, Crosshair, Footprints, GitBranch, Hand, KeyRound, Map, Navigation, RotateCcw, Route, Search, TrafficCone } from "lucide-react";

export const BILAN_COMPETENCIES = [
  { id: "emotivite", icon: Brain, title: "ÉMOTIVITÉ (gestion stress)", observations: [], faible: "+2", moyen: "+1" },
  { id: "trajectoire", icon: Route, title: "TRAJECTOIRE", observations: ["Ligne droite", "En tournant", "En courbe", "Rue étroite", "En utilisant la BV", "Fixation", "Écarts"], faible: "+3", moyen: "+1" },
  { id: "demarrage", icon: KeyRound, title: "DÉMARRAGE", observations: ["Avec frein à main (FAM)", "Sans FAM", "Patinage", "Calage", "Normal", "Dynamique", "Accélération"], faible: "+2", moyen: "+1" },
  { id: "arret", icon: Hand, title: "ARRÊT", observations: ["Avec souplesse", "À un point fixe", "Arrêt d'urgence", "Dosage du frein", "Débrayage", "Focalisation sur BV", "Calage"], faible: "+2", moyen: "+1" },
  { id: "bv", icon: GitBranch, title: "UTILISATION DE LA BV", observations: ["Manipulation brusque", "Mauvais choix de vitesses", "Sous régime", "Sur régime"], faible: "+3", moyen: "+1" },
  { id: "synchronisation", icon: Footprints, title: "SYNCHRONISATION DES COMMANDES", observations: ["Accélérateur, embrayage, BV", "Frein, embrayage, BV", "Frein, embrayage, reprise 1ère", "Roue libre", "Volant, embrayage, BV"], faible: "+3", moyen: "+2" },
  { id: "controles", icon: Search, title: "CONTRÔLES", observations: ["Intérieur", "Extérieur", "Angles morts", "Renouveler", "Rétrécissement", "Obstacles", "En tournant"], faible: "+3", moyen: "+2" },
  { id: "regles", icon: TrafficCone, title: "RÈGLES DE CIRCULATION", observations: ["Choisir sa voie", "Priorités", "Limitation de vitesse", "Feux", "Cédez-le-passage / Stop", "Clignotant", "Signalisation"], faible: "+3", moyen: "+1" },
  { id: "intersections", icon: Crosshair, title: "INTERSECTIONS", observations: ["Sans visibilité", "Rue étroite", "Tourner à D", "Tourner à G", "B.V", "Détections", "Franchissement", "Règles de priorités", "Prise de décision"], faible: "+3", moyen: "+2" },
  { id: "gabarit", icon: CarFront, title: "GESTION DU GABARIT", observations: ["Largeur", "Longueur", "Rues étroites", "Croisements difficiles"], faible: "+3", moyen: "+1" },
  { id: "giratoires", icon: CircleDotDashed, title: "GIRATOIRES / ROND-POINTS", observations: ["Avant le giratoire", "Dans le giratoire", "En sortant du giratoire", "Priorités", "Trajectoire", "Changement de file", "Clignotant"], faible: "+3", moyen: "+2" },
  { id: "manoeuvres", icon: RotateCcw, title: "MANŒUVRES", observations: ["Demi-tour", "Marche arrière ligne droite", "Marche arrière courbe", "Créneau", "Bataille", "Épi"], faible: "+3", moyen: "+2" },
  { id: "changement_file", icon: Navigation, title: "CHANGEMENT DE FILE", observations: ["Allure", "Trajectoire", "Clignotant", "Priorité", "Dynamisme"], faible: "+3", moyen: "+2" },
  { id: "voie_rapide", icon: Map, title: "VOIE RAPIDE", observations: ["Insertion", "Sortie", "Dépassement", "Circulation", "Allure", "Suivre un itinéraire", "Utilisation de la BV", "Prise d'info", "Priorité"], faible: "+4", moyen: "+2" },
  { id: "autonomie", icon: CircleDotDashed, title: "AUTONOMIE", observations: ["Manœuvre autonome", "Conduite autonome", "Trajectoire", "Choix de l'emplacement", "Allure", "Prise d'infos", "Clignotant", "Prise de décision"], faible: "+2", moyen: "+1" },
];

const RATINGS = [
  { id: "pas_vu", label: "Pas Vu" },
  { id: "faible", label: "Faible" },
  { id: "moyen", label: "Moyen" },
  { id: "bon", label: "Bon" },
];

export function emptyBilanEvaluation() {
  return {
    evaluation_date: "",
    observed_competencies: [],
    competencies: Object.fromEntries(BILAN_COMPETENCIES.map((section) => [section.id, { rating: null, observations: [] }])),
    student_agreement: null,
    monitor_agreement: null,
  };
}

export function normalizeBilanEvaluation(value = {}) {
  const empty = emptyBilanEvaluation();
  const competencies = Object.fromEntries(BILAN_COMPETENCIES.map((section) => {
    const current = value?.competencies?.[section.id] || {};
    return [section.id, {
      rating: RATINGS.some((rating) => rating.id === current.rating) ? current.rating : null,
      observations: Array.isArray(current.observations) ? current.observations.filter((item) => section.observations.includes(item)) : [],
    }];
  }));
  return {
    ...empty,
    evaluation_date: typeof value?.evaluation_date === "string" ? value.evaluation_date : "",
    observed_competencies: Array.isArray(value?.observed_competencies) ? value.observed_competencies.map(Number).filter((item) => item >= 1 && item <= 4) : [],
    competencies,
    student_agreement: ["oui", "non"].includes(value?.student_agreement) ? value.student_agreement : null,
    monitor_agreement: ["oui", "non"].includes(value?.monitor_agreement) ? value.monitor_agreement : null,
  };
}

export default function BilanCompetences({ data, onChange, readOnly = false, studentName = "—", monitorName = "—", totalHours = "0", studentDecision = null }) {
  const value = normalizeBilanEvaluation(data);
  const editable = !readOnly && typeof onChange === "function";
  const update = (changes) => editable && onChange({ ...value, ...changes });
  const updateCompetency = (id, changes) => update({ competencies: { ...value.competencies, [id]: { ...value.competencies[id], ...changes } } });
  const toggleObserved = (item) => update({ observed_competencies: value.observed_competencies.includes(item) ? value.observed_competencies.filter((current) => current !== item) : [...value.observed_competencies, item] });

  return <section className="bc-sheet" aria-label="Bilan de compétences">
    <header className="bc-title"><h2>BILAN DE COMPÉTENCES</h2><div className="bc-observed"><strong>COMPÉTENCES OBSERVÉES :</strong>{[1, 2, 3, 4].map((item) => <label key={item}><input type="checkbox" checked={value.observed_competencies.includes(item)} disabled={!editable} onChange={() => toggleObserved(item)} />{item}</label>)}</div></header>
    <div className="bc-meta"><p><span>MONITEUR</span><strong>{monitorName}</strong></p><p><span>ÉLÈVE</span><strong>{studentName}</strong></p><label><span>DATE</span><input type="date" value={value.evaluation_date} disabled={!editable} onChange={(event) => update({ evaluation_date: event.target.value })} /></label></div>
    <div className="bc-rating-legend" aria-label="Légende des évaluations">{RATINGS.map((rating) => <span key={rating.id} className={rating.id}>{rating.label}</span>)}</div>
    <div className="bc-competencies">{BILAN_COMPETENCIES.map((section) => {
      const current = value.competencies[section.id];
      const Icon = section.icon;
      return <article className="bc-card" key={section.id}>
        <h3><i><Icon size={19} strokeWidth={2.2} /></i><span>{section.title}</span></h3>
        <div className="bc-card-content">
          {section.observations.length > 0 ? <div className="bc-observations">{section.observations.map((observation) => <label key={observation}><input type="checkbox" checked={current.observations.includes(observation)} disabled={!editable} onChange={() => updateCompetency(section.id, { observations: current.observations.includes(observation) ? current.observations.filter((item) => item !== observation) : [...current.observations, observation] })} /><span>{observation}</span></label>)}</div> : <p className="bc-no-observations">Aucune observation détaillée.</p>}
          <div className="bc-ratings" aria-label={`Évaluation ${section.title}`}>{RATINGS.map((rating) => <button type="button" key={rating.id} className={`${rating.id}${current.rating === rating.id ? " selected" : ""}`} disabled={!editable} onClick={() => updateCompetency(section.id, { rating: rating.id })} aria-pressed={current.rating === rating.id}><i className="bc-rating-checkbox" aria-hidden="true" /> <span>{rating.label}</span>{rating.id === "faible" && <small>{section.faible}</small>}{rating.id === "moyen" && <small>{section.moyen}</small>}</button>)}</div>
        </div>
      </article>;
    })}</div>
    <section className="bc-total"><span>TOTAL DES HEURES :</span><strong>{totalHours} H</strong></section>
    <section className="bc-agreements"><Agreement title="ACCORD DE L'ÉLÈVE" value={value.student_agreement} decision={studentDecision} /><Agreement title="ACCORD DE L'ENSEIGNANT" value={value.monitor_agreement} editable={editable} onChange={(monitor_agreement) => update({ monitor_agreement })} /></section>
  </section>;
}

function Agreement({ title, value, editable = false, onChange, decision = null }) {
  const labels = { pending: "En attente", accepted: "Accepté", rejected: "Refusé" };
  const studentAgreement = title === "ACCORD DE L'ÉLÈVE";
  const status = decision?.status || (value === "oui" ? "accepted" : value === "non" ? "rejected" : "pending");
  // On the student's own bilan, Oui / Non are the decision itself: "Oui"
  // opens the signature to accept, "Non" the refusal confirmation. They show
  // the saved decision and stay clickable so the student can change it.
  const studentCanChoose = studentAgreement && Boolean(decision?.canDecide);
  const checkedOption = studentAgreement && decision
    ? (status === "accepted" ? "oui" : status === "rejected" ? "non" : null)
    : value;
  const choose = (option) => {
    if (studentCanChoose) decision.onRequest?.(option === "oui" ? "accepted" : "rejected");
    else onChange?.(option);
  };
  return <section className="bc-agreement"><h3>{title}</h3><div>{["oui", "non"].map((option) => <label key={option} className={studentCanChoose ? "bc-agreement-choice" : undefined}><input type="radio" name={title} checked={checkedOption === option} disabled={!editable && !studentCanChoose} onChange={() => choose(option)} />{option === "oui" ? "Oui" : "Non"}</label>)}</div>{studentAgreement && decision && <div className={`bc-decision bc-decision--${status}`}><strong>Statut : {labels[status]}</strong><div className="bc-decision-actions"><button type="button" className="bc-decision-accept" disabled={!decision.canDecide || status === "accepted"} onClick={() => decision.onRequest?.("accepted")}>{status === "rejected" ? "Changer : accepter et signer" : "Accepter et signer"}</button><button type="button" className="bc-decision-reject" disabled={!decision.canDecide || status === "rejected"} onClick={() => decision.onRequest?.("rejected")}>{status === "accepted" ? "Changer : refuser le bilan" : "Refuser le bilan"}</button></div>{!decision.canDecide && <small>La décision est disponible uniquement depuis la session de l’élève.</small>}{decision.canDecide && status !== "pending" && <small>Vous pouvez modifier votre décision à tout moment.</small>}</div>}<p>Signature : <strong>{studentAgreement && decision?.signature?.length ? "Signature de l’élève enregistrée" : "Aucune signature enregistrée"}</strong></p></section>;
}
