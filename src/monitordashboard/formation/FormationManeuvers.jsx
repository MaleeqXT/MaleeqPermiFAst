import { Minus, Plus } from "lucide-react";

export const MANEUVER_GROUPS = [
  {
    title: "Stationnement",
    maneuvers: [
      { id: "epi_droit", label: "Épi à droite", icon: "diagonal-right" },
      { id: "epi_gauche", label: "Épi à gauche", icon: "diagonal-left" },
      { id: "bataille_droit", label: "Bataille à droite", icon: "parallel-right" },
      { id: "bataille_gauche", label: "Bataille à gauche", icon: "parallel-left" },
      { id: "creneau_droit", label: "Créneau droit", icon: "bay-right" },
      { id: "creneau_gauche", label: "Créneau gauche", icon: "bay-left" },
    ],
  },
  {
    title: "Autres manœuvres",
    maneuvers: [
      { id: "marche_arriere", label: "Marche arrière", icon: "reverse" },
      { id: "arriere_courbe", label: "Arrière courbe", icon: "reverse-curve" },
      { id: "demi_tour", label: "Demi tour", icon: "u-turn" },
      { id: "demarrage_cote", label: "Démarrage en côte", icon: "hill" },
      { id: "giratoire", label: "Giratoire", icon: "roundabout" },
      { id: "arret_precision", label: "Arrêt de précision", icon: "precision-stop" },
    ],
  },
];

export const MANEUVER_LABELS = Object.fromEntries(
  MANEUVER_GROUPS.flatMap((group) => group.maneuvers.map((maneuver) => [maneuver.id, maneuver.label])),
);

import diagonalRightIcon from "../../assets/formation-maneuvers/diagonal-right.png";
import diagonalLeftIcon from "../../assets/formation-maneuvers/diagonal-left.png";
import parallelRightIcon from "../../assets/formation-maneuvers/parallel-right.png";
import parallelLeftIcon from "../../assets/formation-maneuvers/parallel-left.png";
import bayRightIcon from "../../assets/formation-maneuvers/bay-right.png";
import bayLeftIcon from "../../assets/formation-maneuvers/bay-left.png";
import reverseIcon from "../../assets/formation-maneuvers/reverse.png";
import reverseCurveIcon from "../../assets/formation-maneuvers/reverse-curve.png";
import uTurnIcon from "../../assets/formation-maneuvers/u-turn.png";
import hillIcon from "../../assets/formation-maneuvers/hill.png";
import roundaboutIcon from "../../assets/formation-maneuvers/roundabout.png";
import precisionStopIcon from "../../assets/formation-maneuvers/precision-stop.png";

const MANEUVER_ICONS = {
  "diagonal-right": diagonalRightIcon, "diagonal-left": diagonalLeftIcon,
  "parallel-right": parallelRightIcon, "parallel-left": parallelLeftIcon,
  "bay-right": bayRightIcon, "bay-left": bayLeftIcon,
  reverse: reverseIcon, "reverse-curve": reverseCurveIcon, "u-turn": uTurnIcon,
  hill: hillIcon, roundabout: roundaboutIcon, "precision-stop": precisionStopIcon,
};

export function ManeuverGlyph({ variant }) {
  return <img className="mf-maneuver-glyph" src={MANEUVER_ICONS[variant]} alt="" draggable="false" />;
}
export default function FormationManeuvers({ counts = {}, onChange, disabled = false }) {
  const changeCount = (id, delta) => {
    const nextValue = Math.max(0, Math.min(9, Number(counts[id] || 0) + delta));
    onChange({ ...counts, [id]: nextValue });
  };

  return <div className="mf-maneuver-editor">
    <p className="mf-muted">Ajoutez ou retirez chaque manœuvre réalisée pendant cette leçon.</p>
    {MANEUVER_GROUPS.map((group) => <section key={group.title} className="mf-maneuver-group">
      <h3>{group.title}</h3>
      <div className="mf-maneuver-grid">
        {group.maneuvers.map((maneuver) => {
          const count = Number(counts[maneuver.id] || 0);
          return <article key={maneuver.id} className={`mf-maneuver-tile ${count ? "selected" : ""}`}>
            <span className="mf-maneuver-label">{maneuver.label}</span>
            <button type="button" className="mf-maneuver-add" disabled={disabled || count >= 9} aria-label={`Ajouter ${maneuver.label}`} onClick={() => changeCount(maneuver.id, 1)}><Plus size={20} /></button>
            <span className="mf-maneuver-icon"><ManeuverGlyph variant={maneuver.icon} />{count > 0 && <b>{count}</b>}</span>
            <button type="button" className="mf-maneuver-remove" disabled={disabled || count === 0} aria-label={`Retirer ${maneuver.label}`} onClick={() => changeCount(maneuver.id, -1)}><Minus size={21} /></button>
          </article>;
        })}
      </div>
    </section>)}
  </div>;
}
export function SavedManeuvers({ counts = {} }) {
  const selected = MANEUVER_GROUPS.flatMap((group) => group.maneuvers).filter((maneuver) => Number(counts[maneuver.id] || 0) > 0);
  if (!selected.length) return <p className="mf-muted mf-saved-maneuvers-empty">Aucune manœuvre renseignée.</p>;
  return <div className="mf-saved-maneuvers" aria-label="Manœuvres enregistrées">
    {selected.map((maneuver) => { const count = Number(counts[maneuver.id]); return <article key={maneuver.id} className="mf-saved-maneuver"><span className="mf-saved-maneuver-icon"><ManeuverGlyph variant={maneuver.icon} />{count > 1 && <b>{count}</b>}</span><span>{maneuver.label}</span></article>; })}
  </div>;
}