import { T_Point } from "app/components";
import { Coordonnees } from "../screens/DetailsExcursionScreen/DetailsExcursionScreen";
import { TPoint, T_flat_point } from "app/navigators";

// Fonction de calcul de distance entre deux coordonnées
export const distanceEntrePoints = (coord1: T_flat_point, coord2: T_flat_point) => {
  // Assurez-vous que coord1 et coord2 sont définis
  console.log("coord1", coord1);
  console.log("coord2", coord2);
  if (
    !coord1 ||
    typeof coord1.lat === "undefined" ||
    typeof coord1.lon === "undefined" ||
    !coord2 ||
    typeof coord2.lat === "undefined" ||
    typeof coord2.lon === "undefined"
  ) {
    /**@warning Il faut gerer cette erreur au lieu de faire planter l'appli */
    throw new Error("Coordonnées non valides");
  }

  // Rayon moyen de la Terre en kilomètres
  const R = 6371;

  // Convertir les degrés en radians
  const toRadians = degree => degree * (Math.PI / 180);

  // Calcul des distances
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);

  // Formule de Haversine pour calculer la distance entre deux points
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
    Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  // Distance en radians
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance en kilomètres
  const distance = R * c;

  return distance;
};
