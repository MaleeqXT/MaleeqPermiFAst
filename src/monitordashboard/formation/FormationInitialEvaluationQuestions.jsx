import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole, Save, X } from "lucide-react";
import http from "../../helpers/http.jsx";
import { profileImageUrl } from "../../new-student-dashboard/StudentHeader.jsx";
import question27Right from "./assets/access-questions/question-27-right.jpeg";
import question27Center from "./assets/access-questions/question-27-center.jpeg";
import question27Left from "./assets/access-questions/question-27-left.jpeg";
import question28Right from "./assets/access-questions/question-28-right.jpeg";
import question28Center from "./assets/access-questions/question-28-center.jpeg";
import question28Left from "./assets/access-questions/question-28-left.jpeg";
import question29Road from "./assets/access-questions/question-29-road.jpeg";
import question36Gear from "./assets/access-questions/question-36-gear.jpeg";
import question37Gear from "./assets/access-questions/question-37-gear.jpeg";

const errorMessage = (error) => Object.values(error.response?.data?.errors || {}).flat().join(" ")
  || error.response?.data?.message
  || "Impossible de contacter le serveur. Réessayez.";

const yesNo = ["Oui", "Non"];
const single = (id, title, options, extra = {}) => ({ id, title, type: "single", options, ...extra });
const multiple = (id, title, options, extra = {}) => ({ id, title, type: "multiple", options, ...extra });
const text = (id, title, extra = {}) => ({ id, title, type: "text", ...extra });
const matrix = (id, title, rows, columns) => ({ id, title, type: "matrix", rows, columns });

