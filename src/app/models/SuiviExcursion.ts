import { Instance, SnapshotIn, SnapshotOut, onSnapshot, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { autorun, reaction, when } from "mobx";
import * as Location from "expo-location";
import { set } from "date-fns";
import * as TaskManager from "expo-task-manager";

const T_point = types.model({
  lat: types.number,
  lon: types.number,
  alt: types.number,
});

const typesExcursion = ["nonDemarree", "enCours", "enPause", "terminee"] as const;
type T_EtatExcursion = (typeof typesExcursion)[number];

function changementEtatPossible(oldEtat: T_EtatExcursion, newEtat: T_EtatExcursion) {
  var possible = false;

  // Matrice des changements d'état possibles notee sur papier
  switch (oldEtat) {
    case typesExcursion[0]:
      if (newEtat === typesExcursion[1]) {
        possible = true;
      }
      break;

    case typesExcursion[1]:
      if (newEtat === typesExcursion[2] || newEtat === typesExcursion[3]) {
        possible = true;
      }
      break;

    case typesExcursion[2]:
      if (newEtat === typesExcursion[1] || newEtat === typesExcursion[3]) {
        possible = true;
      }
      break;

    case typesExcursion[3]:
      if (newEtat === typesExcursion[0]) {
        possible = true;
      }
      break;

    default:
      console.log("[ERREUR] Etat excursion inconnu");
      break;
  }

  return possible;
}

const LOCATION_TASK_NAME = "background-location-task";

/**
 * Model description here for TypeScript hints.
 */
export const SuiviExcursionModel = types
  .model("SuiviExcursion")
  .props({
    // types.frozen pour ne pas repeter les types.
    etat: types.optional(types.frozen(), "nonDemarree"),
    trackReel: types.optional(types.array(T_point), []),
    locationSubscription: types.maybeNull(types.frozen()),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => ({
    afterCreate() {
      autorun(() => {
        switch (self.etat) {
          case "nonDemarree":
            this.setTrackReel([]);
            console.log("Reinitialisation du track reel");
            break;
          case "enCours":
            this.startSuiviTrackReel();
            break;
          case "enPause":
            this.stopSuiviTrackReel();
            break;
          case "terminee":
            this.stopSuiviTrackReel();
            console.log("Enregistrement du track reel");
            break;

          default:
            console.log("[ERREUR] Etat excursion inconnu");
            break;
        }
      });
    },
    async startSuiviTrackReel() {
      console.log("Démarrage du suivi");

      /** @todo repetition (faut créer un contexte) */
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        console.log("Permission de localisation refusée");
        return;
      }
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        console.log("Permission de localisation refusée");
        return;
      }

      TaskManager.defineTask(LOCATION_TASK_NAME, ({ data: { locations }, error }) => {
        if (error) {
          console.error(error);
          return;
        }
        console.log("Received new locations in background", locations);
        // Traitez les mises à jour de localisation ici.
        // Par exemple, enregistrez-les dans un état ou envoyez-les à un serveur.
      });

      Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
      });
      console.log("Suivi en arrière-plan démarré");

      // const subscription = await Location.watchPositionAsync(
      //   {
      //     /**@todo parametres a definri avec bruyere */
      //     accuracy: Location.Accuracy.BestForNavigation,
      //     timeInterval: 5000 /** @todo en dur a changer  */,
      //   },
      //   location => {
      //     this.ajoutPointTrackReel({
      //       lat: location.coords.latitude,
      //       lon: location.coords.longitude,
      //       alt: location.coords.altitude,
      //     });
      //   },
      // );

      // this.setLocationSubscription(subscription);
    },
    stopSuiviTrackReel() {
      // if (self.locationSubscription) {
      //   self.locationSubscription.remove();
      //   this.setLocationSubscription(null);
      // }
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("Arrêt du suivi");
    },

    // SETTERS
    setEtat(etat: T_EtatExcursion) {
      if (changementEtatPossible(self.etat, etat)) {
        self.etat = etat;
      } else {
        console.log("[ERREUR NON GEREE] Changement d'état impossible");
      }
    },
    ajoutPointTrackReel(point: Instance<typeof T_point>) {
      self.trackReel.push(point);
      console.log("Ajout de ", point.lat, point.lon, point.alt);
    },
    setTrackReel(value: Instance<typeof T_point>[]) {
      self.trackReel.replace(value);
    },
    setLocationSubscription(value: Location.LocationSubscription) {
      self.locationSubscription = value;
    },
  })); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SuiviExcursion extends Instance<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotOut extends SnapshotOut<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotIn extends SnapshotIn<typeof SuiviExcursionModel> {}
export const createSuiviExcursionDefaultModel = () => types.optional(SuiviExcursionModel, {});
