import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { T_Signalement } from "app/navigators";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";
import { translate } from "i18n-js";
import { reaction } from "mobx";
//Api
import { api } from "app/services/api";
import { getGeneralApiProblem } from "app/services/api/apiProblem";
import { md5 } from "js-md5";

const signalement = types.model({
  titre: types.string,
  type: types.union(types.literal("Avertissement"), types.literal("PointInteret")),
  description: types.string,
  image: types.string,
  lat: types.number,
  lon: types.number,
  post_id: types.number,
});
const HEURE_EN_MILLISECONDES = 20000;
export enum etatSynchro {
  non_connecte,
  erreur_serveur,
  bien_envoye,
}

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

      reaction(
        () => self.intervalleSynchro,
        _ => {
          // On reinitalise la boucle de synchronisation avec la nouvelle intervalle
          console.log("Reinitialisation de la boucle de synchronisation");
          stopChecking();
          startChecking();
        },
      );
    }
    function beforeDestroy() {
      stopChecking();
    }
    /**
     * Regarde si des elements sont en attente de synchronisation
     * Si oui, tente de les pousser vers le serveur
     */
    function startChecking() {
      self.intervalId = setInterval(() => {
        if (self.signalements.length > 0) {
          tryToPushSignalements();
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

    /* -------------------------------- METHODES -------------------------------- */
    /**
     * Tente de pousser les signalements vers le serveur
     */
    async function tryToPushSignalements(): Promise<etatSynchro> {
      // Vérifie la connexion
      const { isConnected } = await NetInfo.fetch();

      if (isConnected) {
        const response = await api.apisauce.post(
          "set-signalement",
          {
            signalements: JSON.stringify(self.signalements),
            // en cours de développement avec Robin
            md5: md5(JSON.stringify(self.signalements)),
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          removeAllSignalements();
          return etatSynchro.bien_envoye;
        } else {
          console.log(
            "[SYNCHRO MONTANTE] Erreur serveur lors de la synchronisation : ",
            getGeneralApiProblem(response),
          );
          return etatSynchro.erreur_serveur;
        }
      }
      return etatSynchro.non_connecte;
    }


    /* --------------------------------- SETTERS -------------------------------- */
    function addSignalement(signalement: T_Signalement) {
      self.signalements.push(signalement);
    }
    function removeAllSignalements() {
      self.signalements.clear();
    }
    function setIntervalleSynchro(intervalle: number) {
      self.intervalleSynchro = intervalle;
    }

    return {
      afterCreate,
      beforeDestroy,
      tryToPushSignalement: tryToPushSignalements,
      addSignalement,
      removeAllSignalements,
      setIntervalleSynchro,
    };
  }); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SynchroMontanteStore extends Instance<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotOut extends SnapshotOut<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotIn extends SnapshotIn<typeof SynchroMontanteModel> {}
export const createSynchroMontanteDefaultModel = () => types.optional(SynchroMontanteModel, {});
