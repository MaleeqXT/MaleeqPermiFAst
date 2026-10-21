import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import rdvPermisApi from "../services/rdvPermisApi.js";
import PanierValidationResult from "./PanierValidationResult.jsx";
import { assertPanierWritable, isPanierExpired, validationMessage, validationResult as readValidationResult } from "./validationResult.js";
import {
  eligibilityPayload,
  getSlotId,
  isSelectedSlot,
  normalizePlanningSlots,
  slotDateTime,
} from "./slotSelection.js";
import "./RdvPermisPage.css";

const STEPS = ["Centre", "Créneau", "Créer le panier", "Ajouter le créneau", "Éligibilité", "Affecter", "Valider", "Confirmation"];
const today = new Date().toISOString().slice(0, 10);

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? null;
}

function asList(value, keys = []) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [];
}

function itemId(item) {
  if (!item || typeof item !== "object") return "";
  return String(item.id ?? item.centreId ?? item.creneauId ?? item.candidatId ?? item.panierId ?? item.uuid ?? "");
}

function itemTitle(item, fallback) {
  if (!item || typeof item !== "object") return fallback;
  const label = item.nom ?? item.libelle ?? item.name ?? item.intitule ?? item.code ?? item.numeroDossier;
  return String(label ?? (itemId(item) || fallback));
}

function nestedItem(item, keys) {
  for (const key of keys) {
    if (item?.[key] && typeof item[key] === "object") return item[key];
  }
  return item && typeof item === "object" ? item : {};
}

function studentProfile(item) {
  const student = nestedItem(item, ["student", "eleve"]);
  const user = nestedItem(item?.user ?? student.user, ["user"]);
  const firstName = item?.first_name ?? item?.firstName ?? user.first_name ?? user.firstName ?? student.first_name ?? student.firstName ?? "";
  const lastName = item?.last_name ?? item?.lastName ?? user.last_name ?? user.lastName ?? student.last_name ?? student.lastName ?? "";
  const neph = item?.neph ?? student.neph ?? user.neph ?? "";
  const email = item?.email ?? user.email ?? student.email ?? "";
  const id = student.id ?? item?.student_id ?? item?.id ?? "";

  return { id: String(id ?? ""), firstName, lastName, neph, email };
}

function panierSlots(value) {
  const panierData = nestedItem(value, ["panier"]);
  return asList(panierData, ["elementsDuPanier", "creneaux", "slots", "items", "data"]);
}

function panierSlotId(slot) {
  return String(slot?.creneauId ?? slot?.creneau?.id ?? slot?.id ?? "");
}

function panierSlotCandidateId(slot) {
  return String(slot?.candidatId ?? slot?.candidat?.id ?? "");
}

function candidateId(candidate) {
  return String(candidate?.candidat?.id ?? candidate?.candidatId ?? candidate?.id ?? "");
}

function expirationText(value, now) {
  const expiresAt = value?.dateHeureExpiration ?? value?.expiresAt ?? value?.expiration;
  const timestamp = Date.parse(expiresAt ?? "");
  if (!Number.isFinite(timestamp)) return "Expiration non communiquée par RdvPermis";
  const remaining = timestamp - now;
  if (remaining <= 0) return "Expiré — actualisez le panier avant toute action";
  const totalMinutes = Math.ceil(remaining / 60000);
  return `Expire dans ${Math.floor(totalMinutes / 60)} h ${totalMinutes % 60} min`;
}

function statusLabel(status) {
  return {
    connected: "Connecté",
    reconnect_required: "Reconnexion requise",
    connection_unverified: "Connexion à vérifier",
    not_connected: "Non connecté",
  }[status] ?? "État inconnu";
}

function errorMessage(error) {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;
  const messages = {
    401: "Votre session ou votre connexion RdvPermis doit être renouvelée.",
    403: "Vous n’êtes pas autorisé à utiliser cette fonction RdvPermis.",
    409: "RdvPermis a signalé un conflit. Actualisez les données avant de recommencer.",
    422: "RdvPermis a refusé les informations fournies. Vérifiez les champs et l’éligibilité.",
    429: "Trop de demandes vers RdvPermis. Attendez avant de réessayer.",
    502: "RdvPermis a rencontré une erreur temporaire.",
    503: "Le service RdvPermis est temporairement indisponible.",
  };
  return serverMessage || messages[status] || "La demande n’a pas pu être traitée. Réessayez plus tard.";
}

function Field({ label, children, hint }) {
  return <label className="rdv-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function EmptyState({ children = "Aucun résultat. Une réponse [] est valide." }) {
  return <p className="rdv-empty">{children}</p>;
}

function ErrorNotice({ children }) {
  return children ? <div className="rdv-error" role="alert">{children}</div> : null;
}

function JsonDetails({ value }) {
  if (!value || typeof value !== "object") return <EmptyState />;
  const entries = Object.entries(value);
  return entries.length ? (
    <dl className="rdv-details">
      {entries.map(([key, current]) => <div key={key}><dt>{key}</dt><dd>{current !== null && typeof current === "object" ? <pre className="rdv-json-value">{JSON.stringify(current, null, 2)}</pre> : String(current ?? "—")}</dd></div>)}
    </dl>
  ) : <EmptyState />;
}

