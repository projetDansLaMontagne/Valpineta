import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

/**
 * Model description here for TypeScript hints.
 */
export const ParametresModel = types
  .model("Parametres")
  .props({
    langues: types.optional(types.string, "fr"),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => ({
    setLangues: (langues: string) => {
      if (langues !== self.langues) {
        self.langues = langues;
      }
    },
  })); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Parametres extends Instance<typeof ParametresModel> {}
export interface ParametresSnapshotOut extends SnapshotOut<typeof ParametresModel> {}
export interface ParametresSnapshotIn extends SnapshotIn<typeof ParametresModel> {}
export const createParametresDefaultModel = () => types.optional(ParametresModel, {});
