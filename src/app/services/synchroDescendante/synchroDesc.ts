/**
 * @file src/app/services/synchroDescendante/SynchroDesc.ts
 * @description Fichier principal du service de synchronisation descendante.
 * Ce fichier implique quelques changements dans le code de l'application.
 *   - Les excursions (`excursions.json`) qui étaient préalablement stockées dans les assets doivent maintenant être
 * déplacés dans les fichiers du téléphone afin d'être modifiables par la suite. FAIT
 *   - Les fichiers GPX seront stockés dans le dossier `GPX` du téléphone au lancement de l'application. FAIT
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
 *     - API qui prend un fichier en paramètre et qui renvoie le MD5 du fichier afin de
 *     vérifier si le téléchargement s'est bien passé.
 *       -> `${BASE_URL}md5-file?file=tracks/<nom-du-fichier-extension-incluse>`
 *   - `excursions.json`:
 *     - API qui renvoie le MD5 du fichier `excursions.json` afin de vérifier si le téléchargement
 *     s'est bien passé.
 *       -> `${BASE_URL}excursions?isMd5=true`
 *
 * ! REMARQUES
 * - Pour le moment, je compare chaque excursion et chaque signalement. Nous n'avons pas côté API
 * de fonction qui permet de récupérer les excursions modifiées depuis une date donnée.
 *    -> Je pourrait MD5 chaque excursion et les comparer avec ceux du téléphone.
 * - DL des fichiers LOOONG mais fonctionnel.
 * - Lors du DL des GPX, on a un fichier '.gpx' ?
 *
 *
 * ! CONSIGNES
 * `synchroDescendante` peut prendre 2 callbacks en paramètre:
 *  - callbackStep: Fonction qui renvoie l'étape actuelle et le nombre d'étapes total.
 *  - callbackToGetNumberOfFiles: Fonction qui prend deux paramètres: le nombre de fichiers GPX téléchargés et le nombre de fichiers GPX à télécharger.
 *
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import * as FileSystem from "expo-file-system";
import { TExcursion, TLanguageContent, TPoint, TSignalement } from "../../navigators";
import NetInfo from "@react-native-community/netinfo";
import Config from "../../config";
// END IMPORTS ==========================================================================================   END IMPORTS

// VARIABLES ================================================================================================ VARIABLE
// Type(s)
export enum ESynchroDescendanteStep {
  DL_EXCURSIONS = 1,
  MAJ_EXCURSIONS,
  DL_GPX,
  __LENGTH, // À laisser en dernier et ne pas utiliser.
}

export enum ESynchroDescendanteRes {
  OK = 0,
  KO,
  NO_CONNEXION,
}

export type TCallbackToGetNumberOfFiles = (filesDownloaded: number, filesToDl: number) => void;
export type TCallbackStep = (step: number, totalSteps: number) => void;

/**
 * Niveau de debug.
 * Ne sert que pour dev.
 */
export enum EDebugMode {
  LOW = 0,
  MEDIUM,
  HIGH,
}

// Other(s)
export const BASE_URL = Config.API_URL;
const DOCUMENTS_FOLDER = `${FileSystem.documentDirectory}` as const;

export const GPX_FOLDER = `${DOCUMENTS_FOLDER}GPX/`;
const GPX_TEMP_FOLDER = `${DOCUMENTS_FOLDER}GPX-temp/` as const;

export const EXCURSIONS_FILE_DEST = `${DOCUMENTS_FOLDER}fichiers/excursions.json`;
const EXCURSIONS_TEMP_FILE_DEST = `${DOCUMENTS_FOLDER}fichiers/excursions-temp.json`;

export const API_FILE_DL_URL = (file: `${string}.gpx`) => `${BASE_URL}dl-file?file=tracks/${file}`;
export const API_FILE_MD5_URL = (file: `${string}.gpx`) =>
  `${BASE_URL}md5-file?file=tracks/${file}`;

export const API_EXCURSIONS_URL = `${BASE_URL}excursions`;
export const API_EXCURSIONS_MD5_URL = `${API_EXCURSIONS_URL}?isMd5=true`;
// END VARIABLES ======================================================================================= END VARIABLES

// FUNCTIONS ================================================================================================ FUNCTIONS
/**
 * Compare (récurssivement) deux objets.
 *
 * @param signalement1 {TExcursion | TSignalement | TPoint | TLanguageContent<"fr" | "es">} - Premier objet à comparer.
 * @param signalement2 {TExcursion | TSignalement | TPoint | TLanguageContent<"fr" | "es">} - Deuxième objet à comparer.
 *
 * @returns {boolean} - True si les deux objets sont égaux, false sinon.
 */
