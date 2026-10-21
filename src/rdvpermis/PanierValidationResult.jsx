import { validationMessage } from "./validationResult.js";

export default function PanierValidationResult({ result }) {
  if (!result) return null;

  return (
    <section className="rdv-validation-result" aria-label="Résultat de validation du panier">
      <h3>Résultat de validation du panier</h3>
      <p role="status" className={result.confirmed ? "rdv-success" : "rdv-validation-warning"}>
        {validationMessage(result)}
      </p>
      {result.items.map((item, index) => (
        <article className="rdv-validation-slot" key={`${item?.creneauId ?? "resultat"}-${index}`}>
          <strong>{item?.estReserve === true ? "Réservation confirmée" : item?.estReserve === false ? "Réservation refusée" : "Résultat à vérifier"}</strong>
          <span>Créneau : {item?.creneauId ?? "Non communiqué"}</span>
          {item?.examenId && <span>Examen : {item.examenId}</span>}
          {/* Keep every nested diagnostic, including unfamiliar provider fields. */}
          <pre className="rdv-json-value">{JSON.stringify(item, null, 2)}</pre>
        </article>
      ))}
      <details>
        <summary>Réponse complète de RdvPermis</summary>
        <pre className="rdv-json-value">{JSON.stringify(result.data, null, 2)}</pre>
      </details>
      {!result.confirmed && <p>Ne relancez pas la validation sans vérifier les examens déjà créés et les créneaux restant dans le panier.</p>}
    </section>
  );
}
