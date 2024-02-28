/**
 * @description Test de SynchroMontante
 * @version 2.0
 * @oiercesat Cesat Oier
 * @date 2021-02-28
 * @see app/models/SynchroMontante
 * @warning Je ne teste pas les cas où les fonctions n'ont pas de paramètres car ces tests me renvoie des erreurs de compilation
 */

import { expect, test, describe, beforeEach } from "@jest/globals";
import { SynchroMontanteModel } from "./SynchroMontante";
import { T_Signalement } from "app/navigators";
import { IntervalleSynchro } from "./SynchroMontante";

const signalementValide: T_Signalement = {
  nom: "nom",
  type: "Avertissement",
  description: "description",
  image: "image",
  lat: 0,
  lon: 0,
  postId: 0,
};

const signalementInvalide = {} as T_Signalement;

describe("[SynchroMontante] fonctions interne", () => {
  let synchroMontante: ReturnType<typeof SynchroMontanteModel.create>;

  /*Avant chaque test, on crée une nouvelle instance de SynchroMontante, 
  Impossible d'utiliser useStore car cela impliquer de faire des mocks de mobx-state-tree,
  */
  beforeEach(() => {
    synchroMontante = SynchroMontanteModel.create({});
  });

  //Fonctions de manipulation des signalements comme l'ajout et la suppression
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
    test("Doit fonctionner même si il n'y a pas de signalements", () => {
      synchroMontante.removeAllSignalements();
      expect(synchroMontante.signalements.length).toBe(0);
    });
  });

  //Fonctions de manipulation de l'intervalle de synchronisation
  describe("[SynchroMontante] Fonctions avec l'intervalle", () => {
    test("Doit pouvoir changer l'intervalle de synchronisation en Modere", () => {
      synchroMontante.setIntervalleSynchro(IntervalleSynchro.Moderee);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.Moderee);
    });
    test("Doit pouvoir changer l'intervalle de synchronisation en TresFrequente", () => {
      synchroMontante.setIntervalleSynchro(IntervalleSynchro.TresFrequente);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.TresFrequente);
    });
    test("Doit pouvoir changer l'intervalle de synchronisation en PeuFrequente", () => {
      synchroMontante.setIntervalleSynchro(IntervalleSynchro.PeuFrequente);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.PeuFrequente);
    });
    test("Doit pouvoir changer l'intervalle de synchronisation en Jamais", () => {
      synchroMontante.setIntervalleSynchro(0 as IntervalleSynchro);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.TresFrequente);
    });
  });
});
