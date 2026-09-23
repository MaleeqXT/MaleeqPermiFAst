import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TabInfo.css";
import RapportDrawer from "./RapportDrawer";
import { fetchCandidateById, selectSelectedCandidate, selectSelectedCandidateLoading, clearSelectedCandidate } from "../../redux/reducers/candidateSlice";
import { fetchOffers } from "../../redux/reducers/offerSlice";
import http from "../../helpers/http.jsx";

import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;
import { updateStudentBalance,getStudentselectedOffers } from "../../redux/reducers/offerSlice.jsx";



// ── Products ──────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id:1,  name:"FORFAIT 7 HEURES avec CODE INTENSIF BA",           hours:7  },
  { id:2,  name:"FORFAIT 7 HEURES BA",                              hours:7  },
  { id:3,  name:"FORFAIT ACCÉLÉRÉ 12 HEURES avec CODE INTENSIF BA", hours:12 },
  { id:4,  name:"FORFAIT ACCÉLÉRÉ 12 HEURES BA",                    hours:12 },
  { id:5,  name:"FORFAIT ACCÉLÉRÉ 22 HEURES avec CODE INTENSIF BA", hours:22 },
  { id:6,  name:"Pass permis Heure d'évaluation BM",                hours:1  },
  { id:7,  name:"Pass permis Heure d'évaluation BA",                hours:1  },
  { id:8,  name:"Pass permis Automatique F13",  hours:13, desc:"Besoin de quelques heures en plus en boîte automatique ? Ou d'un pack complet pour bien ..." },
  { id:9,  name:"Examen boite automatique",     hours:1,  desc:"Cette offre nous permettra de réserver une heure d'examen dans le planning de votre moniteur, dès qu..." },
  { id:10, name:"Pass permis Automatique F5",   hours:5,  desc:"Besoin de quelques heures en plus en boîte" },
  { id:11, name:"Automatic F13 Driving Licence Pass", hours:0, desc:"Need a few extra hours with an automatic transmission? Or a complete package to master ..." },
  { id:12, name:"Pass permis Turbo F13 BA", hours:0, desc:"Need an intensive 2-week to 45-day training course? Or a complete package to quickly master driving ..." },
  { id:13, name:"Automatic F5 driving licence pass", hours:0, desc:"Need a few extra hours with an automatic transmission? Or a complete package to master ..." },
  { id:14, name:"Automatic transmission test", hours:0, desc:"This offer will allow us to reserve an exam time slot in your instructor's schedule as soon as you have passe..." },
  { id:15, name:"12-HOUR RAPID PASS with INTENSIVE CODE BA", hours:12, desc:"This package includes registration, administrative fees, intensive theory courses (10 hours in person), driving ..." },
  { id:16, name:"Driving licence pass, BA assessment time", hours:0, desc:"Do you need an hour-long evaluation of a manual or automatic transmission vehicle? This package will suit..." },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const EyeOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// Keep dates independent from the browser timezone and display them in the
// French format used throughout the candidate profile.
const toDateInputValue = (value) => {
  if (!value) return "";
  const match = String(value).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!match) return "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
};

const formatFrenchDate = (value) => {
  const normalized = toDateInputValue(value);
  if (!normalized) return "";
  const [year, month, day] = normalized.split("-");
  return `${Number(day)}/${Number(month)}/${year}`;
};

