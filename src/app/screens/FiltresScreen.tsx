import React, { FC, useState, useEffect } from "react"
import { Image, ImageStyle, TextStyle, View, ScrollView, ViewStyle, TouchableOpacity, Switch } from "react-native"
import Slider from "react-native-a11y-slider";
import { observer } from "mobx-react-lite"

import { Text, Button, Screen } from "app/components"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "../theme"

/**@bug onSlidingComplete du slide ne s active pas toujours, ce qui parfois garde la navigation verticale */
/**@bug Valles ne sont pas re selectionnables */

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
  // ! OBTENABLE DEPUIS LA FONCTION valeursFiltres dans la page ExcursionsScreen
  const valeursFiltres = require("../../assets/jsons/valeurs_filtres.json");
  const incrementDenivele = 200;
  const tris = [
    { texte: "Distance", logo: require("./../../assets/icons/distance.png") },
    { texte: "Temps de parcours", logo: require("./../../assets/icons/time.png") },
    { texte: "Dénivelé", logo: require("./../../assets/icons/denivele.png") },
    { texte: "Difficulté physique", logo: logoDiffPhy },
    { texte: "Difficulté d'orientation", logo: logoDiffOri },
  ]

  // -- USE STATES --
  // Tri / Filtres selectionnes
  const [critereTri, setCritereTri] = useState(0);
  const [intervalleDistance, setIntervalleDistance] = useState([0, valeursFiltres.distanceMax]);
  const [intervalleDuree, setIntervalleDuree] = useState([0, valeursFiltres.dureeMax]);
  const [intervalleDenivele, setIntervalleDenivele] = useState([0, valeursFiltres.deniveleMax + incrementDenivele]);
  const [types, setTypes] = useState(
    valeursFiltres.nomsTypesParcours.map(nom => ({ texte: nom, estCoche: true }))
  )
  const [vallees, setVallees] = useState(
    valeursFiltres.nomsVallees.map(nom => ({ nom: nom, selectionnee: true }))
  )
  const [difficultePhysique, setDifficultePhysique] = useState(
    [...Array(valeursFiltres.difficultePhysiqueMax)].map((trash, i) => ({ niveau: i + 1, selectionnee: true }))
  );
  const [difficulteOrientation, setDifficulteOrientation] = useState(
    [...Array(valeursFiltres.difficulteOrientationMax)].map((trash, i) => ({ niveau: i + 1, selectionnee: true }))
  )

  // Autres
  const [slideVerticalBloque, setSlideVerticalBloque] = useState(false);

  // -- CallBacks --
  const clicType = (i) => {
    // Modification de l'état du type
    const updatedTypes = [...types];
    updatedTypes[i].estCoche = !updatedTypes[i].estCoche;
    setTypes(updatedTypes);
  }
  const clicVallee = (i: number) => {
    let newVallees = [...vallees];
    newVallees[i].selectionnee = !newVallees[i].selectionnee;
    setVallees(newVallees);
    console.log("MODIFICATION VALLEE", newVallees[i]);
    console.log(vallees);
    // setVallees(vallees.map((vallee, index) => {
    //   if (index === i) {
    //     // Créez un nouvel objet avec la propriété selectionnee mise à jour
    //     return { ...vallee, selectionnee: !vallee.selectionnee };
    //   }
    //   return vallee;
    // }));
  }
  const clicDifficultePhysique = (i: number) => {
    let newDifficulte = [...difficultePhysique];
    newDifficulte[i].selectionnee = !newDifficulte[i].selectionnee;
    setDifficultePhysique(newDifficulte);
  }
  const clicDifficulteOrientation = (i: number) => {
    let newDifficulte = [...difficulteOrientation];
    newDifficulte[i].selectionnee = !newDifficulte[i].selectionnee;
    setDifficulteOrientation(newDifficulte);
  }
  const validerFiltres = () => {
    const filtres = {
      critereTri: critereTri,
      intervalleDistance: { min: intervalleDistance[0], max: intervalleDistance[1] },
      intervalleDuree: { min: intervalleDuree[0], max: intervalleDuree[1] },
      intervalleDenivele: { min: intervalleDenivele[0], max: intervalleDenivele[1] },
      typesParcours: types.map(type => type.estCoche ? type.texte : null).filter(type => type != null),
      vallees: vallees.map(vallee => vallee.selectionnee ? vallee.nom : null).filter(type => type != null),
      difficultePhysique: difficultePhysique.map(difficultePhysique => difficultePhysique.selectionnee ? difficultePhysique.niveau : null).filter(type => type != null),
      difficulteOrientation: difficulteOrientation.map(difficulteOrientation => difficulteOrientation.selectionnee ? difficulteOrientation.niveau : null).filter(type => type != null),
    };
    navigation.navigate("Excursions", { Filtres: filtres });
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
        tris.map((critere, i) =>
          <TouchableOpacity
            onPress={() => setCritereTri(i)}
            style={$critereTri}
            key={i}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={critere.logo} style={$logoCritere} />
              <Text style={$filtres} >{critere.texte}</Text>
            </View>
            {i == critereTri &&
              <Image source={logoCheck} style={$logoCheck} />
            }
          </TouchableOpacity>
        )
      }
    </View>

    <Text style={$h1}>Filtrer par</Text>
    <Text style={$h2}>Distance (en km)</Text>
    <Slider
      min={0}
      max={valeursFiltres.distanceMax}
      increment={1}
      values={intervalleDistance}
      markerColor="#007C27"
      onSlidingStart={() => setSlideVerticalBloque(true)}
      onSlidingComplete={() => setSlideVerticalBloque(false)}
      onChange={(value) => setIntervalleDistance(value)}
      style={$slider}
    />

    <Text style={$h2}>Durée (en h)</Text>
    <Slider
      min={0}
      max={valeursFiltres.dureeMax}
      increment={1}
      values={intervalleDuree}
      markerColor="#007C27"
      onSlidingStart={() => setSlideVerticalBloque(true)}
      onSlidingComplete={() => setSlideVerticalBloque(false)}
      onChange={(value) => setIntervalleDuree(value)}
      style={$slider}
    />

    <Text style={$h2}>Dénivelé (en m)</Text>
    <Slider
      min={0}
      max={valeursFiltres.deniveleMax + incrementDenivele}
      increment={incrementDenivele}
      values={intervalleDenivele}
      markerColor="#007C27"
      onSlidingStart={() => setSlideVerticalBloque(true)}
      onSlidingComplete={() => setSlideVerticalBloque(false)}
      onChange={(value) => setIntervalleDenivele(value)}
      style={$slider}
    />

    <Text style={$h2}>Type de parcours</Text>
    <View>
      {
        types.map((type, i) =>
          <TouchableOpacity
            onPress={() => clicType(i)}
            style={{ flexDirection: "row", alignItems: "center" }}
            key={i}
          >
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

    <Text style={$h2}>Vallees</Text>
    <View style={$containerVallees}>
      {
        vallees.map((vallee, i) =>
          <Button
            key={i}
            text={vallee.nom}
            style={vallee.selectionnee ? $valleeSelectionnee : $vallee}
            onPress={() => clicVallee(i)}
          />
        )
      }
    </View>

    <Text style={$h2}>Difficulté physique</Text>
    <View style={$containerDiff}>
      {
        difficultePhysique.map((difficulte, i) =>
          <TouchableOpacity
            onPress={() => clicDifficultePhysique(i)}
            style={difficulte.selectionnee ? $difficulteSelectionnee : $difficulte}
            key={difficulte.niveau}
          >
            {
              [...Array(difficulte.niveau)].map((trash, i) =>
                <Image source={logoDiffPhy} style={$imageDifficulte} key={(i + 1) * (difficulte.niveau)} />
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
            onPress={() => clicDifficulteOrientation(i)}
            style={difficulte.selectionnee ? $difficulteSelectionnee : $difficulte}
            key={difficulte.niveau}
          >
            {
              [...Array(difficulte.niveau)].map((trash, i) =>
                <Image source={logoDiffOri} style={$imageDifficulte} key={(i + 1) * (difficulte.niveau)} />
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
  backgroundColor: colors.background,
  padding: spacing.lg,

  paddingTop: 50 // A SUPPRIMER
}
const $critereTri: ViewStyle = {
  flexDirection: "row",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",
}
const $containerVallees: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",

}
const $vallee: ViewStyle = {
  borderColor: "#007C27",
  borderRadius: 15,
  margin: spacing.xs,
}
const $valleeSelectionnee: ViewStyle = {
  ...$vallee,
  backgroundColor: "#007C27",
}
const $containerDiff: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
}
const $difficulte: ViewStyle = {
  flexDirection: "row",
  borderRadius: 20,
  borderWidth: 1,
  margin: spacing.sm,
  marginBottom: 0,
  padding: 8,
}
const $difficulteSelectionnee: ViewStyle = {
  ...$difficulte,
  backgroundColor: "#007C27",
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
const $filtres: TextStyle = {
  fontSize: 15,
}


// ---- A U T R E S ----
const $boutonValidation: ViewStyle = {
  borderRadius: 15,
  borderWidth: 2,
  padding: 0,
  backgroundColor: "#007C27",
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