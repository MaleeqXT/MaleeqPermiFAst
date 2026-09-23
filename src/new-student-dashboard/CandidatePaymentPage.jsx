import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar.jsx";
import StudentHeader from "./StudentHeader.jsx";
import http from "../helpers/http.jsx";
import "./CandidateDashboard.css";
import "./CandidatePaymentPage.css";

function StrokeIcon({ children, strokeWidth = 2 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const BellIcon = () => <StrokeIcon><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></StrokeIcon>;
const ChevronDownIcon = () => <StrokeIcon><path d="m6 9 6 6 6-6" /></StrokeIcon>;
const ChevronRightIcon = () => <StrokeIcon><path d="m9 18 6-6-6-6" /></StrokeIcon>;
const HamburgerIcon = () => <StrokeIcon><path d="M4 6h16M4 12h16M4 18h16" /></StrokeIcon>;
const CalendarIcon = () => <StrokeIcon><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /></StrokeIcon>;
const CarIcon = () => <StrokeIcon><path d="M5 17H3v-4l2-2 2-4h10l2 4 2 2v4h-2M5 17h14M7 17v2M17 17v2M6 11h12" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></StrokeIcon>;
const CardIcon = () => <StrokeIcon><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h3" /></StrokeIcon>;
const DocumentIcon = () => <StrokeIcon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></StrokeIcon>;
const DownloadIcon = () => <StrokeIcon><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 19v2h14v-2" /></StrokeIcon>;
const BankIcon = () => <StrokeIcon><path d="m3 9 9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18M2 18h20" /></StrokeIcon>;
const CashIcon = () => <StrokeIcon><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9H5v1M18 15h1v-1" /></StrokeIcon>;
const InfoIcon = () => <StrokeIcon><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></StrokeIcon>;
const CloseIcon = () => <StrokeIcon><path d="m6 6 12 12M18 6 6 18" /></StrokeIcon>;

const formatCurrency = (value) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(value ?? 0));
const formatDate = (value) => value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(`${value}T00:00:00`)) : "Non renseignée";
const installmentLabel = (item) => item.installment_no ? `${item.installment_no}${item.installment_no === 1 ? "re" : "e"} échéance${item.total_tranches ? ` sur ${item.total_tranches}` : ""}` : "Paiement";

function PaymentMethodIcon({ type }) {
  if (type === "bank") return <BankIcon />;
  if (type === "cash") return <CashIcon />;
  return <CardIcon />;
}

function SectionHeading({ icon, title, actionLabel, onAction }) {
  return (
    <header className="nspay-section-heading">
      <div>{icon && <span className="nspay-section-icon">{icon}</span>}<h2>{title}</h2></div>
      {actionLabel && <button type="button" onClick={onAction}>{actionLabel}</button>}
    </header>
  );
}

