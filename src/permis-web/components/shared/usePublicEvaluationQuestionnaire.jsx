import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import http from "../../../helpers/http.jsx";
import { useCart } from "../../context/CartContext";
import EvaluationQuestionnaire from "./EvaluationQuestionnaire.jsx";
import purpleClipboard from "../../assets/purple-clipboard.jpeg";

const AGENCY_BY_ZONE_ID = {
  "9eeb1c0b-3a2a-41f6-8887-e17879995335": "creil",
  "9ef0999c-3842-4de1-ade2-d88412135519": "toulouse",
};

const agencyKey = (value) => String(value || "")
  .toLocaleLowerCase("fr-FR")
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .trim()
  .replace("criel", "creil");

const parseAgencyPricing = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const offerRows = (response) => {
  const data = response?.data?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/**
 * Public-site entry to the Évaluation de conduite / Bilan services. Every
 * "réserver une évaluation" action goes through the questionnaire, which then
 * adds the real offer of the service it determined to the cart.
 */
export default function usePublicEvaluationQuestionnaire() {
  const currentUser = useSelector((state) => state.auth.user);
  const { items, addItem, removeItem, openDrawer } = useCart();
  const [open, setOpen] = useState(false);

  const zoneId = currentUser?.student?.zone_id ?? currentUser?.zone_id;
  const agency = agencyKey(
    currentUser?.student?.agency?.name
      ?? currentUser?.agency?.name
      ?? currentUser?.student?.zone?.name
      ?? currentUser?.zone?.name
      ?? AGENCY_BY_ZONE_ID[zoneId],
  ) || "creil";
  const rawBoiteType = currentUser?.student?.boite_type ?? currentUser?.boite_type;
  const defaultIsAuto = [0, 1, "0", "1"].includes(rawBoiteType) ? Number(rawBoiteType) : null;

  const loadOffers = useCallback(async (service, isAuto) => {
    const response = await http.get("/public/offers", {
      params: { status: 1, per_page: 100, evaluation_service: service, is_auto: isAuto, ignore_student_boite_type: 1, boite_type: isAuto },
    });

    return offerRows(response)
      .filter((offer) => offer.evaluation_service === service && Number(offer.is_auto) === Number(isAuto))
      .map((offer) => {
        const pricing = parseAgencyPricing(offer.agency_pricing);
        const agencyPricing = pricing.find((entry) => agencyKey(entry?.agency) === agency);
        if (pricing.length && !agencyPricing) return null;
        const price = Number(agencyPricing?.discounted_price ?? agencyPricing?.price_ht ?? agencyPricing?.original_price ?? offer.price_ht ?? offer.original_price ?? offer.final_price) || 0;
        return { id: offer.id, name: offer.name, price, balance: Number(agencyPricing?.balance ?? offer.balance) || 0, isAuto: Number(offer.is_auto), raw: offer };
      })
      .filter(Boolean);
  }, [agency]);

  const onConfirm = useCallback(({ offer, service, answers }) => {
    const role = String(currentUser?.role ?? "").trim().toLowerCase();
    if (currentUser && (role !== "student" || currentUser?.is_secretary === true)) {
      throw new Error("Seuls les élèves peuvent réserver une évaluation.");
    }

    // One pre-training service per order: replace any other evaluation /
    // bilan already in the cart, including the legacy "PASS ÉVALUATION" item.
    items
      .filter((item) => item.evaluationService || item.id === "simulateur")
      .forEach((item) => removeItem(item.id));

    addItem({
      id: offer.id,
      offer_id: offer.id,
      title: offer.name,
      offerName: offer.name,
      image: purpleClipboard,
      price: offer.price,
      type: offer.isAuto === 1 ? "automatic" : "manual",
      balance: offer.balance,
      isCpf: false,
      installments: 1,
      paymentAmount: offer.price,
      quantity: 1,
      evaluationService: service,
      questionnaire: answers,
    });
    setOpen(false);
    openDrawer();
  }, [addItem, currentUser, items, openDrawer, removeItem]);

  const close = useCallback(() => setOpen(false), []);
  const openQuestionnaire = useCallback(() => setOpen(true), []);

  const questionnaire = (
    <EvaluationQuestionnaire
      open={open}
      onClose={close}
      loadOffers={loadOffers}
      onConfirm={onConfirm}
      defaultIsAuto={defaultIsAuto}
    />
  );

  return { openQuestionnaire, questionnaire };
}