function ConfirmationDialog({ action, onCancel, onConfirm, busy }) {
  if (!action) return null;
  return (
    <div className="rdv-modal-overlay" role="presentation">
      <section className="rdv-modal" role="dialog" aria-modal="true" aria-labelledby="rdv-confirm-title">
        <h2 id="rdv-confirm-title">Confirmer l’action</h2>
        <p>{action.description}</p>
        <p className="rdv-modal-warning">Cette action peut modifier les données dans RdvPermis. Elle ne sera envoyée qu’après votre confirmation.</p>
        <div className="rdv-modal-actions">
          <button type="button" className="rdv-button rdv-button--secondary" onClick={onCancel} disabled={busy}>Annuler</button>
          <button type="button" className="rdv-button rdv-button--danger" onClick={onConfirm} disabled={busy}>
            {busy ? "En cours…" : "Confirmer"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function RdvPermisPage() {
  const [status, setStatus] = useState(null);
  const [school, setSchool] = useState(null);
  const [employees, setEmployees] = useState(null);
  const [centreSearch, setCentreSearch] = useState({ codeDepartement: "", groupePermis: "B", estFerme: false });
  const [centres, setCentres] = useState(null);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [centreDetail, setCentreDetail] = useState(null);
  const [planning, setPlanning] = useState(null);
  const [planningDate, setPlanningDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [candidateSearch, setCandidateSearch] = useState({ nom: "", numeroDossier: "", match: "PARTIAL" });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [exams, setExams] = useState(null);
  const [examFilter, setExamFilter] = useState({ groupePermis: "B", date: today });
  const [localStudents, setLocalStudents] = useState(null);
  const [localStudentId, setLocalStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [mandates, setMandates] = useState(null);
  const [panier, setPanier] = useState(null);
  const [paniers, setPaniers] = useState(null);
  const [panierDetail, setPanierDetail] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetail, setExamDetail] = useState(null);
  const [permutableExams, setPermutableExams] = useState(null);
  const [replacementAllowance, setReplacementAllowance] = useState(null);
  const [clock, setClock] = useState(() => Date.now());
  const [workflowStep, setWorkflowStep] = useState(0);
  const [callbackResult] = useState(() => (
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("rdvpermis")
  ));
  const [notice, setNotice] = useState(() => (
    callbackResult === "connected" ? "La connexion RdvPermis a été finalisée. Vérifiez maintenant le statut et l’auto-école." : ""
  ));
  const [error, setError] = useState(() => (
    callbackResult === "error" ? "La connexion RdvPermis n’a pas pu être finalisée. Réessayez depuis ce tableau de bord." : ""
  ));
  const [loading, setLoading] = useState({ status: true });
  const [confirmation, setConfirmation] = useState(null);
  const [mutating, setMutating] = useState(false);
  const connectionStarting = useRef(false);
  const mutationInFlight = useRef(false);

  const centreItems = useMemo(() => asList(centres, ["centres", "items", "content", "data"]), [centres]);
  const slotItems = useMemo(() => normalizePlanningSlots(planning), [planning]);
  const eligibleCandidates = useMemo(() => asList(eligibility, ["candidats", "items", "content", "data"]), [eligibility]);
  const examItems = useMemo(() => asList(exams, ["examens", "items", "content", "data"]), [exams]);
  const studentItems = useMemo(() => asList(localStudents, ["data", "students", "items"]), [localStudents]);
  const studentProfiles = useMemo(() => studentItems.map(studentProfile), [studentItems]);
  const selectedStudent = useMemo(
    () => studentProfiles.find((student) => student.id === localStudentId) ?? null,
    [localStudentId, studentProfiles],
  );
  const matchingStudents = useMemo(() => {
    const query = studentSearch.trim().toLocaleLowerCase();
    if (!query) return studentProfiles;

    return studentProfiles.filter((student) => [
      student.firstName,
      student.lastName,
      `${student.firstName} ${student.lastName}`,
      student.email,
      student.neph,
    ].some((value) => String(value ?? "").toLocaleLowerCase().includes(query)));
  }, [studentProfiles, studentSearch]);
  const visibleStudents = useMemo(() => {
    if (!selectedStudent || matchingStudents.some((student) => student.id === selectedStudent.id)) return matchingStudents;
    return [selectedStudent, ...matchingStudents];
  }, [matchingStudents, selectedStudent]);
  const basketId = itemId(panier);
  const selectedSlotId = useMemo(() => getSlotId(selectedSlot), [selectedSlot]);
  const basketExpired = isPanierExpired(panierDetail ?? panier, clock);
  const bookingLocked = basketExpired || Boolean(validationResult);

  useEffect(() => {
    if (!basketId && paniers === null) return undefined;
    const interval = window.setInterval(() => setClock(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, [basketId, paniers]);

  useEffect(() => {
    if (import.meta.env.DEV && selectedSlotId) {
      console.debug("Selected RdvPermis slot ID:", selectedSlotId);
    }
  }, [selectedSlotId]);

  const runRead = useCallback(async (key, operation, onSuccess) => {
    setLoading((current) => ({ ...current, [key]: true }));
    setError("");
    try {
      const response = await operation();
      onSuccess(unwrap(response));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading((current) => ({ ...current, [key]: false }));
    }
  }, []);

  const refreshStatus = useCallback(() => runRead("status", rdvPermisApi.status, setStatus), [runRead]);

  useEffect(() => {
    let active = true;

    rdvPermisApi.status()
      .then((response) => {
        if (active) setStatus(unwrap(response));
      })
      .catch((requestError) => {
        if (active) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading((current) => ({ ...current, status: false }));
      });

    if (callbackResult && typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      active = false;
    };
  }, [callbackResult]);

  const startConnection = async () => {
    if (connectionStarting.current) return;
    connectionStarting.current = true;
    setLoading((current) => ({ ...current, connect: true }));
    setError("");
    try {
      const response = await rdvPermisApi.connect();
      const authorizationUrl = unwrap(response)?.authorization_url;
      if (!/^https:\/\//i.test(String(authorizationUrl ?? ""))) throw new Error("invalid_authorization_url");
      window.location.assign(authorizationUrl);
    } catch (requestError) {
      setError(errorMessage(requestError));
      setLoading((current) => ({ ...current, connect: false }));
      connectionStarting.current = false;
    }
  };

  const searchCentres = (event) => {
    event.preventDefault();
    runRead("centres", () => rdvPermisApi.searchCentres({
      ...centreSearch,
      estFerme: Boolean(centreSearch.estFerme),
    }), (data) => {
      setCentres(data);
      setSelectedCentre(null);
      setCentreDetail(null);
      setPlanning(null);
      setSelectedSlot(null);
      setEligibility(null);
      setSelectedCandidate(null);
      setWorkflowStep(0);
      setError("");
    });
  };

  const selectCentre = (centre) => {
    setSelectedCentre(centre);
    setCentreDetail(null);
    setPlanning(null);
    setSelectedSlot(null);
    setEligibility(null);
    setSelectedCandidate(null);
    setWorkflowStep(1);
    setError("");
  };

  const loadCentreDetail = () => {
    const centreId = itemId(selectedCentre);
    if (!centreId) return;
    runRead("centreDetail", () => rdvPermisApi.centreDetails(centreId), setCentreDetail);
  };

  const searchPlanning = (event) => {
    event.preventDefault();
    const centreId = itemId(selectedCentre);
    if (!centreId) {
      setError("Sélectionnez d’abord un centre.");
      return;
    }
    setSelectedSlot(null);
    setEligibility(null);
    setSelectedCandidate(null);
    setWorkflowStep(1);
    setError("");
    runRead("planning", () => rdvPermisApi.searchPlanning({
      groupePermis: centreSearch.groupePermis,
      date: planningDate,
      centreId,
    }), (data) => {
      setPlanning(data);
    });
  };

  const selectSlot = (slot) => {
    setSelectedSlot(slot);
    setEligibility(null);
    setSelectedCandidate(null);
    setWorkflowStep(2);
  };

  const searchEligibility = (event) => {
    event.preventDefault();
    const payload = eligibilityPayload(selectedSlot);
    if (!payload || !selectedSlotId) {
      setError("Veuillez sélectionner un créneau valide.");
      return;
    }
    const filtre = { ...payload.filtre };
    if (candidateSearch.nom.trim()) filtre.nom = { query: candidateSearch.nom.trim(), match: candidateSearch.match };
    if (candidateSearch.numeroDossier.trim()) filtre.numeroDossier = { query: candidateSearch.numeroDossier.trim(), match: candidateSearch.match };
    runRead("eligibility", () => rdvPermisApi.searchEligibleCandidates({ filtre }), (data) => {
      setEligibility(data);
      setSelectedCandidate(null);
      setWorkflowStep(Math.max(workflowStep, 4));
    });
  };

  const searchExams = (event) => {
    event.preventDefault();
    runRead("exams", () => rdvPermisApi.listExams(examFilter), setExams);
  };

  const loadStudents = () => runRead("students", rdvPermisApi.listAllLocalStudents, setLocalStudents);

  const searchMandatesForSelectedStudent = () => {
    if (!selectedStudent?.neph) {
      setError("Le NEPH de l’élève est requis pour rechercher ses mandats.");
      return;
    }
    runRead("mandates", () => rdvPermisApi.searchMandatedCandidates({
      filtre: {
        groupePermis: "B",
        numeroDossier: { query: selectedStudent.neph, match: "EXACT" },
      },
      page: 1,
      parPage: 25,
    }), setMandates);
  };

  const loadPaniers = () => runRead("paniers", rdvPermisApi.listPaniers, setPaniers);

  const loadPanierDetail = (panierId = basketId) => {
    if (!panierId) return;
    return runRead("panierDetail", () => rdvPermisApi.panierDetails(panierId), (data) => {
      setPanierDetail(data);
      if (itemId(data)) setPanier(data);
    });
  };

  const loadExamDetail = (exam) => {
    const examId = itemId(exam);
    if (!examId) return;
    setSelectedExam(exam);
    setPermutableExams(null);
    setReplacementAllowance(null);
    return runRead("examDetail", () => rdvPermisApi.examDetails(examId), setExamDetail);
  };

  const loadExamSupport = (exam = selectedExam) => {
    const examId = itemId(exam);
    if (!examId) {
      setError("Sélectionnez un examen programmé.");
      return;
    }
    const date = exam?.date ?? exam?.dateHeure?.slice?.(0, 10) ?? examFilter.date;
    setSelectedExam(exam);
    return Promise.all([
      runRead("permutables", () => rdvPermisApi.permutableExams({ examenPermuteId: examId, date }), setPermutableExams),
      runRead("replacementAllowance", () => rdvPermisApi.replacementAllowance({ groupePermis: examFilter.groupePermis, date }), setReplacementAllowance),
    ]);
  };

  const requestMutation = (kind, description, execute) => {
    if (mutationInFlight.current) return;
    setError("");
    setNotice("");
    setConfirmation({ kind, description, execute });
  };

  const assertActivePanier = () => assertPanierWritable(panierDetail ?? panier, validationResult);

  const confirmMutation = async () => {
    if (!confirmation || mutationInFlight.current) return;
    mutationInFlight.current = true;
    setMutating(true);
    setError("");
    try {
      const result = await confirmation.execute();
      setNotice(result?.notice ?? "L’action a été transmise à RdvPermis.");
      setConfirmation(null);
    } catch (requestError) {
      setError(errorMessage(requestError));
      setConfirmation(null);
    } finally {
      setMutating(false);
      mutationInFlight.current = false;
    }
  };

  const createPanier = () => requestMutation(
    "create-panier",
    "Créer un nouveau panier RdvPermis pour le créneau sélectionné.",
    async () => {
      const response = await rdvPermisApi.createPanier();
      const data = unwrap(response);
      const id = itemId(data) || String(response.headers?.location ?? "").split("/").filter(Boolean).at(-1);
      if (!id) throw new Error("missing_panier_identifier");
      setPanier({ ...(data && typeof data === "object" ? data : {}), id });
      setPanierDetail(data && typeof data === "object" ? data : { id });
      setValidationResult(null);
      setWorkflowStep(3);
      return { notice: "Le panier a été créé. Ajoutez maintenant le créneau sélectionné." };
    },
  );

  const addSlotToPanier = () => {
    const creneauId = selectedSlotId;
    if (!basketId || !creneauId) {
      setError("Un panier et un créneau sélectionné sont nécessaires.");
      return;
    }
    requestMutation("add-slot", "Ajouter le créneau sélectionné au panier actif.", async () => {
      assertActivePanier();
      const response = await rdvPermisApi.addPanierSlot(basketId, { creneauId });
      const data = unwrap(response);
      setPanier((current) => ({ ...(current ?? {}), ...((data && typeof data === "object") ? data : {}) }));
      setPanierDetail((current) => ({ ...(current ?? {}), ...((data && typeof data === "object") ? data : {}) }));
      setWorkflowStep(4);
      return { notice: "Le créneau a été ajouté au panier. Vérifiez l’éligibilité avant d’affecter le candidat." };
    });
  };

  const assignCandidate = () => {
    const creneauId = selectedSlotId;
    const candidatId = candidateId(selectedCandidate);
    if (!basketId || !creneauId || !candidatId || selectedCandidate?.eligibilite?.estEligible !== true) {
      setError("Un panier, un créneau et un candidat éligible sont nécessaires.");
      return;
    }
    requestMutation("assign-candidate", "Affecter ce candidat éligible au créneau du panier.", async () => {
      assertActivePanier();
      await rdvPermisApi.assignPanierCandidate(basketId, creneauId, { candidatId });
      setWorkflowStep(6);
      return { notice: "Le candidat éligible a été affecté au créneau du panier." };
    });
  };

  const validatePanier = () => {
    if (!basketId) {
      setError("Créez d’abord un panier.");
      return;
    }
    requestMutation("validate-panier", "Valider ce panier. La réservation deviendra définitive selon la réponse de RdvPermis.", async () => {
      assertActivePanier();
      const response = await rdvPermisApi.validatePanier(basketId);
      const result = readValidationResult(response);
      setValidationResult(result);
      setWorkflowStep(7);
      if (result.confirmed) {
        // A validated basket can be consumed by the provider. Do not follow a
        // successful validation with a basket GET that can legitimately 404.
        setPanier(null);
        setPanierDetail(null);
        setSelectedCandidate(null);
        setEligibility(null);
        setSelectedSlot(null);
        setPaniers((current) => asList(current, ["paniers", "items", "data"]).filter((entry) => itemId(entry) !== basketId));
      }
      await runRead("exams", () => rdvPermisApi.listExams(examFilter), setExams);
      return { notice: validationMessage(result) };
    });
  };

  const createMandate = () => {
    if (!localStudentId) {
      setError("Sélectionnez un élève local avant de créer un mandat.");
      return;
    }
    requestMutation("create-mandate", `Créer un mandat RdvPermis pour ${selectedStudent?.firstName ?? ""} ${selectedStudent?.lastName ?? ""}.`, async () => {
      await rdvPermisApi.createMandate(localStudentId);
      return { notice: "Le mandat a été transmis à RdvPermis. Actualisez la recherche de candidats mandatés pour le vérifier." };
    });
  };

  const deletePanier = (panierId) => requestMutation(
    "delete-panier",
    "Supprimer ce panier RdvPermis. Cette action est irréversible pour ce panier.",
    async () => {
      await rdvPermisApi.deletePanier(panierId);
      if (panierId === basketId) {
        setPanier(null);
        setPanierDetail(null);
        setValidationResult(null);
        setWorkflowStep(2);
      }
      setPaniers((current) => asList(current, ["paniers", "items", "data"]).filter((entry) => itemId(entry) !== panierId));
      return { notice: "Le panier a été supprimé." };
    },
  );

  const removePanierSlot = (panierId, creneauId) => requestMutation(
    "remove-panier-slot",
    "Retirer ce créneau du panier. Il ne sera plus réservé par ce panier.",
    async () => {
      await rdvPermisApi.removePanierSlot(panierId, creneauId);
      if (panierId === basketId && creneauId === selectedSlotId) {
        setSelectedSlot(null);
        setSelectedCandidate(null);
        setEligibility(null);
        setWorkflowStep(1);
      }
      await loadPanierDetail(panierId);
      return { notice: "Le créneau a été retiré du panier." };
    },
  );

  const unassignPanierCandidate = (panierId, creneauId) => requestMutation(
    "unassign-panier-candidate",
    "Retirer le candidat affecté à ce créneau du panier.",
    async () => {
      await rdvPermisApi.assignPanierCandidate(panierId, creneauId, { candidatId: null });
      if (panierId === basketId && creneauId === selectedSlotId) {
        setSelectedCandidate(null);
        setWorkflowStep(4);
      }
      await loadPanierDetail(panierId);
      return { notice: "Le candidat a été retiré du créneau du panier." };
    },
  );

  const cancelExam = (exam) => {
    const examId = itemId(exam);
    if (!examId) return;
    requestMutation("cancel-exam", "Annuler cet examen auprès de RdvPermis.", async () => {
      await rdvPermisApi.cancelExam(examId);
      setExams((current) => asList(current, ["examens", "items", "content", "data"]).filter((entry) => itemId(entry) !== examId));
      setSelectedExam(null);
      setExamDetail(null);
      setPermutableExams(null);
      setReplacementAllowance(null);
      return { notice: "L’annulation de l’examen a été transmise à RdvPermis." };
    });
  };

  const replaceExamCandidate = (candidateId) => {
    const examId = itemId(selectedExam);
    if (!examId || !candidateId) return;
    requestMutation("replace-exam", "Remplacer le candidat de cet examen. Vérifiez les données avant de confirmer.", async () => {
      await rdvPermisApi.replaceExamCandidate({ examenId: examId, candidatRemplacantId: candidateId });
      await Promise.all([
        loadExamDetail(selectedExam),
        runRead("exams", () => rdvPermisApi.listExams(examFilter), setExams),
        loadExamSupport(selectedExam),
      ]);
      return { notice: "Le remplacement a été transmis à RdvPermis." };
    });
  };

  const permuteExam = (otherExam) => {
    const examId1 = itemId(selectedExam);
    const examId2 = itemId(otherExam);
    if (!examId1 || !examId2 || examId1 === examId2) return;
    requestMutation("permute-exams", `Permuter les examens ${examId1} et ${examId2} auprès de RdvPermis. Cette action peut modifier les deux affectations.`, async () => {
      await rdvPermisApi.permuteExams({ examenId1: examId1, examenId2: examId2 });
      await Promise.all([
        loadExamDetail(selectedExam),
        runRead("exams", () => rdvPermisApi.listExams(examFilter), setExams),
        loadExamSupport(selectedExam),
      ]);
      return { notice: "La permutation a été transmise à RdvPermis." };
    });
  };

  const statusData = status && typeof status === "object" ? status : null;
  const isConnected = Boolean(statusData?.connected);

  return (
    <div className="rdv-page">
      <div className="rdv-page-heading">
        <div>
          <p className="rdv-eyebrow">RdvPermis</p>
          <h1>Gestion des examens</h1>
          <p>Recherchez les centres, créneaux et candidats depuis PermiFast. Les identifiants RdvPermis restent côté serveur.</p>
        </div>
        <button type="button" className="rdv-button rdv-button--primary" onClick={startConnection} disabled={loading.connect}>
          {loading.connect ? "Redirection…" : isConnected ? "Reconnecter RdvPermis" : "Connecter RdvPermis"}
        </button>
      </div>

      {notice && <div className="rdv-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Fermer">×</button></div>}
      <ErrorNotice>{error}</ErrorNotice>

      <section className="rdv-card rdv-connection-card">
        <div className="rdv-card-heading">
          <div><h2>Connexion</h2><p>État local de la connexion OAuth RdvPermis.</p></div>
          <button type="button" className="rdv-text-button" onClick={refreshStatus} disabled={loading.status}>{loading.status ? "Actualisation…" : "Actualiser"}</button>
        </div>
        {loading.status && !statusData ? <div className="rdv-loading">Chargement du statut…</div> : statusData ? (
          <div className="rdv-status-grid">
            <div><span>Statut</span><strong className={`rdv-status rdv-status--${statusData.status}`}>{statusLabel(statusData.status)}</strong></div>
            <div><span>Environnement</span><strong>{statusData.environment ?? "—"}</strong></div>
            <div><span>Configuration</span><strong>{statusData.configured ? "Complète" : "À compléter"}</strong></div>
            <div><span>Expiration</span><strong>{statusData.expires_at ? new Date(statusData.expires_at).toLocaleString("fr-FR") : "—"}</strong></div>
          </div>
        ) : <EmptyState>Le statut n’est pas encore disponible.</EmptyState>}
        {statusData?.last_error && <p className="rdv-helper">{statusData.last_error}</p>}
      </section>

      <section className="rdv-card">
        <div className="rdv-card-heading"><div><h2>Auto-école actuelle</h2><p>Vérification en lecture seule auprès de RdvPermis.</p></div><button type="button" className="rdv-button rdv-button--secondary" onClick={() => runRead("school", rdvPermisApi.currentSchool, setSchool)} disabled={loading.school}>{loading.school ? "Chargement…" : "Charger l’auto-école"}</button></div>
        {school ? <JsonDetails value={school} /> : <EmptyState>Chargez les informations de l’auto-école pour les afficher ici.</EmptyState>}
      </section>

      <section className="rdv-card">
        <div className="rdv-card-heading"><div><h2>Employés de l’auto-école</h2><p>Lecture seule des employés retournés par le contrat v2 actuellement vérifié.</p></div><button type="button" className="rdv-button rdv-button--secondary" onClick={() => runRead("employees", rdvPermisApi.employees, setEmployees)} disabled={loading.employees}>{loading.employees ? "Chargement…" : "Charger les employés"}</button></div>
        {employees !== null && (asList(employees, ["employes", "employees", "items", "data"]).length ? <div className="rdv-result-list">{asList(employees, ["employes", "employees", "items", "data"]).map((employee, index) => <article className="rdv-result-row" key={itemId(employee) || index}><div><strong>{itemTitle(employee, "Employé")}</strong><span>{employee.email ?? employee.role ?? itemId(employee)}</span></div></article>)}</div> : <EmptyState>Aucun employé retourné par RdvPermis.</EmptyState>)}
      </section>

      <section className="rdv-card">
        <div className="rdv-card-heading"><div><h2>Centres d’examen</h2><p>Choisissez un centre avant de rechercher les créneaux.</p></div></div>
        <form className="rdv-form-grid" onSubmit={searchCentres}>
          <Field label="Département"><input required inputMode="numeric" maxLength="3" value={centreSearch.codeDepartement} onChange={(event) => setCentreSearch((current) => ({ ...current, codeDepartement: event.target.value }))} placeholder="Ex. 75" /></Field>
          <Field label="Groupe de permis"><select value={centreSearch.groupePermis} onChange={(event) => setCentreSearch((current) => ({ ...current, groupePermis: event.target.value }))}><option value="A">A</option><option value="B">B</option><option value="CE">CE</option></select></Field>
          <label className="rdv-checkbox"><input type="checkbox" checked={centreSearch.estFerme} onChange={(event) => setCentreSearch((current) => ({ ...current, estFerme: event.target.checked }))} /> Inclure les centres fermés</label>
          <button className="rdv-button rdv-button--primary" disabled={loading.centres}>{loading.centres ? "Recherche…" : "Rechercher les centres"}</button>
        </form>
        {centres !== null && (centreItems.length ? <div className="rdv-result-list">{centreItems.map((centre, index) => { const selected = itemId(centre) === itemId(selectedCentre); return <article className={`rdv-result-row ${selected ? "is-selected" : ""}`} key={itemId(centre) || index}><div><strong>{itemTitle(centre, "Centre d’examen")}</strong><span>{centre.codeDepartement ?? centre.adresse ?? centre.ville ?? itemId(centre)}</span></div><button type="button" className="rdv-button rdv-button--secondary" onClick={() => selectCentre(centre)}>{selected ? "Sélectionné" : "Choisir"}</button></article>; })}</div> : <EmptyState />)}
        {selectedCentre && <div className="rdv-selection"><span>Centre choisi : <strong>{itemTitle(selectedCentre, "Centre")}</strong></span><button type="button" className="rdv-text-button" onClick={loadCentreDetail} disabled={loading.centreDetail}>{loading.centreDetail ? "Chargement…" : "Voir les détails"}</button></div>}
        {centreDetail && <JsonDetails value={centreDetail} />}
      </section>

      <section className="rdv-card">
        <div className="rdv-card-heading"><div><h2>Planning et créneaux disponibles</h2><p>Recherche en lecture seule pour le centre sélectionné.</p></div></div>
        <form className="rdv-form-grid" onSubmit={searchPlanning}>
          <Field label="Date"><input required type="date" value={planningDate} onChange={(event) => setPlanningDate(event.target.value)} /></Field>
          <div className="rdv-readonly-field"><span>Centre sélectionné</span><strong>{selectedCentre ? itemTitle(selectedCentre, "Centre") : "Aucun centre"}</strong></div>
          <div className="rdv-readonly-field"><span>Groupe</span><strong>{centreSearch.groupePermis}</strong></div>
          <button className="rdv-button rdv-button--primary" disabled={!selectedCentre || loading.planning}>{loading.planning ? "Recherche…" : "Rechercher les créneaux"}</button>
        </form>
        {planning !== null && (slotItems.length ? <div className="rdv-result-list">{slotItems.map((slot, index) => { const selected = isSelectedSlot(selectedSlot, slot); return <article className={`rdv-result-row ${selected ? "is-selected" : ""}`} key={getSlotId(slot) ?? index}><div><strong>{itemTitle(slot.creneauDuPlanning, "Créneau disponible")}</strong><span>{slotDateTime(slot) || getSlotId(slot)}</span></div><button type="button" className="rdv-button rdv-button--secondary" onClick={() => selectSlot(slot)}>{selected ? "Sélectionné" : "Choisir"}</button></article>; })}</div> : <EmptyState />)}
      </section>

      <section className="rdv-card">
        <div className="rdv-card-heading"><div><h2>Éligibilité des candidats</h2><p>La vérification porte toujours sur le créneau sélectionné.</p></div></div>
        <form className="rdv-form-grid rdv-form-grid--candidates" onSubmit={searchEligibility}>
          <Field label="Créneau"><input readOnly value={selectedSlotId ? `${slotDateTime(selectedSlot) || "Créneau"} — ${selectedSlotId}` : ""} placeholder="Sélectionnez un créneau" /></Field>
          <Field label="Nom (facultatif)"><input value={candidateSearch.nom} onChange={(event) => setCandidateSearch((current) => ({ ...current, nom: event.target.value }))} /></Field>
          <Field label="NEPH / numéro de dossier (facultatif)"><input value={candidateSearch.numeroDossier} onChange={(event) => setCandidateSearch((current) => ({ ...current, numeroDossier: event.target.value }))} /></Field>
          <Field label="Correspondance"><select value={candidateSearch.match} onChange={(event) => setCandidateSearch((current) => ({ ...current, match: event.target.value }))}><option value="PARTIAL">Partielle</option><option value="EXACT">Exacte</option></select></Field>
          <button className="rdv-button rdv-button--primary" disabled={!selectedSlotId || loading.eligibility}>{loading.eligibility ? "Vérification…" : "Vérifier l’éligibilité"}</button>
        </form>
        {eligibility !== null && (eligibleCandidates.length ? <div className="rdv-result-list">{eligibleCandidates.map((candidate, index) => {
          const id = candidateId(candidate);
          const selected = Boolean(id) && id === candidateId(selectedCandidate);
          const eligible = candidate?.eligibilite?.estEligible;
          return <article className={`rdv-result-row ${selected ? "is-selected" : ""}`} key={id || index}>
            <div><strong>{itemTitle(candidate?.candidat ?? candidate, "Candidat")}</strong><span>{eligible === true ? "Éligible" : eligible === false ? "Non éligible" : "Éligibilité à consulter"}</span></div>
            <button type="button" className="rdv-button rdv-button--secondary" disabled={!id || eligible !== true} onClick={() => { setSelectedCandidate(candidate); setWorkflowStep(5); }}>{selected ? "Sélectionné" : "Choisir"}</button>
          </article>;
        })}</div> : <EmptyState>Aucun candidat éligible pour ce créneau.</EmptyState>)}
      </section>

      <section className="rdv-card">
        <div className="rdv-card-heading"><div><h2>Examens programmés</h2><p>Liste en lecture seule des examens RdvPermis.</p></div></div>
        <form className="rdv-form-grid" onSubmit={searchExams}>
          <Field label="Groupe de permis"><select value={examFilter.groupePermis} onChange={(event) => setExamFilter((current) => ({ ...current, groupePermis: event.target.value }))}><option value="A">A</option><option value="B">B</option></select></Field>
          <Field label="Date"><input required type="date" value={examFilter.date} onChange={(event) => setExamFilter((current) => ({ ...current, date: event.target.value }))} /></Field>
          <button className="rdv-button rdv-button--primary" disabled={loading.exams}>{loading.exams ? "Chargement…" : "Lister les examens"}</button>
        </form>
        {exams !== null && (examItems.length ? <div className="rdv-result-list">{examItems.map((exam, index) => {
          const selected = itemId(exam) === itemId(selectedExam);
          return <article className={`rdv-result-row ${selected ? "is-selected" : ""}`} key={itemId(exam) || index}><div><strong>{itemTitle(exam, "Examen")}</strong><span>{exam.date ?? exam.dateHeure ?? exam.statut ?? itemId(exam)}</span></div><button type="button" className="rdv-button rdv-button--secondary" onClick={() => loadExamDetail(exam)}>{selected ? "Sélectionné" : "Voir le détail"}</button></article>;
        })}</div> : <EmptyState />)}
        {selectedExam && <div className="rdv-selection"><span>Examen choisi : <strong>{itemTitle(selectedExam, "Examen")}</strong></span><button type="button" className="rdv-text-button" onClick={() => loadExamSupport(selectedExam)} disabled={loading.permutables || loading.replacementAllowance}>{loading.permutables || loading.replacementAllowance ? "Chargement…" : "Voir les options"}</button></div>}
        {examDetail && <JsonDetails value={examDetail} />}
        {selectedExam && <div className="rdv-booking-actions"><button type="button" className="rdv-button rdv-button--danger" onClick={() => cancelExam(selectedExam)}>Annuler l’examen</button></div>}
        {(replacementAllowance || permutableExams !== null) && <div className="rdv-subsection">
          <h3>Remplacement et permutation</h3>
          {replacementAllowance && <JsonDetails value={replacementAllowance} />}
          {permutableExams !== null && (asList(permutableExams, ["examens", "items", "data"]).length ? <div className="rdv-result-list">{asList(permutableExams, ["examens", "items", "data"]).map((exam, index) => <article className="rdv-result-row" key={itemId(exam) || index}><div><strong>{itemTitle(exam, "Examen permutable")}</strong><span>{exam.date ?? exam.dateHeure ?? itemId(exam)}</span></div><button type="button" className="rdv-button rdv-button--secondary" onClick={() => permuteExam(exam)}>Permuter</button></article>)}</div> : <EmptyState>Aucun examen permutable pour cette date.</EmptyState>)}
          {selectedCandidate && <button type="button" className="rdv-button rdv-button--secondary" onClick={() => replaceExamCandidate(candidateId(selectedCandidate))}>Remplacer par le candidat sélectionné</button>}
        </div>}
      </section>

      <section className="rdv-card">
        <div className="rdv-card-heading"><div><h2>Mandat candidat</h2><p>Créez un mandat uniquement après avoir vérifié les informations de l’élève.</p></div><button type="button" className="rdv-button rdv-button--secondary" onClick={loadStudents} disabled={loading.students}>{loading.students ? "Chargement…" : "Charger les élèves"}</button></div>
        {localStudents !== null && <div className="rdv-mutation-panel"><Field label="Rechercher un élève"><input type="search" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Nom, prénom, email ou NEPH" /></Field><Field label="Élève local"><select value={localStudentId} onChange={(event) => { setLocalStudentId(event.target.value); setMandates(null); }}><option value="">Sélectionnez un élève</option>{visibleStudents.map((student, index) => <option key={student.id || index} value={student.id}>{student.firstName || "Élève"} {student.lastName}</option>)}</select></Field>{studentItems.length > 0 && <p className="rdv-empty">{matchingStudents.length} élève{matchingStudents.length === 1 ? "" : "s"} trouvé{matchingStudents.length === 1 ? "" : "s"}</p>}{studentItems.length > 0 && !matchingStudents.length && <EmptyState>Aucun élève trouvé</EmptyState>}<button type="button" className="rdv-button rdv-button--danger" onClick={createMandate} disabled={!selectedStudent?.id}>Créer le mandat</button></div>}
        {selectedStudent && <div className="rdv-student-preview" aria-live="polite"><strong>Informations qui seront envoyées après confirmation</strong><span>{selectedStudent.firstName} {selectedStudent.lastName || "—"}</span><span>NEPH : {selectedStudent.neph || "À compléter"}</span><span>Email : {selectedStudent.email || "Non renseigné"}</span><span>Groupe permis : B</span><button type="button" className="rdv-text-button" onClick={searchMandatesForSelectedStudent} disabled={!selectedStudent.neph || loading.mandates}>{loading.mandates ? "Vérification…" : "Vérifier les mandats existants"}</button></div>}
        {mandates !== null && (asList(mandates, ["candidats", "items", "content", "data"]).length ? <div className="rdv-result-list">{asList(mandates, ["candidats", "items", "content", "data"]).map((candidate, index) => <article className="rdv-result-row" key={itemId(candidate?.candidat ?? candidate) || index}><div><strong>{itemTitle(candidate?.candidat ?? candidate, "Candidat mandaté")}</strong><span>{candidate?.mandat?.groupePermis ?? candidate?.groupePermis ?? "Mandat trouvé"}</span></div></article>)}</div> : <EmptyState>Aucun mandat correspondant n’a été trouvé.</EmptyState>)}
        {localStudents !== null && !studentItems.length && <EmptyState>Aucun élève local actif n’est disponible.</EmptyState>}
      </section>

      <section className="rdv-card">
        <div className="rdv-card-heading"><div><h2>Paniers RdvPermis</h2><p>Consultez les paniers existants, leur expiration et les créneaux qu’ils contiennent.</p></div><button type="button" className="rdv-button rdv-button--secondary" onClick={loadPaniers} disabled={loading.paniers}>{loading.paniers ? "Chargement…" : "Lister les paniers"}</button></div>
        {paniers !== null && (asList(paniers, ["paniers", "items", "data"]).length ? <div className="rdv-result-list">{asList(paniers, ["paniers", "items", "data"]).map((entry, index) => <article className={`rdv-result-row ${itemId(entry) === basketId ? "is-selected" : ""}`} key={itemId(entry) || index}><div><strong>{itemId(entry) || "Panier"}</strong><span>{expirationText(entry, clock)}</span></div><div className="rdv-inline-actions"><button type="button" className="rdv-button rdv-button--secondary" onClick={() => loadPanierDetail(itemId(entry))}>Détail</button><button type="button" className="rdv-button rdv-button--danger" onClick={() => deletePanier(itemId(entry))}>Supprimer</button></div></article>)}</div> : <EmptyState>Aucun panier actif.</EmptyState>)}
        {panierDetail && <div className="rdv-subsection"><h3>Panier sélectionné</h3><p className="rdv-expiry">{expirationText(panierDetail, clock)}</p>{panierSlots(panierDetail).length ? <div className="rdv-result-list">{panierSlots(panierDetail).map((slot, index) => { const creneauId = panierSlotId(slot); const candidateId = panierSlotCandidateId(slot); return <article className="rdv-result-row" key={creneauId || index}><div><strong>{creneauId || "Créneau"}</strong><span>{candidateId ? `Candidat : ${candidateId}` : "Aucun candidat affecté"}</span></div><div className="rdv-inline-actions">{candidateId && <button type="button" className="rdv-button rdv-button--secondary" onClick={() => unassignPanierCandidate(basketId, creneauId)}>Retirer le candidat</button>}<button type="button" className="rdv-button rdv-button--danger" onClick={() => removePanierSlot(basketId, creneauId)}>Retirer le créneau</button></div></article>; })}</div> : <EmptyState>Ce panier ne contient aucun créneau.</EmptyState>}</div>}
      </section>

      <section className="rdv-card rdv-booking-card">
        <div className="rdv-card-heading"><div><h2>Réservation par panier</h2><p>Chaque action de réservation nécessite une confirmation explicite.</p></div></div>
        <ol className="rdv-stepper">{STEPS.map((step, index) => <li className={index < workflowStep ? "is-complete" : index === workflowStep ? "is-current" : ""} key={step}><span>{index + 1}</span>{step}</li>)}</ol>
        <div className="rdv-booking-summary">
          <div><span>Centre</span><strong>{selectedCentre ? itemTitle(selectedCentre, "Centre") : "À sélectionner"}</strong></div>
          <div><span>Créneau</span><strong>{selectedSlotId ? `${slotDateTime(selectedSlot) || "Créneau"} — ${selectedSlotId}` : "À sélectionner"}</strong></div>
          <div><span>Panier</span><strong>{basketId || "À créer"}</strong></div>
          <div><span>Candidat</span><strong>{selectedCandidate ? itemTitle(selectedCandidate, "Candidat") : "À sélectionner"}</strong></div>
        </div>
        <div className="rdv-booking-actions">
          <button type="button" className="rdv-button rdv-button--secondary" onClick={createPanier} disabled={!selectedSlotId || Boolean(basketId) || mutating}>Créer le panier</button>
          <button type="button" className="rdv-button rdv-button--secondary" onClick={addSlotToPanier} disabled={!basketId || !selectedSlotId || workflowStep > 3 || bookingLocked || mutating}>Ajouter le créneau</button>
          <button type="button" className="rdv-button rdv-button--secondary" onClick={assignCandidate} disabled={!basketId || !selectedSlotId || !selectedCandidate || workflowStep < 4 || bookingLocked || mutating}>Affecter le candidat</button>
          <button type="button" className="rdv-button rdv-button--danger" onClick={validatePanier} disabled={!basketId || !selectedCandidate || workflowStep < 6 || bookingLocked || mutating}>Valider le panier</button>
        </div>
        <PanierValidationResult result={validationResult} />
      </section>

      <ConfirmationDialog action={confirmation} busy={mutating} onCancel={() => !mutating && setConfirmation(null)} onConfirm={confirmMutation} />
    </div>
  );
}
