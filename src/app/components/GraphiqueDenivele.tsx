import { StyleProp, View, ViewStyle, Dimensions } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"
import { LineChart } from "react-native-chart-kit"

type T_Point = {
  lat: number
  lon: number
  alt: number
  dist: number
}

export interface GraphiqueDeniveleProps {
  style?: StyleProp<ViewStyle>

  points: T_Point[]
}

export const GraphiqueDenivele = observer(function GraphiqueDenivele(
  props: GraphiqueDeniveleProps,
) {
  /* -------------------------------- Constantes ------------------------------- */
  const { width } = Dimensions.get("window")
  const precision = 40 // Precision de l altitude (nombre de points du graphique)

  /* -------------------------------- Fonctions ------------------------------- */
  /**
   * Formate les points de l excursion pour qu ils soient utilisables par le graphique
   * @param track Le track (points du track)
   * @param nbFragments Le nombre de points souhaités sur le diagrame (doit etre inferieur au nombre de points de l excursion)
   * @returns Les points formates
   */
  const trackReduit = (track: T_Point[], nbFragments: number): T_Point[] => {
    /* ---------------------- Verifications des parametres ---------------------- */
    if (!track) {
      throw new Error("Aucune excursion n'a été fournie")
    }
    if (!nbFragments) {
      throw new Error("Aucune precision n'a été fournie")
    }
    if (nbFragments > track.length) {
      throw new Error(
        "Le nombre de points demandés doit être superieur au nombre de points du fichier GPX",
      )
    }
    if (nbFragments < 2) {
      throw new Error("Le nombre de points demandés doit être au minimum de 2")
    }

    /* -------------------------- Selection des points -------------------------- */
    // (c est cette etape qui va assurer une distance equivalente entre les points)
    var pointsSelectionnes = []
    const distanceTotale = track[track.length - 1].dist // Distance du dernier point
    const incrementFragments = distanceTotale / (nbFragments - 1) // Increment (en m) entre chaque fragments

    // Variables de la boucle
    var distanceIdeale = 0
    var indexPoint = 0
    var ecartPointPrecedent = Infinity

    // Pour chaque fragment, on recherche le point le plus proche de sa distance ideale
    // Le but est d encadrer la distance ideale entre deux points et de prendre le plus proche
    while (true) {
      // console.log("Point n°" + indexPoint + " à " + points[indexPoint].dist + "m")
      // console.log("Distance ideale : " + distanceIdeale + "m")

      if (distanceIdeale > distanceTotale) {
        // Dernier point atteint
        break
      } else {
        const distancePoint = track[indexPoint].dist
        if (distancePoint < distanceIdeale) {
          // Le point est avant la distance ideale
          // On passe au points suivant
          ecartPointPrecedent = distanceIdeale - distancePoint
          indexPoint += 1
        } else {
          // Le point est (à / apres) la distance ideale
          var pointLePlusProche
          if (ecartPointPrecedent < distancePoint - distanceIdeale) {
            // Le point precedent est plus proche
            pointLePlusProche = track[indexPoint - 1]
          } else {
            // Le point est plus proche que le precedent
            pointLePlusProche = track[indexPoint]
          }

          // Sauvegarde du point le plus proche
          pointsSelectionnes.push(pointLePlusProche)

          // On passe a la prochaine distance ideale
          distanceIdeale += incrementFragments
          ecartPointPrecedent = Infinity
        }
      }
    }

    return pointsSelectionnes
  }
  /**
   * Calcul les donnees pour le graphique (les met dans donneesGraphique)
   * Fonction asynchrone pour ne pas bloquer l affichage
   */
  const traitementDonneesGraphiques = async (points: T_Point[]) => {
    // Reduction du nombre de points
    points = trackReduit(points, precision)

    // Calcul des absisses
    var abscisses = []
    for (let quart = 0; quart < 4; quart++) {
      // Pour les 4 abscisses (les 4 premiers quarts)
      const index = Math.round((points.length * quart) / 4)
      const abscisse = Math.round(points[index].dist / 100) / 10 //Arrondies au 10e de km
      abscisses.push("" + abscisse + " km")
    }

    // Creation des donnees pour le graphique
    donnesGraphique = {
      labels: abscisses,
      datasets: [
        {
          data: points.map((point) => point.alt),
          strokeWidth: 3,
        },
      ],
    }
  }

  /* ------------------------- Verification parametres ------------------------ */
  var donnesGraphique: any | null = null
  if (props.points) {
    // Parametres bien définis
    traitementDonneesGraphiques(props.points)
  } else {
    throw new Error("GraphiqueDenivele : Mauvais parametres")
  }

  return (
    donnesGraphique && (
      <LineChart
        data={donnesGraphique}
        width={width - spacing.xl * 2}
        height={200}
        withVerticalLabels={true}
        withInnerLines={false}
        withOuterLines={false}
        chartConfig={{
          backgroundColor: colors.fond,
          backgroundGradientFrom: colors.fond,
          backgroundGradientTo: colors.fond,
          color: () => colors.boutonAttenue,
          labelColor: () => colors.bouton,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "0",
            strokeWidth: "0",
            stroke: colors.bouton,
          },
        }}
      />
    )
  )
})
