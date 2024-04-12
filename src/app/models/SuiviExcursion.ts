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
    trackReel: types.maybeNull(types.array(T_point_GPX)),
    trackSuivi: types.maybeNull(types.array(T_point)),
    iPointCourant: types.maybeNull(types.integer),
    __DEV__: false,
    dateDebutExcursion: types.maybeNull(types.Date), // Ne pas utiliser (decalee des qu une pause est effectuee)
    dateDebutPause: types.maybeNull(types.Date),
    dureeEnS: types.maybeNull(types.number),
    timer: types.frozen<NodeJS.Timeout>(),
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
    _setTrackReel(value: any) {
      self.trackReel = value;
    },
    /**
     * Setter privé pour le track suivi
     */
    _setTrackSuivi(value: any) {
      self.trackSuivi = value;
    },
    /**
     * Setter privé pour la date de debut de l excursion
     */
    _setDateDebutExcursion(value: Date | null) {
      self.dateDebutExcursion = value;
    },
    /**
     * Setter privé pour la date de debut de la pause
     */
    _setDateDebutPause(value: Date | null) {
      self.dateDebutPause = value;
    },
    /**
     * Setter privé pour la duree
     */
    _setDureeEnS(value: number) {
      self.dureeEnS = value;
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
          trackSuivi?: Instance<typeof T_point>[] | null; // Si on passe de nonDemarree a enCours, on doit fournir l excursionSuivie
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
          if (newEtat === "enCours" && props.trackSuivi && props.trackSuivi.length !== 0)
            verificationsOK = true;
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

      if (!verificationsOK) {
        console.warn("[SuiviExcursion] Erreur : Pre requis violés");
        return false;
      }

      /* -------------------------- Actions consecutives -------------------------- */
      let aFonctionne = true;
      switch (newEtat) {
        case "nonDemarree":
          self._setTrackReel(null);
          self._setTrackSuivi(null);
          self.setIPointCourant(null);
          self._setDateDebutExcursion(null);
          self._setDateDebutPause(null);
          self._setDureeEnS(null);
          break;
        case "enCours":
          if (self.etat === "nonDemarree") {
            self._setTrackReel([]);
            self._setTrackSuivi(props.trackSuivi);
            self.setIPointCourant(0);
            self._setDateDebutExcursion(new Date());
          } else if (self.etat === "enPause") {
            // Ajout de la duree de la pause a la date de debut
            const dureePause = msEntreDates(new Date(), self.dateDebutPause);
            self._setDateDebutExcursion(new Date(self.dateDebutExcursion.getTime() + dureePause));
            self._setDateDebutPause(null);
          }
          startTimer(500);
          const success = await startBackgroundTask();
          if (!success) aFonctionne = false;
          break;
        case "enPause":
          stopBackgroundTask();
          stopTimer();
          self._setDateDebutPause(new Date());
          break;
        case "terminee":
          if (self.etat === "enCours") {
            stopBackgroundTask();
            stopTimer();
          }
          break;
      }
      if (aFonctionne) {
        self._setEtat(newEtat);
      } else {
        console.warn("[SuiviExcursion] Erreur : Impossible de changer d etat");
      }
      return aFonctionne;
    }
    /**
     * Demande les permissions pour la localisation en front puis en back
     * @returns booleen indiquant si les permissions ont ete obtenues
     */
    async function requestPermissions(): Promise<boolean> {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        return false;
      }
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        return false;
      }
      return true;
    }
    function ajoutPointTrackReel(point: Instance<typeof T_point_GPX>) {
      self.trackReel.push(point);
      console.log("Ajout de ", point.lat, point.lon, point.alt);
    }
    /**
     * Methode pour obtenir la duree de l excursion en cours en secondes
     */
    function getDureeInS() {
      console.log("CALCUL DUREE");
      if (self.etat !== "enCours") {
        console.error(
          "[getDureeInMs] Impossible de recuperer la duree si l excursion n est pas en cours",
        );
      }
      const sEntreDates = msEntreDates(new Date(), self.dateDebutExcursion) / 1000;
      return Math.round(sEntreDates);
    }
    function msEntreDates(date1: Date, date2: Date) {
      if (date1 && date2) {
        return Math.abs(date2.getTime() - date1.getTime());
      } else {
        console.error("[msEntreDates] : Les dates ne doivent pas etre nulles");
        return 0;
      }
    }
    /**
     * Demarre le timer qui met a jour la duree
     */
    function startTimer(msInterval: number) {
      if (self.timer) {
        console.warn("[startTimer] Timer deja en cours");
        stopTimer();
      }
      self.timer = setInterval(() => {
        self._setDureeEnS(getDureeInS());
      }, msInterval);
    }
    /**
     * Stoppe le timer
     */
    function stopTimer() {
      if (self.timer) {
        clearInterval(self.timer);
        self.timer = null;
      }
    }

    /* -------------------------------------------------------------------------- */
    /*                                 PRIMITIVES                                 */
    /* -------------------------------------------------------------------------- */
    /**
     * Methode privee pour demarrer la tache de fond de suivi, en s assurant que les permissions sont ok
     */
    async function startBackgroundTask(): Promise<boolean> {
      try {
        const permissionsOK = await requestPermissions();

        if (permissionsOK) {
          if ((await tacheEnCours()) === false) {
            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME, {
              accuracy: ACCURACY,
              timeInterval: self.__DEV__
                ? 1000
                : undefined /**@warning certains telephones ont des optimisateur de batterie qui surpassent ce parametre*/,
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

            console.log("DEBUG - Suivi en arrière-plan lancé");
          } else {
            TaskManager.getRegisteredTasksAsync().then(console.log);
            console.log("DEBUG - Suivi en arrière-plan déjà en cours");
          }
        }
        return permissionsOK;
      } catch (e) {
        console.warn("[startBackgroundTask]:", e);
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

    return { setEtat, ajoutPointTrackReel, tacheEnCours };
  }); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SuiviExcursion extends Instance<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotOut extends SnapshotOut<typeof SuiviExcursionModel> {}
export interface SuiviExcursionSnapshotIn extends SnapshotIn<typeof SuiviExcursionModel> {}
export const createSuiviExcursionDefaultModel = () => types.optional(SuiviExcursionModel, {});
