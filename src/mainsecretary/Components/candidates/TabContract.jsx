import { useState } from "react";
import "./TabContract.css";
import http from "../../../helpers/http.jsx";

const MEMO_TEXT = `Vient de chez auto école de la gare
A passer l'examen 3 fois > B4 au prochain passage

A faire 2H évaluation en voiture

7/8/24 CPF à 499€
N° 429 528 812 17

30/8/24 Malgré plusieurs relance, ne valide pas le CPF, encore un message sur le répondeur ce jour, il me semble que le numéro de l'auto école est bloqué car je ne peux pas laisser de message sur le répondeur. Envoi d'un mail ce jour également.
*Ne pas mettre d'heures de conduite tant qu'il n'est pas validé.`;

const ContractIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
    <rect x="5" y="14" width="4" height="4" rx="0.5" fill="#c0c4cc" stroke="none"/>
  </svg>
);

const EvalIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <path d="M17 2l-2 2 2 2" stroke="#c0c4cc" strokeWidth="1.5"/>
  </svg>
);

export default function ContractEvaluation({ studentId }) {
  const [memoOpen, setMemoOpen] = useState(false);
  const [openingContract, setOpeningContract] = useState(false);

  async function openContract() {
    if (!studentId || openingContract) return;
    const contractTab = window.open("", "_blank");
    if (contractTab) contractTab.opener = null;
    setOpeningContract(true);
    try {
      const response = await http.get(`/students/${studentId}/contract`, { responseType: "blob" });
      const contractUrl = URL.createObjectURL(new Blob([response.data], { type: "text/html" }));
      if (contractTab) contractTab.location.href = contractUrl;
      else window.location.assign(contractUrl);
      window.setTimeout(() => URL.revokeObjectURL(contractUrl), 60_000);
    } catch (error) {
      contractTab?.close();
      console.error("Impossible d'ouvrir le contrat.", error?.response?.data ?? error);
    } finally {
      setOpeningContract(false);
    }
  }

  return (
    <div className="ce-wrapper">

      {/* Carte 1 : Contrat */}
      <button
        type="button"
        className="ce-card ce-card--link"
        onClick={openContract}
        disabled={!studentId || openingContract}
      >
        <div className="ce-icon-wrap">
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#b0b5bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="12" height="16" rx="1.5" ry="1.5"/>
            <path d="M8 3v2M12 3v2"/>
            <line x1="7" y1="9" x2="13" y2="9"/>
            <line x1="7" y1="12" x2="13" y2="12"/>
            <line x1="7" y1="15" x2="10" y2="15"/>
            <rect x="9" y="11" width="9" height="9" rx="1" fill="#f0f1f3" stroke="#b0b5bf" strokeWidth="1.4"/>
            <line x1="11" y1="15" x2="16" y2="15"/>
            <line x1="11" y1="17" x2="14" y2="17"/>
          </svg>
        </div>
        <div className="ce-card-title">Contrat entre l'élève et Passpermisfacile</div>
        <div className="ce-card-dot">·</div>
      </button>

      {/* Carte 2 : Évaluation */}
      <div className="ce-card">
        <div className="ce-icon-wrap">
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#b0b5bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2H5a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 5 20h14a1.5 1.5 0 0 0 1.5-1.5V8L15 2H9z"/>
            <polyline points="15 2 15 8 20.5 8"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="8" y1="15.5" x2="13" y2="15.5"/>
            <path d="M18 16l1.5 1.5L22 14" stroke="#b0b5bf" strokeWidth="1.4"/>
          </svg>
        </div>
        <div className="ce-card-title">Aucun formulaire d'évaluation disponible</div>
        <div className="ce-card-sub">Vous n'avez pas encore d'évaluation pour ce candidat.</div>
      </div>

      <button type="button" className="ce-memo-card" onClick={() => setMemoOpen(true)}>
        <span className="ce-memo-icon" aria-hidden="true">✎</span>
        <span><strong>Mémo</strong><small>Ouvrir les notes du candidat</small></span>
      </button>

      {memoOpen && (
        <div className="ce-memo-backdrop" role="presentation" onClick={() => setMemoOpen(false)}>
          <section className="ce-memo-modal" role="dialog" aria-modal="true" aria-label="Mémo candidat" onClick={(event) => event.stopPropagation()}>
            <div className="ce-memo-head"><h2>Mémo candidat</h2><button type="button" onClick={() => setMemoOpen(false)} aria-label="Fermer">×</button></div>
            <textarea value={MEMO_TEXT} readOnly aria-label="Notes du candidat" />
          </section>
        </div>
      )}

    </div>
  );
}
