import { Minus, Plus } from "lucide-react";
import { RATING_LABELS, maneuverGroups, maneuverLabel } from "./FormationManeuverCatalog.js";

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
  const source = MANEUVER_ICONS[variant];
  return source ? <img className="mf-maneuver-glyph" src={source} alt="" draggable="false" /> : <span className="mf-maneuver-glyph mf-maneuver-glyph--generic" aria-hidden="true">↻</span>;
}

function normalizedRatings(ratings, id, count) {
  const values = Array.isArray(ratings?.[id]) ? ratings[id] : [ratings?.[id] || 1];
  return Array.from({ length: count }, (_, index) => Math.max(1, Math.min(4, Number(values[index] ?? values[0] ?? 1))));
}

export default function FormationManeuvers({ counts = {}, ratings = {}, maneuvers = [], onChange, onRatingsChange, disabled = false }) {
  const changeCount = (id, delta) => {
    const current = Number(counts[id] || 0);
    const nextValue = Math.max(0, Math.min(9, current + delta));
    onChange({ ...counts, [id]: nextValue });
    if (onRatingsChange) {
      const nextRatings = { ...ratings };
      if (!nextValue) delete nextRatings[id];
      else nextRatings[id] = normalizedRatings(ratings, id, nextValue);
      onRatingsChange(nextRatings);
    }
  };
  const changeRating = (id, index, value) => {
    const next = normalizedRatings(ratings, id, Number(counts[id] || 0));
    next[index] = Number(value);
    onRatingsChange?.({ ...ratings, [id]: next });
  };

  return <div className="mf-maneuver-editor">
    <p className="mf-muted">Ajoutez chaque manœuvre réalisée, puis indiquez le niveau atteint pour chaque passage.</p>
    {maneuverGroups(maneuvers).map((group) => <section key={group.title} className="mf-maneuver-group">
      <h3>{group.title}</h3>
      <div className="mf-maneuver-grid">
        {group.maneuvers.map((maneuver) => {
          const count = Number(counts[maneuver.id] || 0);
          return <article key={maneuver.id} className={`mf-maneuver-tile ${count ? "selected" : ""}`}>
            <span className="mf-maneuver-label">{maneuver.label}</span>
            <button type="button" className="mf-maneuver-add" disabled={disabled || count >= 9} aria-label={`Ajouter ${maneuver.label}`} onClick={() => changeCount(maneuver.id, 1)}><Plus size={20} /></button>
            <span className="mf-maneuver-icon"><ManeuverGlyph variant={maneuver.icon} />{count > 0 && <b>{count}</b>}</span>
            <button type="button" className="mf-maneuver-remove" disabled={disabled || count === 0} aria-label={`Retirer ${maneuver.label}`} onClick={() => changeCount(maneuver.id, -1)}><Minus size={21} /></button>
            {count > 0 && <div className="mf-maneuver-ratings">
              {normalizedRatings(ratings, maneuver.id, count).map((rating, index) => <label key={index}>Passage {index + 1}<select value={rating} disabled={disabled} onChange={(event) => changeRating(maneuver.id, index, event.target.value)}>{Object.entries(RATING_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}
            </div>}
          </article>;
        })}
      </div>
    </section>)}
  </div>;
}

export function SavedManeuvers({ counts = {}, ratings = {}, maneuvers = [] }) {
  const lookup = maneuverGroups(maneuvers).flatMap((group) => group.maneuvers);
  const selected = Object.entries(counts).filter(([, count]) => Number(count) > 0).map(([id]) => lookup.find((item) => item.id === id) || { id, label: maneuverLabel(id, maneuvers), icon: "" });
  if (!selected.length) return <p className="mf-muted mf-saved-maneuvers-empty">Aucune manœuvre renseignée.</p>;
  return <div className="mf-saved-maneuvers" aria-label="Manœuvres enregistrées">
    {selected.map((maneuver) => { const count = Number(counts[maneuver.id]); const lastRating = normalizedRatings(ratings, maneuver.id, count).at(-1); return <article key={maneuver.id} className="mf-saved-maneuver"><span className="mf-saved-maneuver-icon"><ManeuverGlyph variant={maneuver.icon} />{count > 1 && <b>{count}</b>}</span><span>{maneuver.label}</span><small className={`mf-maneuver-rating-badge rating-${lastRating}`}>Niv. {lastRating}</small></article>; })}
  </div>;
}
