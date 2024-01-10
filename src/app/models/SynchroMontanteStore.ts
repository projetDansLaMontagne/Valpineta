import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

// Modèle pour représenter un signalement individuel
const signalement = types.model({
  photo: types.string,
  titre: types.string,
  description: types.string,
});

/**
 * Model description here for TypeScript hints.
 */
export const SynchroMontanteModel = types
  .model("SynchroMontante")
  .props({
    signalements: types.optional(types.array(signalement), []),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    getSignalements: () => {
      return self.signalements;
    },
    getSignalement: (index: number) => {
      return self.signalements[index];
    },
    getSignalementsCount: () => {
      return self.signalements.length;
    },
    addSignalement: (signalement: any) => {
      const etat = self.signalements.push(signalement);
      return etat;
    },
    removeSignalement: (index: number) => {
      self.signalements.splice(index, 1);
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SynchroMontanteStore extends Instance<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotOut extends SnapshotOut<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotIn extends SnapshotIn<typeof SynchroMontanteModel> {}
export const createSynchroMontanteDefaultModel = () => types.optional(SynchroMontanteModel, {})
