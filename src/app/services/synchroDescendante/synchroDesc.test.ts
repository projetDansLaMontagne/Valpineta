/**
 * @file src/app/services/synchroDescendante/synchroDesc.test.ts
 * @description Fichier de test de la synchro descendante.
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import { TExcursion, TPoint, TSignalement } from "../../navigators";
import { describe } from "jest-circus";
import {
  API_FILE_DL_URL,
  API_FILE_MD5_URL,
  areObjectsEquals,
  BASE_URL,
  excursionsJsonExists,
} from "./synchroDesc";
import { expect, test } from "@jest/globals";
// END IMPORTS ==========================================================================================   END IMPORTS

// VARIABLES ================================================================================================ VARIABLE
// Type(s)

// Other(s)
const excursion1 = {
  denivele: "100",
  difficulteOrientation: "1",
  difficulteTechnique: "1",
  distance: "1",
  duree: "2h",
  vallee: "Pineta",
  postId: 1,
  signalements: [] as TSignalement[],
  nomTrackGpx: "track1.gpx",
  track: [] as TPoint[],
  fr: {
    nom: "Excursion 1",
    description: "Description excursion 1",
    typeParcours: "Aller-retour",
  },
  es: {
    nom: "Excursion 1",
    description: "Description excursion 1",
    typeParcours: "Ida y Vuelta",
  },
} as TExcursion;

const excursion1Identique = {
  denivele: "100",
  difficulteOrientation: "1",
  difficulteTechnique: "1",
  distance: "1",
  duree: "2h",
  vallee: "Pineta",
  postId: 1,
  signalements: [] as TSignalement[],
  nomTrackGpx: "track1.gpx",
  track: [] as TPoint[],
  fr: {
    nom: "Excursion 1",
    description: "Description excursion 1",
    typeParcours: "Aller-retour",
  },
  es: {
    nom: "Excursion 1",
    description: "Description excursion 1",
    typeParcours: "Ida y Vuelta",
  },
} as TExcursion;

const excursion4 = {
  denivele: "1000",
  difficulteOrientation: "1",
  difficulteTechnique: "1",
  distance: "1",
  duree: "2h",
  vallee: "Pineta",
  postId: 3,
  signalements: [] as TSignalement[],
  nomTrackGpx: "track1.gpx",
  track: [] as TPoint[],
  fr: {
    nom: "Excursion 1",
    description: "Description excursion 1",
    typeParcours: "Aller-retour",
  },
} as TExcursion;

const signalement1 = {
  id: 1,
  description: "Description signalement 1",
  image: "image1.jpg",
  latitude: 42.123456,
  longitude: 0.123456,
  nom: "Signalement 1",
  type: "PointInteret",
} as TSignalement;

const signalement1Change = {
  id: 1,
  description: "Description signalement 1 changée",
  image: "image1.jpg",
  latitude: 42.123456,
  longitude: 0.123456,
  nom: "Signalement 1",
  type: "PointInteret",
} as TSignalement;

// END VARIABLES ======================================================================================= END VARIABLES

// FUNCTIONS ================================================================================================ FUNCTIONS

// END FUNCTIONS ======================================================================================== END FUNCTIONS

// CODE ========================================================================================================= CODE
/**
 * Tests sur le fichier synchroDesc.ts.
 *
 * @see src/app/services/synchroDescendante/synchroDesc.ts
 */
describe("SynchroDescendante", () => {
  /**
   * Tests sur la fonction `API_FILE_DL_URL`.
   */
  describe("[SynchroDescendante] API_FILE_DL_URL", () => {
    /**
     * Teste si l'URL est correcte.
     */
    test("[SynchroDescendante] - API_FILE_DL_URL - URL correcte.", () => {
      const expected = `${BASE_URL}dl-file?file=tracks/track1.gpx`;

      expect(API_FILE_DL_URL("track1.gpx")).toBe(expected);
    });

    /**
     * Teste si l'URL est incorrecte.
     */
    test("[SynchroDescendante] - API_FILE_DL_URL - URL incorrecte.", () => {
      const expected = `${BASE_URL}dl-file?file=tracks/track1.gpx`;

      expect(API_FILE_DL_URL("track2.gpx")).not.toBe(expected);
    });
  });

  /**
   * Tests sur la fonction `API_FILE_MD5_URL`.
   */
  describe("[SynchroDescendante] API_FILE_MD5_URL", () => {
    /**
     * Teste si l'URL est correcte.
     */
    test("[SynchroDescendante] - API_FILE_MD5_URL - URL correcte.", () => {
      const expected = `${BASE_URL}md5-file?file=tracks/track1.gpx`;

      expect(API_FILE_MD5_URL("track1.gpx")).toBe(expected);
    });

    /**
     * Teste si l'URL est incorrecte.
     */
    test("[SynchroDescendante] - API_FILE_MD5_URL - URL incorrecte.", () => {
      const expected = `${BASE_URL}md5-file?file=tracks/track1.gpx`;

      expect(API_FILE_DL_URL("track2.gpx")).not.toBe(expected);
    });
  });

  /**
   * Tests sur la fonction `areObjectsEquals`.
   */
  describe("[SynchroDescendante] areObjectsEquals", () => {
    /**
     * Teste si deux objects sont égaux.
     */
    test("[SynchroDescendante] - areObjectsEquals - Signalements differents.", () => {
      expect(areObjectsEquals<TSignalement>(signalement1, signalement1Change)).toBeFalsy();
    });

    /**
     * Teste si deux objects n'ayant pas le même nombre de propriétés sont égaux.
     */
    test("[SynchroDescendante] - areObjectsEquals - Objects avec des propriétés différentes.", () => {
      expect(areObjectsEquals<TExcursion>(excursion1, excursion4)).toBeFalsy();
    });

    /**
     * Teste si deux objects sont égaux, objets même référence.
     */
    test("[SynchroDescendante] - areObjectsEquals - Signalements égaux.", () => {
      expect(areObjectsEquals<TSignalement>(signalement1, signalement1)).toBeTruthy();
    });

    /**
     * Teste si deux objects sont égaux, objets différentes références.
     */
    test("[SynchroDescendante] - areObjectsEquals - Objects complexes.", () => {
      expect(areObjectsEquals<TExcursion>(excursion1, excursion1Identique)).toBeTruthy();
    });
  });

  /**
   * Tests sur la fonction `excursionsJsonExists`.
   */
  describe("excursionsJsonExists", () => {
    /**
     * Teste lorsque le fichier JSON existe.
     */
    test("[SynchroDescendante] - excursionsJsonExists - Fichier JSON existe.", () => {
      expect(excursionsJsonExists()).toBeTruthy();
    });

    // /**
    //  * Teste lorsque le fichier JSON n'existe pas.
    //  */
    // test("[SynchroDescendante] - excursionsJsonExists - Fichier JSON n'existe pas.", () => {
    //   expect(false).toBeFalsy();
    // });
  });
});
// END CODE =======================================================================================  END COMPONENT

/**
 * End of file src/app/services/synchroDescendante/synchroDesc.test.ts
 */
