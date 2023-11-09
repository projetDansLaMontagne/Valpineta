import { observer } from "mobx-react-lite";
import React, { FC, useEffect, useState } from "react";
import { View, ViewStyle, Text } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { colors } from "../theme";
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle";
import data from "./../../assets/JSON/exemple.json"

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen() {

  const coordonnees = data.features[0].geometry.coordinates[0];
  const listeALtitude = coordonnees.map((item) => item[2]);

  return (
    <View style={[$container, useSafeAreaInsetsStyle()]}>
      <Text>
        {listeALtitude[0]}
      </Text>
    </View>
  );
});

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background,
};
