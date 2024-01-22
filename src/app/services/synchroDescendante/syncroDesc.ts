/**
 * @file src/app/services/synchroDescendante/SynchroDesc.ts
 * @description Fichier principal du service de synchronisation descendante.
 * Ce fichier implique quelques changements dans le code de l'application.
 *   - Les excursions (`excursions.json`) qui étaient préalablement stockées dans les assets doivent maintenant être
 * déplacés dans les fichiers du téléphone afin d'être modifiables par la suite.
 *   - Les fichiers GPX seront stockés dans le dossier `GPX` du téléphone au lancement de l'application.
 *
 * La syncronisation descendante se fera à plusieurs moments :
 *   - Premier lancement de l'application:
 *     - Bloquer l'application tant que les tuiles n'ont pas toutes été déplacées.
 *     - MAJ des excursions.
 *     - DL des fichiers GPX.
 *   - Toutes les X heures:
 *     - MAJ des excursions.
 *     - MAJ des fichiers GPX.
 *
 * Ce que j'attends de l'API:
 *   - GPX:
 *     - Je lui envoie la liste des fichiers GPX que j'ai sur le téléphone.
 *       - Si un fichier est présent sur le téléphone mais pas sur le serveur, je le supprime ?
 *       - Si un fichier est présent sur le serveur mais pas sur le téléphone, je le DL.
 *       - Si un fichier est présent sur le téléphone et sur le serveur, je vérifie la date de modification.
 *    - `excursions.json`:
 *     - Je lui envoie la liste des excursions que j'ai sur le téléphone et leur signalements.
 *     - Si une excursion est présente sur le téléphone mais pas sur le serveur, je la supprime ?
 *     - Si une excursion est présente sur le serveur mais pas sur le téléphone, je la DL.
 *
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import * as fileSystem from "expo-file-system";
// END IMPORTS ==========================================================================================   END IMPORTS

// VARIABLES ================================================================================================ VARIABLE
// Type(s)

// Other(s)
export const GPX_FOLDER = fileSystem.documentDirectory + "GPX/";
export const EXCURSIONS_FILE = fileSystem.documentDirectory + "excursions.json";
// END VARIABLES ======================================================================================= END VARIABLES

// FUNCTIONS ================================================================================================ FUNCTIONS

// END FUNCTIONS ======================================================================================== END FUNCTIONS

// CODE ========================================================================================================= CODE

// END CODE =======================================================================================  END COMPONENT

/**
 * End of file src/app/services/synchroDescendante/SynchroDesc.ts
 */
