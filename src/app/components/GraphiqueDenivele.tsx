import { useEffect, useState } from "react"
import { StyleProp, View, ViewStyle, Dimensions } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"
import { LineChart } from "react-native-chart-kit"
// import { LineChart } from 'react-native-charts-wrapper'
// import { LineChart } from "react-native-gifted-charts"
import { Text } from "app/components"

type T_Point = {
  lat: number
  lon: number
  alt: number
  dist: number
}

export interface GraphiqueDeniveleProps {
  style?: StyleProp<ViewStyle>

  // Liste de points formant l excursion
  points: T_Point[]

  // Precision de l altitude (nombre de points du graphique)
  precision: number
}

export const GraphiqueDenivele = observer(function GraphiqueDenivele(
  props: GraphiqueDeniveleProps,
) {
  /* -------------------------------- Variables ------------------------------- */
  const { width } = Dimensions.get("window")
  var donnesGraphique: any | null = null

  /* -------------------------------- Fonctions ------------------------------- */
  /**
   * Formate les points de l excursion pour qu ils soient utilisables par le graphique
   * @param points Les points de l excursion
   * @param nbFragments Le nombre de points souhaités sur le diagrame (doit etre inferieur au nombre de points de l excursion)
   * @returns
   */
  const trackReduit = (points: T_Point[], nbFragments: number): T_Point[] => {
    /* ---------------------- Verifications des parametres ---------------------- */
    if (!points) {
      throw new Error("Aucune excursion n'a été fournie")
    }
    if (!nbFragments) {
      throw new Error("Aucune precision n'a été fournie")
    }
    if (nbFragments > points.length) {
      throw new Error(
        "Le nombre de points demandés doit être superieur au nombre de points du fichier GPX",
      )
    }
    if (nbFragments < 2) {
      throw new Error("Le nombre de points demandés doit être au minimum de 2")
    }

    /* -------------------------- Selection des points -------------------------- */
    // (c est cette etape qui va assurer une distance plus ou moins egale entre les points)
    var pointsFormates = []
    const distanceTotale = points[points.length - 1].dist // Distance du dernier point
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
        const distancePoint = points[indexPoint].dist
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
            pointLePlusProche = points[indexPoint - 1]
          } else {
            // Le point est plus proche que le precedent
            pointLePlusProche = points[indexPoint]
          }

          // Sauvegarde du point le plus proche
          pointsFormates.push(pointLePlusProche)

          // On passe a la prochaine distance ideale
          distanceIdeale += incrementFragments
          ecartPointPrecedent = Infinity
        }
      }
    }

    return pointsFormates
  }
  /**
   * Calcul les donnees pour le graphique
   * Fonction asynchrone pour ne pas bloquer l affichage
   */
  const traitementDonneesGraphiques = async () => {
    const points = trackReduit(props.points, props.precision)

    // Calcul des absisses
    var abscisses = []
    for (let quart = 0; quart < 4; quart++) {
      // Pour les 4 abscisses (les 4 premiers quarts)
      const index = Math.round((points.length * quart) / 4)
      const abscisse = Math.round(points[index].dist / 100) / 10 //Arrondies au 10e de km
      abscisses.push("" + abscisse + " km")
    }

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
  if (props.points && props.precision) {
    // Parametres bien définis
    traitementDonneesGraphiques()
  } else {
    throw new Error("GraphiqueDenivele : Mauvais parametres")
  }

  return (
    donnesGraphique && (
      <LineChart
        data={donnesGraphique}
        width={width - spacing.xl * 2}
        height={300}
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
