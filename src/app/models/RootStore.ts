import { Instance, SnapshotOut, types } from "mobx-state-tree";
import { ParametresModel } from "./Parametres";
import { SynchroMontanteModel } from "./SynchroMontante";

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  parametres: types.optional(ParametresModel, {}),
  synchroMontanteStore: types.optional(SynchroMontanteModel, {}),
});

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
