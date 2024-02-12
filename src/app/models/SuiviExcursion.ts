import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { reaction } from "mobx";
import * as Location from "expo-location";

const T_point_GPX = types.model({
  lat: types.number,
  lon: types.number,
  alt: types.number,
  timestamp: types.number,
});

const T_point = types.model({
  lat: types.number,
  lon: types.number,
  alt: types.number,
});

type T_EtatExcursion = "nonDemarree" | "enCours" | "enPause" | "terminee";
const BACKGROUND_LOCATION_TASK_NAME = "background-location-task"; // Static sinon boucle entre suiviExcursion.ts et app.tsx
const BACKGROUND_POSITIONNING_ON_TRACK_TASK_NAME = "background-positionning-on-track-task"; // Static sinon boucle entre suiviExcursion.ts et app.tsx

/**
 * Model description here for TypeScript hints.
 */
export const SuiviExcursionModel = types
  .model("SuiviExcursion")
  .props({
    // types.frozen pour ne pas repeter les types.
    etat: types.optional(types.frozen(), "nonDemarree"),
    trackReel: types.optional(types.array(T_point_GPX), []),
    trackSuivi: types.optional(types.array(T_point), []),
    pointCourant: types.optional(types.number, 0),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => {
    function afterCreate() {
      reaction(
        () => self.etat,
        etat => {
          switch (etat) {
            case "nonDemarree":
              setTrackReel([]);
              setTrackSuivi([]);
              setPointCourant(0);
              console.log("Reinitialisation infos de suivi");
              break;
            case "enCours":
              startSuiviTrackReel();
              break;
            case "enPause":
              stopSuiviTrackReel();
              break;
            case "terminee":
              stopSuiviTrackReel();
              // sauvegarde du track reel
              // publication avis
              break;
          }
        },
      );
    }

    /* -------------------------------------------------------------------------- */
    /*                                   PUBLIC                                   */
    /* -------------------------------------------------------------------------- */
    /**
     * Méthode pour changer l etat
     * @prerequis le nouvel etat doit etre possible
     * @param params parametres supplementaires telle que l excursion modele si on lance une nouvelle excursion
     */
    function setEtat(newEtat: T_EtatExcursion, trackSuivi?: Instance<typeof T_point>[]) {
      var changementPossible = false;

      // Matrice des changements d'état possibles notee sur papier
      switch (self.etat) {
        case "nonDemarree":
          if (newEtat === "enCours") changementPossible = true;
          break;

        case "enCours":
          if (newEtat === "enPause" || newEtat === "terminee") changementPossible = true;
          break;

        case "enPause":
          if (newEtat === "enCours" || newEtat === "terminee") changementPossible = true;
          break;

        case "terminee":
          if (newEtat === "nonDemarree") changementPossible = true;
          break;

        default:
          console.log("[ERREUR] Etat excursion inconnu");
          break;
      }

      // Cas specifique : Verif params supplementaires
      // if (newEtat === "enCours" && !trackSuivi) {
      //   changementPossible = false;
      // }

      // Attribution
      if (changementPossible) {
        self.etat = newEtat;

        // if (newEtat === "enCours") {
        //   setTrackSuivi(trackSuivi);
        //   const track: T_excursion = require("assets/JSON/excursions.json")[0].track;
        //   setTrackSuivi(track);
        //   console.log(track.nom);
        // }
      } else {
        console.log("Changement d etat impossible : mauvaise utilisation de setEtat()");
      }

      switch (newEtat) {
        case "nonDemarree":
          setTrackReel([]);
          setTrackSuivi([]);
          setPointCourant(0);
          console.log("Reinitialisation infos de suivi");
          break;
        case "enCours":
          startSuiviTrackReel();
          break;
        case "enPause":
          stopSuiviTrackReel();
          break;
        case "terminee":
          stopSuiviTrackReel();
          // sauvegarde du track reel
          // publication avis
          break;
      }
    }
    /**
     * Demande les permissions pour la localisation en front puis en back
     * @returns booleen indiquant si les permissions ont ete obtenues
     */
    async function requestPermissions(): Promise<boolean> {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus === "granted") {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === "granted") {
          console.log("[SuiviExucrsion] LOCC BACK OK");
          return true;
        }
      }
      return false;
    }
    function ajoutPointTrackReel(point: Instance<typeof T_point_GPX>) {
      self.trackReel.push(point);
      console.log("Ajout de ", point.lat, point.lon, point.alt);
    }

    /* -------------------------------------------------------------------------- */
    /*                                   PRIVE                                    */
    /* -------------------------------------------------------------------------- */
    /**
     * Methode privee pour demarrer la tache de fond de suivi, en s assurant que les permissions sont ok
     */
    async function startSuiviTrackReel() {
      const permissionsOK = await requestPermissions();

      BACKGROUND_POSITIONNING_ON_TRACK_TASK_NAME;
      if (permissionsOK) {
        if (!(await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME))) {
          Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            // timeInterval: 1000,
            // distanceInterval: 5
            // showsBackgroundLocationIndicator: true,
            // deferredUpdatesDistance: 20,
            foregroundService: {
              notificationTitle: "Using your location",
              notificationBody: "To turn off, go back to the app and switch something off.",
              killServiceOnDestroy: true,
            },
          });

          console.log("Suivi en arrière-plan démarré");
        } else {
          console.log("Suivi en arrière-plan déjà en cours");
        }
      }
    }
    /**
     * Methode privee pour arreter la tache de fond de suivi
     */
    async function stopSuiviTrackReel() {
      if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME)) {
        Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
      }
      console.log("Arrêt du suivi");
    }
    /**
     * Setter privé pour le track reel
     */
    function setTrackReel(value: Instance<typeof T_point_GPX>[]) {
      self.trackReel.replace(value);
    }
    /**
     * Setter privé pour le track suivi
     */
    function setTrackSuivi(value: Instance<typeof T_point>[]) {
      self.trackSuivi.replace(value);
    }
    /**
     * Setter privé pour le point courant
     */
    function setPointCourant(value: number) {
      self.pointCourant = value;
    }

    return { afterCreate, setEtat, requestPermissions, ajoutPointTrackReel };
  }); // eslint-disable-line @typescript-eslint/no-unused-vars
export interface SuiviExcursion extends Instance<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotOut extends SnapshotOut<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotIn extends SnapshotIn<typeof SuiviExcursionModel> {}
export const createSuiviExcursionDefaultModel = () => types.optional(SuiviExcursionModel, {});
