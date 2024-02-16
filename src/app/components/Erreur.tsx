import React from "react";
import { View, Image, Dimensions, TextStyle, TouchableOpacity, ViewStyle } from "react-native";
import { Screen, Text } from "app/components";
import { colors, spacing } from "app/theme";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export interface ErreurProps {
  navigation: NativeStackNavigationProp<any>
}

/**
 * Describe your component here
 */
export const Erreur = observer(function Erreur(props: ErreurProps) {
  return (
    <View>
      <TouchableOpacity style={$boutonRetour} onPress={() => props.navigation.goBack()}>
        <Image style={{ tintColor: colors.bouton }} source={require("assets/icons/back.png")} />
      </TouchableOpacity>
      <View style={$containerErreur}>
        <Text tx="detailsExcursion.erreur.titre" size="xxl" />
        <Text style={$texteErreur} size="sm" tx="detailsExcursion.erreur.message" />
      </View>
    </View>
  );
});

const { width, height } = Dimensions.get("window");

const $containerErreur: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  width: width,
  height: height,
  padding: spacing.lg,
};

const $texteErreur: TextStyle = {
  marginTop: spacing.lg,
  marginBottom: height / 2,
};

/**@warning a factoriser */
const $boutonRetour: ViewStyle = {
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.sm,
  margin: spacing.lg,
  width: 50,
  position: "absolute",
  top: 15,
  zIndex: 1,
};
