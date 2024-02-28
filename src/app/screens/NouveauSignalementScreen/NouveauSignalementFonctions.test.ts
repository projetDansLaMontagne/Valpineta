/**
 * @module app/screens/NouveauSignalementScreen/NouveauSignalementFonctions
 * @oiercesat Cesat Oier
 * @version 1.0
 * @date 2021-02-28
 */

import {
  verifSaisiesValides,
  verifDescription,
  verifNom,
  verifPhoto,
  blobToBase64,
} from "./NouveauSignalementFonctions";
import { describe, expect, test, jest } from "@jest/globals";

// Mock des modèles, pour éviter les dépendances
jest.mock("app/models", () => ({
  EtatSynchro: {
    BienEnvoye: "BienEnvoye",
    NonConnecte: "NonConnecte",
    ErreurServeur: "ErreurServeur",
  },
}));

describe("[NouveauSignalementFonction]", () => {
  describe("[verif Nom]", () => {
    test("nomErreur doit être faux si le nom est renseigné et ne contient pas de caractères sppéciaux", () => {
      const nom = "nom";
      const nomErreur = verifNom(nom);
      expect(nomErreur).toBe(false);
    });
    test("nomErreur doit être vrai si le nom est vide", () => {
      const nom = "";
      const nomErreur = verifNom(nom);
      expect(nomErreur).toBe(true);
    });
    test("nomErreur doit être vrai si le nom contient moins de 3 caractères", () => {
      const nom = "no";
      const nomErreur = verifNom(nom);
      expect(nomErreur).toBe(true);
    });
    test("nomErreur doit être vrai si le nom contient plus de 50 caractères", () => {
      const nom =
        "pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp";
      const nomErreur = verifNom(nom);
      expect(nomErreur).toBe(true);
    });
    // Ce test sert à vérifier que les caractères spéciaux de la langue espagnole et française sont acceptés
    test("nomErreur doit être faux si le nom contient des caractères spéciaux accepté", () => {
      const nom = "Ééèàùçâêîôûäëïöüÿ,;:.-'’!$%^*+\"";
      const nomErreur = verifNom(nom);
      expect(nomErreur).toBe(false);
    });
    test("nomErreur doit être vrai si le nom contient des caractères spéciaux non accepté", () => {
      const nom = "<script>alert('hello');</script>";
      const nomErreur = verifNom(nom);
      expect(nomErreur).toBe(true);
    });
  });
  describe("[verif Description]", () => {
    test("descriptionErreur doit être faux si la description est renseignée et ne contient pas de caractères spéciaux", () => {
      const description = "descriptio";
      const descriptionErreur = verifDescription(description);
      expect(descriptionErreur).toBe(false);
    });
    test("descriptionErreur doit être vrai si la description est vide", () => {
      const description = "";
      const descriptionErreur = verifDescription(description);
      expect(descriptionErreur).toBe(true);
    });
    test("descriptionErreur doit être vrai si la description contient moins de 10 caractères", () => {
      const description = "descripti";
      const descriptionErreur = verifDescription(description);
      expect(descriptionErreur).toBe(true);
    });
    test("descriptionErreur doit être vrai si la description contient plus de 500 charactères", () => {
      const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let description = "";
      for (let i = 0; i < 501; i++) {
        description += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      const descriptionErreur = verifDescription(description);
      expect(descriptionErreur).toBe(true);
    });
    test("descriptionErreur doit être faux si la description contient des caractères spéciaux accepté", () => {
      const description = "Ééèàùçâêîôûäëïöüÿ,;:.-'’!$%^*+\"";
      const descriptionErreur = verifDescription(description);
      expect(descriptionErreur).toBe(false);
    });
    test("descriptionErreur doit être vrai si la description contient des caractères spéciaux non accepté", () => {
      const description = "<script>alert('hello');</script>";
      const descriptionErreur = verifDescription(description);
      expect(descriptionErreur).toBe(true);
    });
  });
  describe("[verif Photo]", () => {
    test("photoErreur doit être faux si la photo est renseignée", () => {
      const photo = "photo";
      const photoErreur = verifPhoto(photo);
      expect(photoErreur).toBe(false);
    });
    test("photoErreur doit être vrai si la photo est vide", () => {
      const photo = "";
      const photoErreur = verifPhoto(photo);
      expect(photoErreur).toBe(true);
    });
    test("photoErreur doit être vrai si la photo n\'est pas définie", () => {
      const photo = undefined;
      const photoErreur = verifPhoto(photo);
      expect(photoErreur).toBe(true);
    });
  });

  /*Cette série de test vérifie que tous les boolens sont correctement retournés.
  Elle ne teste pas les différents cas d'erreurs car ils sont déjà traités dans les tests précédents
  */
  describe("[verifSaisiesValides]", () => {
    test("saisieBonne doit être vrai si les saisies sont correctes", () => {
      const nom = "nom";
      const description = "description";
      const image = "image";
      let { saisiesValides, nomErreur, descriptionErreur, photoErreur } = verifSaisiesValides(
        nom,
        description,
        image,
      );
      
      expect(saisiesValides).toBe(true);
      expect(nomErreur).toBe(false);
      expect(descriptionErreur).toBe(false);
      expect(photoErreur).toBe(false);
    });
    test("saisieBonne doit être faux si le nom est invalide", () => {
      const nom = "";
      const description = "description";
      const image = "image";
      let { saisiesValides, nomErreur, descriptionErreur, photoErreur } = verifSaisiesValides(
        nom,
        description,
        image,
      );
      expect(saisiesValides).toBe(false);
      expect(nomErreur).toBe(true);
      expect(descriptionErreur).toBe(false);
      expect(photoErreur).toBe(false);
    });
    test("saisieBonne doit être faux si la description est invalide", () => {
      const nom = "nom";
      const description = "";
      const image = "image";
      let { saisiesValides, nomErreur, descriptionErreur, photoErreur } = verifSaisiesValides(
        nom,
        description,
        image,
      );
      expect(saisiesValides).toBe(false);
      expect(nomErreur).toBe(false);
      expect(descriptionErreur).toBe(true);
      expect(photoErreur).toBe(false);
    });
    test("saisieBonne doit être faux si la photo est invalide", () => {
      const nom = "nom";
      const description = "description";
      const image = "";
      let { saisiesValides, nomErreur, descriptionErreur, photoErreur } = verifSaisiesValides(
        nom,
        description,
        image,
      );
      expect(saisiesValides).toBe(false);
      expect(nomErreur).toBe(false);
      expect(descriptionErreur).toBe(false);
      expect(photoErreur).toBe(true);
    });
    test("saisieBonne doit être faux si toutes les conditions ne sont pas réunies", () => {
      const nom = "";
      const description = "";
      const image = "";
      let { saisiesValides, nomErreur, descriptionErreur, photoErreur } = verifSaisiesValides(
        nom,
        description,
        image,
      );
      expect(saisiesValides).toBe(false);
      expect(nomErreur).toBe(true);
      expect(descriptionErreur).toBe(true);
      expect(photoErreur).toBe(true);
    });
  });

  /*Cette série de test vérifie que le blob est bien converti en base64
  @todo: Il faudrait tester le cas où la conversion échoue, je n'arrive pas à trouver de solution pour le moment
  */
  describe("[blobToBase64]", () => {
    test("doit convertir un blob en base64 avec FileReader mocké", async () => {
      const blob = new Blob(["hello world"], { type: "text/plain" });
      const base64 = await blobToBase64(blob);
      expect(base64).toBe("data:text/plain;base64,aGVsbG8gd29ybGQ=");
    });

    test("doit rejeter une erreur si la conversion échoue", async () => {
      const blob = undefined;
      await expect(blobToBase64(blob)).rejects.toThrowError();
    });
  });
});
