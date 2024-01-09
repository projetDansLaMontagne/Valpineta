import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { ViewStyle, ScrollView } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Screen, Text } from "app/components";
import { spacing } from "app/theme";
import DonnesApi from "app/components/DonnesApi";

interface AccueilScreenProps extends AppStackScreenProps<"Accueil"> {
  navigation: any;
}

export const AccueilScreen: FC<AccueilScreenProps> = observer(function AccueilScreen(
  props: AccueilScreenProps,
) {
  const { navigation } = props;

  return (
    <Screen style={$root}>
      <DonnesApi />
    </Screen>
  );
});

const $root: ViewStyle = {
  flex: 1,
  padding: spacing.sm,
};
