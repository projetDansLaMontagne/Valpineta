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
}
