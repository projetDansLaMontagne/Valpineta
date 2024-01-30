import { Instance, SnapshotOut, types } from "mobx-state-tree";
import { ParametresModel } from "./Parametres";
import { SuiviExcursionModel } from "./SuiviExcursion";

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  parametres: types.optional(ParametresModel, {}),
  suiviExcursion: types.optional(SuiviExcursionModel, {}),
});

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
