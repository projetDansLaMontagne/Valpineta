import { Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";

//Store
import { SynchroMontanteStore } from "app/models";

//Api
import { api } from "./api";
import { getGeneralApiProblem } from "./api/apiProblem";
import { translate } from "i18n-js";
import { md5 } from "js-md5";

//Type
import { TSignalement, TTypeSignalement } from "app/navigators";

/* --------------------------- FONCTIONS EXPORTEES -------------------------- */

/**
 * Permet de synchroniser les données avec la base de données
 * Synchronisation montante
 * @param signalementAEnvoyer
 * @param synchroMontanteStore
 * @returns Promise<string>
 */
export async function synchroMontanteSignalement(
  signalementAEnvoyer: TSignalement,
  synchroMontanteStore: SynchroMontanteStore,
): Promise<"envoyeEnBdd" | "ajouteEnLocal" | "dejaExistant" | "erreur"> {
  let status: "envoyeEnBdd" | "ajouteEnLocal" | "dejaExistant" | "erreur";

  try {
    //Vérifie si l'appareil est connecté à internet
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);

    //Convertir l'image url en base64
    const blob = await fetch(signalementAEnvoyer.image).then(response => response.blob());
    signalementAEnvoyer.image = await blobToBase64(blob);

    //Vérifie si le signalement existe déjà dans le store
    if (
      !rechercheMemeSignalement(
        signalementAEnvoyer.nom,
        signalementAEnvoyer.type,
        signalementAEnvoyer.description,
        signalementAEnvoyer.image,
        signalementAEnvoyer.lat,
        signalementAEnvoyer.lon,
        synchroMontanteStore,
      )
    ) {
      //Ajoute le signalement formaté dans le store
      const signalementAjoute = synchroMontanteStore.addSignalement(signalementAEnvoyer);

      //Envoi des données si l'appareil est connecté
      if (isConnected && signalementAjoute) {
        const sendStatus = await envoieBaseDeDonneesSignalements(
          synchroMontanteStore.signalements,
          synchroMontanteStore,
        );
        if (sendStatus) {
          status = "envoyeEnBdd";
        } else {
          status = "erreur";
        }
      } else {
        if (signalementAjoute) {
          status = "ajouteEnLocal";
        } else {
          status = "erreur";
        }
      }
    } else {
      status = "dejaExistant";
    }

    //Gestion des erreurs
  } catch (error) {
    console.error("[SynchroMontanteService -> synchroMontante] Erreur :", error);
    status = "erreur";
  }

  return status;
}

/**
 *  Envoie les signalements au serveur
 * @param signalements
 * @param synchroMontanteStore
 * @returns Promise<boolean>
 */
export async function envoieBaseDeDonneesSignalements(
  signalements: Array<TSignalement>,
  synchroMontanteStore: SynchroMontanteStore,
): Promise<boolean> {
  //Id du post A CHANGER
  const post_id = 2049;

  try {
    //Vérifie si des signalements sont présents dans le store
    if (synchroMontanteStore.signalements.length > 0) {
      console.log("[SynchroMontanteService -> envoieBaseDeDonnees] Envoi des données");

      //Envoi des données
      const response = await api.apisauce.post(
        "set-signalement",
        {
          signalements: JSON.stringify(signalements),
          post_id: post_id,
          // en cours de développement avec Robin 
          md5: md5(JSON.stringify(signalements)),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        console.log("[SynchroMontanteService -> envoieBaseDeDonnees] Données envoyées");
        // Supprimer les signalements du store
        synchroMontanteStore.removeAllSignalements();
        return true;
      } else {
        console.log(
          "[SynchroMontanteService -> envoieBaseDeDonnees] Erreur lors de l'envoi des données : ",
          //Récupère le problème
          getGeneralApiProblem(response),
        );
        return false;
      }
    } else {
      console.log("[SynchroMontanteService -> envoieBaseDeDonnees] Aucun signalement à envoyer.");
      return false;
    }
    //Gestion des erreurs
  } catch (error) {
    console.error(
      "[SynchroMontanteService -> envoieBaseDeDonnees] Erreur lors de l'envoi des données :",
      error,
    );
    return false;
  }
}

/**
 * Affiche une alerte pour indiquer que la synchronisation a bien été effectuée
 * @returns
 */
export const alertSynchroEffectuee = () => {
  Alert.alert(
    translate("pageNouveauSignalement.alerte.envoyeEnBdd.titre"),
    translate("pageNouveauSignalement.alerte.envoyeEnBdd.message"),
    [{ text: "OK" }],
  );
};

/* ---------------------- FONCTIONS INTERNES AU SERVICE --------------------- */

/**
 * Recherche si un signalement existe déjà dans la liste des signalements dans le store
 * @param titreSignalement
 * @param type
 * @param descriptionSignalement
 * @param photoSignalement
 * @param lat
 * @param lon
 * @param synchroMontanteStore
 * @returns
 */
function rechercheMemeSignalement(
  titreSignalement: string,
  type: TTypeSignalement,
  descriptionSignalement: string,
  photoSignalement: string,
  lat: number,
  lon: number,
  synchroMontanteStore: SynchroMontanteStore,
): boolean {
  let memeSignalement: boolean = false;

  synchroMontanteStore.signalements.forEach(signalement => {
    if (
      signalement.nom === titreSignalement &&
      signalement.type === type &&
      signalement.description === descriptionSignalement &&
      signalement.image === photoSignalement &&
      signalement.lat === lat &&
      signalement.lon === lon
    ) {
      memeSignalement = true;
    }
  });

  return memeSignalement;
}

/**
 * Transforme un blob en base64
 * @param blob
 * @returns blob en base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
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
