import { SuiviExcursion } from "app/models/SuiviExcursion";
import { TaskManagerError } from "expo-task-manager";
import { distanceEntrePoints } from "./distanceEntrePoints";
import { LocationObject } from "expo-location";
import { T_flat_point } from "app/navigators";

/**
 * Remplit suiviExcursion.trackReel des reelles coordonnees parcourues
 *
 */
export function tacheLocalisationBackground(
  locations: LocationObject[],
  error: TaskManagerError,
  suiviExcursion: SuiviExcursion,
) {
  if (error) {
    console.error(error);
    return;
  }

  locations.forEach(location => {
    suiviExcursion.ajoutPointTrackReel({
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      alt: location.coords.altitude,
      timestamp: location.timestamp,
    });
  });

  // Positionnement sur le track reel
  const { trackSuivi, trackReel } = suiviExcursion;

  const lastLoc = trackReel[trackReel.length - 1];
  const nbPoints = trackSuivi.length;
  const PX = { lat: lastLoc.lat, lon: lastLoc.lon }; //Position actuelle

  while (true) {
    /**@todo GESTION DU DEBUT ET FIN */
    const { iPointCourant } = suiviExcursion;

    // (prev) <------> (P) <--(PX)----> (next)
    const P = trackSuivi[iPointCourant]; //Dernier point validé

    const isFirstPoint = iPointCourant == 0;
    const isLastPoint = iPointCourant == nbPoints - 1;

    const prev = isFirstPoint ? undefined : trackSuivi[iPointCourant - 1];
    const next = isLastPoint ? undefined : trackSuivi[iPointCourant + 1];

    const distPPX = distanceEntrePoints(P, PX);
    const distNextPX = next ? distanceEntrePoints(next, PX) : undefined;
    const distPrevPX = prev ? distanceEntrePoints(prev, PX) : undefined;
    const distPNext = next ? next.dist - P.dist : undefined;

    const nextPointNearer = next && distNextPX < distPPX;
    const prevPointNearer = prev && distPrevPX < distPPX;
    const isLost = next && distPNext < distPPX;

    if (nextPointNearer) {
      // Plus proche du point suivant
      suiviExcursion.setIPointCourant(suiviExcursion.iPointCourant + 1);
    } else if (prevPointNearer) {
      // Plus proche du point precedent
      suiviExcursion.setIPointCourant(suiviExcursion.iPointCourant - 1);
    } else if (isLost) {
      // Perte de suivi : relocalisation
      suiviExcursion.setIPointCourant(nearestPointIndex(trackSuivi, PX));

      // Notif si point le plus proche trop ecarté
      const distNearest = distanceEntrePoints(PX, trackSuivi[suiviExcursion.iPointCourant]);
      if (distNearest > 30) {
        /**@todo GERER LES NOTIFS */
      }
    } else {
      // Pas de changement de point
      break;
    }
    break;
  }
}

/**
 * Recherche le point le plus proche d un point donne parmis tous ceux d un track
 */
function nearestPointIndex(track: T_flat_point[], point: T_flat_point): number {
  var nearestPointIndex = 0;
  for (let i = 0; i < track.length; i++) {
    const currentPoint = track[i];
    const nearestPoint = track[nearestPointIndex];

    const distCurrent = distanceEntrePoints(point, currentPoint);
    const distNearest = distanceEntrePoints(point, nearestPoint);

    if (distCurrent < distNearest) {
      // Le point est plus proche que l ancien
      nearestPointIndex = i;
    }
  }

  return nearestPointIndex;
}
