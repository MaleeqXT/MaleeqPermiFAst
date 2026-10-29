import { useEffect, useState } from "react";
import http from "../../helpers/http.jsx";
import "./TabBasket.css";

const money = (amount) => Number(amount ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
// The admin catalogue price is `offers.price_ht`; this is the amount shown and saved in this cart.
const offerPrice = (offer) => Number(offer?.price_ht ?? offer?.final_price ?? offer?.discounted_price ?? offer?.original_price ?? 0);

export default function CandidateBasket({ candidateName = "", studentId, userId, boiteType }) {
  const [cart, setCart] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    if (!studentId || !userId) return;
    setLoading(true); setError("");
    try {
      const [cartResponse, offersResponse] = await Promise.all([
        http.get(`/admin/shop/cart/${userId}`),
        http.get("/admin/shop/offer", { params: { boite_type: boiteType } }),
      ]);
      setCart(cartResponse.data ?? null);
      const offerData = offersResponse.data?.data ?? offersResponse.data ?? [];
      setOffers(Array.isArray(offerData) ? offerData : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Impossible de charger le panier.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [studentId, userId, boiteType]);

  const items = cart?.cart_details ?? cart?.cartDetails ?? [];
  const cartOfferIds = new Set(items.map((item) => item.offer_id ?? item.offres_id));
  const total = items.reduce((sum, item) => sum + Number(item.price ?? offerPrice(item.offer)) * Number(item.quantity ?? 1), 0);
  const toggle = (offer) => setSelected((items) => items.some((item) => item.id === offer.id) ? items.filter((item) => item.id !== offer.id) : [...items, offer]);

  const save = async () => {
    if (!selected.length) return;
    setSaving(true); setError("");
    try {
      await http.post(`/admin/shop/cart/${userId}`, {
        student_id: studentId,
        data: selected.map((offer) => ({
          offer_id: offer.id,
          quantity: 1,
          tranches: Number(offer.multi_payment ?? 1),
          selected_price_type: "final",
          price: offerPrice(offer),
          balance: Number(offer.balance ?? 0),
        })),
      });
      setSelected([]); setMessage("Les offres ont bien été ajoutées au panier."); await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Impossible d’ajouter les offres au panier.");
    } finally { setSaving(false); }
  };
  const remove = async (item) => {
    setSaving(true); setError("");
    try { await http.delete(`/admin/shop/cart/item/${item.id}`); setMessage("Offre retirée du panier."); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message ?? "Impossible de retirer cette offre."); }
    finally { setSaving(false); }
  };

  return <div className="cb-wrapper">
    <div className="cb-left">
      {message && <div className="cb-toast-msg">{message}</div>}{error && <div className="cb-toast-msg">{error}</div>}
      <div className="cb-pannier-label">Panier de {candidateName}</div>
      {loading ? <div className="cb-empty-state">Chargement…</div> : !items.length ? <div className="cb-empty-state"><div className="cb-empty-title">Aucune offre dans le panier</div><div className="cb-empty-sub">Veuillez sélectionner les offres à ajouter à votre panier.</div></div> : <>
        <div className="cb-cart-items">{items.map((item) => <div key={item.id} className="cb-cart-item"><div className="cb-cart-info"><div className="cb-cart-name">{item.offer?.name ?? "Offre"}</div>{Number(item.offer?.multi_payment ?? item.tranches ?? 1) > 1 && <div className="cb-offer-price">Paiement en {item.offer?.multi_payment ?? item.tranches} fois</div>}<div className="cb-cart-price">{money(item.price ?? offerPrice(item.offer))}</div></div><button className="cb-remove-btn" disabled={saving} onClick={() => remove(item)} title="Supprimer">×</button></div>)}</div>
        <div className="cb-summary"><div className="cb-summary-row"><span>Sous-total</span><span>{money(total)}</span></div><div className="cb-summary-row"><span>Offres :</span><span>{items.length}</span></div><div className="cb-summary-total"><span>Total :</span><span>{money(total)}</span></div></div>
      </>}
    </div>
    <div className="cb-divider"/>
    <div className="cb-right"><div className="cb-choose-label">Choisissez les offres à ajouter au panier</div><div className="cb-offers-list">
      {offers.map((offer) => { const inCart = cartOfferIds.has(offer.id); const isSelected = selected.some((item) => item.id === offer.id); return <button type="button" key={offer.id} disabled={inCart || saving} className={`cb-offer-row${isSelected ? " selected" : ""}${inCart ? " in-cart" : ""}`} onClick={() => toggle(offer)}><div className="cb-offer-info"><div className="cb-offer-name">{offer.name}</div><div className="cb-offer-price">Prix HT <strong>{money(offerPrice(offer))}</strong></div></div>{(isSelected || inCart) && <span className="cb-offer-check">✓</span>}</button>; })}
    </div><button className={`cb-save-btn${selected.length ? " active" : ""}`} disabled={!selected.length || saving} onClick={save}>{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
  </div>;
}
