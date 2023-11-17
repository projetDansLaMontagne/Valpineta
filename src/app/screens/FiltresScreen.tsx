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
  const criteresTri = [
    { nom: "Distance", logo: require("./../../assets/icons/distance.png") },
    { nom: "Temps de parcours", logo: require("./../../assets/icons/time.png") },
    { nom: "Dénivelé", logo: require("./../../assets/icons/denivele.png") },
    { nom: "Difficulté physique", logo: logoDiffPhy },
    { nom: "Difficulté d'orientation", logo: logoDiffOri },
  ]

  // -- USE STATES --
  // Tri / Filtres selectionnes
  const [critereTriSelectionne, setCritereTriSelectionne] = useState(0);
  const [intervalleDistance, setIntervalleDistance] = useState([0, valeursFiltres.distanceMax]);
  const [intervalleDuree, setIntervalleDuree] = useState([0, valeursFiltres.dureeMax]);
  const [intervalleDenivele, setIntervalleDenivele] = useState([0, valeursFiltres.deniveleMax + incrementDenivele]);
  const [typesParcours, setTypesParcours] = useState(
    valeursFiltres.nomTypesParcours.map(nomType => ({ nom: nomType, selectionne: true }))
  )
  const [vallees, setVallees] = useState(
    valeursFiltres.nomVallees.map(nomVallee => ({ nom: nomVallee, selectionne: true }))
  )
  const [difficultesPhysiques, setDifficultesPhysiques] = useState(
    [...Array(valeursFiltres.difficultePhysiqueMax)].map((trash, i) => ({ niveau: i + 1, selectionne: true }))
  );
  const [difficultesOrientation, setDifficultesOrientation] = useState(
    [...Array(valeursFiltres.difficulteOrientationMax)].map((trash, i) => ({ niveau: i + 1, selectionne: true }))
  )

  // Autres
  const [slideVerticalBloque, setSlideVerticalBloque] = useState(false);

  // -- CallBacks --
  const clicType = (i) => {
    // Modification de l'état du type
    const updatedTypesParcours = [...typesParcours];
    updatedTypesParcours[i].selectionne = !updatedTypesParcours[i].selectionne;
    setTypesParcours(updatedTypesParcours);
  }
  const clicVallee = (i: number) => {
    let newVallees = [...vallees];
    newVallees[i].selectionne = !newVallees[i].selectionne;
    setVallees(newVallees);
    console.log("MODIFICATION VALLEE", newVallees[i]);
    console.log(vallees);
    // setVallees(vallees.map((vallee, index) => {
    //   if (index === i) {
    //     // Créez un nouvel objet avec la propriété selectionnee mise à jour
    //     return { ...vallee, selectionne: !vallee.selectionne };
    //   }
    //   return vallee;
    // }));
  }
  const clicDifficultePhysique = (i: number) => {
    let newDifficulte = [...difficultesPhysiques];
    newDifficulte[i].selectionne = !newDifficulte[i].selectionne;
    setDifficultesPhysiques(newDifficulte);
  }
  const clicDifficulteOrientation = (i: number) => {
    let newDifficulte = [...difficultesOrientation];
    newDifficulte[i].selectionne = !newDifficulte[i].selectionne;
    setDifficultesOrientation(newDifficulte);
  }
  const validerFiltres = () => {
    const filtres = {
      critereTri: critereTriSelectionne,
      intervalleDistance: { min: intervalleDistance[0], max: intervalleDistance[1] },
      intervalleDuree: { min: intervalleDuree[0], max: intervalleDuree[1] },
      intervalleDenivele: { min: intervalleDenivele[0], max: intervalleDenivele[1] },
      typesParcours: typesParcours.map(type => type.selectionne ? type.nom : null).filter(type => type != null),
      vallees: vallees.map(vallee => vallee.selectionne ? vallee.nom : null).filter(type => type != null),
      difficultesPhysiques: difficultesPhysiques.map(difficultePhysique => difficultePhysique.selectionne ? difficultePhysique.niveau : null).filter(type => type != null),
      difficultesOrientation: difficultesOrientation.map(difficultesOrientation => difficultesOrientation.selectionne ? difficultesOrientation.niveau : null).filter(type => type != null),
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
        criteresTri.map((critere, i) =>
          <TouchableOpacity
            onPress={() => setCritereTriSelectionne(i)}
            style={$critereTri}
            key={i}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={critere.logo} style={$logoCritere} />
              <Text style={$filtres} >{critere.nom}</Text>
            </View>
            {i == critereTriSelectionne &&
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
        typesParcours.map((typeParcours, i) =>
          <TouchableOpacity
            onPress={() => clicType(i)}
            style={{ flexDirection: "row", alignItems: "center" }}
            key={i}
          >
            <Switch
              trackColor={{ false: 'onsenfout', true: '#cccccc' }}
              thumbColor={typeParcours.selectionne ? 'green' : '#ffffff'}
              ios_backgroundColor="#CCCCCC"
              onValueChange={() => clicType(i)}
              value={typeParcours.selectionne}
              style={$switch}
            />
            <Text>{typeParcours.nom}</Text>
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
            style={vallee.selectionne ? $valleeSelectionnee : $vallee}
            onPress={() => clicVallee(i)}
          />
        )
      }
    </View>

    <Text style={$h2}>Difficulté physique</Text>
    <View style={$containerDiff}>
      {
        difficultesPhysiques.map((difficulte, i) =>
          <TouchableOpacity
            onPress={() => clicDifficultePhysique(i)}
            style={difficulte.selectionne ? $difficulteSelectionnee : $difficulte}
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
        difficultesOrientation.map((difficulte, i) =>
          <TouchableOpacity
            onPress={() => clicDifficulteOrientation(i)}
            style={difficulte.selectionne ? $difficulteSelectionnee : $difficulte}
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