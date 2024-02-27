import {
  saisiesValides,
  verifDescription,
  verifNom,
  verifPhoto,
  blobToBase64,
  AlerteStatus,
} from "./NouveauSignalementFonctions";
import { describe, expect, test, jest, afterEach } from "@jest/globals";
import { EtatSynchro } from "app/models";
import { Alert } from "react-native";

jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

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
    test("nomErreur doit être faux si le nom contient des caractères spéciaux accepté", () => {
      const nom = "Ééèàùçâêîôûäëïöüÿ,;:.-'’!$%^*+\"";
      const nomErreur = verifNom(nom);
      expect(nomErreur).toBe(false);
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
      const description = "desc";
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
    test("photoErreur doit être vrai si la photo est vide", () => {
      const photo = undefined;
      const photoErreur = verifPhoto(photo);
      expect(photoErreur).toBe(true);
    });
  });
  describe("[saisiesValides]", () => {
    test("saisieBonne doit être vrai si les saisies sont correctes", () => {
      const nom = "nom";
      const description = "description";
      const image = "image";
      const saisieBonne = true;
      let nomErreur = false;
      let descriptionErreur = false;
      let photoErreur = false;
      const result = saisiesValides(
        nom,
        description,
        image,
        saisieBonne,
        nomErreur,
        descriptionErreur,
        photoErreur,
      );
      expect(result).toBe(true);
    });
    test("saisieBonne doit être faux si le nom est invalide", () => {
      const nom = "";
      const description = "description";
      const image = "image";
      const saisieBonne = false;
      let nomErreur = false;
      let descriptionErreur = false;
      let photoErreur = false;
      const result = saisiesValides(
        nom,
        description,
        image,
        saisieBonne,
        nomErreur,
        descriptionErreur,
        photoErreur,
      );
      expect(result).toBe(false);
    });
    test("saisieBonne doit être faux si la description est invalide", () => {
      const nom = "nom";
      const description = "";
      const image = "image";
      const saisieBonne = false;
      let nomErreur = false;
      let descriptionErreur = false;
      let photoErreur = false;
      const result = saisiesValides(
        nom,
        description,
        image,
        saisieBonne,
        nomErreur,
        descriptionErreur,
        photoErreur,
      );
      expect(result).toBe(false);
    });
    test("saisieBonne doit être faux si la photo est invalide", () => {
      const nom = "nom";
      const description = "description";
      const image = "";
      const saisieBonne = false;
      let nomErreur = false;
      let descriptionErreur = false;
      let photoErreur = false;
      const result = saisiesValides(
        nom,
        description,
        image,
        saisieBonne,
        nomErreur,
        descriptionErreur,
        photoErreur,
      );
      expect(result).toBe(false);
    });
  });
  describe("[blobToBase64]", () => {
    test("doit convertir un blob en base64", async () => {
      const text = "Ceci est un test";
      const blob = new Blob([text], { type: "text/plain" });

      const result = await blobToBase64(blob);

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^data:text\/plain;base64,/);
    });

    test("doit rejeter une erreur si la conversion échoue", async () => {
      const blob = undefined;
      await expect(blobToBase64(blob)).rejects.toThrowError();
    });
  });
  describe("[AlerteStatus]", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("devrait afficher une alerte en cas de succès", () => {
      AlerteStatus(EtatSynchro.BienEnvoye);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Reussite !",
        "Votre signalement a bien été enregistré",
        [],
        { cancelable: true },
      );
    });

    test("devrait afficher une alerte en cas de non connexion", () => {
      AlerteStatus(EtatSynchro.NonConnecte);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Hors connexion",
        "Votre signalement sera automatiquement enregistré lors de votre prochaine connexion (duree du cycle parametrable)",
        [],
        { cancelable: true },
      );
    });

    test("devrait afficher une alerte en cas d'erreur serveur", () => {
      AlerteStatus(EtatSynchro.ErreurServeur);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erreur serveur",
        "Une erreur est survenue lors de l'envoi de votre signalement. Veuillez réessayer plus tard.",
        [],
        { cancelable: true },
      );
    });
  });
});