export const INITIAL_EVALUATION_QUESTIONS = [
  multiple("q01", "Quelle est la formation choisie ?", ["Boîte automatique", "Boîte mécanique", "Véhicule aménagé", "Conduite accompagnée", "Conduite supervisée"]),
  single("q02", "Le code a-t-il déjà été obtenu et est-il toujours en cours de validité ?", yesNo),
  text("q03", "Quelles sont tes ambitions professionnelles ?"),
  text("q04", "Quelles sont tes passions et sports exercés ?"),
  single("q05", "Portes-tu des lunettes ?", yesNo),
  text("q06", "Connais-tu ton acuité visuelle ?"),
  text("q07", "Quelle est la date de ton prochain rendez-vous chez l'ophtalmo ?", { input: "date" }),
  single("q08", "As-tu déjà conduit une voiture ?", yesNo),
  single("q09", "As-tu déjà conduit un cyclomoteur ?", yesNo),
  single("q10", "Disposes-tu du permis AM (si oui faire 2 photos) ?", yesNo),
  single("q11", "Sais tu faire du vélo ?", yesNo),
  single("q12", "As tu déjà conduit un tracteur?", yesNo),
  single("q13", "As tu déjà conduit une voiturette?", yesNo),
  single("q14", "As tu déjà conduit un quad?", yesNo),
  single("q15", "As tu déjà conduit une tondeuse?", yesNo),
  single("q16", "As tu déjà conduit un caddie?", yesNo),
  single("q17", "Tu penses que bien conduire c'est laquelle de ces deux propositions?", ["Maîtriser la voiture et le code", "Prévoir les difficultés, savoir y faire face"]),
  single("q18", "Tu penses qu'apprendre à conduire c'est laquelle de ces deux propositions?", ["Un passage inévitable", "Une envie de connaître"]),
  single("q19", "Comment change t-on la trajectoire de la voiture?", ["Par la manipulation du volant", "Autre"]),
  single("q20", "Comment rapproche t-on la voiture vers la droite?", ["Par la manipulation vers la droite le volant", "Autre"]),
  single("q21", "Faut-il tenir fort le volant ?", yesNo),
  single("q22", "Faut-il toujours le tenir de la même manière?", yesNo),
  single("q23", "Lorsque l'on dépasse, quel angle doit-on donner au volant?", ["Entre 0 et 1/4 de tour (0° et 90°)", "Entre 1/4 et 1/2 tour (90° et 180°)"]),
  multiple("q24", "Lorsque l'on veut tourner à angle droit sur une courte distance, quel angle doit-on donner au volant (pour rentrer dans un garage)?", ["Volant à fond", "1 tour", "Autre"]),
  single("q25", "Quel organe reçoit la commande faite par le volant?", ["Les roues", "Autre"]),
  single("q26", "Sur quelles roues agit le volant?", ["Les roues avant", "Autre"]),
  multiple("q27", "Lorsqu'elle roule normalement quelle position sur la route, la voiture doit-elle avoir?", ["Collée à droite", "Au centre de la voie", "Plutôt à gauche"], { visual: "road-choices" }),
  multiple("q28", "Quelle position sur la route, la voiture doit-elle avoir avant un tournant à gauche?", ["Collée à droite", "Au centre de la voie", "Plutôt à gauche"], { visual: "curve-choices" }),
  multiple("q29", "Comment peut-ton savoir quelle est la position de la voiture, lorsque l'on est installé au poste de conduite?", ["Regard rétro droit", "Regard sur l'avant ligne du milieu", "Regard à l'avant à droite", "Synthèse de diverses prises d'infos", "Autre"], { visual: "positioning" }),
  multiple("q30", "Ou est l'organe que l'on appelle l'embrayage?", ["Entre le moteur et la boite de vitesse", "Entre la boite de vitesse et les roues", "Ne sait pas"]),
  single("q31", "Grâce à quelle commande actionne t-on l'embrayage?", ["La pédale de gauche", "Autre"]),
  multiple("q32", "Quelles sont les différentes positions de la pédale d'embrayage?", ["Appuyée", "Relâchée", "Intermédiaire"]),
  matrix("q33", "Quels contextes justifient chacune des positions de l'embrayage?", ["A l'arrêt", "Au démarrage", "En circulation", "Passage de vitesse"], ["Appuyé", "Relâché", "Intermédiaire"]),
  multiple("q34", "Ou est l'organe que l'on appelle la boite de vitesse ?", ["Entre le moteur et l'embrayage", "Entre l'embrayage et les roues", "Ne sait pas"]),
  single("q35", "Grâce à quelle commande actionne t-on la boite de vitesse?", ["Le levier de vitesse", "Autre"]),
  multiple("q36", "Combien y-a-t-il de rapport(s)?", ["1", "5", "6", "Autre"], { visual: "gear-36" }),
  single("q37", "Combien ce levier de vitesse a-t-il de positions?", ["6", "7"], { visual: "gear-37" }),
  multiple("q38", "Que signifie le mot « vitesse » en conduite?", ["L'allure de la voiture", "La vitesse engagée", "Le régime du moteur"]),
  single("q39", "Quelle vitesse faut-il engager pour démarrer?", ["La première", "Autre"]),
  multiple("q40", "Quand faut-il changer de vitesse?", ["Lorsque le moteur fait du bruit", "En fonction de l'allure de la voiture", "En fonction de la météo"]),
  multiple("q41", "Par quelles commandes peut-on freiner?", ["La pédale du milieu", "Le frein à main", "En rétrogradant"]),
  multiple("q42", "Comment actionne t-on les dispositifs de freinage?", ["Avec la pédale du milieu", "En tirant avec la main sans le pouce", "En rétrogradant"]),
  matrix("q43", "Sur quelles roues agissent chacun des freins?", ["Roues avants", "Roues arrières", "Les quatre roues"], ["Pédale du milieu", "Tirer avec la main", "En rétrogradant"]),
  multiple("q44", "Verifiez l'installation de l'élève au volant", ["Assise // pédales", "Dossier", "Retros", "Ceinture", "Ordre exact"]),
  multiple("q45", "Exercices de manipulation du volant", ["Regarde son volant", "Regarde devant et sur les cotés", "Relève les indices", "Interprète les indices", "Autre, plutôt négatif", "Autre, plutôt positif"]),
  single("q46", "Comment évaluez-vous la précision du volant?", ["La voiture se place près du trottoir", "Autre"]),
  matrix("q47", "Evaluation des démarrages?", ["Gestes bien organisés", "Erreur", "Pas de calage ou de dérapage"], ["Démarrage 1", "Démarrage 2", "Démarrage 3"]),
  matrix("q48", "Evaluation des arrêts?", ["Gestes bien organisés", "Erreur", "Pas de calage ou de dérapage"], ["Démarrage 1", "Démarrage 2", "Démarrage 3"]),
  single("q49", "L'élève est-il capable de répéter une explication?", yesNo),
  single("q50", "L'élève a-t-il trouvé l'évaluation intéressante?", yesNo),
  text("q51", "A quel(s) moment(s) a-t-il été le plus mal à l'aise?", { multiline: true }),
];

function ReferenceImage({ source, alt }) {
  return <img className="mf-questions-reference-image" src={source} alt={alt} />;
}

function Visual({ type, index }) {
  if (type === "positioning") return <ReferenceImage source={question29Road} alt="Vue depuis le poste de conduite" />;
  if (type === "gear-36") return <ReferenceImage source={question36Gear} alt="Grille de rapports de boîte de vitesse" />;
  if (type === "gear-37") return <ReferenceImage source={question37Gear} alt="Levier de vitesse" />;
  if (type === "road-choices") {
    const sources = [question27Right, question27Center, question27Left];
    return <ReferenceImage source={sources[index]} alt="Position de la voiture sur la route" />;
  }
  if (type === "curve-choices") {
    const sources = [question28Right, question28Center, question28Left];
    return <ReferenceImage source={sources[index]} alt="Position de la voiture avant le tournant" />;
  }
  return null;
}
function Choice({ label, checked, multiple, disabled, onChange, visual }) {
  return <label className={"mf-questions-choice" + (visual ? " visual" : "")}>
    <span>{label}</span>
    {visual}
    <input type={multiple ? "checkbox" : "radio"} checked={checked} disabled={disabled} onChange={onChange} />
  </label>;
}

