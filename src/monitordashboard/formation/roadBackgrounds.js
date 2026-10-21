import blank from "./assets/road-backgrounds/blank.svg";
import straightRoad from "./assets/road-backgrounds/straight-road.jpg";
import curvedRoad from "./assets/road-backgrounds/curved-road.jpg";
import tJunction from "./assets/road-backgrounds/t-junction.jpg";
import crossroadLights from "./assets/road-backgrounds/crossroad-lights.jpg";
import laneArrows from "./assets/road-backgrounds/lane-arrows.jpg";
import yieldJunction from "./assets/road-backgrounds/yield-junction.jpg";
import roundaboutYield from "./assets/road-backgrounds/roundabout-yield.jpg";
import roundabout from "./assets/road-backgrounds/roundabout.jpg";
import parallelParking from "./assets/road-backgrounds/parallel-parking.jpg";
import angledParking from "./assets/road-backgrounds/angled-parking.jpg";
import mergeLanes from "./assets/road-backgrounds/merge-lanes.jpg";
import signageJunction from "./assets/road-backgrounds/signage-junction.jpg";
import clutchDiagram from "./assets/road-backgrounds/clutch-diagram.jpg";

const createRoad = (id, name, src, category, width = 308, height = 462) => ({ id, name, src, category, asset: `road-backgrounds/${id}.jpg`, width, height });

export const ROAD_BACKGROUNDS = [
  { id: "blank", name: "Fond blanc", src: blank, category: "Neutre", asset: "road-backgrounds/blank.svg", width: 1000, height: 620 },
  createRoad("straight-road", "Route droite", straightRoad, "Routes"),
  createRoad("curved-road", "Route en courbe", curvedRoad, "Routes"),
  createRoad("t-junction", "Carrefour avec cédez-le-passage", tJunction, "Intersection", 318, 478),
  createRoad("crossroad-lights", "Carrefour à feux", crossroadLights, "Feux tricolores"),
  createRoad("lane-arrows", "Carrefour directionnel", laneArrows, "Intersection"),
  createRoad("yield-junction", "Carrefour à cédez-le-passage", yieldJunction, "Intersection"),
  createRoad("roundabout-yield", "Giratoire avec cédez-le-passage", roundaboutYield, "Giratoire"),
  createRoad("roundabout", "Giratoire", roundabout, "Giratoire"),
  createRoad("parallel-parking", "Stationnement en créneau", parallelParking, "Stationnement"),
  createRoad("angled-parking", "Stationnement en épi", angledParking, "Stationnement"),
  createRoad("merge-lanes", "Voies d’insertion", mergeLanes, "Routes", 308, 400),
  createRoad("signage-junction", "Carrefour avec signalisation", signageJunction, "Intersection", 308, 400),
  createRoad("clutch-diagram", "Pédales et embrayage", clutchDiagram, "Mécanique"),
];

export const ROAD_BACKGROUND_BY_ID = Object.fromEntries(ROAD_BACKGROUNDS.map((background) => [background.id, background]));
export function roadBackground(id) { return ROAD_BACKGROUND_BY_ID[id] || null; }
