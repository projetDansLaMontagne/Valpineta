import React, { FC, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { ViewStyle, TextStyle, Dimensions, View, TouchableOpacity, TouchableHighlight } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Screen, Text, Button } from "app/components";
import { colors, spacing } from "app/theme";
import Icon from "react-native-vector-icons/FontAwesome";
import { useStores } from "app/models";
import I18n, { t } from "i18n-js";
import { navigate } from "app/navigators";
import Dropdown from 'react-native-input-select';
import { te } from "date-fns/locale";

interface ParametresScreenProps extends AppStackScreenProps<"Parametres"> { }
const { width, height } = Dimensions.get("window");

export const ParametresScreen: FC<ParametresScreenProps> = observer(function ParametresScreen() {
  const { parametres } = useStores();

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]}>
      <View style={$souligne}>
        <Text style={$titre} tx={"parametres.titre"} size="xl" />
      </View>
      <View style={$containerUnParametre}>
        <View style={$containerIconTexte}>
          <Icon name="language" size={30} color={colors.palette.marron} />
          <Text style={$texteParametre} tx={"parametres.changerLangue.titre"} size="sm" />
        </View>
        <View style={$containerBoutons}>
          <View
            style={[$souligneBouton, parametres.langues === "fr" ? { left: 0 } : { left: "50%" }]}
          ></View>
          <TouchableOpacity
            onPress={() => {
              I18n.locale = "fr";
              parametres.setLangues("fr");
            }}
          >
            <Text style={$texteBouton} tx={"parametres.changerLangue.francais"} size="sm" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              I18n.locale = "es";
              parametres.setLangues("es");
            }}
          >
            <Text style={$texteBouton} tx={"parametres.changerLangue.espagnol"} size="sm" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={$containerUnParametre}>
        <View style={$containerIconTexte}>
          <Icon name="cloud" size={30} color={colors.palette.marron} />
          <Text style={$texteParametre} tx={"parametres.choisirSynchro.titre"} size="sm" />
        </View>
        <Dropdown
          placeholder={parametres.langues === "fr" ? "Choisir" : "Elegir"}
          options={[
            { label: '1h', value: 1 },
            { label: '12h', value: 12 },
            { label: '24h', value: 24 },
          ]}
          selectedValue={parametres.tempsSynchro}
          onValueChange={(value) => parametres.setTempsSynchro(value)}
          primaryColor={colors.palette.vert}
          dropdownStyle={$pickerSynchro}
          dropdownContainerStyle={$dropdownContainerStyle}
        />
      </View>
      <Button text="Navigation vers nouveau signalement" onPress={() => {
        navigate("Stack", {
          screen: "NouveauSignalement",
          params: { type: "Avertissement" },
        });
      }
      } />
    </Screen>
  );
});

const $titre: TextStyle = {
  marginTop: spacing.lg,
  marginBottom: spacing.xs,
  width: width,
  textAlign: "center",
  color: colors.text,
};

const $souligne: ViewStyle = {
  borderBottomColor: colors.text,
  borderBottomWidth: 1,
  width: width,
};

const $containerUnParametre: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  padding: spacing.xs,
  paddingTop: spacing.lg,
};

const $containerIconTexte: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
};

const $containerBoutons: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: spacing.sm,
};

const $texteParametre: TextStyle = {
  marginHorizontal: spacing.sm,
  maxWidth: 150,
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

const $pickerSynchro: ViewStyle = {
  marginTop:20,
  backgroundColor: colors.fond,
  width: width / 3,
  borderColor: colors.palette.vert,
  borderWidth: 1,
  borderRadius: 5,
  minHeight: 30,
};

const $dropdownContainerStyle: ViewStyle = {
  width: width / 3,
};
