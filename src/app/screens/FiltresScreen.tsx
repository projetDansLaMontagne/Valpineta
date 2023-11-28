import React, { FC, useState, useEffect } from "react"
import { Image, ImageStyle, TextStyle, View, ScrollView, ViewStyle, TouchableOpacity, Switch } from "react-native"
import Slider from "react-native-a11y-slider";
import { observer } from "mobx-react-lite"

import { Text, Button, Screen } from "app/components"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "../theme"

/**@bug onSlidingComplete du slide ne s active pas toujours, ce qui parfois garde la navigation verticale */

interface FiltresScreenProps extends AppStackScreenProps<"Filtres"> {
}

export const FiltresScreen: FC<FiltresScreenProps> = observer(function FiltresScreen(
  props: FiltresScreenProps
) {
  const { navigation } = props;
  var valeursFiltres;

  // Assets
  const logoCheck = require("../../assets/icons/check_3x_vert.png");

  const logoDistance = require("../../assets/icons/distance.png");
  const logoDuree = require("../../assets/icons/time.png");
  const logoDenivele = require("../../assets/icons/denivele.png");
  const logoDiffTech = require("../../assets/icons/difficulte_technique.png");
  const logoDiffOri = require("./../../assets/icons/difficulte_orientation.png");

  // -- CONSTANTES --
  // Recuperation des valeurs de filtres
  try {
    // ! OBTENABLE DEPUIS LA FONCTION valeursFiltres dans la page ExcursionsScreen
    valeursFiltres = require("../../assets/jsons/valeurs_filtres.json");
  }
  catch (error) {
    // Erreur critique si on n a pas les valeurs de filtres
    navigation.navigate("Excursions");
    console.error("Page des filtres necessite les filtres appliques en parametres");
    return <></>;
  }
  const incrementDenivele = 200;
  const criteresTri = [
    { nom: "Distance", nomCle: "distance", logo: logoDistance },
    { nom: "Durée", nomCle: "duree", logo: logoDuree },
    { nom: "Dénivelé", nomCle: "denivele", logo: logoDenivele },
    { nom: "Difficulté technique", nomCle: "difficulteTechnique", logo: logoDiffTech },
    { nom: "Difficulté d'orientation", nomCle: "difficulteOrientation", logo: logoDiffOri },
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
  const [difficultesTechniques, setDifficultesTechniques] = useState(
    [...Array(valeursFiltres.difficulteTechniqueMax)].map((trash, i) => ({ niveau: i + 1, selectionne: true }))
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
  }
  const clicDifficulteTechnique = (i: number) => {
    let newDifficulte = [...difficultesTechniques];
    newDifficulte[i].selectionne = !newDifficulte[i].selectionne;
    setDifficultesTechniques(newDifficulte);
  }
  const clicDifficulteOrientation = (i: number) => {
    let newDifficulte = [...difficultesOrientation];
    newDifficulte[i].selectionne = !newDifficulte[i].selectionne;
    setDifficultesOrientation(newDifficulte);
  }
  const validerFiltres = () => {
    const filtres = {
      critereTri: criteresTri[critereTriSelectionne].nomCle,
      intervalleDistance: { min: intervalleDistance[0], max: intervalleDistance[1] },
      intervalleDuree: { min: intervalleDuree[0], max: intervalleDuree[1] },
      intervalleDenivele: { min: intervalleDenivele[0], max: intervalleDenivele[1] },
      typesParcours: typesParcours.map(type => type.selectionne ? type.nom : null).filter(type => type != null),
      vallees: vallees.map(vallee => vallee.selectionne ? vallee.nom : null).filter(type => type != null),
      difficultesTechniques: difficultesTechniques.map(difficulteTechnique => difficulteTechnique.selectionne ? difficulteTechnique.niveau : null).filter(type => type != null),
      difficultesOrientation: difficultesOrientation.map(difficultesOrientation => difficultesOrientation.selectionne ? difficultesOrientation.niveau : null).filter(type => type != null),
    };
    navigation.navigate("Excursions", { Filtres: filtres });
  }

  return <Screen
    preset="scroll"
    safeAreaEdges={["top", "bottom"]}
    style={$container}
    ScrollViewProps={{ scrollEnabled: !slideVerticalBloque }}
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
      markerColor={colors.palette.vert}
      onSlidingStart={() => setSlideVerticalBloque(true)}
      onSlidingComplete={() => setSlideVerticalBloque(false)}
      onChange={(value) => setIntervalleDistance(value)}
      style={$slider}
      labelStyle={{ backgroundColor: colors.fond }}
    />

    <Text style={$h2}>Durée (en h)</Text>
    <Slider
      min={0}
      max={valeursFiltres.dureeMax}
      increment={1}
      values={intervalleDuree}
      markerColor={colors.palette.vert}
      onSlidingStart={() => setSlideVerticalBloque(true)}
      onSlidingComplete={() => setSlideVerticalBloque(false)}
      onChange={(value) => setIntervalleDuree(value)}
      style={$slider}
      labelStyle={{ backgroundColor: colors.fond }}
    />

    <Text style={$h2}>Dénivelé (en m)</Text>
    <Slider
      min={0}
      max={valeursFiltres.deniveleMax + incrementDenivele}
      increment={incrementDenivele}
      values={intervalleDenivele}
      markerColor={colors.palette.vert}
      onSlidingStart={() => setSlideVerticalBloque(true)}
      onSlidingComplete={() => setSlideVerticalBloque(false)}
      onChange={(value) => setIntervalleDenivele(value)}
      style={$slider}
      labelStyle={{ backgroundColor: colors.fond }}
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
              trackColor={{ false: 'onsenfout', true: colors.palette.gris }}
              thumbColor={typeParcours.selectionne ? colors.bordure : colors.palette.blanc}
              ios_backgroundColor={colors.palette.gris}

              onValueChange={() => clicType(i)}
              value={typeParcours.selectionne}
              style={$switch}
            />
            <Text>{typeParcours.nom}</Text>
          </TouchableOpacity>
        )
      }
    </View>

    <Text style={$h2}>Vallées</Text>
    <View style={$containerVallees}>
      {
        vallees.map((vallee, i) =>
          <TouchableOpacity
            onPress={() => clicVallee(i)}
            style={[$vallee, vallee.selectionne ? { backgroundColor: colors.palette.vert } : { backgroundColor: colors.palette.blanc }]}
            key={i}>
            <Text style={vallee.selectionne ? { color: colors.palette.blanc } : { color: colors.palette.noir }}>{vallee.nom}</Text>
          </TouchableOpacity>
        )
      }
    </View>

    <Text style={$h2}>Difficulté technique</Text>
    <View style={$containerDiff}>
      {
        difficultesTechniques.map((difficulte, i) =>
          <TouchableOpacity
            onPress={() => clicDifficulteTechnique(i)}
            style={difficulte.selectionne ? $difficulteSelectionnee : $difficulte}
            key={difficulte.niveau}
          >
            {
              [...Array(difficulte.niveau)].map((trash, i) =>
                <Image source={logoDiffTech} style={$imageDifficulte} key={(i + 1) * (difficulte.niveau)} />
              )
            }
          </TouchableOpacity>
        )
      }
    </View>

    <Text style={$h2}>Difficulté d'orientation</Text>
    <View style={$containerDiff}>
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
  </Screen >
})


// ---- V I E W S ----
const $container: ViewStyle = {
  backgroundColor: colors.fond,
  padding: spacing.lg,
  height: "100%"
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
  borderColor: colors.palette.vert,
  borderRadius: 15,
  borderWidth: 1,
  margin: spacing.xxs,
  padding: spacing.sm,
}
const $containerDiff: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
}
const $difficulte: ViewStyle = {
  flexDirection: "row",
  borderRadius: 20,
  borderColor: colors.palette.vert,
  borderWidth: 1,
  margin: spacing.sm,
  marginBottom: 0,
  padding: 8,
}
const $difficulteSelectionnee: ViewStyle = {
  ...$difficulte,
  backgroundColor: colors.palette.vert,
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
  resizeMode: "stretch",
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