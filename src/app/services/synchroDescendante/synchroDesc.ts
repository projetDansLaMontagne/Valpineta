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
import * as FileSystem from "expo-file-system";
import { TExcursion } from "../../navigators";
// END IMPORTS ==========================================================================================   END IMPORTS

// VARIABLES ================================================================================================ VARIABLE
// Type(s)

// Other(s)
export const GPX_FOLDER = `${FileSystem.documentDirectory}GPX/`;
export const EXCURSIONS_FILE_DEST = `${FileSystem.documentDirectory}fichiers/excursions.json`;
export const API_FILE_DL_URL = (file: `${string}.gpx`) =>
  `https://valpineta.eu/wp-json/api-wp/dl-file?file=tracks/${file}`;
// END VARIABLES ======================================================================================= END VARIABLES

// FUNCTIONS ================================================================================================ FUNCTIONS
/**
 * Vérifie si le fichier 'excursions.json' existe.
 *
 * @returns {Promise<boolean>}
 */
export const excursionsJsonExists = async (): Promise<boolean> => {
  printDocumentDirectory();

  try {
    const fileInfo = await FileSystem.getInfoAsync(EXCURSIONS_FILE_DEST);
    return fileInfo.exists;
  } catch (error) {
    console.error("Error checking file existence:", error);
    return false;
  }
};

const printDocumentDirectory = () => {
  console.log("[synchro]documentDirectory -> ", FileSystem.documentDirectory);
};

/**
 * Copie du fichier 'excursions.json' dans le dossier 'fichiers/excursions.json'
 *
 * @returns {Promise<void>}
 */
export const copyExcursionsJson = async (): Promise<void> => {
  const excursionsJson = require("assets/JSON/excursions.json");
  // On vérifie si le dossier 'fichiers' existe
  const fichiersFolder = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}fichiers`);
  // Si le dossier 'fichiers' n'existe pas, on le crée
  if (!fichiersFolder.exists) {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}fichiers`);
  }

  // On copie le fichier 'excursions.json' dans le dossier 'fichiers', s'il existe, on le remplace
  await FileSystem.writeAsStringAsync(EXCURSIONS_FILE_DEST, JSON.stringify(excursionsJson));
};

export const getExcursionsJson = async (): Promise<TExcursion[]> => {
  if (await excursionsJsonExists()) {
    const excursionsJson = await FileSystem.readAsStringAsync(EXCURSIONS_FILE_DEST);
    return JSON.parse(excursionsJson);
  }

  return [];
};

const copyFile = async (file: `${string}.gpx`): Promise<void> => {
  await FileSystem.downloadAsync(
    API_FILE_DL_URL(file),
    `${FileSystem.documentDirectory}GPX/${file}`,
  );
};

/**
 * Copie des fichiers GPX dans le dossier 'GPX'.
 * Fonctionne de deux manières :
 * - Si le dossier 'GPX' n'existe pas, on le crée et on copie les fichiers.
 * - Si le dossier 'GPX' existe, on vérifie les fichiers présents et on copie les fichiers manquants.
 *
 * À exécuter au lancement de l'application mais après `copyExcursionsJson`.
 *
 * @returns {Promise<void>}
 */
export const getAndCopyGPXFiles = async (): Promise<void> => {
  // On vérifie si le dossier 'GPX' existe
  const GPXFolder = await FileSystem.getInfoAsync(GPX_FOLDER);
  // Si le dossier 'GPX' n'existe pas, on le crée
  if (!GPXFolder.exists) {
    console.log("[synchroDesc] le dossier 'GPX' n'existe pas, on le crée");
    await FileSystem.makeDirectoryAsync(GPX_FOLDER);
  }

  // On récupère la liste des fichiers GPX présents sur le téléphone
  const files = await FileSystem.readDirectoryAsync(GPX_FOLDER);
  console.log("[synchroDesc] fichiers GPX présents sur le téléphone -> ", files.length);

  // On récupère la liste des fichiers GPX présents sur le serveur
  // Ces fichiers sont stockés dans le fichier 'excursions.json'.
  const excursionsJson = await getExcursionsJson();
  const GPXFiles = excursionsJson.map(excursion => excursion.nomTrackGpx as `${string}.gpx`);

  // On copie les fichiers manquants
  const missingFiles = GPXFiles.filter(file => !files.includes(file));
  console.log("[synchroDesc] fichiers GPX manquants -> ", missingFiles.length);

  if (missingFiles.length > 0) {
    for (const file of missingFiles) {
      console.log("[synchroDesc] copie du fichier -> ", file);
      await copyFile(file);
    }

    console.log(`[synchroDesc] ${missingFiles.length} fichiers GPX copiés`);
  } else {
    console.log("[synchroDesc] tous les fichiers GPX sont présents sur le téléphone");
  }
};
// END FUNCTIONS ======================================================================================== END FUNCTIONS

// CODE ========================================================================================================= CODE

// END CODE =======================================================================================  END COMPONENT

/**
 * End of file src/app/services/synchroDescendante/SynchroDesc.ts
 */
