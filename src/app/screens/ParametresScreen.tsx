import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { ViewStyle, TextStyle, Dimensions, View, TouchableOpacity } from "react-native";
import { AppStackScreenProps, TPoint } from "app/navigators";
import { Screen, Text, Button } from "app/components";
import { colors, spacing } from "app/theme";
import Icon from "react-native-vector-icons/FontAwesome";
import { IntervalleSynchro, useStores } from "app/models";
import Dropdown from "react-native-input-select";
import { translate } from "app/i18n";

interface ParametresScreenProps extends AppStackScreenProps<"Parametres"> {}
const { width } = Dimensions.get("window");

export const ParametresScreen: FC<ParametresScreenProps> = observer(function ParametresScreen() {
  const { parametres, synchroMontante, suiviExcursion } = useStores();

  // En debug, on met un track personnalise pour pouvoir faire des tests haut niveau
  //const trackSuivi: TPoint[] = undefined; // = require("assets/tests_examples/track_test_manuel_devant_chez_nico.json");
  const trackSuivi: TPoint[] = require("assets/JSON/exemple_cruz_del_guardia.json");

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
        <TouchableOpacity
          style={$containerBoutons}
          onPress={() => {
            const nouvelleLangue = parametres.langue === "fr" ? "es" : "fr";
            parametres.setLangue(nouvelleLangue);
          }}
        >
          <View
            style={[$souligneBouton, parametres.langue === "fr" ? { left: 0 } : { left: "50%" }]}
          ></View>
          <Text style={$texteBouton} tx={"parametres.changerLangue.francais"} size="sm" />
          <Text style={$texteBouton} tx={"parametres.changerLangue.espagnol"} size="sm" />
        </TouchableOpacity>
      </View>
      <View style={$containerUnParametre}>
        <View style={$containerIconTexte}>
          <Icon name="cloud" size={30} color={colors.palette.marron} />
          <Text style={$texteParametre} tx={"parametres.choisirSynchro.titre"} size="sm" />
        </View>
        <Dropdown
          options={[
            { label: "1 mins", value: IntervalleSynchro.TresFrequente },
            { label: "5 mins", value: IntervalleSynchro.Moderee },
            { label: "10 mins", value: IntervalleSynchro.PeuFrequente },
          ]}
          selectedValue={synchroMontante.intervalleSynchro}
          onValueChange={(value: IntervalleSynchro) => synchroMontante.setIntervalleSynchro(value)}
          primaryColor={colors.palette.vert}
          dropdownStyle={$pickerSynchro}
          dropdownContainerStyle={$dropdownContainerStyle}
        />
      </View>
      <Text>{suiviExcursion.etat}</Text>

      {suiviExcursion.etat === "enCours" && (
        <>
          <Button
            text="Mettre en pause"
            onPress={() => suiviExcursion.setEtat({ newEtat: "enPause" })}
          />
          <Button text="Stopper" onPress={() => suiviExcursion.setEtat({ newEtat: "terminee" })} />
          <Text>Point courant : {suiviExcursion.iPointCourant}</Text>
        </>
      )}
      {suiviExcursion.etat === "enPause" && (
        <>
          <Button text="Reprendre" onPress={() => suiviExcursion.setEtat({ newEtat: "enCours" })} />
          <Button text="Stopper" onPress={() => suiviExcursion.setEtat({ newEtat: "terminee" })} />
        </>
      )}
      {suiviExcursion.etat === "terminee" && (
        <Button
          text="Valider fin de rando"
          onPress={() => suiviExcursion.setEtat({ newEtat: "nonDemarree" })}
        />
      )}
      {suiviExcursion.etat === "nonDemarree" && (
        <Button
          text="Demarrer rando"
          onPress={() => suiviExcursion.setEtat({ newEtat: "enCours", trackSuivi: trackSuivi })}
        />
      )}
      {suiviExcursion.trackReel.map((point, i) => (
        <Text key={i}>
          {new Date(point.timestamp).toLocaleTimeString()} {point.lat} {point.lon} {point.alt}
        </Text>
      ))}
    </Screen>
  );
});

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

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
  marginTop: 20,
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
