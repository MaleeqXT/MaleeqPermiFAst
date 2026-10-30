import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Commander.css";
import FilterDrawer from "./FilterDrawer";
import http from "../helpers/http.jsx";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIP_PUBLISHABLE;

// Kept as legacy catalogue reference while offers are loaded from the API.
// eslint-disable-next-line no-unused-vars
const OFFERS = [
  {
    id: 1,
    name: "Pass permis Turbo 20H BM",
    shortName: "Turbo 20H",
    description:
      "Besoin d'une formation intensive de 2 semaines à 45 jours ? Ou d'un pack complet pour bien maîtriser la conduite rapidement ? Ce pack vous conviendra parfaitement.",
    price: 1490,
    paymentLabel: "Paiement en 2 fois",
    paymentAmount: 745,
    features: [
      "Formation intensive 2 semaines a 45 jours",
      "Accompagnement a l'examen",
      "Sans heure d'évaluation",
    ],
    accent: "#2563eb",
  },
  {
    id: 2,
    name: "Pass permis Accompagne BM",
    shortName: "Accompagne",
    description: "20H + 4H RDV pedagogique",
    price: 1290,
    paymentLabel: "Paiement en 3 fois",
    paymentAmount: 430,
    features: [
      "Constitution du dossier",
      "Code en ligne inclus",
      "Évaluation de départ",
    ],
    accent: "#c9a64b",
  },
  {
    id: 3,
    name: "Pass permis Code (Intensif)",
    shortName: "Code",
    description:
      "Besoin d'avoir accès au code en ligne en intensif (10h en 1 semaine) ? Ce pack vous conviendra parfaitement.",
    price: 190,
    paymentLabel: "Offre intensive",
    paymentAmount: 190,
    features: [
      "INTENSIF - 10h en 1 semaine",
      "200 séries / 2 000 questions",
      "10 thématiques officielles",
    ],
    accent: "#0f172a",
  },
  {
    id: 4,
    name: "Pass permis Turbo 20H BM",
    shortName: "Turbo 20H",
    description:
      "Besoin d'une formation intensive de 2 semaines à 45 jours ? Ou d'un pack complet pour bien maîtriser la conduite rapidement ? Ce pack vous conviendra parfaitement.",
    price: 1490,
    paymentLabel: "Paiement en 2 fois",
    paymentAmount: 745,
    features: [
      "Formation intensive 2 semaines a 45 jours",
      "Accompagnement a l'examen",
      "Sans heure d'évaluation",
    ],
    accent: "#2563eb",
  },
  {
    id: 5,
    name: "Pass permis Accompagne BM",
    shortName: "Accompagne",
    description: "20H + 4H RDV pedagogique",
    price: 1290,
    paymentLabel: "Paiement en 3 fois",
    paymentAmount: 430,
    features: [
      "Constitution du dossier",
      "Code en ligne inclus",
      "Évaluation de départ",
    ],
    accent: "#c9a64b",
  },
  {
    id: 6,
    name: "Pass permis Code (Intensif)",
    shortName: "Code",
    description:
      "Besoin d'avoir accès au code en ligne en intensif (10h en 1 semaine) ? Ce pack vous conviendra parfaitement.",
    price: 190,
    paymentLabel: "Offre intensive",
    paymentAmount: 190,
    features: [
      "INTENSIF - 10h en 1 semaine",
      "200 séries / 2 000 questions",
      "10 thématiques officielles",
    ],
    accent: "#0f172a",
  },
];

const STUDENT = {
  initials: "EE",
  name: "ELIF ELMACIOGLU",
  email: "elmaciogluelif@gmail.com",
  phone: "0616057238",
  idLabel: "834",
  balance: "24h",
};

