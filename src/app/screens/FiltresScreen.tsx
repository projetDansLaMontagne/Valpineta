import React, { FC, useState, useEffect } from "react"
import { Image, ImageStyle, TextStyle, View, ScrollView, ViewStyle, TouchableOpacity, Switch } from "react-native"
import Slider from "react-native-a11y-slider";
import { observer } from "mobx-react-lite"

import { Text, Button, Screen } from "app/components"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "../theme"

/*
-- Todo --
Regler probleme du focus sur le slider qui empeche le slide vertical (onSlidingComplete non pris en compte)
Regler probleme de logo check qui disparait si expo n est plus lance
*/

interface FiltresScreenProps extends AppStackScreenProps<"Filtres"> {
  navigation: undefined
}

export const FiltresScreen: FC<FiltresScreenProps> = observer(function FiltresScreen(
  props: FiltresScreenProps
) {
  const { navigation } = props;

  // Assets
  const logoCheck = require("../../assets/icons/check_3x_vert.png");
  const logoDiffPhy = require("../../assets/icons/difficulte_physique.png");
  const logoDiffOri = require("./../../assets/icons/difficulte_orientation.png");

  // -- CONSTANTES --
  const criteresTri = [
    { texte: "Distance", logo: require("./../../assets/icons/distance.png") },
    { texte: "Temps de parcours", logo: require("./../../assets/icons/time.png") },
    { texte: "Dénivelé", logo: require("./../../assets/icons/denivele.png") },
    { texte: "Difficulté physique", logo: logoDiffPhy },
    { texte: "Difficulté d'orientation", logo: logoDiffOri },
  ]
  const distanceMax = 15;
  const dureeMax = 8;
  const deniveleMax = 3000;


  // -- USE STATES --
  // Tri / Filtres selectionnes
  const [critereTri, setCritereTri] = useState(0);
  const [intervalleDistance, setIntervalleDistance] = useState([0, distanceMax]);
  const [intervalleDuree, setIntervalleDuree] = useState([0, dureeMax]);
  const [intervalleDenivele, setIntervalleDenivele] = useState([0, dureeMax]);
  const [types, setTypes] = useState([
    { texte: "Aller-Retour", estCoche: true },
    { texte: "Boucle", estCoche: true },
    { texte: "Ligne", estCoche: true },
  ])
  const [zones, setzones] = useState([
    { nom: "Pineta", selectionnee: true },
    { nom: "Vallée de la Roya", selectionnee: true },
    { nom: "Vallée des Merveilles", selectionnee: true },
    { nom: "Vallée de la Vésubie", selectionnee: true },
    { nom: "Vallée de la Tinée", selectionnee: true },
    { nom: "Vallée de la B", selectionnee: true },
  ])
  const [difficultePhysique, setDifficultePhysique] = useState([
    { niveau: 1, selectionnee: true },
    { niveau: 2, selectionnee: true },
    { niveau: 3, selectionnee: true },
  ])
  const [difficulteOrientation, setDifficulteOrientation] = useState([
    { niveau: 1, selectionnee: true },
    { niveau: 2, selectionnee: true },
    { niveau: 3, selectionnee: true },
  ])

  // Autres
  const [slideVerticalBloque, setSlideVerticalBloque] = useState(false);

  // -- CallBacks --
  const clicType = (i) => {
    // Modification de l'état du type
    const updatedTypes = [...types];
    updatedTypes[i].estCoche = !updatedTypes[i].estCoche;
    setTypes(updatedTypes);
  }
  const clicZone = (i) => {
    let newZones = [...zones];
    newZones[i].selectionnee = !newZones[i].selectionnee;
    setzones(newZones);
  }
  const clicDifficultePhysique = (i) => {
    let newDifficulte = [...difficultePhysique];
    newDifficulte[i].selectionnee = !newDifficulte[i].selectionnee;
    setDifficultePhysique(newDifficulte);
  }
  const clicDifficulteOrientation = (i) => {
    let newDifficulte = [...difficulteOrientation];
    newDifficulte[i].selectionnee = !newDifficulte[i].selectionnee;
    setDifficulteOrientation(newDifficulte);
  }
  const validerFiltres = () => {
    const filtres = {
      critereTri: critereTri,
      intervalleDistance: intervalleDistance,
      intervalleDuree: intervalleDuree,
      intervalleDenivele: intervalleDenivele,
      types: types,
      zones: zones,
      difficultePhysique: difficultePhysique,
      difficulteOrientation: difficulteOrientation,
    };

    navigation.navigate("Welcome", { filtres: filtres });
  }

  return <ScrollView
    style={$container}
    scrollEnabled={!slideVerticalBloque}
  >
    <Button
      text="Valider filtres"
      style={$boutonValidation}
      onPress={() => validerFiltres()}
    />

    <Text style={$h1}>Trier par</Text>
    <View>
      {
        criteresTri.map((critere, i) =>
          <TouchableOpacity onPress={() => setCritereTri(i)} style={$critereTri}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={critere.logo} style={$logoCritere} />
              <Text style={$criteresTri} >{critere.texte}</Text>
            </View>
            {i == critereTri &&
              <Image source={logoCheck} style={$logoCheck} />
            }
          </TouchableOpacity>
        )
      }
    </View>

    <Text style={$h1}>Filtrer par</Text>
    <Text style={$h2}>Distance</Text>
    <Slider
      min={0}
      max={distanceMax}
      increment={1}
      values={intervalleDistance}
      markerColor={colors.palette.vert}
      onSlidingStart={() => setSlideVerticalBloque(true)}
      onSlidingComplete={() => setSlideVerticalBloque(false)}
      onChange={(value) => setIntervalleDistance(value)}
      style={$slider}
    />

    <Text style={$h2}>Durée</Text>
    <Slider
      min={0}
      max={dureeMax}
      increment={1}
      values={intervalleDuree}
      markerColor={colors.palette.vert}
      onSlidingStart={() => setSlideVerticalBloque(true)}
      onSlidingComplete={() => setSlideVerticalBloque(false)}
      onChange={(value) => setIntervalleDuree(value)}
      style={$slider}
    />

    <Text style={$h2}>Dénivelé</Text>
    <Slider
      min={0}
      max={deniveleMax}
      increment={200}
      values={intervalleDenivele}
      markerColor={colors.palette.vert}
      onSlidingStart={() => setSlideVerticalBloque(true)}
      onSlidingComplete={() => setSlideVerticalBloque(false)}
      onChange={(value) => setIntervalleDenivele(value)}
      style={$slider}
    />

    <Text style={$h2}>Type de parcours</Text>
    <View>
      {
        types.map((type, i) =>
          <TouchableOpacity onPress={() => clicType(i)} style={{ flexDirection: "row", alignItems: "center" }}>
            <Switch
              trackColor={{ false: 'onsenfout', true: colors.palette.grisFonce }}
              thumbColor={type.estCoche ? colors.bordure : colors.palette.noir}
              ios_backgroundColor={colors.palette.grisFonce}
              onValueChange={() => clicType(i)}
              value={type.estCoche}
              style={$switch}
            />
            <Text>{type.texte}</Text>
          </TouchableOpacity>
        )
      }
    </View>

    <Text style={$h2}>Zones</Text>
    <View style={$containerZones}>
      {
        zones.map((zone, i) =>
          <Button
            key={i}
            text={zone.nom}
            style={zone.selectionnee ? $zoneSelectionnee : $zone}
            onPress={() => clicZone(i)}
          />
        )
      }
    </View>

    <Text style={$h2}>Difficulté physique</Text>
    <View style={$containerDiff}>
      {
        difficultePhysique.map((difficulte, i) =>
          <TouchableOpacity
            key={difficulte.niveau}
            onPress={() => clicDifficultePhysique(i)}
            style={difficulte.selectionnee ? $difficulteSelectionnee : $difficulte}
          >
            {
              [...Array(difficulte.niveau)].map(() =>
                <Image source={logoDiffPhy} style={$imageDifficulte} />
              )
            }
          </TouchableOpacity>
        )
      }
    </View>

    <Text style={$h2}>Difficulté d'orientation</Text>
    <View style={[$containerDiff, { marginBottom: spacing.xxxl }]}>
      {
        difficulteOrientation.map((difficulte, i) =>
          <TouchableOpacity
            key={difficulte.niveau}
            onPress={() => clicDifficulteOrientation(i)}
            style={difficulte.selectionnee ? $difficulteSelectionnee : $difficulte}
          >
            {
              [...Array(difficulte.niveau)].map(() =>
                <Image source={logoDiffOri} style={$imageDifficulte} />
              )
            }
          </TouchableOpacity>
        )
      }
    </View>
  </ScrollView>
})

