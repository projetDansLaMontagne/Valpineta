import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import * as Location from "expo-location";
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
const T_excursion_suivie = types.model({
  index: types.number,
  track: types.array(T_point),
});
type T_etat_excursion = "nonDemarree" | "enCours" | "enPause" | "terminee";

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
    excursionSuivie: types.maybeNull(T_excursion_suivie),
    iPointCourant: 0,
    __DEV__: false,
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
    _setEtat(newEtat: T_etat_excursion) {
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
    _setExcursionSuivie(value: Instance<typeof T_excursion_suivie>) {
      self.excursionSuivie = value;
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
          excursionSuivie?: Instance<typeof T_excursion_suivie>; // Si on passe de nonDemarree a enCours, on doit fournir l excursionSuivie
        }
      | { newEtat: Exclude<T_etat_excursion, "enCours"> };
    /**
     * Méthode pour changer l etat
     * @prerequis le nouvel etat doit etre possible
     */
    async function setEtat(props: switchStateParams): Promise<boolean> {
      console.log(self.etat, "-->", props.newEtat);
      const { newEtat } = props;

      /* ------------------------------ Verifications ----------------------------- */
      let verificationsOK = false;
      switch (self.etat) {
        case "nonDemarree":
          if (newEtat === "enCours" && props.excursionSuivie !== undefined) verificationsOK = true;
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

      /* -------------------------- Actions consecutives -------------------------- */
      if (verificationsOK) {
        let aFonctionne: boolean;
        switch (newEtat) {
          case "nonDemarree":
            self._setTrackReel([]);
            self._setExcursionSuivie(undefined);
            self._setPointCourant(0);
            aFonctionne = true;
            break;
          case "enCours":
            self._setExcursionSuivie(props.excursionSuivie);
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
          console.error("[SuiviExcursion] Erreur : Impossible de changer d etat");
          return false;
        }
      } else {
        console.error("[SuiviExcursion] Erreur : Pre requis violés");
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
            timeInterval: self.__DEV__
              ? 1000
              : undefined /**@warning ne fonctionne pas sur Xiaomi. L'opti de batterie fait qu il envoie la loc seulement quand on bouge */,
            distanceInterval: self.__DEV__ ? undefined : DISTANCE_INTERVAL,

            pausesUpdatesAutomatically: self.__DEV__ ? false : true, // APPLE only : permet d envoyer moins de loc si elles sont rapprochees
            showsBackgroundLocationIndicator: true, // APPLE only : pour changer l apparence du bandeau

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