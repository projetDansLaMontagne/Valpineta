/**
 * @description Test de SynchroMontante
 * @version 1.0
 * @author Oier Cesat
 * @date 2021-01-25
 */

import { expect, test, describe, beforeEach } from "@jest/globals";
import { SynchroMontanteModel } from "./SynchroMontante";
import { T_Signalement } from "app/navigators";
import { IntervalleSynchro} from "./SynchroMontante";
import { unprotect } from "mobx-state-tree";

const signalementValide: T_Signalement = {
  nom: "nom",
  type: "Avertissement",
  description: "description",
  image: "image",
  lat: 0,
  lon: 0,
  postId: 0,
};

const signalementInvalide = {
} as T_Signalement;

describe("[SynchroMontante] fonctions interne", () => {
  let synchroMontante: ReturnType<typeof SynchroMontanteModel.create>;

  beforeEach(() => {
    synchroMontante = SynchroMontanteModel.create({});
    unprotect(synchroMontante);
  });

  describe("[SynchroMontante] fonctions de manipulation des signalements", () => {

    test("Doit ajouter un signalement", () => {
      const signalementLength = synchroMontante.signalements.length;
      synchroMontante.addSignalement(signalementValide);
      expect(synchroMontante.signalements.length).toBe(signalementLength + 1);
    });
    test("Doit renvoyer une erreur si on ajoute un signalement vide", () => {
      expect(() => synchroMontante.addSignalement(signalementInvalide)).toThrowError();
    });   
    test("Doit supprimer tous les signalements avec removeAllSignalements", () => {
      synchroMontante.addSignalement(signalementValide);
      synchroMontante.removeAllSignalements();
      expect(synchroMontante.signalements.length).toBe(0);
    });
  });

  describe("[SynchroMontante] Fonctions avec l'interval", () => {

    test("Doit pouvoir changer l'intervalle de synchronisation en Modere", () => {
      synchroMontante.setIntervalleSynchro(IntervalleSynchro.Moderee);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.Moderee);
    });
    test("Doit pouvoir changer l'intervalle de synchronisation en TresFrequente", () => {
      synchroMontante.setIntervalleSynchro(IntervalleSynchro.TresFrequente);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.TresFrequente);
    })
    test("Doit pouvoir changer l'intervalle de synchronisation en PeuFrequente", () => {
      synchroMontante.setIntervalleSynchro(IntervalleSynchro.PeuFrequente);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.PeuFrequente);
    })
    test("Doit pouvoir changer l'intervalle de synchronisation en Jamais", () => {
      synchroMontante.setIntervalleSynchro(0 as IntervalleSynchro);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.TresFrequente);
    })
  });
});
