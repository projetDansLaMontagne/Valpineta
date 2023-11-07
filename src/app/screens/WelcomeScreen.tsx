import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"
import { Image, ImageStyle, TextStyle, View, ScrollView, ViewStyle, TouchableOpacity } from "react-native"
import { CheckBox } from 'react-native-elements';
// import { AppStackScreenProps } from "../../navigators"
import { Text, Button } from "../components"
import { isRTL } from "../i18n"
import { colors, spacing } from "../theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"

// Faire le slider
// Regler le probleme de require
// Faire le css de la page

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> { }

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen(
) {

  const welcomeLogo = require("../../assets/images/logo.png")
  const croixLogo = require("../../assets/icons/x_3x.png")

  // TRI
  const criteresTri = [
    { logo: "distance.png", texte: "Distance" },
    { logo: "time.png", texte: "Temps de parcours" },
    { logo: "denivele.png", texte: "Dénivelé" },
    { logo: "difficulte_orientation.png", texte: "Difficulté physique" },
    { logo: "difficulte_physique.png", texte: "Difficulté d'orientation" },
  ]
  const [critereTriSelectionne, setCritereTriSelectionne] = useState(0);

  // FILTRES
  const [isAllerRetour, setIsAllerRetour] = useState(false);

  const [types, setTypes] = useState([
    { texte: "Aller-Retour", estCoche: true },
    { texte: "Boucle", estCoche: true },
    { texte: "Ligne", estCoche: true },
  ])
  const clicType = (i) => {
    // Modification de l'état du type
    const updatedTypes = [...types];
    updatedTypes[i].estCoche = !updatedTypes[i].estCoche;
    setTypes(updatedTypes);
  }

  const zones = ["Pineta", "Vallée de la Roya", "Vallée des Merveilles", "Vallée de la Vésubie", "Vallée de la Tinée", "Vallée de la B"]
  const [zoneSelectionne, setZoneSelectionnee] = useState(0)

  const [difficultePhysique, setDifficultePhysique] = useState(1)   // Par defaut difficulté physique à 1

  const [difficulteOrientation, setDifficulteOrientation] = useState(1)  // Par defaut difficulté d orientation à 1

  return (
    <ScrollView>
      <View style={$container}>
        <Image style={$welcomeLogo} source={welcomeLogo} resizeMode="contain" />
        <Image style={$logo} source={croixLogo} />
        <Text>Trier par</Text>
        <View style={$containerCriteresTri}>
          {
            criteresTri.map((critere, i) =>
              <TouchableOpacity onPress={() => setCritereTriSelectionne(i)} style={$containerCritereTri}>
                <View key={i} style={$critereTri}>
                  {/* <Image source={require("../../assets/icons/" + critere.logo)} /> */}
                  <Image source={croixLogo} style={$croixLogo} />
                  <Text style={$criteresTri} >{critere.texte}</Text>
                  {i == critereTriSelectionne &&
                    <Image source={require("../../assets/icons/check.png")} />
                  }
                </View>
              </TouchableOpacity>
            )
          }
        </View>

        <Text>Filtrer par</Text>
        <Text>Distance</Text>
        {/* <SliderIntervalle max={1000} unite="km" precision={1 / 2} /> */}
        <Text>Durée</Text>
        <Text>Dénivelé</Text>
        <Text>Type de parcours</Text>
        <View style={$type}>
          <View>
            <Text>Aller-retour</Text>
            {
              types.map((type, i) =>
                <CheckBox
                  style={$chkbx}
                  title={type.texte}
                  checked={type.estCoche}
                  onPress={() => clicType(i)}
                />
              )
            }

          </View>
        </View>
        <Text>Zone</Text>
        <ScrollView style={$containerZones}>
          {
            zones.map((zone, i) =>
              <Button
                key={i}
                text={zone}
                style={zoneSelectionne == i ? $zoneSelectionnee : $zone}
                onPress={() => setZoneSelectionnee(i)}
              />
            )
          }
        </ScrollView>
        <Text>Difficulté physique</Text>
        <Text>Difficulté d'orientation</Text>
      </View>
    </ScrollView>
  )
})

// ---- V I E W S ----
const $container: ViewStyle = {
  flex: 1,
  alignItems: "center",
  backgroundColor: colors.background,
}
const $containerCriteresTri: ViewStyle = {
  borderWidth: 1,
  width: "100%",
}
const $containerCritereTri: ViewStyle = {
}
const $critereTri: ViewStyle = {
  flexDirection: "row",
}
const $type: ViewStyle = {
}
const $containerZones: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  width: "100%",
}


// ---- I M A G E S ----
const $croixLogo: ImageStyle = {
  width: 30,
  height: 30,
}
const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
}
const $logo: ImageStyle = {
  // color: "#007C27"
}


// ---- T E X T S ----
const $criteresTri: TextStyle = {
  fontSize: 15,
}

// ---- B O U T O N S ----
const $zone: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  borderRadius: 5,
  margin: spacing.sm,
}
const $zoneSelectionnee: ViewStyle = {
  ...$zone,
  backgroundColor: colors.palette.accent400,
}

// ---- A U T R E S ----
const $chkbx: ViewStyle = {
  backgroundColor: "transparent",
  borderColor: "transparent",
  padding: 0,
  margin: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  marginBottom: 0,
}