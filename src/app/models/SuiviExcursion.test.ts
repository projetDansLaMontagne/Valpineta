import { TPoint, T_flat_point } from "app/navigators";
import { SuiviExcursionModel } from "./SuiviExcursion";

test("Tache de suivi fonctionnelle", () => {
  // Les indexes sont en +1 pour commencer à 1
  // VOIR la representation visuelle de ces tracks dans app/assets/
  const parcoursReel1: (T_flat_point & { indexPointLie: number })[] = [
    { lat: 43.483256055093, lon: -1.4988597703803124, indexPointLie: 1 },
    { lat: 43.48180177321184, lon: -1.4979515760793674, indexPointLie: 4 }, // Relocalisation ici
    { lat: 43.481199599371834, lon: -1.4990633311719033, indexPointLie: 4 },
    { lat: 43.48122232302196, lon: -1.4994861112775155, indexPointLie: 4 },
    { lat: 43.483040187338794, lon: -1.5006291834149112, indexPointLie: 5 },
    { lat: 43.483710511001604, lon: -1.5004256226233206, indexPointLie: 5 },
    { lat: 43.48388093108598, lon: -1.499767964681257, indexPointLie: 6 },
  ];
  const parcoursReel2: (T_flat_point & { indexPointLie: number })[] = [
    { lat: 43.4833646146295, lon: -1.498469412696537, indexPointLie: 1 },
    { lat: 43.48370453989046, lon: -1.4971439212037823, indexPointLie: 2 },
    { lat: 43.48324854215113, lon: -1.4958298563618269, indexPointLie: 2 },
    { lat: 43.482170715630325, lon: -1.4971324945529823, indexPointLie: 3 },
    { lat: 43.48288374148146, lon: -1.5005033565388677, indexPointLie: 5 },
    { lat: 43.48351385034545, lon: -1.5019659678412176, indexPointLie: 6 },
  ];

  const parcoursSuivi: Omit<TPoint, "pos">[] = [
    { lat: 43.483327, lon: -1.498525, alt: 20.5, dist: 0 },
    { lat: 43.483921, lon: -1.496157, alt: 22, dist: 202.1 },
    { lat: 43.482981, lon: -1.495834, alt: 20.3, dist: 309.9 },
    { lat: 43.481022, lon: -1.499376, alt: 23, dist: 669.2 },
    { lat: 43.483633, lon: -1.50091, alt: 8.8, dist: 984.8 },
    { lat: 43.48405, lon: -1.499369, alt: 15.8, dist: 1117.5 },
    { lat: 43.483469, lon: -1.501866, alt: 6.8, dist: 1329.1 },
    { lat: 43.483688, lon: -1.502547, alt: 5.5, dist: 1389.2 },
    { lat: 43.483432, lon: -1.502738, alt: 5.3, dist: 1421.5 },
    { lat: 43.483184, lon: -1.502409, alt: 5.5, dist: 1459.8 },
    { lat: 43.483025, lon: -1.502783, alt: 5.8, dist: 1494.8 },
  ];
  const instance = SuiviExcursionModel.create({
    excursionSuivie: { index: 0, track: parcoursSuivi },
  });

  expect(instance).toBeTruthy();
});
