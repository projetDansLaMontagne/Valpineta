import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";

/**
 * Model description here for TypeScript hints.
 */
export const ParametresModel = types
  .model("Parametres")
  .props({
    langues: types.optional(types.string, "fr"),
    initialized: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => ({})); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Parametres extends Instance<typeof ParametresModel> {}
export interface ParametresSnapshotOut extends SnapshotOut<typeof ParametresModel> {}
export interface ParametresSnapshotIn extends SnapshotIn<typeof ParametresModel> {}
export const createParametresDefaultModel = () => types.optional(ParametresModel, {});
