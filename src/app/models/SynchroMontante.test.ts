/**
 * @description Test de SynchroMontante
 * @version 1.0
 * @author Oier Cesat
 * @date 2021-01-25
 * @see https://conceptreply.medium.com/optimising-testing-strategy-with-react-mobx-and-jest-18144f82b330
 * @see https://medium.com/welldone-software/jest-how-to-mock-a-function-call-inside-a-module-21c05c57a39f
 */

import { describe } from "jest-circus";
import { jest, expect, test, beforeAll, afterEach, beforeEach } from "@jest/globals";
import { SynchroMontanteModel } from "./SynchroMontante";
import { T_Signalement } from "app/navigators";
import { EtatSynchro, IntervalleSynchro } from "./SynchroMontante";
import { useStores } from "./helpers/useStores";
import { ApiOkResponse, ApiResponse } from "apisauce";

const signalementValide: T_Signalement = {
  nom: "nom",
  type: "Avertissement",
  description: "description",
  image: "image",
  lat: 0,
  lon: 0,
  postId: 0,
};

const signalementInvalide: T_Signalement = {
  test: "test"
};

describe("[SynchroMontante]", () => {
  let synchroMontante: ReturnType<typeof SynchroMontanteModel.create>;
  beforeAll(() => {
    synchroMontante = SynchroMontanteModel.create();
  });

  describe("[SynchroMontante] fonctions de manipulation des signalements", () => {
    test("Doit ajouter un signalement", () => {
      const signalementLength = synchroMontante.signalements.length;
      synchroMontante.addSignalement(signalementValide);
      expect(synchroMontante.signalements.length).toBe(signalementLength + 1);
    });
    test("Doit renvoyer une erreur si on ajoute un signalement vide", () => {
      expect(() => synchroMontante.addSignalement({} as T_Signalement)).toThrowError();
    });
    test("Doit renvoyer erreur si signalement n'est pas de type T_Signalement", () => {
      expect(() => synchroMontante.addSignalement("test")).toThrowError();
    });
    test("Doit supprimer tout les signalements", () => {
      synchroMontante.addSignalement(signalementValide);
      synchroMontante.addSignalement(signalementValide);
      synchroMontante.addSignalement(signalementValide);
      synchroMontante.removeAllSignalements();
      expect(synchroMontante.signalements.length).toBe(0);
    });
  });

  describe('[SynchroMontante] Fonctions avec l\'interval', () => {

      test('Doit pouvoir changer l\'intervalle de synchronisation', () => {
          synchroMontante.setIntervalleSynchro(IntervalleSynchro.Moderee);
          expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.Moderee);
      }
      );
      test('Doit renvoyer une erreur si on change l\'intervalle de synchronisation avec une valeur non valide', () => {
          synchroMontante.setIntervalleSynchro(0);
          expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.TresFrequente);
      }
      );
      test('Doit renvoyer une erreur si l\'intervalle n\'est passé en paramètre', () => {
          synchroMontante.setIntervalleSynchro();
          expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.TresFrequente);
      }
      );
  });

  describe("[SynchroMontante] PushSignalements ", () => {

    test('Doit envoyer les signalements si l\'utilisateur est connecté', () => {
        const result = synchroMontante.pushSignalements({ ok: true } as ApiResponse<any, any>);
        expect(result).toBeTruthy();
    }
    );

    test("Doit renvoyer faux si l'api renvoie une erreur", async () => {
      const result = await synchroMontante.pushSignalements({ ok: false } as ApiResponse<any, any>);
      expect(result).toBeFalsy();
    });
  });

  describe("[SynchroMontante] callApi", () => {
    
    test("Doit renvoyer une réponse valide", async () => {
      jest.useFakeTimers();

      const response = await synchroMontante.callApi([signalementValide]);
      console.log(response);
      expect(response.ok).toBeTruthy();
    });

    test("Doit renvoyer une erreur si callApi n'a aucun paramètre", async () => {
      expect(synchroMontante.callApi()).rejects.toThrowError();
    });

    test("Doit renvoyer faux si callApi un type invalide", async () => {
      expect(synchroMontante.callApi(signalementInvalide)).rejects.toThrowError();
    });
  });
});
