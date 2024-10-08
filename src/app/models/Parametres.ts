import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import I18n from "i18n-js";
import { reaction } from "mobx";

/**
 * Model description here for TypeScript hints.
 */
export const ParametresModel = types
  .model("Parametres")
  .props({
    langue: types.optional(types.string, "fr"),
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => ({
    setLangue: (langues: "fr" | "es") => {
      self.langue = langues;
    },
    afterCreate() {
      reaction(
        () => self.langue,
        langues => {
          I18n.locale = langues;
        },
      );
    },
  })); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Parametres extends Instance<typeof ParametresModel> {}
export interface ParametresSnapshotOut extends SnapshotOut<typeof ParametresModel> {}
export interface ParametresSnapshotIn extends SnapshotIn<typeof ParametresModel> {}
export const createParametresDefaultModel = () => types.optional(ParametresModel, {});
