import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle,Dimensions } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"
import { LineChart } from 'react-native-chart-kit'
import { useEffect, useState } from "react"

export interface GraphiqueDeniveleProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const GraphiqueDenivele = observer(function GraphiqueDenivele(props: GraphiqueDeniveleProps) {
    const { width, height } = Dimensions.get("window");

    const data = JSON.parse(JSON.stringify(require("./../../assets/JSON/exemple.json")));

    const coordonnees = data.features[0].geometry.coordinates[0];
    const listeALtitude = coordonnees
      .map((item, index) => (index % 50 === 0 ? item[2] : null))
      .filter((altitude) =>altitude !== null);
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
              r: "4",
              strokeWidth: "2",
              stroke: colors.bouton
            }
          }}
          bezier
        />
      </View>
    );
  }
);
