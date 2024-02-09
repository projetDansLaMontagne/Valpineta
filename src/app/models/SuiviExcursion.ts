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

type T_EtatExcursion = "nonDemarree" | "enCours" | "enPause" | "terminee";
const BACKGROUND_LOCATION_TASK_NAME = "background-location-task"; // Static sinon boucle entre suiviExcursion.ts et app.tsx

/* ------------------------------- PRIMITIVES ------------------------------- */
function changementEtatPossible(oldEtat: T_EtatExcursion, newEtat: T_EtatExcursion) {
  var possible = false;

  // Matrice des changements d'état possibles notee sur papier
  switch (oldEtat) {
    case "nonDemarree":
      if (newEtat === "enCours") {
        possible = true;
      }
      break;

    case "enCours":
      if (newEtat === "enPause" || newEtat === "terminee") {
        possible = true;
      }
      break;

    case "enPause":
      if (newEtat === "enCours" || newEtat === "terminee") {
        possible = true;
      }
      break;

    case "terminee":
      if (newEtat === "nonDemarree") {
        possible = true;
      }
      break;

    default:
      console.log("[ERREUR] Etat excursion inconnu");
      break;
  }

  return possible;
}

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
      reaction(
        () => self.etat,
        etat => {
          switch (etat) {
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
        },
      );
    },
    async startSuiviTrackReel() {
      console.log("Démarrage du suivi");

      
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
    async stopSuiviTrackReel() {
      // if (self.locationSubscription) {
      //   self.locationSubscription.remove();
      //   this.setLocationSubscription(null);
      // }
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
