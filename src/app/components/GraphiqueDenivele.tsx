import * as React from "react"
import { StyleProp, View, ViewStyle,Dimensions } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"
import { LineChart } from 'react-native-chart-kit'

export interface GraphiqueDeniveleProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  /**
   * Données passées au graphique
   */
  data
}

/**
 * Describe your component here
 */
export const GraphiqueDenivele = observer(function GraphiqueDenivele(props: GraphiqueDeniveleProps) {

    //Lageur de l'écran
    const { width } = Dimensions.get("window");

    //Données du graphique
    const data = props.data;

    //Récupération des altitudes
    const coordonnees = data.features[0].geometry.coordinates[0];
    //On ne garde que les altitudes tous les 50 points
    const listeALtitude = coordonnees
      .map((item, index) => (index % 50 === 0 ? item[2] : null))
      .filter((altitude) =>altitude !== null);

    //Données du graphique avec labels et les données
    const line = {
      labels: ["0", "200", "400", "600", "800", "1000"],
      datasets: [
        {
          data: listeALtitude,
        },
      ],
    };

    return (
      <View>
        <LineChart
          data={line}
          width={width - spacing.xl * 2}
          height={200}
          withInnerLines={false}
          withOuterLines={false}
          withShadow={false}
          chartConfig={{
            backgroundColor: colors.fond,
            backgroundGradientFrom: colors.fond,
            backgroundGradientTo: colors.fond,
            color: () => colors.boutonAttenue,
            labelColor: () => colors.bouton,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "0",
              strokeWidth: "0",
              stroke: colors.bouton
            }
          }}
          bezier
        />
      </View>
    );
  }
);