function ModalShell({ title, description, onClose, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div className="nspay-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={modalRef} className="nspay-modal" role="dialog" aria-modal="true" aria-labelledby="nspay-modal-title" tabIndex="-1">
        <header className="nspay-modal-header">
          <div><h2 id="nspay-modal-title">{title}</h2>{description && <p>{description}</p>}</div>
          <button type="button" onClick={onClose} aria-label="Fermer la fenêtre"><CloseIcon /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

export default function CandidatePaymentPage() {
  const navigate = useNavigate();
  const invoiceTrackRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [invoiceError, setInvoiceError] = useState("");

  useEffect(() => {
    let active = true;
    http.get("/student/payment-summary")
      .then(({ data }) => active && setPaymentSummary(data))
      .catch(() => active && setPaymentError("Impossible de charger vos informations de paiement pour le moment."));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!activeModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => event.key === "Escape" && setActiveModal(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  const handleSidebarNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const openInvoice = async (saleId) => {
    setInvoiceError("");
    const invoiceWindow = window.open("", "_blank");
    try {
      const response = await http.get(`/student/payments/${saleId}/invoice`, { responseType: "blob" });
      const pdfUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      if (invoiceWindow) invoiceWindow.location.href = pdfUrl;
      else window.location.assign(pdfUrl);
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
    } catch {
      invoiceWindow?.close();
      setInvoiceError("Impossible d’ouvrir ce reçu pour le moment.");
    }
  };

  const student = paymentSummary?.student;
  const payments = paymentSummary?.payments;
  const upcomingInstallments = paymentSummary?.upcoming_installments ?? [];
  const paymentHistory = paymentSummary?.payment_history ?? [];
  const paymentMethods = paymentSummary?.payment_methods ?? [];

  return (
    <div className="nsd-root nspay-root">
      <StudentSidebar activePath="/student-payments" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleSidebarNavigate} />

      <main className="nsd-main nspay-main">
        <StudentHeader className="nspay-header" title="Paiements" subtitle="Suivez vos paiements et gérez le financement de votre formation." onMenuOpen={() => setSidebarOpen(true)} />

        {paymentError && <p className="nspay-data-message nspay-data-message--error" role="alert">{paymentError}</p>}
        {invoiceError && <p className="nspay-data-message nspay-data-message--error" role="alert">{invoiceError}</p>}

        <section className="nspay-card nspay-training-card">
          <SectionHeading title="Ma formation en cours" />
          <div className="nspay-training-content">
            <div className="nspay-course-summary">
              <span className="nspay-course-icon"><CarIcon /></span>
              <div><h3>{student?.training_type ?? "Chargement…"}</h3><p>{student?.agency ? `Agence ${student.agency}` : "Agence non renseignée"}</p><span>Date d'inscription : {student ? formatDate(student.registration_date) : "Chargement…"}</span></div>
            </div>
            <div className="nspay-financial-summary">
              <div><span>Prix total</span><strong>{payments ? formatCurrency(payments.total) : "—"}</strong></div>
              <div className="is-paid"><span>Déjà payé</span><strong>{payments ? formatCurrency(payments.paid) : "—"}</strong></div>
              <div className="is-remaining"><span>Reste à payer</span><strong>{payments ? formatCurrency(payments.remaining) : "—"}</strong></div>
            </div>
            <button type="button" className="nspay-primary-action" onClick={() => setActiveModal("payment-info")}><CardIcon />Payer maintenant</button>
          </div>
        </section>

        <section className="nspay-card">
          <SectionHeading icon={<CalendarIcon />} title="Prochaines échéances" actionLabel="Voir tout" />
          <div className="nspay-table-wrap">
            <table className="nspay-table nspay-upcoming-table">
              <thead><tr><th>Date</th><th>Description</th><th>Montant</th><th>Statut</th><th><span className="sr-only">Action</span></th></tr></thead>
              <tbody>{upcomingInstallments.length ? upcomingInstallments.map((item) => <tr key={item.id}><td><span className="nspay-date-cell"><CalendarIcon />{formatDate(item.date)}</span></td><td><strong>{installmentLabel(item)}</strong>{item.description && <small>{item.description}</small>}</td><td>{formatCurrency(item.amount)}</td><td><span className="nspay-status nspay-status--upcoming">À venir</span></td><td><button type="button" className="nspay-row-action" aria-label={`Voir ${installmentLabel(item)}`}><ChevronRightIcon /></button></td></tr>) : <tr><td colSpan="5" className="nspay-empty-cell">Aucune échéance à venir.</td></tr>}</tbody>
            </table>
          </div>
        </section>

        <section className="nspay-card">
          <SectionHeading title="Historique des paiements" actionLabel="Voir tout" onAction={() => setActiveModal("payment-history")} />
          <div className="nspay-table-wrap">
            <table className="nspay-table nspay-history-table">
              <thead><tr><th>Date</th><th>Description</th><th>Montant</th><th>Moyen de paiement</th><th>Statut</th><th>Reçu</th></tr></thead>
              <tbody>{paymentHistory.length ? paymentHistory.map((item) => <tr key={item.id}><td>{formatDate(item.date)}</td><td><strong>{installmentLabel(item)}</strong>{item.reference && <small>{item.reference}</small>}</td><td>{formatCurrency(item.amount)}</td><td><span className="nspay-method-cell"><CardIcon /><span>{item.payment_method || "Non renseigné"}</span></span></td><td><span className="nspay-status nspay-status--paid">Payé</span></td><td><button type="button" className="nspay-download-button" onClick={() => openInvoice(item.id)} aria-label={`Télécharger le reçu de ${installmentLabel(item)}`}><DownloadIcon /></button></td></tr>) : <tr><td colSpan="6" className="nspay-empty-cell">Aucun paiement enregistré.</td></tr>}</tbody>
            </table>
          </div>
        </section>

        <section className="nspay-card nspay-invoices-card">
          <SectionHeading title="Mes factures / reçus" actionLabel="Voir toutes" onAction={() => setActiveModal("invoices")} />
          <div className="nspay-invoice-shell">
            <div ref={invoiceTrackRef} className="nspay-invoice-track">
              {paymentHistory.length ? paymentHistory.map((invoice) => <article key={invoice.id} className="nspay-invoice"><div className="nspay-invoice-top"><span><DocumentIcon /></span><em>Payé</em></div><h3>{invoice.reference || "Reçu de paiement"}</h3><p>{formatDate(invoice.date)}</p><strong>{formatCurrency(invoice.amount)}</strong><button type="button" onClick={() => openInvoice(invoice.id)}><DownloadIcon />Télécharger</button></article>) : <p className="nspay-data-message">Aucun reçu disponible.</p>}
            </div>
            <button type="button" className="nspay-invoice-next" aria-label="Afficher les factures suivantes" onClick={() => invoiceTrackRef.current?.scrollBy({ left: 240, behavior: "smooth" })}><ChevronRightIcon /></button>
          </div>
        </section>

        <section className="nspay-card nspay-methods-card">
          <header className="nspay-section-heading nspay-methods-heading"><div><h2>Moyens de paiement utilisés</h2></div></header>
          <div className="nspay-method-grid">
            {paymentMethods.length ? paymentMethods.map((method) => (
              <article key={method.id} className="nspay-method-card">
                <div className={`nspay-method-icon nspay-method-icon--${method.type}`}><PaymentMethodIcon type={method.type} /></div>
                <h3>{method.title}</h3>
                {method.type === "card" ? <p>{method.last_four ? `**** **** **** ${method.last_four}` : "Numéro de carte non disponible"}</p> : <p>Utilisé pour un paiement confirmé</p>}
              </article>
            )) : <p className="nspay-data-message">Aucun moyen de paiement utilisé pour le moment.</p>}
          </div>
        </section>

        <section className="nspay-contact-strip"><span><InfoIcon /></span><p><strong>Une question ?</strong> Contactez votre équipe pédagogique, nous sommes là pour vous accompagner.</p><button type="button">Nous contacter</button></section>
      </main>

      {activeModal === "payment-info" && <ModalShell title="Payer maintenant" description="Le paiement en ligne n’est pas connecté à cette interface de démonstration." onClose={() => setActiveModal(null)}><div className="nspay-payment-notice"><span><CardIcon /></span><div><small>Reste à payer</small><strong>{payments ? formatCurrency(payments.remaining) : "—"}</strong><p>Aucune opération bancaire ne sera effectuée depuis cette maquette.</p></div></div><footer className="nspay-modal-actions"><button type="button" className="primary" onClick={() => setActiveModal(null)}>Compris</button></footer></ModalShell>}

      {activeModal === "payment-history" && <ModalShell title="Historique des paiements" description="Tous vos paiements confirmés." onClose={() => setActiveModal(null)}><div className="nspay-list-modal">{paymentHistory.length ? paymentHistory.map((item) => <article key={item.id} className="nspay-list-item"><div><strong>{installmentLabel(item)}</strong><small>{formatDate(item.date)}{item.reference ? ` · ${item.reference}` : ""}</small></div><div className="nspay-list-item__right"><strong>{formatCurrency(item.amount)}</strong><span className="nspay-status nspay-status--paid">Payé</span></div></article>) : <p className="nspay-data-message">Aucun paiement enregistré.</p>}</div><footer className="nspay-modal-actions"><button type="button" className="primary" onClick={() => setActiveModal(null)}>Fermer</button></footer></ModalShell>}

      {activeModal === "invoices" && <ModalShell title="Mes factures / reçus" description="Tous les reçus disponibles pour vos paiements confirmés." onClose={() => setActiveModal(null)}><div className="nspay-list-modal">{paymentHistory.length ? paymentHistory.map((invoice) => <article key={invoice.id} className="nspay-list-item"><span className="nspay-list-document"><DocumentIcon /></span><div className="nspay-list-item__content"><strong>{invoice.reference || "Reçu de paiement"}</strong><small>{formatDate(invoice.date)}</small></div><div className="nspay-list-item__right"><strong>{formatCurrency(invoice.amount)}</strong><button type="button" className="nspay-list-download" onClick={() => openInvoice(invoice.id)}><DownloadIcon />Télécharger</button></div></article>) : <p className="nspay-data-message">Aucun reçu disponible.</p>}</div><footer className="nspay-modal-actions"><button type="button" className="primary" onClick={() => setActiveModal(null)}>Fermer</button></footer></ModalShell>}

    </div>
  );
}