const addOneYear = (value) => {
  const normalized = toDateInputValue(value);
  if (!normalized) return "";
  const [year, month, day] = normalized.split("-").map(Number);
  return `${year + 1}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// Add the exact offer IDs here once supplied. Name/price matching is kept as
// a fallback so existing offers continue to work before that configuration.
const EVALUATION_OFFER_IDS = [
  "9eec87d5-44bb-4889-a130-3e168ca671dd", // BM – 38 €
  "9eec8bb6-af81-4846-b729-5c646ead54f4", // BA – 45 €
];

const REQUIRED_DOCUMENT_TYPES = [
  "Cerfa 02",
  "Code",
  "Pièce d’identité recto",
  "Pièce d’identité verso",
  "Facture EDF",
  "Attestation d’hébergement",
  "Ephotos",
  "Pièce d’identité de l’hébergeur recto",
  "Pièce d’identité de l’hébergeur verso",
];

function TrackingDateField({ fieldKey, label, value, editing, onStartEdit, onChange, red = false, readOnly = false }) {
  const dateValue = toDateInputValue(value);
  return (
    <div className="ti-input-group">
      <label className="ti-input-label">{label}</label>
      {editing ? (
        <input
          className={`ti-input${red ? " ti-input--date-red" : ""}`}
          type="date"
          autoFocus
          readOnly={readOnly}
          value={dateValue}
          onChange={event => onChange?.(event.target.value)}
          onBlur={() => onStartEdit(null)}
          onKeyDown={event => { if (event.key === "Enter") onStartEdit(null); }}
        />
      ) : (
        <div className="cp-field-display" onClick={() => onStartEdit(fieldKey)}>
          <span className={dateValue ? `cp-field-display-value${red ? " ti-date-red" : ""}` : "cp-field-display-empty"}>
            {dateValue ? formatFrenchDate(dateValue) : "Non renseigné"}
          </span>
          <span className="cp-field-edit-hint"><EditIcon /></span>
        </div>
      )}
    </div>
  );
}

// ── Balance Panel ─────────────────────────────────────────────────────────────
function BalancePanel({ onClose, onSave, boite_type , selectedOffers = [] }) {
  const [search,   setSearch]   = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error,    setError]    = useState("");
  const [operation, setOperation] = useState("Addition (+)");
  const dropRef = useRef(null);

   const dispatch = useDispatch();
  const { list: offers, loading } = useSelector(state => state.offers);

  // useEffect(() => {
  //   dispatch(fetchOffers({ is_cart: 1, boite_type: boite_type ?? 0 }));
  // }, [boite_type]);

  // const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const normalizedBoiteType = String(boite_type ?? "").toLowerCase();
  const isAutomaticStudent = normalizedBoiteType === "ba" || normalizedBoiteType === "1" || normalizedBoiteType === "automatic";
  const hasBoiteType = normalizedBoiteType !== "" && normalizedBoiteType !== "null" && normalizedBoiteType !== "undefined";
  const filtered = offers.filter((offer) => {
    const matchesSearch = String(offer.name ?? "").toLowerCase().includes(search.toLowerCase());
    if (!hasBoiteType) return matchesSearch;
    return matchesSearch && Number(offer.is_auto) === (isAutomaticStudent ? 1 : 0);
  });


  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="ti-panel-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ti-panel">
        <div className="ti-panel-header">
          <button className="ti-panel-back" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Retour
          </button>
          <span className="ti-panel-title">Solde du candidat</span>
        </div>

        <div className="ti-panel-body">
          <div className="ti-product-selector" ref={dropRef}>
            <div
              className={`ti-select-btn${selected ? " ti-select-btn--selected" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setDropOpen(o => !o)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDropOpen(o => !o);
                }
              }}
            >
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, textAlign:"left" }}>
                {selected ? selected.name : "Sélectionner un produit"}
              </span>
              {selected
                ? <button className="ti-select-clear" onClick={e => { e.stopPropagation(); setSelected(null); }}>✕</button>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              }
            </div>
            {error && <div className="ti-dropdown-empty" style={{ color: "#dc2626", textAlign: "left", padding: "8px 2px 0" }}>{error}</div>}

            {dropOpen && (
              <div className="ti-dropdown">
                <div className="ti-dropdown-search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input className="ti-dropdown-search-input" placeholder="Recherche avec mot-clé" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                </div>
                <div className="ti-dropdown-list">
                  {filtered.map(p => (
                    <button key={p.id}  className={`ti-dropdown-item${selected?.id === p.id ? " ti-dropdown-item--active" : ""}`}
                      // onClick={() => { setSelected(p); setDropOpen(false); setSearch(""); setError(""); }}>
                       onClick={() => { setSelected(p); setDropOpen(false); setSearch(""); setError(""); }}>
                      {p.name}
                    </button>
                  ))}
                  {filtered.length === 0 && <div className="ti-dropdown-empty">Aucun résultat</div>}
                </div>
              </div>
            )}
          </div>

          {selected && (
            <div className="ti-product-detail">
              <div className="ti-product-detail-name">{selected.name}</div>
              <div className="ti-product-detail-sub">Solde unique : {selected.balance}<strong>{selected.hours}h</strong></div>
            </div>
          )}

          <div className="ti-solde-row">
            <div className="ti-solde-box">
              <span className="ti-solde-label">Solde</span>
              <div className="ti-solde-val">
                <span>{selected ? selected.balance : 0}</span>
                <span className="ti-solde-unit">h</span>
              </div>
            </div>
            <div className="ti-operation-box">
              <span className="ti-solde-label">Opération</span>
              <div className="ti-operation-row">
                <select className="ti-input" value={operation} onChange={e => setOperation(e.target.value)}>
                  <option value="Addition (+)">Addition (+)</option>
                  <option value="Soustraction (-)">Soustraction (-)</option>
                </select>
                <button className="ti-operation-clear">✕</button>
              </div>
            </div>
          </div>

