import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { T_Signalement } from "app/navigators";
import NetInfo from "@react-native-community/netinfo";
import { reaction } from "mobx";
//Api
import { api } from "app/services/api";
import { getGeneralApiProblem } from "app/services/api/apiProblem";
import { md5 } from "js-md5";

const signalement = types.model({
  nom: types.string,
  type: types.union(types.literal("Avertissement"), types.literal("PointInteret")),
  description: types.string,
  image: types.string,
  lat: types.number,
  lon: types.number,
  postId: types.number,
});
const MINUTE_EN_MILLISECONDES = 60000;
export enum EtatSynchro {
  RienAEnvoyer,
  NonConnecte,
  ErreurServeur,
  BienEnvoye,
}
export enum IntervalleSynchro {
  TresFrequente = 1,
  Moderee = 5,
  PeuFrequente = 30,
}

/**
 * Model description here for TypeScript hints.
 */
export const SynchroMontanteModel = types
  .model("SynchroMontante")
  .props({
    signalements: types.optional(types.array(signalement), []),
    intervalId: types.maybeNull(types.union(types.number, types.frozen<null | NodeJS.Timeout>())),
    intervalleSynchro: types.optional(types.number, IntervalleSynchro.TresFrequente),
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
      self.intervalId = setInterval(tryToPush, self.intervalleSynchro * MINUTE_EN_MILLISECONDES);
    }
    /**
     * Stoppe la boucle de synchronisation
     */
    function stopChecking() {
      if (self.intervalId) {
        clearInterval(self.intervalId);
      }
    }

    const tryToPush = async (): Promise<EtatSynchro> => {
      // Vérifie la connexion
      const { isConnected } = await NetInfo.fetch();

      if (isConnected) {
        if (self.signalements.length > 0) {
          console.log("[SYNCHRO MONTANTE] tentative");
          const success = pushSignalements();
          if (success) {
            return EtatSynchro.BienEnvoye;
          } else {
            return EtatSynchro.ErreurServeur;
          }
        }

        // AJOUTER ICI LA SYNCHRO DES AUTRES DONNEES

        return EtatSynchro.RienAEnvoyer;
      }
      return EtatSynchro.NonConnecte;
    };

    /* -------------------------------- METHODES -------------------------------- */
    /**
     * Primitive qui tente de pousser les signalements vers le serveur
     * @prerequis etre connecte et avoir des signalements a pousser
     * @returns booleen indiquant si la synchronisation a reussi
     */
    async function pushSignalements(): Promise<boolean> {
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
      } else {
        console.error(
          "[SYNCHRO MONTANTE] Debug : Erreur serveur lors de la synchronisation : ",
          getGeneralApiProblem(response),
        );
      }

      return response.ok;
    }

    /* --------------------------------- SETTERS -------------------------------- */
    function addSignalement(signalement: T_Signalement) {
      self.signalements.push(signalement);
    }
    function removeAllSignalements() {
      self.signalements.clear();
    }
    function setIntervalleSynchro(intervalle: IntervalleSynchro) {
      self.intervalleSynchro = intervalle;
    }

    return {
      afterCreate,
      beforeDestroy,
      tryToPush,
      addSignalement,
      removeAllSignalements,
      setIntervalleSynchro,
    };
  }); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SynchroMontanteStore extends Instance<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotOut extends SnapshotOut<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotIn extends SnapshotIn<typeof SynchroMontanteModel> {}
export const createSynchroMontanteDefaultModel = () => types.optional(SynchroMontanteModel, {});
