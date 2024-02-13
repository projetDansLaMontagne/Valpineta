import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { reaction } from "mobx";
import * as Location from "expo-location";
import { TPoint } from "app/navigators";

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
const BACKGROUND_LOCATION_TASK_NAME = "background-location-task"; // Static sinon boucle entre suiviExcursion.ts et app.tsx

/**
 * Model description here for TypeScript hints.
 */
export const SuiviExcursionModel = types
  .model("SuiviExcursion")
  .props({
    etat: types.optional(types.frozen(), "nonDemarree"),
    trackReel: types.optional(types.array(T_point_GPX), []),
    trackSuivi: types.optional(types.array(T_point), []),
    iPointCourant: types.optional(types.number, 0),
    __debug__: types.optional(types.boolean, true),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => {
    /* -------------------------------------------------------------------------- */
    /*                                   PUBLIC                                   */
    /* -------------------------------------------------------------------------- */
    type setEtatParams =
      | {
          newEtat: "enCours";
          trackSuivi: Instance<typeof T_point>[];
        }
      | { newEtat: Exclude<T_EtatExcursion, "enCours"> };
    /**
     * Méthode pour changer l etat
     * @prerequis le nouvel etat doit etre possible
     * @param params parametres supplementaires telle que l excursion modele si on lance une nouvelle excursion
     */
    async function setEtat(props: setEtatParams): Promise<boolean> {
      console.log("CHANGEMENT ETAT");
      const { newEtat } = props;

      /* ---------------------------------- Debug --------------------------------- */
      if (self.__debug__ && newEtat == "enCours") {
        // En debug, on met un track personnalise pour pouvoir faire des tests
        const track: TPoint[] = require("assets/tests_examples/excursions.json")[0].track;
        props.trackSuivi = track as Instance<typeof T_point>[];
      }

      /* ------------------------------ Verifications ----------------------------- */
      var preRequisOK = false;
      // etats possibles
      switch (self.etat) {
        case "nonDemarree":
          if (newEtat === "enCours") preRequisOK = true;
          break;

        case "enCours":
          if (newEtat === "enPause" || newEtat === "terminee") preRequisOK = true;
          break;

        case "enPause":
          if (newEtat === "enCours" || newEtat === "terminee") preRequisOK = true;
          break;

        case "terminee":
          if (newEtat === "nonDemarree") preRequisOK = true;
          break;
      }
      // params
      if (newEtat === "enCours" && !props.trackSuivi) {
        preRequisOK = false;
      }

      /* -------------------------- Actions consecutives -------------------------- */
      if (preRequisOK) {
        var aFonctionne: boolean;
        switch (newEtat) {
          case "nonDemarree":
            setTrackReel([]);
            setTrackSuivi([]);
            setPointCourant(0);
            console.log("Reinitialisation infos de suivi");
            aFonctionne = true; //Tjrs vrai
            break;
          case "enCours":
            setTrackSuivi(props.trackSuivi);
            aFonctionne = await startBackgroundTask();
            break;
          case "enPause":
            stopSuiviTrackReel();
            aFonctionne = true;
            break;
          case "terminee":
            stopSuiviTrackReel();
            // sauvegarde du track reel
            // publication avis
            aFonctionne = true;
            break;
        }

        if (aFonctionne === true) {
          self.etat = newEtat;
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
    /*                                   PRIVE                                    */
    /* -------------------------------------------------------------------------- */
    /**
     * Methode privee pour demarrer la tache de fond de suivi, en s assurant que les permissions sont ok
     */
    async function startBackgroundTask(): Promise<boolean> {
      const permissionsOK = await requestPermissions();

      if (permissionsOK) {
        if (!(await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME))) {
          await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            // timeInterval: 5000,
            // distanceInterval: 5
            // showsBackgroundLocationIndicator: true,
            // deferredUpdatesDistance: 20,

            // foregroundService: {
            //   notificationTitle: "Using your location",
            //   notificationBody: "To turn off, go back to the app and switch something off.",
            //   killServiceOnDestroy: true,
            // },
          });
          console.log("Suivi en arrière-plan démarré");
        } else {
          console.log("Suivi en arrière-plan déjà en cours");
        }
        return true;
      } else {
        return false;
      }
    }
    /**
     * Methode privee pour arreter la tache de fond de suivi
     */
    async function stopSuiviTrackReel() {
      if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME)) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
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
      self.iPointCourant = value;
    }

    return { setEtat, requestPermissions, ajoutPointTrackReel };
  }); // eslint-disable-line @typescript-eslint/no-unused-vars
export interface SuiviExcursion extends Instance<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotOut extends SnapshotOut<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotIn extends SnapshotIn<typeof SuiviExcursionModel> {}
export const createSuiviExcursionDefaultModel = () => types.optional(SuiviExcursionModel, {});
