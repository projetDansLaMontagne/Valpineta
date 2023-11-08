import React, { FC, useState, useEffect } from "react"
import { Image, ImageStyle, TextStyle, View, ScrollView, ViewStyle, TouchableOpacity, Switch } from "react-native"
import Slider from "react-native-a11y-slider";
import { observer } from "mobx-react-lite"

import { Text, Button, Screen } from "app/components"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "../theme"
// import { useStores } from "app/models"

/*
-- Todo --
Regler probleme du focus sur le slider qui empeche le slide vertical (onSlidingComplete non pris en compte)
Regler probleme de logo check qui disparait si expo n est plus lance
*/

interface FiltresScreenProps extends AppStackScreenProps<"Filtres"> {
  filtresSetter: React.Dispatch<any>; // On veut recevoir un setter de useState
}

export const FiltresScreen: FC<FiltresScreenProps> = observer(function FiltresScreen(
  props: FiltresScreenProps
) {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  const { filtresSetter } = props

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
  const nomsZones = ["Pineta", "Vallée de la Roya", "Vallée des Merveilles", "Vallée de la Vésubie", "Vallée de la Tinée", "Vallée de la B"]


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
  const [zone, setzone] = useState(0)
  const [difficultePhysique, setDifficultePhysique] = useState(1)   // Par defaut difficulté physique à 1
  const [difficulteOrientation, setDifficulteOrientation] = useState(1)  // Par defaut difficulté d orientation à 1

  // Autres
  const [slideVerticalBloque, setSlideVerticalBloque] = useState(false);
  // const [isFiltresAppliques, setIsFiltresAppliques] = useState(true);


  // -- CallBacks --
  const clicType = (i) => {
    // Modification de l'état du type
    const updatedTypes = [...types];
    updatedTypes[i].estCoche = !updatedTypes[i].estCoche;
    setTypes(updatedTypes);
  }
  const validerFiltres = () => {
    // setIsFiltresAppliques(true);

    filtresSetter({
      critereTri: critereTri,
      intervalleDistance: intervalleDistance,
      intervalleDuree: intervalleDuree,
      intervalleDenivele: intervalleDenivele,
      types: types,
      zone: zone,
      difficultePhysique: difficultePhysique,
      difficulteOrientation: difficulteOrientation,
    });
  }

  // useEffect(() => {
  //   setIsFiltresAppliques(false);
  // }, [critereTri, intervalleDistance, intervalleDenivele, intervalleDistance, intervalleDuree, types, zone, difficultePhysique, difficulteOrientation])

  return (
    // <Screen style={$root} preset="scroll">
    <ScrollView
      style={$container}
      scrollEnabled={!slideVerticalBloque}
    >
      {/* <View style={$containerBtnValider}>
        {!isFiltresAppliques && */}
      <Button
        text="Appliquer"
        onPress={() => validerFiltres()}
        style={$boutonValidation}
      />
      {/* }
        </View> */}

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
        markerColor="#007C27"
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
        markerColor="#007C27"
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
        markerColor="#007C27"
        onSlidingStart={() => setSlideVerticalBloque(true)}
        onSlidingComplete={() => setSlideVerticalBloque(false)}
        onChange={(value) => setIntervalleDenivele(value)}
        style={$slider}
      />

      <Text style={$h2}>Type de parcours</Text>
      <View style={$cadre}>
        {
          types.map((type, i) =>
            <TouchableOpacity onPress={() => clicType(i)} style={{ flexDirection: "row", alignItems: "center" }}>
              <Switch
                trackColor={{ false: 'onsenfout', true: '#cccccc' }}
                thumbColor={type.estCoche ? 'green' : '#ffffff'}
                ios_backgroundColor="#CCCCCC"
                onValueChange={() => clicType(i)}
                value={type.estCoche}
                style={$switch}
              />
              <Text>{type.texte}</Text>
            </TouchableOpacity>
          )
        }
      </View>

      <Text style={$h2}>Zone</Text>
      <View style={$containerZones}>
        {
          nomsZones.map((nomZone, i) =>
            <Button
              key={i}
              text={nomZone}
              style={zone == i ? $zoneSelectionnee : $zone}
              onPress={() => setzone(i)}
            />
          )
        }
      </View>

      <Text style={$h2}>Difficulté physique</Text>
      <View style={$containerDiff}>
        {
          [1, 2, 3].map((i) =>
            <TouchableOpacity
              key={i}
              onPress={() => setDifficultePhysique(i)}
              style={i == difficultePhysique ? $difficulteSelectionnee : $difficulte}
            >
              {
                [...Array(i)].map(() =>
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
          [1, 2, 3].map((i) =>
            <TouchableOpacity
              key={i}
              onPress={() => setDifficulteOrientation(i)}
              style={i == difficulteOrientation ? $difficulteSelectionnee : $difficulte}
            >
              {
                [...Array(i)].map(() =>
                  <Image source={logoDiffOri} style={$imageDifficulte} />
                )
              }
            </TouchableOpacity>
          )
        }
      </View>
    </ScrollView>
  )
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
  backgroundColor: colors.background,
  padding: spacing.lg,

  paddingTop: 50 // A SUPPRIMER
}
// const $containerBtnValider: ViewStyle = {
//   position: "absolute",
//   width: "100%",
//   height: "100%",
//   backgroundColor: "red",
//   alignItems: "center",
//   justifyContent: "flex-end"
// }
const $critereTri: ViewStyle = {
  flexDirection: "row",
  width: "100%",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
}
const $containerZones: ViewStyle = {
  ...$cadre,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",

}
const $zone: ViewStyle = {
  borderColor: "#007C27",
  borderRadius: 15,
  margin: spacing.xs,
}
const $zoneSelectionnee: ViewStyle = {
  ...$zone,
  backgroundColor: "#007C27",
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
  backgroundColor: "#007C27",
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
  backgroundColor: "#007C27",
  // width: 200,
  // position: "relative",
  // bottom: 0
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