<div className="ti-balance-list-card">
  <div className="ti-balance-list-title">Liste des soldes</div>

  {selectedOffers.length === 0 && (
    <div className="ti-dropdown-empty">Aucune offre attribuée</div>
  )}

  {selectedOffers.map(item => (
    <div key={item.id} className="ti-balance-list-item">
      <div className="ti-balance-list-img">
        {item.offer?.media?.storage_media?.path ? (
          <img
            src={`${BASE_URL}/storage/${item.offer.media.storage_media.path}`}
            alt={item.offer?.name}
            style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          "📋"
        )}
      </div>
      <div className="ti-balance-list-info">
        <div className="ti-balance-list-name">
          <span>{item.offer?.name}</span>
          <span className="ti-balance-list-hours">
            {item.total_balance ?? item.balance} H total
          </span>
        </div>
        <div className="ti-balance-list-desc">
          {item.offer?.description}
        </div>
      </div>
    </div>
  ))}
</div>
        </div>

        <div className="ti-panel-footer">
          <button
            className={`ti-save-btn${selected ? " ti-save-btn--active" : ""}`}
            onClick={() => {
              if (!selected) {
                setError("This offer is required.");
                return;
              }
              setError("");
              onSave(selected,operation);
              onClose();
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main TabInfo ──────────────────────────────────────────────────────────────
export default function TabInfo({
  disableFetch = false ,
    form: formProp = null,        // ✅ add karo
  set: setProp = null,          // ✅ add karo
  committed: committedProp = null,
    showRapport = true,
  onConnect = null,
  autoConnect = false,
  showBalanceSection = true,
  showPasswordSection = true,
  showDocuments = true,
  beforeActions = null,
  onOpenNameModal,
  onSave,
  onCancel,
}) {
   const { id } = useParams();
     const dispatch = useDispatch();

  const user = useSelector(selectSelectedCandidate);
  const loading = useSelector(selectSelectedCandidateLoading);
  const selectedOffers = useSelector(state => state.offers.selectedOffers);
  const currentUser = useSelector(state => state.auth.user);
  const currentRole = String(currentUser?.role ?? "").trim().toLowerCase();
  const canModifyBalance = ["admin", "super-admin", "super_admin", "superadmin"].includes(currentRole)
    && currentUser?.is_secretary !== true;



  const [localForm, setLocalForm] = useState({
    email: "", phone: "", sexe: "Homme",
    date_naissance: "", postal: "", adresse: "",
  });
  const [localCommitted, setLocalCommitted] = useState({
    first_name: "", last_name: "",
  });


  //   const [form, setForm] = useState({
  //   email: "", phone: "", sexe: "Homme",
  //   date_naissance: "", postal: "", adresse: "",
  // });

  // const [committed, setCommitted] = useState({
  //   first_name: "", last_name: "",
  // });

    const form      = formProp      ?? localForm;
  const committed = committedProp ?? localCommitted;
  function set(key, val) {
    if (setProp) setProp(key, val);
    else setLocalForm(prev => ({ ...prev, [key]: val }));
  }


  const location = useLocation();
  const navigate = useNavigate();
    const [neph,       setNeph]       = useState("");
  const [codeDate,   setCodeDate]   = useState("");
  const [balance,    setBalance]    = useState(0);
  const [estimation, setEstimation] = useState(0);
  const [showPanel,  setShowPanel]  = useState(false);
  const [showRapportDrawer, setShowRapportDrawer] = useState(false);
  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [trackingDates, setTrackingDates] = useState({ codeExpiry: "", formulaExpiry: "" });
  const [documentPickerOpen, setDocumentPickerOpen] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);
  const [providedDocuments, setProvidedDocuments] = useState([]);
  const documentFileInputRef = useRef(null);
  const pendingDocIdRef = useRef(null);

  const candidateStorageId = id ?? user?.student?.id ?? user?.id ?? "default";

  function documentsFromDatabase(documents) {
    if (!documents || typeof documents !== "object") return [];

    return Object.entries(documents).flatMap(([type, files]) => {
      const entries = Array.isArray(files) ? files : (files?.path ? [files] : []);
      return entries.map((file, index) => ({
        id: `${type}_${file.path ?? file.name ?? index}`,
        type,
        name: file.name ?? "",
        size: file.size ?? null,
        path: file.path ?? null,
        createdAt: file.uploaded_at ?? null,
      }));
    });
  }

  // Prefer the database; local storage remains a fallback for drafts created
  // before a file has been selected and uploaded.
  useEffect(() => {
    if (candidateStorageId) {
      const databaseDocuments = documentsFromDatabase(user?.student?.required_documents);
      if (databaseDocuments.length > 0) {
        setProvidedDocuments(databaseDocuments);
        return;
      }
      const saved = localStorage.getItem(`candidate_docs_${candidateStorageId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProvidedDocuments(parsed);
          }
        } catch (e) {
          console.error("Error loading candidate documents", e);
        }
      }
    }
  }, [candidateStorageId, user?.student?.required_documents]);

  // Save documents metadata to localStorage whenever list changes
  useEffect(() => {
    if (candidateStorageId) {
      if (providedDocuments.length > 0) {
        const metadata = providedDocuments.map(({ file, previewUrl, ...rest }) => rest);
        localStorage.setItem(`candidate_docs_${candidateStorageId}`, JSON.stringify(metadata));
      } else {
        localStorage.removeItem(`candidate_docs_${candidateStorageId}`);
      }
    }
  }, [providedDocuments, candidateStorageId]);

  const orderedOffers = [...selectedOffers].sort((a, b) =>
    new Date(a.created_at ?? a.createdAt ?? 0) - new Date(b.created_at ?? b.createdAt ?? 0)
  );
  const firstOfferDate = orderedOffers[0]?.created_at ?? orderedOffers[0]?.createdAt ?? "";
  const trainings = user?.student?.trainings ?? user?.student?.reservations ?? [];
  const evaluationTraining = trainings
    .filter((training) => EVALUATION_OFFER_IDS.includes(String(training.offer_id ?? training.offer?.id)))
    .sort((a, b) => new Date(a.reservation?.date ?? a.date ?? a.created_at ?? 0) - new Date(b.reservation?.date ?? b.date ?? b.created_at ?? 0))[0];
  const evaluationDate = evaluationTraining?.reservation?.date ?? evaluationTraining?.date ?? "";
  const firstReservationDate = trainings
    .map((training) => training?.reservation?.date ?? training?.date ?? training?.start_at ?? "")
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0] ?? "";
  const requestedPermis = String(user?.student?.boite_type ?? form.boite_type ?? "").toLowerCase() === "1"
    || String(user?.student?.boite_type ?? form.boite_type ?? "").toLowerCase() === "ba"
    ? "BA"
    : "BM";

  useEffect(() => {
    setTrackingDates((current) => ({
      codeExpiry: form.date_expiration_code || current.codeExpiry || user?.student?.date_expiration_code || "",
      formulaExpiry: form.date_expiration_formula || current.formulaExpiry || addOneYear(firstReservationDate),
    }));
  }, [form.date_expiration_code, form.date_expiration_formula, user?.student?.date_expiration_code, firstReservationDate]);

  function handleSelectDocumentType(selectedType) {
    if (!selectedType) return;
    const newDocId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDoc = {
      id: newDocId,
      type: selectedType,
      name: "",
      size: null,
      file: null,
      createdAt: new Date().toISOString(),
    };

    setProvidedDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newDocId);
    pendingDocIdRef.current = newDocId;
    setDocumentPickerOpen(false);

    // Auto-open computer file picker after dropdown selection
    setTimeout(() => {
      if (documentFileInputRef.current) {
        documentFileInputRef.current.value = "";
        documentFileInputRef.current.click();
      }
    }, 60);
  }

  async function handleDocumentFileChange(event) {
    const file = event.target.files?.[0];
    const targetDocId = activeDocId || pendingDocIdRef.current;
    if (!file || !targetDocId) return;

    setProvidedDocuments((docs) =>
      docs.map((doc) =>
        doc.id === targetDocId
          ? {
              ...doc,
              name: file.name,
              size: file.size,
              file: file,
              updatedAt: new Date().toISOString(),
            }
          : doc
      )
    );

    setActiveDocId(null);
    pendingDocIdRef.current = null;
    event.target.value = "";

    if (!user?.student?.id) return;

    try {
      const upload = new FormData();
      const document = providedDocuments.find((item) => item.id === targetDocId);
      upload.append("document_type", document?.type || "Document");
      if (document?.path) {
        upload.append("replace", "1");
        upload.append("existing_path", document.path);
      }
      upload.append("files[]", file);
      const response = await http.post(`/students/${user.student.id}/required-documents`, upload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const databaseDocuments = documentsFromDatabase(response.data?.required_documents);
      if (databaseDocuments.length > 0) setProvidedDocuments(databaseDocuments);
    } catch (error) {
      console.error("Unable to save the student document", error);
    }
  }

  function handleReplaceDocumentFile(docId) {
    setActiveDocId(docId);
    pendingDocIdRef.current = docId;
    if (documentFileInputRef.current) {
      documentFileInputRef.current.value = "";
      documentFileInputRef.current.click();
    }
  }

  function handleRemoveDocument(docId) {
    setProvidedDocuments((docs) => docs.filter((doc) => doc.id !== docId));
  }

  function formatFileSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  useEffect(() => {
    if (autoConnect) handleConnect();
  }, [autoConnect]);

   // ── Fetch on mount
  useEffect(() => {
    if (disableFetch) return;
    if (id) dispatch(fetchCandidateById(id));
    return () => dispatch(clearSelectedCandidate());
  }, [id]);

useEffect(() => {
    if (user) {
      console.log('user is:',user);
      // ✅ Sirf tab local state set karo jab props nahi aaye:
      if (!formProp) {
        setLocalForm({
          email:          user.email          ?? "",
          phone:          user.phone          ?? "",
          sexe:           user.sexe           ?? "Homme",
          date_naissance: user.date_naissance?.split(" ")[0] ?? "",
          postal:         user.postal         ?? "",
          adresse:        user.adresse        ?? "",
        });
      }
      if (!committedProp) {
        setLocalCommitted({
          first_name: user.first_name ?? "",
          last_name:  user.last_name  ?? "",
        });
      }

      setNeph(user.student?.neph ?? "");
      setCodeDate(user.student?.date_code ?? "");
      setBalance(user.student?.balance ?? 0);
      setEstimation(user.student?.estimation ?? 0);
      set("balanceAvailable", user.student?.balance ?? 0);

      // The balance selector must include every offer compatible with the
      // student's transmission type, not only offers marked for the cart.
      // Request a larger page because the default offers endpoint is paginated.
      dispatch(fetchOffers({
        boite_type: user.student?.boite_type ?? 0,
        per_page: 100,
      }));

      if (user.student?.id) {
        dispatch(getStudentselectedOffers({ studentId: user.student.id }));
      }

    }
}, [user]);


  function handleBalanceSave(product, operation) {
    // if (!product) return;
    // setBalance(prev => prev + product.hours);
    // setEstimation(prev => prev + product.hours);

  //    if (!product) return;
  // const hours = product.balance ?? 0;  // API data mein `balance` field hai
  // if (operation === "Addition (+)") {
  //   setBalance(prev => prev + Number(hours));
  // } else {
  //   setBalance(prev => Math.max(0, prev - Number(hours)));
  // }

     if (!product) return;
    const hours = product.balance ?? 0;
    const status = operation === "Addition (+)" ? "inc" : "dec";
    const currentBalance = Number(balance) || 0;
    const nextBalance = status === "inc"
      ? currentBalance + Number(hours)
      : Math.max(0, currentBalance - Number(hours));

    // console.log(hours);
    // console.log(status)
    // console.log(user?.student?.id); 
        dispatch(updateStudentBalance({
        studentId: user?.student?.id, // ya jo bhi id field hai
        offer_id: product.id,          // ya product.offer_id, jo bhi UUID field hai
        balance: hours,
        status,
    }));

    // local UI turant update (optimistic)
    setBalance(nextBalance);
    set("balanceAvailable", nextBalance);

  }


  //   function set(key, val) {
  //   setForm(prev => ({ ...prev, [key]: val }));
  // }


  function handleConnect() {
    if (onConnect) {
      onConnect();
    } else {
      navigate("/new-student-dashboard", {
        state: {
          fromCandidateProfile: true,
          candidate: user,
          fromSecretaryDashboard: Boolean(location.state?.fromSecretaryDashboard),
          openFilterOnOpen: true,
          returnTo: location.pathname,
        },
      });
    }
  }

  return (
    <>
      {/* ══ 1. Informations personnelles ══ */}
      <section className="cp-section">
        <h2 className="cp-section-title">Informations personnelles </h2>

        <div className="cp-name-row">
          <div className="cp-name-col">
            <span className="cp-field-label">Nom</span>
            <strong className="cp-field-val">{committed.first_name}</strong>
          </div>
          <div className="cp-name-col">
            <span className="cp-field-label">Prénom</span>
            <strong className="cp-field-val">{committed.last_name}</strong>
          </div>
          <button className="cp-edit-icon" title="Modifier le nom" onClick={onOpenNameModal}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>

        <div className="cp-divider" />

        <div className="cp-fields-grid">
          {/* Col 1: E-mail */}
          <div className="cp-field-block">
            <label className="cp-label">E-mail *</label>
            {editingField === "email" ? (
              <input
                className="cp-input"
                type="email"
                autoFocus
                value={form.email ?? ""}
                onChange={e => set("email", e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={e => { if (e.key === "Enter") setEditingField(null); }}
              />
            ) : (
              <div className="cp-field-display" onClick={() => setEditingField("email")}>
                <span className={form.email ? "cp-field-display-value" : "cp-field-display-empty"}>
                  {form.email || "Non renseigné"}
                </span>
                <span className="cp-field-edit-hint"><EditIcon /></span>
              </div>
            )}
          </div>

          {/* Col 2: Téléphone */}
          <div className="cp-field-block">
            <label className="cp-label">Téléphone *</label>
            {editingField === "phone" ? (
              <input
                className="cp-input"
                autoFocus
                value={form.phone ?? form.tel ?? ""}
                onChange={e => {
                  set("phone", e.target.value);
                  if (form.tel !== undefined) set("tel", e.target.value);
                }}
                onBlur={() => setEditingField(null)}
                onKeyDown={e => { if (e.key === "Enter") setEditingField(null); }}
              />
            ) : (
              <div className="cp-field-display" onClick={() => setEditingField("phone")}>
                <span className={(form.phone || form.tel) ? "cp-field-display-value" : "cp-field-display-empty"}>
                  {form.phone || form.tel || "Non renseigné"}
                </span>
                <span className="cp-field-edit-hint"><EditIcon /></span>
              </div>
            )}
          </div>

          {/* Col 1: Genre */}
          <div className="cp-field-block">
            <label className="cp-label">Genre</label>
            {editingField === "sexe" ? (
              <select
                className="cp-input"
                autoFocus
                value={form.sexe ?? form.genre ?? "Homme"}
                onChange={e => {
                  set("sexe", e.target.value);
                  if (form.genre !== undefined) set("genre", e.target.value);
                  setEditingField(null);
                }}
                onBlur={() => setEditingField(null)}
              >
                <option value="Femme">Femme</option>
                <option value="Homme">Homme</option>
                <option value="Autre">Autre</option>
              </select>
            ) : (
              <div className="cp-field-display" onClick={() => setEditingField("sexe")}>
                <span className={(form.sexe || form.genre) ? "cp-field-display-value" : "cp-field-display-empty"}>
                  {form.sexe || form.genre || "Homme"}
                </span>
                <span className="cp-field-edit-hint"><EditIcon /></span>
              </div>
            )}
          </div>

          {/* Col 2: Date de naissance */}
          <div className="cp-field-block">
            <label className="cp-label">Date de naissance</label>
            {editingField === "date_naissance" ? (
              <input
                className="cp-input"
                type="date"
                autoFocus
                value={(form.date_naissance ?? form.dob ?? "").split(" ")[0]}
                onChange={e => {
                  set("date_naissance", e.target.value);
                  if (form.dob !== undefined) set("dob", e.target.value);
                }}
                onBlur={() => setEditingField(null)}
                onKeyDown={e => { if (e.key === "Enter") setEditingField(null); }}
              />
            ) : (
              <div className="cp-field-display" onClick={() => setEditingField("date_naissance")}>
                <span className={(form.date_naissance || form.dob) ? "cp-field-display-value" : "cp-field-display-empty"}>
                  {formatFrenchDate(form.date_naissance || form.dob) || "Non renseigné"}
                </span>
                <span className="cp-field-edit-hint"><EditIcon /></span>
              </div>
            )}
          </div>

          {/* Col 1: Code postal */}
          <div className="cp-field-block">
            <label className="cp-label">Code postal *</label>
            {editingField === "postal" ? (
              <input
                className="cp-input"
                autoFocus
                value={form.postal ?? ""}
                onChange={e => set("postal", e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={e => { if (e.key === "Enter") setEditingField(null); }}
              />
            ) : (
              <div className="cp-field-display" onClick={() => setEditingField("postal")}>
                <span className={form.postal ? "cp-field-display-value" : "cp-field-display-empty"}>
                  {form.postal || "Non renseigné"}
                </span>
                <span className="cp-field-edit-hint"><EditIcon /></span>
              </div>
            )}
          </div>

          {/* Col 2: Adresse */}
          <div className="cp-field-block">
            <label className="cp-label">Adresse *</label>
            {editingField === "adresse" ? (
              <input
                className="cp-input"
                autoFocus
                value={form.adresse ?? form.address ?? ""}
                onChange={e => {
                  set("adresse", e.target.value);
                  if (form.address !== undefined) set("address", e.target.value);
                }}
                onBlur={() => setEditingField(null)}
                onKeyDown={e => { if (e.key === "Enter") setEditingField(null); }}
              />
            ) : (
              <div className="cp-field-display" onClick={() => setEditingField("adresse")}>
                <span className={(form.adresse || form.address) ? "cp-field-display-value" : "cp-field-display-empty"}>
                  {form.adresse || form.address || "Non renseigné"}
                </span>
                <span className="cp-field-edit-hint"><EditIcon /></span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cp-section" style={{ marginTop: 16 }}>
        <h2 className="cp-section-title">Suivi du permis</h2>

        <div className="ti-tracking-grid">
          <TrackingDateField
            fieldKey="evaluation_date"
            label="Date d’évaluation"
            value={evaluationDate}
            editing={editingField === "evaluation_date"}
            onStartEdit={setEditingField}
            readOnly
          />
          
          <div className="ti-input-group">
            <label className="ti-input-label">Évaluation heures</label>
            <div className="cp-field-display ti-field-static">
              <span className={Number(balance) > 0 ? "cp-field-display-value" : "cp-field-display-empty"}>
                {Number(balance) > 0 ? `${balance} h` : "Non renseigné"}
              </span>
            </div>
          </div>

          <TrackingDateField
            fieldKey="registration_date"
            label="Date d’inscription"
            value={firstOfferDate}
            editing={editingField === "registration_date"}
            onStartEdit={setEditingField}
            readOnly
          />
          <div className="ti-input-group">
            <label className="ti-input-label">Permis demandé</label>
            <div className="cp-field-display ti-field-static">
              <span className="cp-field-display-value">{requestedPermis}</span>
            </div>
          </div>

          <TrackingDateField
            fieldKey="date_code"
            label="Date code"
            value={form.date_code ?? codeDate}
            editing={editingField === "date_code"}
            onStartEdit={setEditingField}
            onChange={value => { setCodeDate(value); set("date_code", value); }}
          />
          <TrackingDateField
            fieldKey="code_expiry"
            label="Échéance code"
            value={trackingDates.codeExpiry}
            editing={editingField === "code_expiry"}
            onStartEdit={setEditingField}
            onChange={value => { setTrackingDates(current => ({ ...current, codeExpiry: value })); set("date_expiration_code", value); }}
            red
          />

          <TrackingDateField
            fieldKey="formula_expiry"
            label="Échéance formule"
            value={trackingDates.formulaExpiry}
            editing={editingField === "formula_expiry"}
            onStartEdit={setEditingField}
            onChange={value => { setTrackingDates(current => ({ ...current, formulaExpiry: value })); set("date_expiration_formula", value); }}
            red
          />
        </div>
      </section>

      {/* Documents belong to student profiles only. */}
      {showDocuments && <section className="cp-section ti-documents-section" style={{ marginTop: 16 }}>
        <div className="ti-documents-header">
          <div className="ti-documents-title-wrap">
            <h2 className="cp-section-title" style={{ margin: 0 }}>Docduments à fournir</h2>
            {providedDocuments.length > 0 && (
              <span className="ti-documents-count-badge">
                {providedDocuments.length}
              </span>
            )}
          </div>
          <button
            type="button"
            className={`ti-documents-add-btn ${documentPickerOpen ? "active" : ""}`}
            title="Ajouter un document"
            onClick={() => setDocumentPickerOpen((open) => !open)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Dropdown for selecting document */}
        {documentPickerOpen && (
          <div className="ti-document-picker-box">
            <div className="ti-document-picker-label">Sélectionnez le document à ajouter :</div>
            <div className="ti-document-select-wrap">
              <select
                className="ti-input ti-document-select"
                defaultValue=""
                autoFocus
                onChange={(event) => handleSelectDocumentType(event.target.value)}
              >
                <option value="" disabled>Sélectionner un document...</option>
                {REQUIRED_DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button
                type="button"
                className="ti-document-picker-close"
                onClick={() => setDocumentPickerOpen(false)}
                title="Fermer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <input
          ref={documentFileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={handleDocumentFileChange}
        />

        {providedDocuments.length === 0 ? (
          <div className="ti-documents-empty-box" onClick={() => setDocumentPickerOpen(true)}>
            <div className="ti-documents-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <div className="ti-documents-empty-text">
              <strong>Aucun document ajouté pour le moment.</strong>
              <span>Cliquez sur <b>+ Ajouter</b> ou ici pour sélectionner un document (Cerfa 02, Pièce d'identité, Facture EDF, etc.)</span>
            </div>
          </div>
        ) : (
          <div className="ti-documents-list">
            {providedDocuments.map((document) => (
              <div className="ti-document-card" key={document.id || document.type}>
                <div className="ti-document-card-left">
                  <div className={`ti-document-icon-badge ${document.name ? "has-file" : "pending"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      {document.name ? (
                        <path d="m9 15 2 2 4-4"/>
                      ) : (
                        <>
                          <line x1="12" y1="11" x2="12" y2="17"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </>
                      )}
                    </svg>
                  </div>
                  
                  <div className="ti-document-meta">
                    <div className="ti-document-type-title">{document.type}</div>
                    <div className="ti-document-file-info">
                      {document.name ? (
                        <span className="ti-document-file-name" title={document.name}>
                          📎 {document.name} {document.size ? `(${formatFileSize(document.size)})` : ""}
                        </span>
                      ) : (
                        <span className="ti-document-file-empty">
                          Aucun fichier sélectionné
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ti-document-card-right">
                  {document.name ? (
                    <span className="ti-doc-status-pill success">
                      ✓ Téléversé
                    </span>
                  ) : (
                    <span className="ti-doc-status-pill pending">
                      En attente
                    </span>
                  )}

                  <button
                    type="button"
                    className="ti-doc-action-btn upload"
                    title={document.name ? "Remplacer le fichier" : "Téléverser un fichier"}
                    onClick={() => handleReplaceDocumentFile(document.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{document.name ? "Modifier" : "Téléverser"}</span>
                  </button>

                  <button
                    type="button"
                    className="ti-doc-action-btn delete"
                    title="Supprimer ce document"
                    onClick={() => handleRemoveDocument(document.id)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>}

      {showBalanceSection && (
        <section className="cp-section" style={{ marginTop: 16 }}>
          <h2 className="cp-section-title">Solde</h2>

          <div className="ti-balance-inputs ti-balance-inputs--single">
            <div className="ti-input-group">
              <label className="ti-input-label">NEPH<span className="ti-req">*</span></label>
              {editingField === "neph" ? (
                <input
                  className="ti-input"
                  autoFocus
                  value={form.neph ?? neph}
                  onChange={e => {
                    setNeph(e.target.value);
                    set("neph", e.target.value);
                  }}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={e => { if (e.key === "Enter") setEditingField(null); }}
                />
              ) : (
                <div className="cp-field-display" onClick={() => setEditingField("neph")}>
                  <span className={(form.neph || neph) ? "cp-field-display-value" : "cp-field-display-empty"}>
                    {form.neph || neph || "Non renseigné"}
                  </span>
                  <span className="cp-field-edit-hint"><EditIcon /></span>
                </div>
              )}
            </div>
          </div>

          <div className="ti-balance-stats">
            <div className="ti-stat">
              <span className="ti-stat-label">Solde<br />disponible</span>
              <span className="ti-stat-val">{balance}</span>
            </div>
            {canModifyBalance && (
              <button className="ti-modifier-btn" onClick={() => setShowPanel(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4"  y1="21" x2="4"  y2="14"/><line x1="4"  y1="10" x2="4"  y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8"  x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
                  <line x1="1"  y1="14" x2="7"  y2="14"/>
                  <line x1="9"  y1="8"  x2="15" y2="8"/>
                  <line x1="17" y1="16" x2="23" y2="16"/>
                </svg>
                Modifier
              </button>
            )}
            <div className="ti-stat">
              <span className="ti-stat-label">Estimation</span>
              <span className="ti-stat-val">{estimation}</span>
            </div>
          </div>
        </section>
      )}

      {showPasswordSection && (
        <section className="cp-section" style={{ marginTop: 16 }}>
          <h2 className="cp-section-title">Modifier votre mot de passe</h2>

          <div className="ti-password-inputs">
            <div className="ti-input-group">
              <label className="ti-input-label">Mot de passe <span className="ti-req">*</span></label>
              {editingField === "password" ? (
                <div className="ti-pw-wrap">
                  <input
                    className="ti-input"
                    autoFocus
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      set("password", e.target.value);
                    }}
                    onBlur={() => setEditingField(null)}
                    placeholder="Mot de passe"
                  />
                  <button className="ti-pw-toggle" type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShowPass(o => !o)}>
                    {showPass ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
              ) : (
                <div className="cp-field-display" onClick={() => setEditingField("password")}>
                  <span className={password ? "cp-field-display-value" : "cp-field-display-empty"}>
                    {password ? "••••••••" : "Modifier le mot de passe"}
                  </span>
                  <span className="cp-field-edit-hint"><EditIcon /></span>
                </div>
              )}
            </div>

            <div className="ti-input-group">
              <label className="ti-input-label">Confirmation du mot de passe <span className="ti-req">*</span></label>
              {editingField === "confirm" ? (
                <div className="ti-pw-wrap">
                  <input
                    className="ti-input"
                    autoFocus
                    type={showConf ? "text" : "password"}
                    value={confirm}
                    onChange={e => {
                      setConfirm(e.target.value);
                      set("password_confirmation", e.target.value);
                    }}
                    onBlur={() => setEditingField(null)}
                    placeholder="Confirmation du mot de passe"
                  />
                  <button className="ti-pw-toggle" type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShowConf(o => !o)}>
                    {showConf ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
              ) : (
                <div className="cp-field-display" onClick={() => setEditingField("confirm")}>
                  <span className={confirm ? "cp-field-display-value" : "cp-field-display-empty"}>
                    {confirm ? "••••••••" : "Confirmer le mot de passe"}
                  </span>
                  <span className="cp-field-edit-hint"><EditIcon /></span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ Boutons d'action ══ */}
      {beforeActions}

      <div className="ti-action-row">
        {showRapport && (
          <button className="ti-action-btn ti-action-btn--rapport" onClick={() => setShowRapportDrawer(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
              <path d="M14 2v6h6"/>
              <path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
            </svg>
            Rapport des heures
          </button>
        )}

        <button className="ti-action-btn ti-action-btn--connect" onClick={handleConnect}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          Connecter
        </button>
      </div>

      {/* ══ Barre d'enregistrement ══ */}
      <div className="cp-save-bar">
        <button className="cp-btn-cancel" onClick={onCancel}>Annuler</button>
        <button className="cp-btn-save" onClick={onSave}>Enregistrer</button>
      </div>

      {/* ══ Panneaux superposés ══ */}
      {showPanel && (
        <BalancePanel
          onClose={() => setShowPanel(false)}
          onSave={handleBalanceSave}
          boite_type={user?.student?.boite_type ?? form.boite_type}
          selectedOffers={selectedOffers}
        />
      )}
      {showRapportDrawer && (
        <RapportDrawer onClose={() => setShowRapportDrawer(false)} />
      )}
    </>
  );
}
