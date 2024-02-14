import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import * as Location from "expo-location";
import { TPoint } from "app/navigators";
import * as TaskManager from "expo-task-manager";

// Types
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
  dist: types.number,
});
type T_EtatExcursion = "nonDemarree" | "enCours" | "enPause" | "terminee";

// Constantes
const BACKGROUND_LOCATION_TASK_NAME = "background-location-task"; // Static sinon boucle entre suiviExcursion.ts et app.tsx
const ACCURACY = Location.Accuracy.Highest;
const DISTANCE_INTERVAL = 5;

/**
 * Model description here for TypeScript hints.
 */
export const SuiviExcursionModel = types
  .model("SuiviExcursion")
  .props({
    etat: "nonDemarree",
    trackReel: types.optional(types.array(T_point_GPX), []),
    trackSuivi: types.optional(types.array(T_point), []),
    iPointCourant: 0,
    __DEV__: true,
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => ({
    /* -------------------------------------------------------------------------- */
    /*                                   SETTERS                                  */
    /* -------------------------------------------------------------------------- */
    /**
     * Setter prive pour l intermediaire switchState
     */
    _setEtat(newEtat: T_EtatExcursion) {
      self.etat = newEtat;
    },
    /**
     * Setter privé pour le track reel
     */
    _setTrackReel(value: Instance<typeof T_point_GPX>[]) {
      self.trackReel.replace(value);
    },
    /**
     * Setter privé pour le track suivi
     */
    _setTrackSuivi(value: Instance<typeof T_point>[]) {
      self.trackSuivi.replace(value);
    },
    /**
     * Setter privé pour le point courant
     */
    _setPointCourant(value: number) {
      self.iPointCourant = value;
    },
    /**
     * Setter pour le point courant
     */
    setIPointCourant(value: number) {
      self.iPointCourant = value;
    },
  }))
  .actions(self => {
    /* -------------------------------------------------------------------------- */
    /*                                   PUBLIC                                   */
    /* -------------------------------------------------------------------------- */
    type switchStateParams =
      | {
          newEtat: "enCours";
          trackSuivi: Instance<typeof T_point>[];
        }
      | { newEtat: Exclude<T_EtatExcursion, "enCours"> };
    /**
     * Méthode pour changer l etat
     * @prerequis le nouvel etat doit etre possible
     */
    async function setEtat(props: switchStateParams): Promise<boolean> {
      console.log(self.etat, "-->", props.newEtat);
      const { newEtat } = props;

      /* ---------------------------------- Debug --------------------------------- */
      if (self.__DEV__ && newEtat == "enCours") {
        // En debug, on met un track personnalise pour pouvoir faire des tests
        const track: TPoint[] = require("assets/tests_examples/excursions.json")[0].track;
        props.trackSuivi = track as Instance<typeof T_point>[];
      }

      /* ------------------------------ Verifications ----------------------------- */
      let verificationsOK = false;
      // changement d etat possible
      switch (self.etat) {
        case "nonDemarree":
          if (newEtat === "enCours") verificationsOK = true;
          break;

        case "enCours":
          if (newEtat === "enPause" || newEtat === "terminee") verificationsOK = true;
          break;

        case "enPause":
          if (newEtat === "enCours" || newEtat === "terminee") verificationsOK = true;
          break;

        case "terminee":
          if (newEtat === "nonDemarree") verificationsOK = true;
          break;
      }
      // params : trackSuivi bien present
      if (newEtat === "enCours" && !props.trackSuivi) {
        verificationsOK = false;
      }

      /* -------------------------- Actions consecutives -------------------------- */
      if (verificationsOK) {
        let aFonctionne: boolean;
        switch (newEtat) {
          case "nonDemarree":
            self._setTrackReel([]);
            self._setTrackSuivi([]);
            self._setPointCourant(0);
            aFonctionne = true;
            break;
          case "enCours":
            self._setTrackSuivi(props.trackSuivi);
            aFonctionne = await startBackgroundTask();
            break;
          case "enPause":
            stopBackgroundTask();
            aFonctionne = true;
            break;
          case "terminee":
            stopBackgroundTask();
            /**@todo sauvegarde du track reel*/
            /**@todo publication avis*/
            aFonctionne = true;
            break;
        }
        if (aFonctionne === true) {
          self._setEtat(newEtat);
          return true;
        } else {
          console.warn("[SuiviExcursion] Erreur : Impossible de changer d etat");
          return false;
        }
      } else {
        console.warn("[SuiviExcursion] Erreur : Pre requis violés");
        return false;
      }
    }
    /**
     * Demande les permissions pour la localisation en front puis en back
     * @returns booleen indiquant si les permissions ont ete obtenues
     */
    async function requestPermissions(): Promise<boolean> {
      try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus === "granted") {
          const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
          if (backgroundStatus === "granted") {
            return true;
          }
        }
        return false;
      } catch (e) {
        console.warn("[requestPermissions]:", e);
        return false;
      }
    }
    function ajoutPointTrackReel(point: Instance<typeof T_point_GPX>) {
      self.trackReel.push(point);
      console.log("Ajout de ", point.lat, point.lon, point.alt);
    }

    /* -------------------------------------------------------------------------- */
    /*                                 PRIMITIVES                                 */
    /* -------------------------------------------------------------------------- */
    /**
     * Methode privee pour demarrer la tache de fond de suivi, en s assurant que les permissions sont ok
     */
    async function startBackgroundTask(): Promise<boolean> {
      const permissionsOK = await requestPermissions();

      if (permissionsOK) {
        if ((await tacheEnCours()) === false) {
          await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME, {
            accuracy: ACCURACY,
            timeInterval: self.__DEV__ ? 1000 : undefined,
            distanceInterval: self.__DEV__ ? undefined : DISTANCE_INTERVAL,

            foregroundService: {
              notificationTitle: "Suivi de votre randonnées en cours",
              notificationBody:
                "Ne fermez pas l'application sinon vous ne pourrez plus être suivi.",
              killServiceOnDestroy: true,
            },
          });

          console.log("Suivi en arrière-plan lancé");
        } else {
          TaskManager.getRegisteredTasksAsync().then(console.log);
          console.log("Suivi en arrière-plan déjà en cours");
        }

        return true;
      } else {
        return false;
      }
    }
    /**
     * Methode privee qui indique si la tache de fond est en cours
     */
    async function tacheEnCours(): Promise<boolean> {
      return await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
    }
    /**
     * Methode privee pour arreter la tache de fond de suivi
     */
    async function stopBackgroundTask() {
      if ((await tacheEnCours()) === true) {
        console.log("ARRET DE LA TACHE EN COURS");
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
      }
    }

    return { setEtat, requestPermissions, ajoutPointTrackReel, tacheEnCours };
  }); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SuiviExcursion extends Instance<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotOut extends SnapshotOut<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotIn extends SnapshotIn<typeof SuiviExcursionModel> {}
export const createSuiviExcursionDefaultModel = () => types.optional(SuiviExcursionModel, {});