import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { remove } from "app/utils/storage";

// Modèle pour représenter un signalement individuel
const signalement = types.model({
  nom: types.string,
  type: types.union(types.literal("Avertissement"), types.literal("PointInteret")),
  description: types.string,
  image: types.string,
  //sert à stocker le lien vers l'image dans le storage afin de pouvoir comparer
  lienURLImage: types.string,
  lat: types.number,
  lon: types.number,
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
    removeAllSignalements: () => {
      self.signalements.clear();
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SynchroMontanteStore extends Instance<typeof SynchroMontanteModel> { }
export interface SynchroMontanteSnapshotOut extends SnapshotOut<typeof SynchroMontanteModel> { }
export interface SynchroMontanteSnapshotIn extends SnapshotIn<typeof SynchroMontanteModel> { }
export const createSynchroMontanteDefaultModel = () => types.optional(SynchroMontanteModel, {})
