import { StyleProp, View, ViewStyle, Dimensions } from "react-native";
import { observer } from "mobx-react-lite";
import { colors, spacing } from "app/theme";
import { LineChart } from "react-native-chart-kit";
import { T_point } from "app/navigators";

type T_point_graphique = Pick<T_point, "alt" | "dist">;
export interface GraphiqueDeniveleProps {
  detaille: boolean;
  points: T_point_graphique[];
}

export const GraphiqueDenivele = observer(function GraphiqueDenivele(
  props: GraphiqueDeniveleProps,
) {
  /* -------------------------------- VARIABLES ------------------------------- */
  const { points: allPoints, detaille } = props;
  const { width } = Dimensions.get("window");
  const PRECISION = 40; // Precision de l altitude (nombre de points du graphique)

  /* ---------------------- PROTECTION MAUVAIS PARAMETRES --------------------- */
  if (!allPoints || detaille === undefined) {
    throw new Error("[GraphiqueDenivele] Mauvais parametres");
  }

  for (const point of allPoints) {
    if (point.alt === undefined) {
      console.error("[GraphiqueDenivele] Tous les points doivent avoir une altitude");
      return <></>;
    }
  }

  /* --------------------------- DONNEES GRAPHIQUES --------------------------- */
  const points = trackReduit(allPoints, PRECISION);
  const abscises = getAbscises(points);
  const donneesGraphique = {
    labels: abscises,
    datasets: [
      {
        data: points.map(point => point.alt),
        strokeWidth: detaille ? 3 : 2,
      },
    ],
  };

  /* -------------------------------- FONCTIONS ------------------------------- */
  /**
   * Reduit le nombre de points du track a la valeur souhaitee
   * @param track Le track (points du track)
   * @param nbFragments Le nombre de points souhaités sur le diagrame
   */
  function trackReduit(track: T_point_graphique[], nbFragments: number) {
    /* ---------------------- Verifications des parametres ---------------------- */
    if (nbFragments > track.length) {
      // Si on demande trop de fragments par rapport au nombre de points du track
      // On retourne le track initial sans le reduire
      return track;
    }

    /* -------------------------- Selection des points -------------------------- */
    // (c est cette etape qui va assurer une distance equivalente entre les points)
    let pointsSelectionnes: T_point_graphique[] = [];
    const distanceTotale = track[track.length - 1].dist; // Distance du dernier point
    const incrementFragments = distanceTotale / (nbFragments - 1); // Increment (en m) entre chaque fragments

    // Variables de la boucle
    let distanceIdeale = 0;
    let indexPoint = 0;
    let ecartPointPrecedent = Infinity;

    // Pour chaque fragment, on recherche le point le plus proche de sa distance ideale
    // Le but est d encadrer la distance ideale entre deux points et de prendre le plus proche
    while (true) {
      if (distanceIdeale > distanceTotale) {
        // Dernier point atteint
        break;
      } else {
        const distancePoint = track[indexPoint].dist;
        if (distancePoint < distanceIdeale) {
          // Le point est avant la distance ideale
          // On passe au points suivant
          ecartPointPrecedent = distanceIdeale - distancePoint;
          indexPoint += 1;
        } else {
          // Le point est apres la distance ideale
          const prevNearest = ecartPointPrecedent < distancePoint - distanceIdeale;
          const nearestPoint = prevNearest ? track[indexPoint - 1] : track[indexPoint];

          // Sauvegarde du point le plus proche
          pointsSelectionnes.push(nearestPoint);

          // On passe a la prochaine distance ideale
          distanceIdeale += incrementFragments;
          ecartPointPrecedent = Infinity;
        }
      }
    }

    return pointsSelectionnes;
  }

  /**
   * Pour recupérer les 4 abscisses du graphique
   */
  function getAbscises(points: T_point_graphique[]) {
    let abscisses: string[] = [];
    for (let quart = 0; quart < 4; quart++) {
      // Pour les 4 abscisses (les 4 premiers quarts)
      const index = Math.round((points.length * quart) / 4);
      const abscisse = Math.round(points[index].dist / 100) / 10; //Arrondies au 10e de km
      abscisses.push("" + abscisse + " km");
    }

    return abscisses;
  }

  return (
    <LineChart
      data={donneesGraphique}
      width={width - spacing.xl * 2}
      height={detaille ? 200 : 100}
      formatYLabel={valeur => Math.round(+valeur / 50) * 50 + " m"}
      withVerticalLabels={detaille}
      withHorizontalLabels={true}
      withInnerLines={false}
      withOuterLines={false}
      chartConfig={{
        backgroundColor: colors.fond,
        backgroundGradientFrom: colors.fond,
        backgroundGradientTo: colors.fond,
        color: () => colors.boutonAttenue,
        labelColor: () => colors.bouton,
        propsForDots: {
          r: "0",
          strokeWidth: "0",
          stroke: colors.bouton,
        },
      }}
    />
  );
});
