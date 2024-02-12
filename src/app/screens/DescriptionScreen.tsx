// Librairies
import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import {
  ViewStyle,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  TextStyle,
  useWindowDimensions,
  View,
} from "react-native";
import { AppStackScreenProps } from "app/navigators";
import HTML from "react-native-render-html";

// Composants
import { Screen, Text } from "app/components";
import { spacing, colors } from "app/theme";

const { width, height } = Dimensions.get("window");

interface DescriptionScreenProps extends AppStackScreenProps<"Description"> {}

export const DescriptionScreen: FC<DescriptionScreenProps> = observer(function DescriptionScreen(
  props: DescriptionScreenProps,
) {
  const { route, navigation } = props;
  const { width: windowWidth } = useWindowDimensions();
  const excursion = route.params?.excursion;

  return (
    <Screen style={$container} preset="fixed">
      <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
        <Image
          style={{ tintColor: colors.bouton }}
          source={require("../../assets/icons/back.png")}
        />
      </TouchableOpacity>
      {excursion ? (
        <ScrollView style={$containerDescription}>
          <Text tx="detailsExcursion.erreur.titre" size="xxl" />
          <Text tx="detailsExcursion.erreur.message" style={$texteDescription} size="sm" />
        </ScrollView>
      ) : (
        <ScrollView style={$scrollDescription}>
          <View style={$containerDescription}>
            <Text size="xxl">{excursion.nom}</Text>
            <HTML source={{ html: excursion.description ?? "" }} contentWidth={windowWidth} />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
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
