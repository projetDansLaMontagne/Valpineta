/**
 * @file src/app/services/CheckIfFirstLaunch.ts
 * @description Fichier contenant le service permettant de vérifier si l'application est lancée pour la première fois ou non.
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import AsyncStorage from "@react-native-async-storage/async-storage";
// END IMPORTS ==========================================================================================   END IMPORTS

// VARIABLES ================================================================================================ VARIABLE
// Type(s)

// Other(s)
const HAS_LAUNCHED = "hasLaunched";
// END VARIABLES ======================================================================================= END VARIABLES

// FUNCTIONS ================================================================================================ FUNCTIONS
/**
 * Met à jour le statut de l'application (lancée ou non).
 */
const setAppLaunched = async () => {
  await AsyncStorage.setItem(HAS_LAUNCHED, "true");
};

/**
 * Vérifie si l'application est lancée pour la première fois.
 *
 * @return {Promise<boolean>} - `true` si c'est la première fois que l'application est lancée, `false` sinon.
 */
export const checkIfFirstLaunch = async (): Promise<boolean> => {
  try {
    const hasLaunched = (await AsyncStorage.getItem(HAS_LAUNCHED)) === "true";

    if (!hasLaunched) {
      await setAppLaunched();
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Error @checkIfFirstLaunch:", error);
    return false;
  }
};
// END FUNCTIONS ======================================================================================== END FUNCTIONS

// CODE ========================================================================================================= CODE

// END CODE =======================================================================================  END COMPONENT

/**
 * End of file src/app/services/CheckIfFirstLaunch.ts
 */
