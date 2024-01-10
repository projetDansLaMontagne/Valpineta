import * as React from "react";
import { StyleProp, TextStyle, View, ViewStyle, Image, ImageStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { colors, spacing, typography } from "app/theme";
import { Text } from "app/components/Text";

export interface CarteAvisProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Nombre d'étoile de l'avis
   */
  nombreEtoiles: number;

  /**
   * Avis textuel
   */
  texteAvis: string;
}

/**
 * Describe your component here
 */
export const CarteAvis = observer(function CarteAvis(props: CarteAvisProps) {
  const { style } = props;
  const $styles = [$container, style];
  const { nombreEtoiles, texteAvis } = props;

  var etoilesVides = 5 - nombreEtoiles;

  return (
    <View style={$styles}>
      <View style={$containerEtoiles}>
        {Array(nombreEtoiles)
          .fill(0)
          .map((item, index) => (
            <Image
              style={$icon}
              key={index}
              source={require("../../assets/icons/etoile_pleine.png")}
            />
          ))}
        {Array(etoilesVides)
          .fill(0)
          .map((item, index) => (
            <Image
              style={$icon}
              key={index}
              source={require("../../assets/icons/etoile_vide.png")}
            />
          ))}
      </View>
      <Text style={$text}>{texteAvis}</Text>
    </View>
  );
});

const $container: ViewStyle = {
  justifyContent: "center",
  borderColor: colors.bordure,
  borderWidth: 1,
  borderRadius: spacing.xs,
  marginTop: spacing.xs,
  marginBottom: spacing.xs,
  marginLeft: spacing.lg,
  marginRight: spacing.lg,
  padding: spacing.lg,
};

const $text: TextStyle = {
  fontFamily: typography.primary.normal,
  color: colors.text,
  fontSize: 14,
};

const $containerEtoiles: ViewStyle = {
  flexDirection: "row",
  marginBottom: spacing.xs,
};

const $icon: ImageStyle = {
  width: 20,
  height: 20,
  tintColor: colors.bouton,
};
