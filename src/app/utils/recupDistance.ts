/**@warning cette fonction n est pas utile. On peit acceder a cette distance en soustrayant la distance du point par la sienne  */

// A SUPPRIMER : importation Coordonnees
import { T_flat_point, TPoint } from "app/navigators";
import { distanceEntrePoints } from "./distanceEntrePoints";

//Fonction me permettant de récupérer la distance entre l'utilisateur et le signalement en passant par les points du tracé
export const recupDistance = (point: T_flat_point, data: TPoint[]): number => {
  if (!point || !point.lat || !point.lon) {
    console.error("Coordonnées du signalement non valides");
    return 0;
  }

  // Initialiser la distance minimale avec une valeur élevée
  let distanceMinimale: number = Number.MAX_VALUE;

  let coordPointPlusProche: TPoint;

  // Parcourir toutes les coordonnées dans le fichier
  for (const coord of data) {
    // Assurez-vous que les coordonnées dans le fichier sont définies
    if (!coord.lat || !coord.lon) {
      console.error("Coordonnées dans le fichier non valides");
      continue;
    }

    // Calculer la distance entre le signalement et la coordonnée actuelle du fichier
    const distanceSignalementPointLePlusProche = distanceEntrePoints(point, coord);

    // Mettre à jour la distance minimale si la distance actuelle est plus petite
    if (distanceSignalementPointLePlusProche < distanceMinimale) {
      distanceMinimale = distanceSignalementPointLePlusProche;
      coordPointPlusProche = coord;
    }
  }

  const distanceDepartPointLePlusProche =
    Math.round((coordPointPlusProche.dist / 1000) * 100) / 100;

  //Distance totale DANS UN MONDE PARFAIT et pour calculer le temps de parcours en ajoutant la distance entre le point le plus proche et le départ sauf qu'il faut faire un algo parce que le point le pls proche peut ne pas être le point suivant (exemple un circuit qui fait un aller retour ou les points allez et retour sont proches)
  // const distanceTotale = distanceMinimale + distanceDepartPointLePlusProche; //c'est donc pas vraiment ce calcul qu'il faut faire
  // return distanceTotale;
  return distanceDepartPointLePlusProche;
};