function Matrix({ question, value, disabled, onChange }) {
  const matrixValue = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const toggle = (row, column) => {
    const current = Array.isArray(matrixValue[row]) ? matrixValue[row] : [];
    onChange({ ...matrixValue, [row]: current.includes(column) ? current.filter((item) => item !== column) : [...current, column] });
  };
  return <div className="mf-questions-matrix-wrap"><table className="mf-questions-matrix"><thead><tr><th></th>{question.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>
    {question.rows.map((row) => <tr key={row}><th>{row}</th>{question.columns.map((column) => <td key={column}><input type="checkbox" aria-label={row + " : " + column} checked={(matrixValue[row] || []).includes(column)} disabled={disabled} onChange={() => toggle(row, column)} /></td>)}</tr>)}
  </tbody></table></div>;
}

export default function FormationInitialEvaluationQuestions({ studentId, monitorId, onClose }) {
  const [payload, setPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [final, setFinal] = useState({ score: "", lessons_proposed: "", guidance: "" });
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const params = useMemo(() => monitorId ? { monitor_id: monitorId } : {}, [monitorId]);
  const editable = Boolean(payload?.editable) && !saving;
  const question = INITIAL_EVALUATION_QUESTIONS[step];

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await http.get("/monitor/formation/" + studentId + "/initial-evaluation/questions", { params });
      const next = data.data;
      setPayload(next);
      setAnswers(next.evaluation.answers || {});
      setFinal({
        score: next.evaluation.final?.score ?? "",
        lessons_proposed: next.evaluation.final?.lessons_proposed ?? "",
        guidance: next.evaluation.final?.guidance || "",
      });
      setStep(Math.max(0, Math.min(INITIAL_EVALUATION_QUESTIONS.length - 1, Number(next.evaluation.current_question || 1) - 1)));
      setDirty(false);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, [params, studentId]);

  useEffect(() => { load(); }, [load]);

  const persist = async (nextStep = step, validated = false) => {
    if (!editable) return false;
    setSaving(true); setError(""); setNotice("");
    try {
      const finalPayload = {};
      if (final.score !== "") finalPayload.score = Number(final.score);
      if (final.lessons_proposed !== "") finalPayload.lessons_proposed = Number(final.lessons_proposed);
      if (final.guidance) finalPayload.guidance = final.guidance;
      const body = { answers, current_question: nextStep + 1, validated, final: finalPayload };
      const { data } = await http.put("/monitor/formation/" + studentId + "/initial-evaluation/questions", body, { params });
      setPayload(data.data);
      setAnswers(data.data.evaluation.answers || answers);
      setFinal({
        score: data.data.evaluation.final?.score ?? "",
        lessons_proposed: data.data.evaluation.final?.lessons_proposed ?? "",
        guidance: data.data.evaluation.final?.guidance || "",
      });
      setDirty(false);
      return true;
    } catch (requestError) { setError(errorMessage(requestError)); return false; }
    finally { setSaving(false); }
  };

  const navigate = async (target) => {
    if (target < 0) { if (!saving && (!dirty || window.confirm("Abandonner les modifications non enregistrées ?"))) onClose(); return; }
    const storedStep = Math.min(target, INITIAL_EVALUATION_QUESTIONS.length - 1);
    if (await persist(storedStep, false)) setStep(target);
  };

  const updateAnswer = (value) => { setAnswers((current) => ({ ...current, [question.id]: value })); setDirty(true); };
  const updateFinal = (key, value) => { setFinal((current) => ({ ...current, [key]: value })); setDirty(true); };
  const currentValue = answers[question?.id];

  const renderInput = () => {
    if (question.type === "text") return <label className="mf-questions-text"><span>Votre réponse :</span>{question.input ? <input type={question.input} value={typeof currentValue === "string" ? currentValue : ""} disabled={!editable} onChange={(event) => updateAnswer(event.target.value)} /> : <textarea rows={question.multiline ? 7 : 4} value={typeof currentValue === "string" ? currentValue : ""} disabled={!editable} onChange={(event) => updateAnswer(event.target.value)} />}</label>;
    if (question.type === "matrix") return <Matrix question={question} value={currentValue} disabled={!editable} onChange={updateAnswer} />;

    const selected = Array.isArray(currentValue) ? currentValue : [];
    const topVisual = question.visual === "positioning" || question.visual === "gear-36" || question.visual === "gear-37"
      ? <Visual type={question.visual} /> : null;
    return <div className="mf-questions-options">{topVisual}{question.options.map((option, index) => {
      const checked = question.type === "multiple" ? selected.includes(option) : currentValue === option;
      const visual = question.visual === "road-choices" || question.visual === "curve-choices" ? <Visual type={question.visual} index={index} /> : null;
      return <Choice key={option} label={option} checked={checked} multiple={question.type === "multiple"} disabled={!editable} visual={visual} onChange={() => updateAnswer(question.type === "multiple" ? (checked ? selected.filter((item) => item !== option) : [...selected, option]) : option)} />;
    })}</div>;
  };

  const initials = useMemo(() => (payload?.student?.name || "Élève").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(), [payload?.student?.name]);
  const photo = profileImageUrl(payload?.student);
  const finalScreen = step === INITIAL_EVALUATION_QUESTIONS.length;

  return <div className="mf-questions-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving && (!dirty || window.confirm("Abandonner les modifications non enregistrées ?"))) onClose(); }}>
    <section className="mf-questions-modal" role="dialog" aria-modal="true" aria-label="Questions de l'évaluation initiale">
      <header className="mf-questions-header"><button type="button" aria-label="Retour" disabled={saving} onClick={() => navigate(finalScreen ? INITIAL_EVALUATION_QUESTIONS.length - 1 : step - 1)}><ArrowLeft size={23} /></button><div className="mf-questions-person"><span>{photo ? <img src={photo} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : initials}</span><strong>{payload?.student?.name || "Élève"}</strong><small>PASSPERMISFACILE</small></div><button type="button" aria-label="Fermer les questions" disabled={saving} onClick={() => { if (!dirty || window.confirm("Abandonner les modifications non enregistrées ?")) onClose(); }}><X size={21} /></button></header>
      {loading && <p className="mf-questions-loading">Chargement des questions…</p>}
      {!loading && error && !payload && <p className="mf-questions-message mf-error" role="alert">{error}<button type="button" onClick={load}>Réessayer</button></p>}
      {!loading && payload && <main className="mf-questions-body">
        {payload.locked_reason && <p className="mf-questions-locked"><LockKeyhole size={17} />{payload.locked_reason}</p>}
        {error && <p className="mf-questions-message mf-error" role="alert">{error}</p>}
        {notice && <p className="mf-questions-message mf-success" role="status">{notice}</p>}
        {!finalScreen && <section className="mf-questions-card"><header><span>Question {step + 1}/51</span><h2>{question.title}</h2></header>{renderInput()}</section>}
        {finalScreen && <section className="mf-questions-card mf-questions-final"><header><span>Évaluation de l'enseignant</span><h2>Résultat de l'évaluation initiale</h2></header>
          <label><span>Score de l'évaluation</span><input type="number" min="0" max="100" value={final.score} disabled={!editable} onChange={(event) => updateFinal("score", event.target.value)} /></label>
          <p className="mf-questions-guidance">Rappeler à l'élève et insister sur l'importance de poser la moindre question lors de l'apprentissage.</p>
          <p className="mf-questions-guidance">Rappeler à l'élève de se rendre sur le site ANTS pour y établir la demande de dossier et nous transférer les messages reçus.</p>
          <p className="mf-questions-guidance">Rappeler à l'élève de télécharger l'application Parcours Conduite ou COACHAAC en fonction de sa formation.</p>
          <label><span>Nombre d'heures de leçons à prévoir</span><input type="number" min="0" max="999" value={final.lessons_proposed} disabled={!editable} onChange={(event) => updateFinal("lessons_proposed", event.target.value)} /></label>
          <label><span>Consignes complémentaires</span><textarea rows="4" value={final.guidance} disabled={!editable} onChange={(event) => updateFinal("guidance", event.target.value)} /></label>
          {payload.evaluation.status === "validated" && <p className="mf-questions-validated"><CheckCircle2 size={17} />Évaluation validée et enregistrée.</p>}
        </section>}
      </main>}
      {!loading && payload && <footer className="mf-questions-footer">
        {!finalScreen ? <><button type="button" disabled={saving || step === 0} onClick={() => navigate(step - 1)}>Précédent</button><button type="button" className="next" disabled={!editable} onClick={() => navigate(step + 1)}>{saving ? "Enregistrement…" : step === 50 ? "Voir le résultat" : "Suivant"}</button></> : <><button type="button" disabled={saving} onClick={() => navigate(50)}>Précédent</button><button type="button" className="next" disabled={!editable} onClick={async () => { if (await persist(50, true)) setNotice("L'évaluation a été validée."); }}><Save size={17} />{saving ? "Validation…" : "Valider"}</button></>}
      </footer>}
    </section>
  </div>;
}