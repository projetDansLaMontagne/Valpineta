import { observer } from "mobx-react-lite";
import React, { FC, useEffect, useState } from "react";
import { View, ViewStyle, Text } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { colors } from "../theme";
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle";
import data from "./../../assets/JSON/exemple.json"
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from 'react-native-chart-kit'
import { Dimensions } from "react-native";

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> { }

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen() {

  const coordonnees = data.features[0].geometry.coordinates[0];
  const listeALtitude = coordonnees.map((item) => item[2]);

  const altitudeMax = Math.max(...listeALtitude);
  const altitudeMin = Math.min(...listeALtitude);

  const line = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        strokeWidth: 2, // optional
      },
    ],
  };

  return (
    <View>
      <Text>
        Bezier Line Chart
      </Text>
      <LineChart
        data={line}
        width={Dimensions.get('window').width} // from react-native
        height={220}
        yAxisLabel={'$'}
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
});

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background,
};
