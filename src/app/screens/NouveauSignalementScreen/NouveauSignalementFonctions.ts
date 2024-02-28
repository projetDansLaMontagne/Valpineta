/**
 * Fonctions utiles pour le composant NouveauSignalementScreen
 * @oiercesat Cesat Oier
 * @version 1.0
 * @date 2021-02-28
 * @test app/screens/NouveauSignalementScreen/NouveauSignalementFonctions.test.ts
 */

// Regex contanant uniquement des caractères autorisés
const regex = /^[a-zA-Z0-9\u00C0-\u00FF\s'’!$%^*()\-_+,.:;¡¿"«»¡¿&\/\\[\]]+$/;

/**
 * Indique si les informations du signalement sont correctes (tailles de champs, caractères autorisés et photo OK)
 */
export const verifSaisiesValides = (
  nom: string,
  description: string,
  image: string,

): {saisiesValides:boolean, nomErreur:boolean, descriptionErreur:boolean, photoErreur:boolean } => {
  let nomErreur = verifNom(nom);
  let descriptionErreur = verifDescription(description);
  let photoErreur = verifPhoto(image);
  let saisiesValides = false;

  // Si tout est bon, on retourne vrai
  if (!nomErreur && !descriptionErreur && !photoErreur) {
    saisiesValides = true;
  } else {
    saisiesValides = false;
  }

  return { saisiesValides, nomErreur, descriptionErreur, photoErreur };
};

/**
 * Vérifie si la photo est bien renseignée
 * @param image
 * @param photoErreur
 */
export function verifPhoto(image: string): boolean {
  return image === "" || image === undefined || image === null;
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