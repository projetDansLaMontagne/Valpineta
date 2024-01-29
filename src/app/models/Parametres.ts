import { Instance, SnapshotIn, SnapshotOut, onPatch, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import I18n from "i18n-js";
import { reaction } from "mobx";

/**
 * Model description here for TypeScript hints.
 */
export const ParametresModel = types
  .model("Parametres")
  .props({
    langues: types.optional(types.string, "fr"),
    tempsSynchro : types.optional(types.number, 1)
  })
  .actions(withSetPropAction)
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => ({
    setLangues: (langues: string) => {
      if (langues !== self.langues) {
        self.langues = langues;
      }
    },
    setTempsSynchro: (tempsSynchro: number) => {
      if (tempsSynchro !== self.tempsSynchro) {
        self.tempsSynchro = tempsSynchro;
      }
    },
    afterCreate() {
      reaction(
        () => self.langues,
        langues => {
          I18n.locale = langues;
        }
      );
    }
  })); // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Parametres extends Instance<typeof ParametresModel> {}
export interface ParametresSnapshotOut extends SnapshotOut<typeof ParametresModel> {}
export interface ParametresSnapshotIn extends SnapshotIn<typeof ParametresModel> {}
export const createParametresDefaultModel = () => types.optional(ParametresModel, {});
