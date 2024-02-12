import { RootStore } from "app/models";
import { TaskManagerError } from "expo-task-manager";

export interface T_task_loca {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export function tacheLocalisationBackground(
  locations: T_task_loca[],
  error: TaskManagerError,
  rootStore: RootStore,
) {
  const _debug = true;

  if (error) {
    console.error(error);
    return;
  }
  locations.forEach(location => {
    rootStore.suiviExcursion.ajoutPointTrackReel({
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      alt: location.coords.altitude,
      timestamp: location.timestamp,
    });
  });
}
