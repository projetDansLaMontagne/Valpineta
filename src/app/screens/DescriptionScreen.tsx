// Librairies
import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import {
  ViewStyle,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Dimensions,
  ScrollView,
  TextStyle,
  View,
} from "react-native";
import HTML from "react-native-render-html";
// import { AppStackScreenProps } from "app/navigators"

// Composants
import { Screen } from "app/components";
import { spacing, colors } from "app/theme";
import { Text } from "app/components";
// import { goBack } from "app/navigators"

const { width, height } = Dimensions.get("window");

interface DescriptionScreenProps extends AppStackScreenProps<"Description"> {
  excursion: Record<string, unknown>;
}

export const DescriptionScreen: FC<DescriptionScreenProps> = observer(function DescriptionScreen(
  props: DescriptionScreenProps,
) {
  const { route, navigation } = props;

  // Vérifier si "excursion" est défini
  if (props?.route?.params?.excursion === undefined) {
    return (
      <Screen style={$container} preset="fixed">
        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
        <ScrollView style={$containerDescription}>
          <Text tx="detailsExcursion.erreur.titre" size="xxl" />
          <Text tx="detailsExcursion.erreur.message" style={$texteDescription} size="sm" />
        </ScrollView>
      </Screen>
    );
  } else {
    const { excursion } = route.params;
    var nomExcursion = "";
    var description = "";

    if (excursion) {
      nomExcursion = excursion.nom;
      description = excursion.description;
    }

    return (
      <Screen style={$container} preset="fixed">
        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
        <ScrollView style={$scrollDescription}>
          <View style={$containerDescription}>
            <Text size="xxl">{nomExcursion}</Text>
            <HTML source={{ html: description }} />
          </View>
        </ScrollView>
      </Screen>
    );
  }
});

const $boutonRetour: ViewStyle = {
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.sm,
  margin: spacing.lg,
  width: 50,
  position: "relative",
  top: 15,
};

const $container: ViewStyle = {
  flex: 1,
  width: width,
  height: height,
  backgroundColor: colors.fond,
  position: "absolute",
};

const $scrollDescription: ViewStyle = {
  width: width,
  padding: spacing.lg,
};

const $containerDescription: ViewStyle = {
  marginBottom: 500,
};

const $texteDescription: TextStyle = {
  marginTop: spacing.lg,
  textAlign: "justify",
};