function formatPrice(amount) {
  const value = Number(amount) || 0;
  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

function itemQuantity(item) {
  const quantity = Number(item.quantity);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;
}

function plainText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function offerFeatures(value) {
  if (Array.isArray(value)) return value.map(plainText).filter(Boolean);

  const items = String(value ?? "")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .split(/\n+/)
    .map(plainText)
    .filter(Boolean);

  return items.length ? items : ["Offre disponible dans votre agence"];
}

function normalizeBoiteType(value) {
  return [0, 1, "0", "1"].includes(value) ? Number(value) : null;
}

function cartOfferId(item) {
  const value = item?.offer_id ?? item?.offerId ?? item?.id;
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function normalizeOfferName(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bpass\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const ADDITIONAL_SERVICE_NAMES = new Set([
  "inscription prefectorale",
  "fabrication permis",
  "rdv pedagogique 2h",
  "accompagnement examen",
  "accompagnement examen 1h",
  "forfait 10h",
  "livre de code",
  "conduite supervisee 2h",
  "heure a l unite boite manuelle",
]);

function isAdditionalServiceCartItem(item) {
  return item?.cartType === "additional-service"
    || ADDITIONAL_SERVICE_NAMES.has(normalizeOfferName(item?.offerName ?? item?.title ?? item?.name));
}

function isCodeCartItem(item) {
  return /(?:^|\s)code(?:\s|$)/.test(normalizeOfferName(item?.offerName ?? item?.title ?? item?.name));
}

// Mirrors the old checkout's SummaryOrder.vue fallback for menu services.
// Their parent offer is a menu and therefore has no single balance; the
// service label itself is the authoritative source when it contains hours.
function balanceFromServiceLabel(item) {
  const explicitBalance = Number(item?.balance);
  if (Number.isFinite(explicitBalance) && explicitBalance > 0) return explicitBalance;

  const label = String(item?.offerName ?? item?.title ?? item?.name ?? "");
  const match = label.match(/(\d+(?:[.,]\d+)?)\s*h\b/i);
  if (!match) return 0;

  const parsed = Number(match[1].replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function parseInstallments(value) {
  let parsed = value;
  while (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((installment, index) => ({
      no: Number(installment?.no ?? installment?.installment_no ?? index + 1),
      amount: Number(installment?.amount),
      status: String(installment?.status || "pending").toLowerCase(),
    }))
    .filter((installment) => Number.isInteger(installment.no) && installment.no > 0 && Number.isFinite(installment.amount) && installment.amount > 0)
    .sort((left, right) => left.no - right.no);
}

function toCommanderOffer(offer) {
  // The offers endpoint already applies the student's agency pricing to the
  // top-level fields. For checkout, price_ht is the agency's full price and
  // takes precedence over promotional/display-only final_price values.
  const price = Number(offer.price_ht ?? offer.original_price ?? offer.discounted_price ?? offer.final_price) || 0;
  const paymentSchedule = parseInstallments(offer.installments_data);
  const configuredInstallments = Math.max(1, Number(offer.multi_payment) || 1);
  const installmentEligible = configuredInstallments > 1 && paymentSchedule.length > 0;
  const installments = installmentEligible ? paymentSchedule.length : 1;
  const installmentAmount = installmentEligible ? paymentSchedule[0].amount : price;
  const name = offer.name || "Offre permis";

  return {
    id: offer.id,
    name,
    shortName: name.replace(/^pass permis\s*/i, "").slice(0, 24) || name,
    description: plainText(offer.description) || "Offre disponible dans votre agence.",
    price,
    paymentLabel: installments > 1 ? `Paiement en ${installments} fois` : "Paiement comptant",
    paymentAmount: installmentAmount,
    installments,
    paymentSchedule,
    installmentEligible,
    isMenuOffer: normalizeOfferName(offer.name) === "permis a la carte",
    balance: Number(offer.balance) || 0,
    rawOffer: offer,
    features: offerFeatures(offer.caracteristiques),
    accent: /^#[0-9a-f]{3,8}$/i.test(offer.color || "") ? offer.color : "#2563eb",
  };
}

function resolveCartOffer(savedItem, catalogue) {
  const persistedId = savedItem?.offer_id ?? savedItem?.offerId;
  if (persistedId) {
    const byPersistedId = catalogue.find((offer) => String(offer.id) === String(persistedId));
    if (byPersistedId) return byPersistedId;
  }

  const byId = catalogue.find((offer) => String(offer.id) === String(savedItem?.id));
  if (byId) return byId;

  // Service-page cards used human-readable local IDs before checkout was
  // connected to the offer catalogue. Resolve those older saved items by their
  // display name, then continue with the real database offer ID.
  const savedName = normalizeOfferName(savedItem?.offerName ?? savedItem?.title ?? savedItem?.name);
  if (!savedName) return null;

  const matchingOffer = catalogue.find((offer) => normalizeOfferName(offer.name) === savedName);
  if (matchingOffer) return matchingOffer;

  // The public Code page historically stored visual IDs such as
  // `code-normal` instead of the offer UUID. Resolve those persisted carts
  // to the published database product, including the slightly different
  // "Code (Intensif)" catalogue naming.
  if (isCodeCartItem(savedItem)) {
    const intensive = savedName.includes("intensif");
    const codeOffers = catalogue.filter((offer) => {
      const offerName = normalizeOfferName(offer.name);
      return offerName.includes("permis code") && offerName.includes("intensif") === intensive;
    });
    if (codeOffers.length === 1) return codeOffers[0];
  }

  // Additional services are individual selections from the existing menu
  // offer. The legacy Vue checkout saves their own price/balance against this
  // one offer ID, which the backend payment service already supports.
  if (isAdditionalServiceCartItem(savedItem)) {
    return catalogue.find((offer) => offer.isMenuOffer) || null;
  }

  return null;
}

function hydrateCartItem(savedItem, offer) {
  const isMenuSelection = offer.isMenuOffer && isAdditionalServiceCartItem(savedItem);
  if (!isMenuSelection) {
    // The Code page is a fixed-price public product selector. Preserve the
    // amount the learner selected there (290 € for the intensive option,
    // 29 € for normal access) instead of replacing it with a legacy base
    // catalogue value while restoring the cart after login.
    if (isCodeCartItem(savedItem)) {
      const selectedPrice = Number(savedItem.price);
      if (Number.isFinite(selectedPrice) && selectedPrice > 0) {
        return {
          ...offer,
          price: selectedPrice,
          paymentAmount: selectedPrice,
          quantity: itemQuantity(savedItem),
        };
      }
    }
    return { ...offer, quantity: itemQuantity(savedItem) };
  }

  return {
    ...offer,
    // Preserve the service selected by the learner while using the existing
    // menu offer UUID for the backend cart and payment records.
    name: savedItem.title || savedItem.offerName || offer.name,
    price: Number(savedItem.price) || 0,
    balance: balanceFromServiceLabel(savedItem),
    quantity: itemQuantity(savedItem),
  };
}

function installmentBalanceFor(item, installmentNo) {
  const schedule = item.paymentSchedule || [];
  if (!schedule.length || !installmentNo) return Number(item.balance || 0);

  const totalBalance = Math.round(Number(item.balance || 0));
  const share = Math.floor(totalBalance / schedule.length);
  const remainder = totalBalance - (share * schedule.length);
  const index = schedule.findIndex((installment) => Number(installment.no) === Number(installmentNo));

  if (index < 0) return totalBalance;
  return share + (index === 0 ? remainder : 0);
}

function loadStripeJs() {
  if (window.Stripe) return Promise.resolve(window.Stripe);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Stripe));
      existing.addEventListener("error", () => reject(new Error("Stripe n'a pas pu être chargé.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => resolve(window.Stripe);
    script.onerror = () => reject(new Error("Stripe n'a pas pu être chargé."));
    document.head.appendChild(script);
  });
}

function StripeCardField({ onReady, onError }) {
  const mountRef = useRef(null);

  useEffect(() => {
    let cardElement;
    let active = true;

    async function mountCard() {
      if (!STRIPE_PUBLISHABLE_KEY) {
        onError("La clé publique Stripe est absente de la configuration frontend.");
        return;
      }

      try {
        const Stripe = await loadStripeJs();
        if (!active || !Stripe || !mountRef.current) return;

        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        const elements = stripe.elements();
        cardElement = elements.create("card", {
          style: {
            base: { color: "#1f2937", fontFamily: "Inter, sans-serif", fontSize: "15px", "::placeholder": { color: "#94a3b8" } },
            invalid: { color: "#dc2626" },
          },
        });
        cardElement.mount(mountRef.current);
        cardElement.on("change", (event) => onError(event.error?.message || ""));
        onReady({ stripe, cardElement });
      } catch (error) {
        onError(error.message || "Stripe n'a pas pu être initialisé.");
      }
    }

    mountCard();
    return () => {
      active = false;
      cardElement?.destroy();
      onReady(null);
    };
  }, [onError, onReady]);

  return <div ref={mountRef} className="cmd-stripe-card" />;
}

function IconCart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function IconDelete() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function OfferCard({ offer, inCart, onAdd, onRemove }) {
  return (
    <article className={`cmd-offer-card${inCart ? " cmd-offer-card--active" : ""}`}>
      <div className="cmd-offer-banner">
        <div className="cmd-offer-banner-top">
          <span className="cmd-offer-banner-pill" style={{ backgroundColor: `${offer.accent}18`, color: offer.accent }}>
            {offer.paymentLabel}
          </span>
          <span className="cmd-offer-banner-amount">{formatPrice(offer.paymentAmount)}</span>
        </div>
      </div>

      <div className="cmd-offer-logo" style={{ color: offer.accent }}>
        <span>{offer.shortName}</span>
      </div>

      <h3 className="cmd-offer-name">{offer.name}</h3>
      <p className="cmd-offer-description">{offer.description}</p>
      <div className="cmd-offer-price">{formatPrice(offer.price)}</div>

      {inCart ? (
        <button className="cmd-offer-button cmd-offer-button--subtle" onClick={() => onRemove(offer.id)}>
          Retirer du panier
        </button>
      ) : (
        <button className="cmd-offer-button" onClick={() => onAdd(offer)}>
          Ajouter au panier
        </button>
      )}

      <div className="cmd-offer-feature-title">Caractéristiques</div>
      <ul className="cmd-offer-features">
        {offer.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </article>
  );
}

function SuccessModal({ count, onClose }) {
  return (
    <div className="cmd-modal-overlay">
      <div className="cmd-modal">
        <div className="cmd-modal-head">
          <IconInfo />
          <span>Ajouté au panier</span>
        </div>
        <div className="cmd-modal-body">
          {count > 1 ? "Les produits ont été ajoutés au panier." : "Le produit a été ajouté au panier."}
        </div>
        <button className="cmd-modal-close" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}

function PaymentSuccessModal({ offers, onClose }) {
  return (
    <div className="cmd-modal-overlay">
      <div className="cmd-modal">
        <div className="cmd-modal-head"><IconInfo /><span>Paiement confirmé</span></div>
        <div className="cmd-modal-body">
          Votre paiement a été enregistré. Offre{offers.length > 1 ? "s" : ""} activée{offers.length > 1 ? "s" : ""} : {offers.map((offer) => offer.name).join(", ")}.
        </div>
        <button className="cmd-modal-close" onClick={onClose}>Continuer</button>
      </div>
    </div>
  );
}

function OffersDrawer({ items, total, onClose, onRemove, onCheckout }) {
  return (
    <>
      <div className="cmd-drawer-overlay" onClick={onClose} />
      <aside className="cmd-drawer">
        <div className="cmd-drawer-header">
          <button className="cmd-drawer-link" onClick={onClose}>
            Fermer
          </button>
          <div className="cmd-drawer-title">Mes offres</div>
          <div className="cmd-drawer-spacer" />
        </div>

        <div className="cmd-drawer-body">
          <div className="cmd-cart-list">
            {items.map((item) => (
              <div key={item.id} className="cmd-cart-card">
                <div className="cmd-cart-card-head">
                  <div>
                    <div className="cmd-cart-name">{item.name}</div>
                    <div className="cmd-cart-pill">{item.paymentLabel}</div>
                  </div>
                  <button className="cmd-cart-delete" onClick={() => onRemove(item.id)} aria-label="Supprimer">
                    <IconDelete />
                  </button>
                </div>

                <div className="cmd-cart-price">{formatPrice(item.price)}</div>
                <div className="cmd-cart-installment">{`${formatPrice(item.paymentAmount)} x ${Math.max(1, Math.round(item.price / item.paymentAmount))}`}</div>
                <div className="cmd-cart-student">
                  Étudiant : {STUDENT.name} (ID : {STUDENT.idLabel}, E-mail : {STUDENT.email})
                </div>
              </div>
            ))}
          </div>

          <div className="cmd-drawer-summary">
            <div className="cmd-drawer-row">
              <span>Sous-total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="cmd-drawer-subtext">{`${items.length} offre${items.length > 1 ? "s" : ""}`}</div>
            <div className="cmd-drawer-divider" />
            <div className="cmd-drawer-total-row">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <p className="cmd-drawer-note">
              Confirmez votre panier pour passer a l'etape de paiement et finaliser les offres choisies.
            </p>
          </div>
        </div>

        <div className="cmd-drawer-footer">
          <button className="cmd-drawer-checkout" onClick={onCheckout}>
            Continuer vers le paiement
          </button>
        </div>
      </aside>
    </>
  );
}

function CheckoutPage({ items, studentId, student, onBack, onRemove, onPaymentSuccess }) {
  const [paymentMode, setPaymentMode] = useState("standard");
  const [selectedInstallments, setSelectedInstallments] = useState({});
  const [stripeContext, setStripeContext] = useState(null);
  const [cardholderName, setCardholderName] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const getSelectedInstallment = useCallback((item) => {
    const installmentNo = Number(selectedInstallments[item.id]);
    return item.paymentSchedule?.find((installment) => installment.no === installmentNo) || null;
  }, [selectedInstallments]);

  const balanceForItem = useCallback((item) => {
    const selectedInstallment = getSelectedInstallment(item);
    const unitBalance = selectedInstallment
      ? installmentBalanceFor(item, selectedInstallment.no)
      : Number(item.balance || 0);
    return unitBalance * itemQuantity(item);
  }, [getSelectedInstallment]);

  const amountForItem = useCallback((item) => {
    const selectedInstallment = getSelectedInstallment(item);
    return Number(selectedInstallment?.amount ?? item.price) * itemQuantity(item);
  }, [getSelectedInstallment]);

  const amountToPay = useMemo(() => (
    items.reduce((sum, item) => sum + amountForItem(item), 0)
  ), [amountForItem, items]);

  const selectedTrancheCount = useMemo(() => (
    items.reduce((count, item) => count + (getSelectedInstallment(item) ? 1 : 0), 0)
  ), [getSelectedInstallment, items]);

  const handleStripeReady = useCallback((context) => {
    setStripeContext(context);
  }, []);

  const handleStripeError = useCallback((message) => {
    setPaymentError(message || "");
  }, []);

  async function handlePayment() {
    if (!stripeContext?.stripe || !stripeContext?.cardElement) {
      setPaymentError("Le formulaire de carte est en cours de chargement.");
      return;
    }

    if (!cardholderName.trim()) {
      setPaymentError("Veuillez saisir le nom du titulaire de la carte.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const cartData = items.map((item) => {
        const selectedInstallment = getSelectedInstallment(item);
        const isInstallment = Boolean(selectedInstallment);
        const trancheCount = isInstallment ? Math.max(1, Number(item.installments) || 1) : 1;
        const balance = isInstallment
          ? installmentBalanceFor(item, selectedInstallment.no)
          : Number(item.balance || 0);

        return {
          offer_id: item.id,
          quantity: itemQuantity(item),
          tranches: trancheCount,
          // cart_details only supports its existing enum values: final and second.
          selected_price_type: isInstallment ? "second" : "final",
          price: isInstallment ? Number(selectedInstallment.amount) : Number(item.price),
          balance,
        };
      });

      // The payment service creates Sales from the authenticated student's pending cart.
      // Store the selected offers there first so the sale, wallet and offer are linked.
      await http.post("/carts/many", { data: cartData, ...(studentId ? { student_id: studentId } : {}) });

      const installments = items
        .map((item) => {
          const selectedInstallment = getSelectedInstallment(item);
          return selectedInstallment ? { offer_id: item.id, installment_no: selectedInstallment.no } : null;
        })
        .filter(Boolean);

      // A student uses the protected student Stripe API. Staff viewing a student
      // dashboard use the staff-aware payment API with the selected student_id.
      const stripeStoreUrl = studentId ? "/payment/stripe/complete" : "/student/strip";
      const stripeSuccessUrl = studentId ? "/payment/stripe/success" : "/student/strip/success";

      const { data: intentData } = await http.post(stripeStoreUrl, {
        amount: amountToPay,
        balance: cartData.reduce((sum, item) => sum + Number(item.balance || 0) * item.quantity, 0),
        ...(studentId ? { student_id: studentId } : {}),
        ...(installments.length ? { installments } : {}),
      });

      const sale = intentData?.sale || intentData?.sales?.[0];
      if (!intentData?.clientSecret || !sale?.id) {
        throw new Error("La création du paiement a échoué. Veuillez réessayer.");
      }

      const { error, paymentIntent } = await stripeContext.stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: {
          card: stripeContext.cardElement,
          billing_details: { name: cardholderName.trim() },
        },
      });

      if (error) throw error;
      if (paymentIntent?.status !== "succeeded") {
        throw new Error("Le paiement n'a pas été confirmé par Stripe.");
      }

      const { data: successData } = await http.post(stripeSuccessUrl, {
        paymentIntentId: paymentIntent.id,
        saleId: sale.id,
        ...(studentId ? { student_id: studentId } : {}),
      });

      if (!successData?.success) {
        throw new Error("Le paiement a été reçu mais sa validation a échoué.");
      }

      onPaymentSuccess(successData.sales || [successData.sale]);
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Le paiement a échoué. Veuillez réessayer."
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  return (
    <div className="cmd-checkout">
      <div className="cmd-checkout-main">
        <div className="cmd-checkout-head">
          <button className="cmd-back-button" onClick={onBack}>
            <IconBack />
          </button>
          <h2>Finalisez votre commande</h2>
        </div>

        <div className="cmd-checkout-section-title">Informations élève</div>
        <div className="cmd-student-card">
          <div className="cmd-student-avatar">{student.initials}</div>
          <div className="cmd-student-meta">
            <div className="cmd-student-name">{student.name}</div>
            <div className="cmd-student-sub">{[student.email, student.phone].filter(Boolean).join(" | ")}</div>
          </div>
          <div className="cmd-student-arrow">
            <IconArrowRight />
          </div>
        </div>

        <div className="cmd-checkout-divider">
          <span>Choisissez votre mode de paiement</span>
        </div>

        <div className="cmd-payment-grid">
          <button
            type="button"
            className={"cmd-payment-option" + (paymentMode === "standard" ? " cmd-payment-option--active" : "")}
            onClick={() => {
              setPaymentMode("standard");
              setSelectedInstallments({});
            }}
          >
            <div className="cmd-payment-option-title">Standard</div>
            <div className="cmd-payment-option-sub">Réglez l'intégralité du montant en une seule transaction.</div>
          </button>
          <button
            type="button"
            className={"cmd-payment-option" + (paymentMode === "split" ? " cmd-payment-option--active" : "")}
            onClick={() => {
              setPaymentMode("split");
              setSelectedInstallments(
                items.reduce((selection, item) => {
                  if (item.installmentEligible && item.paymentSchedule?.[0]) {
                    selection[item.id] = item.paymentSchedule[0].no;
                  }
                  return selection;
                }, {})
              );
            }}
          >
            <div className="cmd-payment-option-title">Paiement par tranche</div>
            <div className="cmd-payment-option-sub">Utilisez les échéances disponibles selon les offres du panier.</div>
          </button>
        </div>

        <div className="cmd-checkout-section-title">Informations de paiement</div>
        <div className="cmd-form-grid">
          <input
            className="cmd-input cmd-input--full"
            placeholder="Nom du titulaire de la carte"
            value={cardholderName}
            onChange={(event) => setCardholderName(event.target.value)}
          />
          <div className="cmd-card-field cmd-input--full">
            <StripeCardField onReady={handleStripeReady} onError={handleStripeError} />
          </div>
        </div>

        {paymentError && <p style={{ color: "#b91c1c", marginTop: 12 }}>{paymentError}</p>}

        <p className="cmd-terms">
          Votre commande est presque terminée. En cliquant sur « Confirmer et payer », vous acceptez nos conditions générales de vente et notre politique de confidentialité.
        </p>

        <button className="cmd-pay-button" onClick={handlePayment} disabled={paymentLoading}>
          {paymentLoading ? "Paiement en cours…" : `Confirmer et payer (${formatPrice(amountToPay)})`}
        </button>

        <div className="cmd-secure-banner">
          <IconLock />
          <span>Paiement 100 % sécurisé</span>
        </div>

        <div className="cmd-policy-title">Informations utiles</div>
        <div className="cmd-policy-list">
          <p>Nous acceptons les cartes Visa, Mastercard et American Express.</p>
          <p>Les paiements sont protégés par chiffrement SSL.</p>
          <p>Vous pouvez consulter les détails de vos offres depuis votre espace élève.</p>
          <p>Notre equipe d'assistance reste disponible pour toute question sur votre commande.</p>
        </div>
      </div>

      <aside className="cmd-checkout-summary">
        <h3>Récapitulatif de la Commande</h3>
        <div className="cmd-checkout-summary-list">
          {items.map((item) => (
            <div key={item.id} className="cmd-checkout-summary-item">
              <div className="cmd-checkout-summary-content">
                <div className="cmd-checkout-summary-name">{item.name}{itemQuantity(item) > 1 ? ` × ${itemQuantity(item)}` : ""}</div>
                <div className="cmd-checkout-summary-balance">{`Solde : ${balanceForItem(item)}h`}</div>
              </div>
              <div className="cmd-checkout-summary-side">
                <strong>{formatPrice(amountForItem(item))}</strong>
                <button className="cmd-checkout-remove" onClick={() => onRemove(item.id)}>
                  Retirer
                </button>
              </div>
              {item.installmentEligible && (
                <div className="cmd-installment-picker">
                  <span className="cmd-installment-title">Choisir le mode de paiement</span>
                  <div className="cmd-installment-controls">
                    <button
                      type="button"
                      className={"cmd-installment-full" + (!getSelectedInstallment(item) ? " cmd-installment-full--active" : "")}
                      onClick={() => {
                        setPaymentMode("standard");
                        setSelectedInstallments((current) => {
                          const next = { ...current };
                          delete next[item.id];
                          return next;
                        });
                      }}
                    >
                      <span className="cmd-installment-option-label">Prix complet</span>
                      <span className="cmd-installment-option-amount">{formatPrice(item.price)}</span>
                    </button>
                    <select
                      className={"cmd-installment-select" + (getSelectedInstallment(item) ? " cmd-installment-select--active" : "")}
                      value={getSelectedInstallment(item)?.no || ""}
                      onChange={(event) => {
                        setPaymentMode(event.target.value ? "split" : "standard");
                        setSelectedInstallments((current) => ({
                          ...current,
                          [item.id]: Number(event.target.value),
                        }));
                      }}
                      aria-label={"Choisir une échéance pour " + item.name}
                    >
                      <option value="">Choisir une échéance</option>
                      {item.paymentSchedule.map((installment) => (
                        <option key={installment.no} value={installment.no}>
                          {"Paiement " + installment.no + "/" + item.installments + " — " + formatPrice(installment.amount)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {getSelectedInstallment(item) && (
                    <div className="cmd-installment-selected">
                      {"Échéance sélectionnée : Paiement " + getSelectedInstallment(item).no + "/" + item.installments + " — " + formatPrice(getSelectedInstallment(item).amount)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="cmd-checkout-summary-row">
          <span>Paiement sur tranches</span>
          <strong>{selectedTrancheCount ? selectedTrancheCount + " échéance" + (selectedTrancheCount > 1 ? "s" : "") : "Standard (Une fois)"}</strong>
        </div>
        <div className="cmd-checkout-summary-row">
          <span>Sous-total</span>
          <strong>{formatPrice(amountToPay)}</strong>
        </div>
        <div className="cmd-checkout-summary-total">
          <span>Total à payer</span>
          <strong>{formatPrice(amountToPay)}</strong>
        </div>
        <p className="cmd-checkout-summary-note">
          {selectedTrancheCount
            ? "Le montant affiché correspond aux échéances sélectionnées. Les échéances suivantes restent gérées depuis votre espace élève."
            : "Le total s'ajuste automatiquement selon les offres ajoutées ou retirées du panier."}
        </p>
      </aside>
    </div>
  );
}

export default function Commander({ studentId = null, initialCheckout = false, onHome, onPaymentCompleted = () => {}, onOpenNotifications = () => {}, notifCount = 0 }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const studentName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.name || "Élève";
  const checkoutStudent = studentId ? STUDENT : {
    name: studentName,
    initials: studentName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    email: user?.email || "",
    phone: user?.phone || user?.telephone || "",
  };
  const [cartItems, setCartItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showFilter, setShowFilter] = useState(!initialCheckout);
  const [view, setView] = useState("catalog");
  const [paidOffers, setPaidOffers] = useState([]);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOffers() {
      setOffersLoading(true);
      setOffersError("");

      try {
        let savedItems = [];
        if (initialCheckout) {
          try {
            savedItems = JSON.parse(window.localStorage.getItem("ppf_cart") || "[]");
          } catch {
            savedItems = [];
          }
          if (!Array.isArray(savedItems) || !savedItems.length) {
            throw new Error("Votre panier est vide. Choisissez une offre pour continuer.");
          }
        }
        const savedOfferIds = [...new Set(savedItems.map(cartOfferId).filter(Boolean))];
        const response = await http.get("/student/offers", {
          params: {
            ...(studentId ? { student_id: studentId } : {}),
            ...(initialCheckout ? { per_page: 100 } : {}),
            ...(savedItems.some((item) => item?.isCpf) ? { include_cpf: 1 } : {}),
            ...(savedOfferIds.length ? { cart_offer_ids: savedOfferIds } : {}),
          },
        });
        const payload = response.data?.offers;
        const rows = Array.isArray(payload) ? payload : payload?.data ?? [];
        // Selected website offers may be beyond the first page of the catalogue.
        if (initialCheckout) {
          for (let page = 2; page <= Number(payload?.last_page || 1); page += 1) {
            if (savedOfferIds.every((id) => rows.some((offer) => String(offer.id) === id))) break;
            const next = await http.get("/student/offers", {
              params: {
                per_page: 100,
                page,
                ...(studentId ? { student_id: studentId } : {}),
                ...(savedItems.some((item) => item?.isCpf) ? { include_cpf: 1 } : {}),
                ...(savedOfferIds.length ? { cart_offer_ids: savedOfferIds } : {}),
              },
            });
            if (!active) return;
            rows.push(...(next.data?.offers?.data || []));
          }
        }
        const loggedBoiteType = normalizeBoiteType(response.data?.boite_type);
        if (loggedBoiteType === null) {
          throw new Error("Le type de boîte de l'élève est introuvable.");
        }
        // Hard client-side guard: a manual student never sees BA cards and an
        // automatic student never sees BM cards, except the existing menu
        // offer used by additional services. That menu deliberately contains
        // service lines for both learner types.
        const matchingRows = rows.filter(
          (offer) => Number(offer.is_auto) === loggedBoiteType
            || normalizeOfferName(offer.name) === "permis a la carte"
            || savedOfferIds.includes(String(offer.id))
        );

        if (!active) return;

        const commanderOffers = matchingRows.map(toCommanderOffer);
        setOffers(commanderOffers);

        if (initialCheckout) {
          const importedItems = savedItems
            .map((saved) => {
              const offer = resolveCartOffer(saved, commanderOffers);
              if (!offer) {
                throw new Error(`L’offre « ${saved?.title || saved?.name || "sélectionnée"} » n’est pas disponible pour votre agence ou votre type de boîte. Veuillez modifier votre panier.`);
              }
              return hydrateCartItem(saved, offer);
            });

          if (importedItems.length) {
            setCartItems(importedItems);
            setView("checkout");
          }
        }
      } catch (requestError) {
        if (active) {
          setOffers([]);
          setOffersError(requestError.response?.data?.message || requestError.message || "Impossible de charger les offres de votre agence.");
        }
      } finally {
        if (active) setOffersLoading(false);
      }
    }

    loadOffers();
    return () => { active = false; };
  }, [studentId, initialCheckout]);

  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * itemQuantity(item), 0), [cartItems]);

  const totalLabel = useMemo(() => {
    if (cartItems.length === 0) return "Choisissez une offre";
    return `${cartItems.length} offre${cartItems.length > 1 ? "s" : ""} • ${formatPrice(total)}`;
  }, [cartItems, total]);

  function handleAddOffer(offer) {
    setCartItems((prev) => (prev.some((item) => item.id === offer.id) ? prev : [...prev, offer]));
    setShowSuccess(true);
  }

  function handleRemoveOffer(id) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    if (initialCheckout) {
      try {
        const savedItems = JSON.parse(window.localStorage.getItem("ppf_cart") || "[]");
        window.localStorage.setItem("ppf_cart", JSON.stringify(savedItems.filter((item) => String(item.id) !== String(id))));
      } catch {
        return;
      }
    }
  }

  function handlePaymentSuccess() {
    if (initialCheckout) window.localStorage.removeItem("ppf_cart");
    setPaidOffers(cartItems);
    setCartItems([]);
    setView("catalog");
    setShowPaymentSuccess(true);
    onPaymentCompleted();
    navigate("/", { replace: true });
  }

  if (view === "checkout" && cartItems.length > 0) {
    return (
      <CheckoutPage
        items={cartItems}
        studentId={studentId}
        student={checkoutStudent}
        onBack={initialCheckout ? onHome : () => setView("catalog")}
        onRemove={handleRemoveOffer}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  if (initialCheckout && paidOffers.length === 0) {
    return (
      <div className="cmd-page">
        <h1 className="cmd-title">Finalisez votre commande</h1>
        <p role={offersError ? "alert" : "status"}>{offersLoading ? "Chargement de votre panier…" : offersError || "Votre panier est vide."}</p>
        <button className="cmd-filter-button" onClick={onHome}>Retour aux offres</button>
      </div>
    );
  }

  return (
    <>
      <div className="cmd-page">
        <div className="cmd-head">
          <div className="kicker-text">
            <div className="cmd-kicker">EE</div>
            <div><h1 className="cmd-title">Choisissez l'offre qui vous convient</h1></div>
          </div>
          <button className="cmd-filter-button cmd-filter-button--icon" onClick={onOpenNotifications} aria-label="Notifications">
            <IconBell />
            <span className="cmd-filter-badge">{notifCount}</span>
          </button>
        </div>

        <div className="cmd-grid">
          {offersLoading && <p>Chargement des offres…</p>}
          {!offersLoading && offersError && <p style={{ color: "#b91c1c" }}>{offersError}</p>}
          {!offersLoading && !offersError && offers.length === 0 && <p>Aucune offre n'est disponible pour votre agence.</p>}
          {!offersLoading && offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              inCart={cartItems.some((item) => item.id === offer.id)}
              onAdd={handleAddOffer}
              onRemove={handleRemoveOffer}
            />
          ))}
        </div>

        {paidOffers.length > 0 && (
          <div className="cmd-payment-complete">
            <strong>Vos offres activées</strong>
            <span>{paidOffers.map((offer) => offer.name).join(" • ")}</span>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="cmd-bottom-bar">
            <button className="cmd-home-pill" onClick={onHome} aria-label="Accueil">
              <IconHome />
            </button>
            <button className="cmd-total-button" onClick={() => setShowCart(true)}>
              <IconCart />
              <span>{totalLabel}</span>
            </button>
          </div>
        )}
      </div>

      {showFilter && <FilterDrawer onClose={() => setShowFilter(false)} />}
      {showSuccess && <SuccessModal count={cartItems.length} onClose={() => setShowSuccess(false)} />}
      {showPaymentSuccess && <PaymentSuccessModal offers={paidOffers} onClose={() => setShowPaymentSuccess(false)} />}
      {showCart && cartItems.length > 0 && (
        <OffersDrawer
          items={cartItems}
          total={total}
          onClose={() => setShowCart(false)}
          onRemove={handleRemoveOffer}
          onCheckout={() => {
            setShowCart(false);
            setView("checkout");
          }}
        />
      )}
    </>
  );
}
