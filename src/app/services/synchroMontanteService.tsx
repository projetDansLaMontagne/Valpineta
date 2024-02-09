import { Alert } from "react-native";

//Store
import { useStores } from "app/models";
import { translate } from "i18n-js";



//Type
import { T_Signalement } from "app/navigators";
export type TStatus = "envoyeEnBdd" | "ajouteEnLocal" | "dejaExistant" | "erreur";


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
