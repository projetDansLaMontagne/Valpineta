/**
 * @oiercesat Cesat Oier
 * @version 1.0
 * @date 2021-02-28
 * @module app/models/Parametres
 * @todo Vérifier que le i18n est bien changé, il faut faire des mocks de i18n.currentLocale dans ./src/test/setup.ts
 */

import { expect, test, describe, beforeEach } from "@jest/globals";
import { ParametresModel } from "./Parametres";

describe("[Parametres] fonctions interne", () => {
  let parametres: ReturnType<typeof ParametresModel.create>;

  beforeEach(() => {
    parametres = ParametresModel.create({});
  });

  describe("[Parametres] fonctions de manipulation des parametres", () => {
    test("Doit changer la langue", () => {
      parametres.setLangue("es");
      expect(parametres.langue).toBe("es");
    });
    test("Doit changer la langue", () => {
      parametres.setLangue("fr");
      expect(parametres.langue).toBe("fr");
    });
  });
});
