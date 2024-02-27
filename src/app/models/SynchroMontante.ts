/**
 * Fichier de model pour la synchronisation montante
 * @module app/models/SynchroMontante
 * @authors Cesat Oier, Delahaie Nicolas
 * @version 2.0
 * @date 2024-02-15
 * @see https://mobx-state-tree.js.org/API/#array // utilisation des array avec mobx-state-tree
 */
import { Instance, SnapshotIn, SnapshotOut, types, unprotect, isProtected } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { T_Signalement } from "app/navigators";
import NetInfo from "@react-native-community/netinfo";
import { reaction, runInAction } from "mobx";
//Api
import { api } from "app/services/api";
import { getGeneralApiProblem } from "app/services/api/apiProblem";
import { ApiResponse } from "apisauce";

const signalement = types.model({
  nom: types.string,
  type: types.union(types.literal("Avertissement"), types.literal("PointInteret")),
  description: types.string,
  image: types.string,
  lat: types.number,
  lon: types.number,
  postId: types.number,
});
export const MINUTE_EN_MILLISECONDES = 60000;
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

export let intervalId: NodeJS.Timeout | null = null;
export let tryingToPush = false;

/**
 * Model description here for TypeScript hints.
 */
export const SynchroMontanteModel = types
  .model("SynchroMontante")
  .props({
    signalements: types.optional(types.array(signalement), []),
    // intervalId: types.maybeNull(types.union(types.number, types.frozen<null | NodeJS.Timeout>())),
    intervalleSynchro: types.optional(types.number, IntervalleSynchro.TresFrequente),
    testing: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => {
    /* ---------------------------------- DEMON --------------------------------- */
    function afterCreate() {
      // startChecking();
      reaction(
        () => self.intervalleSynchro,
        _ => {
          // On reinitalise la boucle de synchronisation avec la nouvelle intervalle
          if (intervalId) {
            clearInterval(intervalId);
          }
          // startChecking();
        },
      );
    }
    /*istanbul ignore next*/
    function beforeDestroy() {
      clearInterval(intervalId);
    }
    /**
     * Regarde si des elements sont en attente de synchronisation
     * Si oui, tente de les pousser vers le serveur
     */
    async function startChecking() {
      let isConnected = false;
      runInAction(() => {
        tryingToPush = false;
      });
      if (self.testing) {
        isConnected = true;
      } else {
        /*istanbul ignore next*/
        const state = await NetInfo.fetch();
        /*istanbul ignore next*/
        isConnected = state.isConnected;
      }
      /*istanbul ignore next*/
      intervalId = setInterval(
        () => tryToPush(isConnected, self.signalements),
        self.intervalleSynchro * MINUTE_EN_MILLISECONDES,
      );
    }

    const tryToPush = async (
      isConnected: boolean,
      signalements: T_Signalement[],
    ): Promise<EtatSynchro> => {
      if (isConnected) {
        if (signalements.length > 0 && !tryingToPush) {
            tryingToPush = true;
          const response = await callApi(signalements);
          const success = await traiterResultat(response);
          if (success) {
              console.log("tryToPush success");
              tryingToPush = false;
            
            return EtatSynchro.BienEnvoye;
          } else {
              console.log("tryToPush error");
              tryingToPush = false;
            return EtatSynchro.ErreurServeur;
          }
        }
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
    async function traiterResultat(response: ApiResponse<any, any>): Promise<boolean> {
      if (response) {
        if (response.ok) {
          runInAction(() => {
            self.signalements.clear();
          });
          return true;
        } else {
          getGeneralApiProblem(response);
          return false;
        }
      } else {
        return false;
      }
    }

    const callApi = async (signalements: T_Signalement[]) => {
      const response = await api.apisauce.post(
        "set-signalement",
        {
          signalements: JSON.stringify(signalements),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response;
    };

    /* --------------------------------- SETTERS -------------------------------- */
    function addSignalement(signalement: T_Signalement) {
      self.signalements.push(signalement);
    }
    function setIntervalleSynchro(intervalle: IntervalleSynchro) {
      if (intervalle in IntervalleSynchro) {
        self.intervalleSynchro = intervalle;
      } else {
        self.intervalleSynchro = IntervalleSynchro.TresFrequente;
      }
    }

    return {
      afterCreate,
      beforeDestroy,
      traiterResultat,
      callApi,
      tryToPush,
      addSignalement,
      setIntervalleSynchro,
    };
  }); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SynchroMontanteStore extends Instance<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotOut extends SnapshotOut<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotIn extends SnapshotIn<typeof SynchroMontanteModel> {}
export const createSynchroMontanteDefaultModel = () => types.optional(SynchroMontanteModel, {});
