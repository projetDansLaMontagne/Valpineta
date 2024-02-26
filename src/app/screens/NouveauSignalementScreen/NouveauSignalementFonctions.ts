import { Alert } from "react-native";
import { EtatSynchro } from "app/models";

// Regex contanant uniquement des caractères autorisés
const regex = /^[a-zA-Z0-9\u00C0-\u00FF\s'’!$%^*()\-_+,.:;¡¿"«»¡¿&\/\\[\]]+$/;

/**
 * Indique si les informations du signalement sont correctes (tailles de champs, caractères autorisés et photo OK)
 */
export const saisiesValides = (
  nom: string,
  description: string,
  image: string,
  saisieBonne: boolean,
  nomErreur: boolean,
  descriptionErreur: boolean,
  photoErreur: boolean,
): boolean => {
  nomErreur = verifNom(nom);
  descriptionErreur = verifDescription(description);
  photoErreur = verifPhoto(image);

  // Si tout est bon, on retourne vrai
  if (!nomErreur && !descriptionErreur && !photoErreur) {
    saisieBonne = true;
  } else {
    saisieBonne = false;
  }

  return saisieBonne;
};

/**
 * Vérifie si la photo est bien renseignée
 * @param image
 * @param photoErreur
 */
export function verifPhoto(image: string): boolean {
  return image === "";
}

/**
 * Vérifie si la description est correcte
 * @param description
 * @param descriptionErreur
 */
export function verifDescription(description: string): boolean {
  return (
    description === "" ||
    description.length < 10 ||
    description.length > 500 ||
    !regex.test(description)
  );
}

/**
 * Vérifie si le nom est correct
 * @param nom
 * @returns true si le nom est invalide, sinon false
 */
export function verifNom(nom: string): boolean {
  return nom === "" || !regex.test(nom) || nom.length < 3 || nom.length > 50;
}

/**
 * Transforme un blob en base64
 * @param blob
 * @returns blob en base64
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(
          new Error(
            "[SynchroMontanteService -> blobToBase64 ]Conversion Blob vers Base64 a échoué.",
          ),
        );
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
     * fonction pour afficher une alerte en fonction du status de fin de l'envoi du signalement
     */
export const AlerteStatus = (status: EtatSynchro) => {
    switch (status) {
      case EtatSynchro.BienEnvoye:
        Alert.alert("Reussite !", "Votre signalement a bien été enregistré", [], {
          cancelable: true,
        });
        break;

      case EtatSynchro.NonConnecte:
        Alert.alert(
          "Hors connexion",
          "Votre signalement sera automatiquement enregistré lors de votre prochaine connexion (duree du cycle parametrable)",
          [],
          { cancelable: true },
        );
        break;

      case EtatSynchro.ErreurServeur:
        Alert.alert(
          "Erreur serveur",
          "Une erreur est survenue lors de l'envoi de votre signalement. Veuillez réessayer plus tard.",
          [],
          { cancelable: true },
        );
        break;
    }
  };
