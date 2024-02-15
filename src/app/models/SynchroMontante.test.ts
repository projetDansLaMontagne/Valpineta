/**
 * @description Test de SynchroMontante
 * @version 1.0
 * @author Oier Cesat
 * @date 2021-01-25
 * @see https://conceptreply.medium.com/optimising-testing-strategy-with-react-mobx-and-jest-18144f82b330
 * @see https://medium.com/welldone-software/jest-how-to-mock-a-function-call-inside-a-module-21c05c57a39f
 */

import { describe } from "jest-circus";
import { jest, expect, test, beforeAll, afterEach, beforeEach, afterAll } from "@jest/globals";
import { SynchroMontanteModel } from "./SynchroMontante";
import { T_Signalement } from "app/navigators";
import { EtatSynchro, IntervalleSynchro } from "./SynchroMontante";
import { ApiOkResponse, ApiResponse } from "apisauce";
import { ExclusiveGesture } from "react-native-gesture-handler/lib/typescript/handlers/gestures/gestureComposition";
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

const signalementInvalide: T_Signalement = {
  test: "test",
};

describe("[SynchroMontante]", () => {
  let synchroMontante: ReturnType<typeof SynchroMontanteModel.create>;
  beforeAll(() => {
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

  describe("[SynchroMontante] Fonctions avec l'interval", () => {
    test("Doit pouvoir changer l'intervalle de synchronisation", () => {
      synchroMontante.setIntervalleSynchro(IntervalleSynchro.Moderee);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.Moderee);
    });
    test("Doit renvoyer une erreur si on change l'intervalle de synchronisation avec une valeur non valide", () => {
      synchroMontante.setIntervalleSynchro(0);
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.TresFrequente);
    });
    test("Doit renvoyer une erreur si l'intervalle n'est passé en paramètre", () => {
      synchroMontante.setIntervalleSynchro();
      expect(synchroMontante.intervalleSynchro).toBe(IntervalleSynchro.TresFrequente);
    });
  });

  describe("[SynchroMontante] callApi", () => {
    test("Doit renvoyer une réponse valide", async () => {
      const response = await synchroMontante.callApi([signalementValide]);
      expect(response.ok).toBeTruthy();
    });

    test("Doit renvoyer une erreur si callApi n'a aucun paramètre", async () => {
      const response = await synchroMontante.callApi();
      expect(response.ok).toBeFalsy();
    });

    test("Doit renvoyer faux si callApi un type invalide", async () => {
      const response = await synchroMontante.callApi(signalementInvalide);
      expect(response.ok).toBeFalsy();
    });
  });

  describe("[SynchroMontante] traiterResultat ", () => {
    test("Doit renvoyer true si la reponse.ok est true et doit suppimer tout les signalements", async () => {
      synchroMontante.addSignalement(signalementValide);
      const response: ApiResponse<any, any> = {
        ok: true,
      } as ApiOkResponse<any>;

      const result = await synchroMontante.traiterResultat(response);

      expect(result).toBeTruthy();
      expect(synchroMontante.signalements.length).toBe(0);
    });

    test("Doit renvoyer false si la reponse.ok est false", async () => {
      const response: ApiResponse<any, any> = {
        ok: false,
      } as ApiResponse<any, any>;

      const result = await synchroMontante.traiterResultat(response);

      expect(result).toBeFalsy();
    });

    test("Doit renvoyer faux s'il n'y a pas de réponse", async () => {
      const result = await synchroMontante.traiterResultat(undefined);

      expect(result).toBeFalsy();
    });

    test("Doit renvoyer false si la reponse.ok est false même s'il y a des signalements a envoyer", async () => {

      synchroMontante.addSignalement(signalementValide);
      const response: ApiResponse<any, any> = {
        ok: false,
      } as ApiResponse<any, any>;

      const result = await synchroMontante.traiterResultat(response);

      expect(result).toBeFalsy();
    });

    test("Doit renvoyer faux s'il n'y a pas de réponse même s'il y a des signalements a envoyer", async () => {
      synchroMontante.addSignalement(signalementValide);

      const result = await synchroMontante.traiterResultat(undefined);

      expect(result).toBeFalsy();
    });

  });

  describe("[SynchroMontante] tryToPush", () => {
    test("Doit renvoyer EtatSynchro.BienEnvoye s'il y a des signalements a envoyer et qu'il a de la connexion", async () => {
      synchroMontante.addSignalement(signalementValide);
      const result = await synchroMontante.tryToPush(true, synchroMontante.signalements);
      expect(result).toBe(EtatSynchro.BienEnvoye);
    });

    test("Doit renvoyer EtatSynchro.RienAEnvoyer s'il n'y a pas de signalements a envoyer et qu'il a de la connexion", async () => {
      const result = await synchroMontante.tryToPush(true, synchroMontante.signalements);
      expect(result).toBe(EtatSynchro.RienAEnvoyer);
    });

    test("Doit renvoyer EtatSynchro.NonConnecte s'il n'y a pas de connexion", async () => {
      const result = await synchroMontante.tryToPush(false, synchroMontante.signalements);
      expect(result).toBe(EtatSynchro.NonConnecte);
    });

    test("Doit renvoyer EtatSynchro.NonConnecte s'il y a des signalements a envoyer et qu'il n'a pas de connexion", async () => {
      synchroMontante.addSignalement(signalementValide);
      const result = await synchroMontante.tryToPush(false, synchroMontante.signalements);
      expect(result).toBe(EtatSynchro.NonConnecte);
    });

    test("Doit renvoyer EtatSynchro.ErreurServeur si les signalemenets a envoyer ne sont pas bon", async () => {
      const result = await synchroMontante.tryToPush(true, [signalementInvalide]);
      expect(result).toBe(EtatSynchro.ErreurServeur);
    });
  });
});
