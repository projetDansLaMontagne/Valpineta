import { Alert } from "react-native";

//Store
import { useStores } from "app/models";

//Api
import { api } from "./api";
import { getGeneralApiProblem } from "./api/apiProblem";
import { translate } from "i18n-js";
import { md5 } from "js-md5";

//Type
import { T_Signalement } from "app/navigators";
export type TStatus = "envoyeEnBdd" | "ajouteEnLocal" | "dejaExistant" | "erreur";



/**
 *  Envoie les signalements au serveur
 * @param signalements
 * @param synchroMontante
 * @returns Promise<boolean>
 */
export async function envoieBaseDeDonneesSignalements(
  signalements: Array<T_Signalement>,
): Promise<boolean> {
  const { synchroMontante } = useStores();

  try {
    //Vérifie si des signalements sont présents dans le store
    if (synchroMontante.signalements.length > 0) {
      console.log("[SynchroMontanteService -> envoieBaseDeDonnees] Envoi des données");

      //Envoi des données
      const response = await api.apisauce.post(
        "set-signalement",
        {
          signalements: JSON.stringify(signalements),
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
        synchroMontante.removeAllSignalements();
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
