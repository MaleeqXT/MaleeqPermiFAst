import { useCallback, useEffect, useMemo, useState } from "react";
import livretApi from "../services/livretNumeriqueApi.js";
import { canCreateLesson, pageItems, retryableStatuses, statusLabel } from "./livretPresentation.js";
import "./LivretNumeriquePage.css";

const emptyContract = { studentId: "", requestNumber: "", registrationDate: "", trainingType: "", permitCategory: "", vehicleType: "", evaluatedHours: "" };
const emptyLesson = { studentId: "", trainingContractId: "", lessonDate: "", startedAt: "", endedAt: "", durationMinutes: "30", lessonType: "circulation", permitCategory: "", vehicleType: "", trainerId: "", providerTrainerId: "", trainerAuthorization: "", simulatorId: "", providerSimulatorId: "", simulatorReference: "", departmentCode: "", localSessionReference: "" };

function Field({ label, value, onChange, type = "text", required = false, ...props }) {
  return <label>{label}<input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} {...props} /></label>;
}

export default function LivretNumeriquePage() {
  const [status, setStatus] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [contract, setContract] = useState(emptyContract);
  const [lesson, setLesson] = useState(emptyLesson);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sync, contractList, lessonList] = await Promise.all([livretApi.status(), livretApi.contracts(), livretApi.lessons()]);
      setStatus(sync.data?.data ?? sync.data);
      setContracts(pageItems(contractList.data));
      setLessons(pageItems(lessonList.data));
      setMessage("");
    } catch (error) { setMessage(error.response?.data?.message || "Impossible de charger le Livret Numérique."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const contractById = useMemo(() => Object.fromEntries(contracts.map((item) => [item.id, item])), [contracts]);
  const updateContract = (key) => (value) => setContract((current) => ({ ...current, [key]: value }));
  const updateLesson = (key) => (value) => setLesson((current) => ({ ...current, [key]: value }));
  const submit = async (event, operation, reset) => {
    event.preventDefault();
    try { await operation(); reset(); setMessage("Enregistré. La synchronisation est prise en charge par Laravel."); await load(); }
    catch (error) { setMessage(error.response?.data?.message || "La validation a échoué."); }
  };
  const retry = async (operation) => { try { await operation(); await load(); } catch (error) { setMessage(error.response?.data?.message || "La relance a échoué."); } };

  return <main className="livret-page">
    <header><div><p className="livret-eyebrow">RdvPermis</p><h1>Livret Numérique</h1><p>Contrats, leçons et suivi de synchronisation.</p></div><button type="button" onClick={load} disabled={loading}>Actualiser</button></header>
    <div className="livret-warning" role="status">Le schéma fournisseur Livret n’est pas encore vérifié dans Swagger. Les dossiers restent locaux et les tentatives sont marquées « À corriger » sans appel provider spéculatif.</div>
    {message && <p className="livret-message">{message}</p>}
    <section className="livret-cards" aria-label="État des synchronisations">
      {["contracts", "lessons"].map((kind) => <article key={kind}><h2>{kind === "contracts" ? "Contrats" : "Leçons"}</h2><dl>{Object.entries(status?.[kind] || {}).map(([key, value]) => <div key={key}><dt>{statusLabel(key)}</dt><dd>{value}</dd></div>)}</dl></article>)}
    </section>
    <section className="livret-grid">
      <form className="livret-panel" onSubmit={(event) => submit(event, () => livretApi.createContract({ ...contract, evaluatedHours: Number(contract.evaluatedHours) }), () => setContract(emptyContract))}>
        <h2>Nouveau contrat</h2><Field label="ID élève" value={contract.studentId} onChange={updateContract("studentId")} required /><Field label="NEPH / numéro de demande" value={contract.requestNumber} onChange={updateContract("requestNumber")} required /><Field label="Date d'inscription" type="date" value={contract.registrationDate} onChange={updateContract("registrationDate")} required /><Field label="Type de formation" value={contract.trainingType} onChange={updateContract("trainingType")} required /><Field label="Catégorie permis" value={contract.permitCategory} onChange={updateContract("permitCategory")} required /><Field label="Type de véhicule" value={contract.vehicleType} onChange={updateContract("vehicleType")} required /><Field label="Heures évaluées" type="number" min="0" value={contract.evaluatedHours} onChange={updateContract("evaluatedHours")} required /><button>Créer le contrat local</button>
      </form>
      <form className="livret-panel" onSubmit={(event) => submit(event, () => livretApi.createLesson({ ...lesson, durationMinutes: Number(lesson.durationMinutes) }), () => setLesson(emptyLesson))}>
        <h2>Nouvelle leçon terminée</h2><Field label="ID élève" value={lesson.studentId} onChange={updateLesson("studentId")} required /><label>Contrat <select value={lesson.trainingContractId} required onChange={(e) => { const selected = contractById[e.target.value]; setLesson((current) => ({ ...current, trainingContractId: e.target.value, studentId: selected?.student_id || current.studentId, permitCategory: selected?.permit_category || current.permitCategory, vehicleType: selected?.vehicle_type || current.vehicleType })); }}><option value="">Choisir un contrat synchronisé</option>{contracts.filter((item) => item.sync_status === "synced").map((item) => <option value={item.id} key={item.id}>{item.request_number} — {item.permit_category}</option>)}</select></label><label>Type <select value={lesson.lessonType} onChange={(e) => updateLesson("lessonType")(e.target.value)}>{["circulation", "plateau", "simulator", "theoretical"].map((type) => <option key={type}>{type}</option>)}</select></label><Field label="Date" type="date" value={lesson.lessonDate} onChange={updateLesson("lessonDate")} required /><Field label="Début" type="datetime-local" value={lesson.startedAt} onChange={updateLesson("startedAt")} required /><Field label="Fin" type="datetime-local" value={lesson.endedAt} onChange={updateLesson("endedAt")} required /><Field label="Durée (minutes)" type="number" min="30" max="240" value={lesson.durationMinutes} onChange={updateLesson("durationMinutes")} required /><Field label="Catégorie" value={lesson.permitCategory} onChange={updateLesson("permitCategory")} required /><Field label="Véhicule" value={lesson.vehicleType} onChange={updateLesson("vehicleType")} required />
        {lesson.lessonType === "simulator" ? <><Field label="ID simulateur local" value={lesson.simulatorId} onChange={updateLesson("simulatorId")} required /><Field label="ID simulateur fournisseur" value={lesson.providerSimulatorId} onChange={updateLesson("providerSimulatorId")} required /></> : <><Field label="ID formateur local" value={lesson.trainerId} onChange={updateLesson("trainerId")} required /><Field label="ID formateur fournisseur" value={lesson.providerTrainerId} onChange={updateLesson("providerTrainerId")} required /><Field label="Autorisation d'enseigner" value={lesson.trainerAuthorization} onChange={updateLesson("trainerAuthorization")} required />{["circulation", "plateau"].includes(lesson.lessonType) && <Field label="Département" value={lesson.departmentCode} onChange={updateLesson("departmentCode")} required />}</>}<Field label="Référence de séance locale" value={lesson.localSessionReference} onChange={updateLesson("localSessionReference")} /><button disabled={!canCreateLesson(contractById[lesson.trainingContractId], lesson)}>Créer la leçon locale</button>
      </form>
    </section>
    <section className="livret-panel livret-table"><h2>Contrats</h2><table><thead><tr><th>Demande</th><th>Permis</th><th>Véhicule</th><th>État</th><th /></tr></thead><tbody>{contracts.map((item) => <tr key={item.id}><td>{item.request_number}</td><td>{item.permit_category}</td><td>{item.vehicle_type}</td><td><span className={`livret-badge ${item.sync_status}`}>{statusLabel(item.sync_status)}</span>{item.provider_error_message && <small>{item.provider_error_message}</small>}</td><td>{retryableStatuses.has(item.sync_status) && <button type="button" onClick={() => retry(() => livretApi.retryContract(item.id))}>Relancer</button>}</td></tr>)}{!contracts.length && <tr><td colSpan="5">Aucun contrat Livret.</td></tr>}</tbody></table></section>
    <section className="livret-panel livret-table"><h2>Leçons</h2><table><thead><tr><th>Date</th><th>Type</th><th>Durée</th><th>État</th><th /></tr></thead><tbody>{lessons.map((item) => <tr key={item.id}><td>{item.lesson_date}</td><td>{item.lesson_type}</td><td>{item.duration_minutes} min</td><td><span className={`livret-badge ${item.sync_status}`}>{statusLabel(item.sync_status)}</span>{item.provider_error_message && <small>{item.provider_error_message}</small>}</td><td>{retryableStatuses.has(item.sync_status) && <button type="button" onClick={() => retry(() => livretApi.retryLesson(item.id))}>Relancer</button>}</td></tr>)}{!lessons.length && <tr><td colSpan="5">Aucune leçon Livret.</td></tr>}</tbody></table></section>
  </main>;
}
