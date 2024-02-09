import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { T_Signalement } from "app/navigators";

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

/**
 * Model description here for TypeScript hints.
 */
export const SynchroMontanteModel = types
  .model("SynchroMontante")
  .props({
    signalements: types.optional(types.array(signalement), []),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => ({
    addSignalement: (signalement: T_Signalement) => {
      self.signalements.push(signalement);
    },
    removeAllSignalements: () => {
      self.signalements.clear();
    },
  })); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SynchroMontanteStore extends Instance<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotOut extends SnapshotOut<typeof SynchroMontanteModel> {}
export interface SynchroMontanteSnapshotIn extends SnapshotIn<typeof SynchroMontanteModel> {}
export const createSynchroMontanteDefaultModel = () => types.optional(SynchroMontanteModel, {});
