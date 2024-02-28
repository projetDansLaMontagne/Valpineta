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

const signalement = types.model({
  nom: types.string,
  type: types.union(types.literal("Avertissement"), types.literal("PointInteret")),
  description: types.string,
  image: types.string,
  lat: types.number,
  lon: types.number,
  postId: types.number,
});

export enum IntervalleSynchro {
  TresFrequente = 1,
  Moderee = 5,
  PeuFrequente = 30,
}

export let intervalId: NodeJS.Timeout | null = null;

/**
 * Model description here for TypeScript hints.
 */
export const SynchroMontanteModel = types
  .model("SynchroMontante")
  .props({
    signalements: types.optional(types.array(signalement), []),
    intervalleSynchro: types.optional(types.number, IntervalleSynchro.TresFrequente),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => {
    /* -------------------------------- METHODES -------------------------------- */


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
    function removeAllSignalements() {
      self.signalements.clear();
    }

    return {
      addSignalement,
      setIntervalleSynchro,
      removeAllSignalements
    };
  }); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SynchroMontanteStore extends Instance<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotOut extends SnapshotOut<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotIn extends SnapshotIn<typeof SynchroMontanteModel> {}
export const createSynchroMontanteDefaultModel = () => types.optional(SynchroMontanteModel, {});