const $root: ViewStyle = {
  flex: 1,
}


// ---- R E U T I L I S A B L E ----
const $cadre: ViewStyle = {
  borderRadius: 20,
  borderWidth: 1,
  margin: spacing.sm
}

// ---- V I E W S ----
const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.fond,
  padding: spacing.lg,

  paddingTop: 50 // A SUPPRIMER
}
const $critereTri: ViewStyle = {
  flexDirection: "row",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",
}
const $containerZones: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",

}
const $zone: ViewStyle = {
  borderColor: colors.palette.vert,
  borderRadius: 15,
  margin: spacing.xs,
}
const $zoneSelectionnee: ViewStyle = {
  ...$zone,
  backgroundColor: colors.palette.vert,
}
const $difficulte: ViewStyle = {
  flexDirection: "row",
  borderRadius: 20,
  borderWidth: 1,
  margin: spacing.md,
  padding: 8,
}
const $difficulteSelectionnee: ViewStyle = {
  ...$difficulte,
  backgroundColor: colors.palette.vert,
}
const $containerDiff: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
}


// ---- I M A G E S ----
const $logoCritere: ImageStyle = {
  width: 30,
  height: 30,
  resizeMode: "contain",
  marginLeft: spacing.lg,
  marginRight: spacing.lg,
  marginTop: 7,
  marginBottom: 7,
}
const $logoCheck: ImageStyle = {
  height: 40,
  resizeMode: "contain",
  marginRight: spacing.lg,
}
const $imageDifficulte: ImageStyle = {
  width: 30,
  height: 30,
  resizeMode: "contain",
}


// ---- T E X T S ----
const $h1: TextStyle = {
  fontSize: 30,
  marginTop: spacing.lg,
  paddingTop: spacing.lg,
}
const $h2: TextStyle = {
  fontSize: 20,
  marginTop: spacing.lg,
}
const $criteresTri: TextStyle = {
  fontSize: 15,
}


// ---- A U T R E S ----
const $boutonValidation: ViewStyle = {
  borderRadius: 15,
  borderWidth: 2,
  padding: 0,
  backgroundColor: colors.palette.vert,
}
const $switch: ViewStyle = {
  backgroundColor: "transparent",
  borderColor: "transparent",
  margin: spacing.sm,
}
const $slider: ViewStyle = {
  paddingLeft: spacing.lg,
  paddingRight: spacing.lg,
}
