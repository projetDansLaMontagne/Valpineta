import React, { FC, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ViewStyle, TextStyle, Dimensions, View, TouchableOpacity } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Screen, Text } from "app/components";
import { colors, spacing } from "app/theme";
import Icon from "react-native-vector-icons/FontAwesome";
import { useStores } from "app/models";
import I18n from "i18n-js";
import { useNavigation } from "@react-navigation/native";

interface ParametresScreenProps extends AppStackScreenProps<"Parametres"> {}
const { width } = Dimensions.get("window");

export const ParametresScreen: FC<ParametresScreenProps> = observer(function ParametresScreen() {
  const { parametres } = useStores();

  useEffect(() => {
    parametres.setProp("langues", I18n.locale);
  }, []);

  const navigation = useNavigation();

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]}>
      <View style={$souligne}>
        <Text style={$titre} tx={"parametres.titre"} size="xl" />
      </View>
      <View style={$containerUnParametre}>
        <View style={$containerIconTexte}>
          <Icon name="language" size={30} color={colors.text} />
          <Text style={$texteParametre} tx={"parametres.changerLangue.titre"} size="sm" />
        </View>
        <TouchableOpacity
          style={$containerBoutons}
          onPress={() => {
            const nouvelleLangue = parametres.langues === "fr" ? "es" : "fr";
            parametres.setProp("langues", nouvelleLangue);
            I18n.locale = nouvelleLangue;
          }}
        >
          <View
            style={[$souligneBouton, parametres.langues === "fr" ? { left: 0 } : { left: "50%" }]}
          ></View>
          <Text style={$texteBouton} tx={"parametres.changerLangue.francais"} size="sm" />
          <Text style={$texteBouton} tx={"parametres.changerLangue.espagnol"} size="sm" />
        </TouchableOpacity>
      </View>
      <View style={$containerBoutonLoadingScreen}>
        <Text style={$texteParametre} tx={"loadingScreen.syncText"} size="sm" />
        <TouchableOpacity
          style={$containerBoutons}
          onPress={() => {
            parametres.setProp("initialized", false);
          }}
        >
          <Text style={$buttonStyle} tx={"loadingScreen.syncBtn"} size="sm" />
        </TouchableOpacity>
      </View>
    </Screen>
  );
});

const $titre: TextStyle = {
  marginTop: spacing.lg,
  marginBottom: spacing.xs,
  width,
  textAlign: "center",
  color: colors.text,
};

const $souligne: ViewStyle = {
  borderBottomColor: colors.text,
  borderBottomWidth: 1,
  width,
};

const $containerUnParametre: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  padding: spacing.xs,
  paddingTop: spacing.lg,
  width,
};

const $containerIconTexte: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
};

const $containerBoutons: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: spacing.sm,
};

const $containerBoutonLoadingScreen: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginHorizontal: spacing.sm,
};

const $texteParametre: TextStyle = {
  flex: 1,
  marginHorizontal: spacing.sm,
};

const $souligneBouton: ViewStyle = {
  backgroundColor: colors.bouton,
  height: 2,
  width: "50%",
  bottom: 0,
  position: "absolute",
};

const $texteBouton: TextStyle = {
  color: colors.text,
  paddingRight: spacing.xs,
  paddingLeft: spacing.xs,
};

const $buttonStyle: ViewStyle = {
  borderColor: colors.bordure,
  borderWidth: 1,
  padding: spacing.sm,
  borderRadius: 5,
};
