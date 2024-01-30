/**
 * @file src/app/services/synchroDescendante/synchroDesc.test.ts
 * @description Fichier de test de la synchro descendante.
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import { TExcursion, TPoint, TSignalement } from "../../navigators";
import { describe } from "jest-circus";
import { areObjectsEquals, updateExcursionsJson } from "./synchroDesc";
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

const excursion1Change = {
  denivele: "10000",
  difficulteOrientation: "100",
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

const excursion2 = {
  denivele: "1000",
  difficulteOrientation: "1",
  difficulteTechnique: "1",
  distance: "1",
  duree: "2h",
  vallee: "Pineta",
  postId: 2,
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

const excursion3 = {
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
  es: {
    nom: "Excursion 1",
    description: "Description excursion 1",
    typeParcours: "Ida y Vuelta",
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
   * Tests sur la fonction `updateExcursionsJson`.
   */
  describe("updateExcursionsJson", () => {
    /**
     * Deux objects différents mais avec le même contenu.
     */
    test("[SynchroDescendante] - updateExcursionsJson - Excursion pas changée.", () => {
      const { hasChanged, excursionsJson } = updateExcursionsJson(
        [excursion1],
        [excursion1Identique],
      );

      expect(hasChanged).toBeFalsy();
      expect(excursionsJson).toHaveLength(1);
      expect(excursionsJson[0]).toEqual(excursion1);
      expect(excursionsJson[0]).toEqual(excursion1Identique);
    });

    /**
     * Deux excursions différentes mais avec le même id.
     */
    test("[SynchroDescendante] - updateExcursionsJson - Excursion changée.", () => {
      const { hasChanged, excursionsJson } = updateExcursionsJson([excursion1Change], [excursion1]);

      expect(hasChanged).toBeTruthy();
      expect(excursionsJson).toHaveLength(1);
      expect(excursionsJson[0]).toEqual(excursion1Change);
    });

    /**
     * Si une excursion est supprimée, elle doit être supprimée du fichier JSON.
     */
    test("[SynchroDescendante] - updateExcursionsJson - Excursion supprimée.", () => {
      const { hasChanged, excursionsJson } = updateExcursionsJson([], [excursion1Identique]);

      expect(hasChanged).toBeTruthy();
      expect(excursionsJson).toHaveLength(0);
    });

    /**
     * Si une excursion est ajoutée, elle doit être ajoutée au fichier JSON.
     */
    test("[SynchroDescendante] - updateExcursionsJson - Excursion ajoutée.", () => {
      const { hasChanged, excursionsJson } = updateExcursionsJson(
        [excursion1Identique, excursion2],
        [excursion1Identique],
      );

      expect(hasChanged).toBeTruthy();
      expect(excursionsJson).toHaveLength(2);
      expect(excursionsJson[0]).toEqual(excursion1Identique);
      expect(excursionsJson[1]).toEqual(excursion2);
    });

    /**
     * Teste si une excursion est ajoutée et une autre supprimée.
     */
    test("[SynchroDescendante] - updateExcursionsJson - Excursion ajoutée et supprimée.", () => {
      const { hasChanged, excursionsJson } = updateExcursionsJson(
        [excursion2, excursion3],
        [excursion1, excursion2],
      );

      expect(hasChanged).toBeTruthy();
      expect(excursionsJson).toHaveLength(2);
      expect(excursionsJson[0]).toEqual(excursion2);
      expect(excursionsJson[1]).toEqual(excursion3);
    });

    /**
     * Teste dans le cas où une excursion est modifiée sur le serveur.
     */
    test("[SynchroDescendante] - updateExcursionsJson - Excursion modifiée sur le serveur.", () => {
      const { hasChanged, excursionsJson } = updateExcursionsJson(
        [excursion1Identique, excursion1Change],
        [excursion1Identique],
      );

      expect(hasChanged).toBeTruthy();
      expect(excursionsJson).toHaveLength(1);
      expect(excursionsJson[0]).toEqual(excursion1Change);
    });

    /**
     * Teste s'il n'y a plus d'excursions sur le serveur.
     */
    test("[SynchroDescendante] - updateExcursionsJson - Plus d'excursions sur le serveur.", () => {
      const { hasChanged, excursionsJson } = updateExcursionsJson([], [excursion1Identique]);

      expect(hasChanged).toBeTruthy();
      expect(excursionsJson).toHaveLength(0);
    });

    /**
     * Teste s'il n'y a pas d'excursions sur le téléphone mais toutes sur le serveur.
     */
    test("[SynchroDescendante] - updateExcursionsJson - Plus d'excursions sur le téléphone.", () => {
      const { hasChanged, excursionsJson } = updateExcursionsJson(
        [excursion1, excursion2, excursion3],
        [],
      );

      expect(hasChanged).toBeTruthy();
      expect(excursionsJson).toHaveLength(3);
      expect(excursionsJson[0]).toEqual(excursion1);
      expect(excursionsJson[1]).toEqual(excursion2);
      expect(excursionsJson[2]).toEqual(excursion3);
    });
  });
});
// END CODE =======================================================================================  END COMPONENT

/**
 * End of file src/app/services/synchroDescendante/synchroDesc.test.ts
 */
