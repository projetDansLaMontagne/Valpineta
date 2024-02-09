import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { T_Signalement } from "app/navigators";
import NetInfo from "@react-native-community/netinfo";

// Import pour la synchro
import {
  envoieBaseDeDonneesSignalements,
  alertSynchroEffectuee,
} from "app/services/synchroMontanteService";

// Modèle pour représenter un signalement individuel
const signalement = types.model({
  titre: types.string,
  type: types.union(types.literal("Avertissement"), types.literal("PointInteret")),
  description: types.string,
  image: types.string,
  lat: types.number,
  lon: types.number,
  post_id: types.number,
});
const HEURE_EN_MILLISECONDES = 3600000;

/**
 * Model description here for TypeScript hints.
 */
export const SynchroMontanteModel = types
  .model("SynchroMontante")
  .props({
    signalements: types.optional(types.array(signalement), []),
    intervalId: types.maybeNull(types.union(types.number, types.frozen<null | NodeJS.Timeout>())),
    intervalleSynchro: types.optional(types.number, 1),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => {
    /* ---------------------------------- DEMON --------------------------------- */
    function afterCreate() {
      startChecking();
    }
    function beforeDestroy() {
      stopChecking();
    }
    /**
     * Regarde si des elements sont en attente de synchronisation
     * Si oui, tente de les pousser vers le serveur
     */
    function startChecking() {
      self.intervalId = setInterval(async () => {
        if (self.signalements.length > 0) {
          tryPushSignalement(self.signalements);
        }
      }, self.intervalleSynchro * HEURE_EN_MILLISECONDES);
    }
    /**
     * Stoppe la boucle de synchronisation
     */
    function stopChecking() {
      if (self.intervalId) {
        clearInterval(self.intervalId);
      }
    }

    /**
     * Pousse les informations de signalements vers le serveur
     */
    async function tryPushSignalement(signalements: T_Signalement[]) {
      // Vérifie la connexion
      const { isConnected } = await NetInfo.fetch();

      if (isConnected) {
        const success = await envoieBaseDeDonneesSignalements(signalements);

        if (success) {
          alertSynchroEffectuee();
        }
      }
    }
    function addSignalement(signalement: T_Signalement) {
      self.signalements.push(signalement);
    }
    function removeAllSignalements() {
      self.signalements.clear();
    }

    return {
      afterCreate,
      beforeDestroy,
      tryPushSignalement,
      addSignalement,
      removeAllSignalements,
    };
  }); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SynchroMontanteStore extends Instance<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotOut extends SnapshotOut<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotIn extends SnapshotIn<typeof SynchroMontanteModel> {}
export const createSynchroMontanteDefaultModel = () => types.optional(SynchroMontanteModel, {});
