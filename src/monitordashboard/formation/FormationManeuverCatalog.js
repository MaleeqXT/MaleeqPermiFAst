export const MANEUVER_GROUPS = [
  { title: "Stationnement", maneuvers: [
    { id: "epi_droit", label: "Stationnement en épi avant/arrière", icon: "diagonal-right" },
    { id: "epi_gauche", label: "Stationnement en épi avant/arrière (sens inverse)", icon: "diagonal-left" },
    { id: "bataille_droit", label: "Stationnement bataille avant/arrière", icon: "parallel-right" },
    { id: "bataille_gauche", label: "Stationnement bataille avant/arrière (sens inverse)", icon: "parallel-left" },
    { id: "creneau_droit", label: "Stationnement créneau", icon: "bay-right" },
    { id: "creneau_gauche", label: "Stationnement créneau (sens inverse)", icon: "bay-left" },
  ] },
  { title: "Autres manœuvres", maneuvers: [
    { id: "marche_arriere", label: "Marche arrière en ligne droite", icon: "reverse" },
    { id: "arriere_courbe", label: "Marche arrière en courbe", icon: "reverse-curve" },
    { id: "demi_tour", label: "Demi-tour", icon: "u-turn" },
    { id: "demarrage_cote", label: "Démarrage en côte", icon: "hill" },
    { id: "giratoire", label: "Giratoire", icon: "roundabout" },
    { id: "arret_precision", label: "Arrêt de précision", icon: "precision-stop" },
  ] },
];

export const MANEUVER_LABELS = Object.fromEntries(MANEUVER_GROUPS.flatMap((group) => group.maneuvers.map((maneuver) => [maneuver.id, maneuver.label])));
export const RATING_LABELS = { 1: "Découverte — rouge", 2: "Avec aide / intervention — orange", 3: "Seul, à consolider — jaune", 4: "Maîtrisée en sécurité — vert" };

export function maneuverGroups(catalog) {
  if (!Array.isArray(catalog)) return MANEUVER_GROUPS;
  const groups = new Map();
  catalog.forEach((item) => {
    const title = item.group || item.group_name || "Autres manœuvres";
    const maneuver = { id: item.slug || item.id, label: item.name || item.label || "Manœuvre", icon: item.icon || "" };
    groups.set(title, [...(groups.get(title) || []), maneuver]);
  });
  return [...groups.entries()].map(([title, maneuvers]) => ({ title, maneuvers }));
}

export function maneuverLabel(id, catalog = []) {
  const match = (catalog || []).find((item) => (item.slug || item.id) === id);
  return match?.name || match?.label || MANEUVER_LABELS[id] || id;
}
