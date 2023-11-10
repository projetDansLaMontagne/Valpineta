import { observer } from "mobx-react-lite";
import React, { FC, useEffect, useState } from "react";
import { View, ViewStyle, Text } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { colors } from "../theme";
import {
  LineChart,
} from 'react-native-chart-kit'
import { Dimensions } from "react-native";

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> { }

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen() {

  const data = JSON.parse(JSON.stringify(require("./../../assets/JSON/exemple.json")));

  const coordonnees = data.features[0].geometry.coordinates[0];
  const listeALtitude = coordonnees
  .map((item, index) => (index % 50 === 0 ? item[2] : null))
  .filter((altitude) => altitude !== 0);

  const line = {
    datasets: [
      {
        data: listeALtitude,
      },
    ],
  };

  return (
    <View style={$container}>
      <LineChart
        data={line}
        width={Dimensions.get('window').width} // from react-native
        height={200}
        withInnerLines={false}
        withOuterLines={false}
        yAxisSuffix="m"
        withShadow={false}
        chartConfig={{
          backgroundColor: "#ffffff",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#ffffff"
          }
        }}
        bezier
      />
      {/* <Text>
        {listeALtitude}
      </Text> */}

    </View>
  );
});

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.fond,
};