export const areObjectsEquals = <
  T extends TExcursion | TSignalement | TPoint | TLanguageContent<"fr" | "es">,
>(
  signalement1: T,
  signalement2: T,
): boolean => {
  const keys1 = Object.keys(signalement1);
  const keys2 = Object.keys(signalement2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    // Si la valeur est un objet, on compare récurssivement
    if (typeof signalement1[key] === "object") {
      return areObjectsEquals(signalement1[key], signalement2[key]);
    } else {
      if (signalement1[key] !== signalement2[key]) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Récupère le nombre de fichiers GPX présents sur le téléphone.
 *
 * @returns {Promise<number>}
 */
/* istanbul ignore next */
export const getNumberOfExcursions = async (): Promise<number> => {
  const excursionsJson = await getExcursionsJsonFromDevice();
  return excursionsJson.length;
};

/**
 * Vérifie si le fichier `excursions.json` existe sur le téléphone.
 *
 * @returns {Promise<boolean>}
 */
export const excursionsJsonExists = async (): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(EXCURSIONS_FILE_DEST);
    return fileInfo.exists;
  } catch (error) {
    /* istanbul ignore next */
    console.error("Error checking file existence:", error);
    /* istanbul ignore next */
    return false;
  }
};

/**
 * Copie du fichier 'excursions.json' dans le dossier 'fichiers/excursions.json'
 *
 * @returns {Promise<void>}
 */
/* istanbul ignore next */
export const downloadExcursionsJson = async (): Promise<void> => {
  // On vérifie si le dossier 'fichiers' existe
  const fichiersFolder = await FileSystem.getInfoAsync(`${DOCUMENTS_FOLDER}fichiers`);
  // Si le dossier 'fichiers' n'existe pas, on le crée
  if (!fichiersFolder.exists) {
    await FileSystem.makeDirectoryAsync(`${DOCUMENTS_FOLDER}fichiers`);
  }

  // On copie le fichier 'excursions.json' dans le dossier 'fichiers', s'il existe, on le remplace
  const { md5 } = await FileSystem.downloadAsync(API_EXCURSIONS_URL, EXCURSIONS_TEMP_FILE_DEST, {
    md5: true,
  });

  // On récupère le MD5 du fichier sur le serveur
  // la réponse est un string
  console.log(`[synchroDesc] fetch API_EXCURSIONS_MD5_URL -> `, API_EXCURSIONS_MD5_URL);
  const md5API = await fetch(API_EXCURSIONS_MD5_URL)
    .then(res => res.json() as Promise<string>)
    .catch(error => {
      console.error("Error fetching API_EXCURSIONS_MD5_URL:", error);
      return "";
    });

  console.log(`[synchroDesc] MD5 du fichier de l'API -> `, md5API);

  // On compare les deux MD5 pour savoir si le téléchargement s'est bien passé.
  if (md5 !== md5API) {
    // Suppression du fichier temporaire
    await FileSystem.deleteAsync(EXCURSIONS_TEMP_FILE_DEST);
    console.error(
      `[synchroDesc - 182] MD5 du fichier 'excursions.json' différents: ${md5} ${md5API}`,
    );

    throw new Error("Erreur lors du téléchargement du fichier 'excursions.json'.");
  }
};

/**
 * Récupère le fichier 'excursions.json' et le parse en JSON.
 *
 * @returns {Promise<Array<TExcursion>>}
 */
/* istanbul ignore next */
export const getExcursionsJsonFromDevice = async (): Promise<Array<TExcursion>> => {
  try {
    if (await excursionsJsonExists()) {
      const excursionsJson = await FileSystem.readAsStringAsync(EXCURSIONS_FILE_DEST);
      return JSON.parse(excursionsJson);
    }
  } catch (error) {
    console.error("Error reading file:", error);
  }

  return [] as Array<TExcursion>;
};

/**
 * Met à jour le fichier 'excursions.json' en comparant les excursions présentes sur le téléphone et sur le serveur.
 * Il faut vérifier pour chaque excursion si ses signalements ont été modifiés.
 *
 * @param debug {boolean} Affiche des logs dans la console.
 *
 * @returns {Promise<void>}
 */
/* istanbul ignore next */
export const updateExcursionsJsonRequest = async (debug?: EDebugMode): Promise<void> => {
  // On vérifie si le fichier 'excursions-temp.json' existe
  const excursionsTempFile = await FileSystem.getInfoAsync(EXCURSIONS_TEMP_FILE_DEST);

  // Si le fichier 'excursions-temp.json' existe, on le supprime
  if (!excursionsTempFile.exists) {
    // On récupère le MD5 du fichier 'excursions.json' sur le serveur.
    const md5API = await fetch(API_EXCURSIONS_MD5_URL).then(res => res.json() as Promise<string>);

    // Téléchargement du fichier 'excursions.json' depuis le serveur.
    const { md5 } = await FileSystem.downloadAsync(API_EXCURSIONS_URL, EXCURSIONS_TEMP_FILE_DEST, {
      md5: true,
    });

    // On compare les deux MD5 pour savoir si le téléchargement s'est bien passé.
    if (md5 !== md5API) {
      console.error(
        `[synchroDesc - 238] MD5 du fichier 'excursions.json' différents: ${md5} ${md5API}`,
      );
      throw new Error("Erreur lors du téléchargement du fichier 'excursions.json'.");
    } else {
      debug >= EDebugMode.MEDIUM &&
        console.log("[synchroDesc] MD5 du fichier 'excursions.json' identiques");
    }
  }

  // Récupération des excursions depuis le fichier 'excursions.json'.
  const excursionsJson = await getExcursionsJsonFromDevice();

  // Récupération des excursions depuis le fichier 'excursions-temp.json'.
  const excursionsServer = await FileSystem.readAsStringAsync(EXCURSIONS_TEMP_FILE_DEST).then(
    res => JSON.parse(res) as Array<TExcursion>,
  );

  const { hasChanged, excursionsJson: excursionsJsonUpdated } = updateExcursionsJson(
    excursionsServer,
    excursionsJson,
    debug,
  );

  if (hasChanged) {
    // On met à jour le fichier 'excursions.json' sur le téléphone
    await FileSystem.writeAsStringAsync(
      EXCURSIONS_FILE_DEST,
      JSON.stringify(excursionsJsonUpdated),
    );
  }

  debug >= EDebugMode.LOW && console.log(`[synchroDesc] ${DOCUMENTS_FOLDER}`);

  // On supprime le fichier 'excursions-temp.json'
  await FileSystem.deleteAsync(EXCURSIONS_TEMP_FILE_DEST);
};

/**
 * Met à jour le fichier 'excursions.json' en comparant les excursions présentes sur le téléphone et sur le serveur.
 * Il faut vérifier chaque excursion et chaque signalement.
 *
 * @param excursionsServer {Array<TExcursion>} Excursions présentes sur le serveur.
 * @param excursionsJson {Array<TExcursion>} Excursions présentes sur le téléphone.
 * @param debug {boolean} Affiche des logs dans la console.
 *
 * @returns {boolean} True si le fichier 'excursions.json' a été modifié, false sinon.
 */
export const updateExcursionsJson = (
  excursionsServer: Array<TExcursion>,
  excursionsJson: Array<TExcursion>,
  debug?: EDebugMode,
): {
  hasChanged: boolean;
  excursionsJson: Array<TExcursion>;
} => {
  let hasChanged = false;

  if (excursionsServer.length === 0) {
    debug >= 1 && console.log("[synchroDesc] pas d'excursions sur le serveur");
    return {
      hasChanged: excursionsJson.length > 0,
      excursionsJson: [],
    };
  }

  // On cherche si des excursions ont été supprimées
  for (const excursionJson of excursionsJson) {
    // On récupère l'excursion correspondante sur le serveur
    const excursionServer = excursionsServer.find(
      excursion => excursion.postId === excursionJson.postId,
    );

    debug >= 2 && console.log(`[synchroDesc] excursionJson.postId -> ${excursionJson.postId}`);
    debug >= 2 && console.log(`[synchroDesc] excursionServer.postId -> ${excursionServer?.postId}`);

    // Si l'excursion n'est pas présente sur le serveur
    if (!excursionServer) {
      // On supprime l'excursion sur le téléphone
      debug &&
        console.log(
          `[synchroDesc] l'excursion ${excursionJson.postId} n'est pas présente sur le serveur`,
        );
      const index = excursionsJson.indexOf(excursionJson);
      excursionsJson.splice(index, 1);

      hasChanged = true;
    }
  }

  // On compare les excursions
  for (const excursionServer of excursionsServer) {
    // On récupère l'excursion correspondante sur le téléphone
    const excursionJson = excursionsJson.find(
      excursion => excursion.postId === excursionServer.postId,
    );

    // Si l'excursion est présente sur le téléphone
    if (excursionJson) {
      // On compare les deux excursions
      if (!areObjectsEquals(excursionServer, excursionJson)) {
        // Si les excursions sont différentes, on met à jour l'excursion sur le téléphone
        debug &&
          console.log(
            `[synchroDesc] l'excursion ${excursionServer.postId} est présente sur le téléphone mais est différente`,
          );
        const index = excursionsJson.indexOf(excursionJson);
        excursionsJson[index] = excursionServer;

        hasChanged = true;
      }
    } else {
      // Si l'excursion n'est pas présente sur le téléphone, on l'ajoute
      debug &&
        console.log(
          `[synchroDesc] l'excursion ${excursionServer.postId} n'est pas présente sur le téléphone`,
        );
      excursionsJson.push(excursionServer);

      hasChanged = true;
    }
  }

  // On retourne les excursions mises à jour
  return {
    hasChanged,
    excursionsJson,
  };
};

/**
 * Crée le dossier 'GPX' s'il n'existe pas.
 *
 * @returns {Promise<void>}
 */
/* istanbul ignore next */
const createGPXFolder = async (): Promise<void> => {
  // check si le dossier 'GPX-temp' existe
  const GPXFolder = await FileSystem.getInfoAsync(GPX_FOLDER);
  // Si le dossier 'GPX-temp' n'existe pas, on le crée
  if (!GPXFolder.exists) {
    await FileSystem.makeDirectoryAsync(GPX_FOLDER);
  }
};

/**
 * Crée le dossier 'GPX-temp' s'il n'existe pas.
 *
 * @returns {Promise<void>}
 */
/* istanbul ignore next */
const createGPXTempFolder = async (): Promise<void> => {
  // check si le dossier 'GPX-temp' existe
  const GPXFolder = await FileSystem.getInfoAsync(GPX_TEMP_FOLDER);
  // Si le dossier 'GPX-temp' n'existe pas, on le crée
  if (!GPXFolder.exists) {
    await FileSystem.makeDirectoryAsync(GPX_TEMP_FOLDER);
  }
};

/**
 * Supprime le dossier 'GPX-temp' s'il existe.
 *
 * @returns {Promise<void>}
 */
/* istanbul ignore next */
const deleteGPXTempFolder = async (): Promise<void> => {
  // check si le dossier 'GPX-temp' existe
  const GPXFolder = await FileSystem.getInfoAsync(GPX_TEMP_FOLDER);
  // Si le dossier 'GPX-temp' existe, on le supprime
  if (GPXFolder.exists) {
    await FileSystem.deleteAsync(GPX_TEMP_FOLDER);
  }
};

/**
 * Télécharge le fichier GPX passé en paramètre depuis notre API.
 * @param file {string} Nom du fichier GPX à télécharger.
 *
 * @returns {Promise<void>}
 */
/* istanbul ignore next */
const dlGPXFile = async (file: `${string}.gpx`): Promise<void> => {
  if (file === ".gpx") {
    return Promise.resolve();
  }

  await createGPXTempFolder();

  const { md5 } = await FileSystem.downloadAsync(
    API_FILE_DL_URL(file),
    `${GPX_TEMP_FOLDER}${file}`,
    {
      md5: true,
    },
  );

  // On récupère le MD5 du fichier sur le serveur
  const md5API = await fetch(API_FILE_MD5_URL(file)).then(res => res.json() as Promise<string>);

  console.log(`[synchroDesc] MD5 du fichier ${file} -> `, md5);
  console.log(`[synchroDesc] MD5 du fichier ${file} sur le serveur -> `, md5API);

  // On compare les deux MD5 pour savoir si le téléchargement s'est bien passé.
  if (md5 !== md5API) {
    // Suppression du fichier temporaire
    await FileSystem.deleteAsync(`${GPX_TEMP_FOLDER}${file}`);
    throw new Error(`Erreur lors du téléchargement du fichier '${file}'. Les MD5 sont différents.`);
  }

  await createGPXFolder();

  // On copie le fichier dans le dossier 'GPX'
  await FileSystem.copyAsync({
    from: `${GPX_TEMP_FOLDER}${file}`,
    to: `${GPX_FOLDER}${file}`,
  });
};

/**
 * Copie des fichiers GPX dans le dossier 'GPX'.
 * Fonctionne de deux manières :
 * - Si le dossier 'GPX' n'existe pas, on le crée et on copie les fichiers.
 * - Si le dossier 'GPX' existe, on vérifie les fichiers présents et on copie les fichiers manquants.
 *
 * À exécuter au lancement de l'application mais après `downloadExcursionsJson`.
 *
 * @param callbackToGetNumberOfFiles {Function} Fonction qui renvoie le nombre de fichiers GPX présents sur le téléphone.
 *
 * @returns {Promise<void>}
 */
/* istanbul ignore next */
export const getAndCopyGPXFiles = async (
  callbackToGetNumberOfFiles?: TCallbackToGetNumberOfFiles,
): Promise<void> => {
  await createGPXFolder();
  await createGPXTempFolder();

  // On récupère la liste des fichiers GPX présents sur le téléphone
  const files = await FileSystem.readDirectoryAsync(GPX_FOLDER);
  console.log("[synchroDesc] fichiers GPX présents sur le téléphone -> ", files.length);

  // On récupère la liste des fichiers GPX présents sur le serveur
  // Ces fichiers sont stockés dans le fichier 'excursions.json'.
  const excursionsJson = await getExcursionsJsonFromDevice();
  const GPXFiles = excursionsJson.map(excursion => excursion.nomTrackGpx as `${string}.gpx`);
  console.log("[synchroDesc] fichiers GPX présents sur le serveur -> ", GPXFiles.length);

  // On copie les fichiers manquants
  const missingFiles = GPXFiles.filter(file => !files.includes(file));
  console.log("[synchroDesc] fichiers GPX manquants -> ", missingFiles.length);

  callbackToGetNumberOfFiles &&
    callbackToGetNumberOfFiles(files.length - missingFiles.length, GPXFiles.length);

  let filesDownloaded = 0;
  if (missingFiles.length > 0) {
    for (const file of missingFiles) {
      console.log("[synchroDesc] copie du fichier -> ", file);
      try {
        await dlGPXFile(file);
      } catch (error) {
        console.error(error);
      }

      callbackToGetNumberOfFiles &&
        callbackToGetNumberOfFiles(++filesDownloaded, missingFiles.length);
    }

    console.log(`[synchroDesc] ${missingFiles.length} fichiers GPX copiés`);
  } else {
    console.log("[synchroDesc] tous les fichiers GPX sont présents sur le téléphone");
  }

  // Suppression du dossier temporaire
  await deleteGPXTempFolder();
};

// END FUNCTIONS ======================================================================================== END FUNCTIONS

// CODE ========================================================================================================= CODE
/**
 * Fonction principale de la synchronisation descendante.
 * Exécute les fonctions dans l'ordre suivant :
 *  - Si le fichier 'excursions.json' n'existe pas, on le copie.
 *  - On met à jour le fichier 'excursions.json'.
 *  - Si le dossier 'GPX' n'existe pas, on le crée et on copie les fichiers.
 *  - Sinon, on vérifie les fichiers présents et on copie les fichiers manquants.
 *
 *  À exécuter au lancement de l'application et/ou toutes les X heures.
 *
 * @param callbackStep {Function} Fonction qui renvoie le nombre de tuiles téléchargées.
 * @param callbackToGetNumberOfFiles {Function} Fonction qui renvoie le nombre de fichiers GPX présents sur le téléphone.
 * @param debug {EDebugMode} Niveau de debug.
 *
 * @returns {Promise<boolean>} True si la synchronisation s'est bien passée, false sinon.
 */
/* istanbul ignore next */
export const synchroDescendante = async (
  callbackStep?: TCallbackStep,
  callbackToGetNumberOfFiles?: TCallbackToGetNumberOfFiles,
  debug?: EDebugMode,
): Promise<ESynchroDescendanteRes> => {
  const connexion = await NetInfo.fetch();

  if (!connexion.isConnected) {
    return ESynchroDescendanteRes.NO_CONNEXION;
  }

  try {
    // On vérifie si le fichier 'excursions.json' existe
    const excursionsJsonExist = await excursionsJsonExists();

    // Si le fichier 'excursions.json' n'existe pas, on le copie
    if (!excursionsJsonExist) {
      await downloadExcursionsJson();
    }
    callbackStep &&
      callbackStep(ESynchroDescendanteStep.DL_EXCURSIONS, ESynchroDescendanteStep.__LENGTH - 1);

    // On met à jour le fichier 'excursions.json'
    await updateExcursionsJsonRequest(debug);

    callbackStep &&
      callbackStep(ESynchroDescendanteStep.MAJ_EXCURSIONS, ESynchroDescendanteStep.__LENGTH - 1);

    // On copie les fichiers GPX
    await getAndCopyGPXFiles(callbackToGetNumberOfFiles);
    callbackStep &&
      callbackStep(ESynchroDescendanteStep.DL_GPX, ESynchroDescendanteStep.__LENGTH - 1);

    return ESynchroDescendanteRes.OK;
  } catch (error) {
    console.error(error);

    return ESynchroDescendanteRes.KO;
  }
};

// END CODE =======================================================================================  END COMPONENT

/**
 * End of file src/app/services/synchroDescendante/SynchroDesc.ts
 */
