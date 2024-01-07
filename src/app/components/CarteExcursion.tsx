import React, { useState } from "react"
import { Image, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"

<<<<<<< HEAD
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native"
import { colors, spacing } from "../theme"
import { Text } from "./Text"

/**@warning L absence de parametre n est pas geree */

interface CarteExcursionProps extends TouchableOpacityProps {
  excursion: Record<string, unknown>
  navigation: any
}

export function CarteExcursion(props: CarteExcursionProps) {
  const navigation = props.navigation

  var nomExcursion = ""
  var vallee = ""
  var typeParcours = ""
  var duree = { h: 0, m: 0 }
  var distance = 0
  var denivele = 0
  var difficulteTechnique = 0
  var difficulteOrientation = 0

  if (props.excursion) {
    nomExcursion = props.excursion.nom
    vallee = props.excursion.vallee
    typeParcours = props.excursion.typeParcours
    duree = props.excursion.duree
    distance = props.excursion.distance
    denivele = props.excursion.denivele
    difficulteTechnique = props.excursion.difficulteTechnique
    difficulteOrientation = props.excursion.difficulteOrientation
  }

  const valleeIcone = require("../../assets/icons/zone.png")
  const typeParcoursIcone = require("../../assets/icons/parcours.png")
  const dureeIcone = require("../../assets/icons/duree.png")
  const distanceIcone = require("../../assets/icons/distance.png")
  const deniveleIcone = require("../../assets/icons/denivele.png")
  const difficulteTechniqueIcone = require("../../assets/icons/difficulteParcours.png")
  const difficulteOrientationIcone = require("../../assets/icons/difficulteOrientation.png")
=======
interface PropsCarteExcursion extends TouchableOpacityProps {
  nom: string;
  vallee: string;
  typeParcours: string;
  duree: Record<"h" | "m", number>;
  distance: string;
  denivele: string;
  difficulteTechnique: string;
  difficulteOrientation: string;
  navigation: any;
  signalements: any;
}

export function CarteExcursion(props: PropsCarteExcursion) {
  const iconeVallee = require("../../assets/icons/zone.png");
  const iconeParcours = require("../../assets/icons/parcours.png");
  const iconeTemps = require("../../assets/icons/temps.png");
  const iconeDistance = require("../../assets/icons/distance.png");
  const iconeDenivelePositif = require("../../assets/icons/denivelePositif.png");
  const iconeDifficulteTechnique = require("../../assets/icons/difficulteTechnique.png");
  const iconeDifficulteOrientation = require("../../assets/icons/difficulteOrientation.png");
>>>>>>> e2d17749 (test de resolution de bug avant merge mais pas concluant V333)

  const imageRandonnee = require("../../assets/images/randonnee.png");

  const [coeurTouche, setCoeurTouche] = useState(false)

<<<<<<< HEAD
  const excursionFavorite = () => {
    if (coeurTouche) {
      setCoeurTouche(false)
=======
  useEffect(() => {
    validerParams();
  }, []);

  const validerParams = () => {
    if (
      props &&
      props.nom !== undefined &&
      props.duree !== undefined &&
      props.distance !== undefined &&
      props.difficulteTechnique !== undefined &&
      props.difficulteOrientation !== undefined &&
      props.signalements !== undefined
    ) {
      // Tous les paramètres sont définis, on peut naviguer en toute sécurité
>>>>>>> e2d17749 (test de resolution de bug avant merge mais pas concluant V333)
    } else {
      setCoeurTouche(true)
    }
  }

  const detailExcursion = () => {
<<<<<<< HEAD
    navigation.navigate("Stack", {
      screen: "DetailsExcursion",
      params: { excursion: props.excursion },
    })
  }
=======
    // console.log("Détail de l'excursion " + props.nom, props.duree, props.distance, props.difficulteTechnique, props.difficulteOrientation, props.signalements);
    validerParams(); // Valider à nouveau avant de naviguer

    // Si tous les paramètres sont définis, naviguer vers l'écran 'DetailsExcursion'
    props.navigation.navigate('Stack', {
      screen: 'DetailsExcursion',
      params: {
        nomExcursion: props.nom,
        temps: props.duree,
        distance: props.distance,
        difficulteTechnique: props.difficulteTechnique,
        difficulteOrientation: props.difficulteOrientation,
        signalements: props.signalements
      }
    });
  };
>>>>>>> e2d17749 (test de resolution de bug avant merge mais pas concluant V333)

  const styles = StyleSheet.create({
    carteGlobale: {
      padding: 5,
      margin: 10,
      shadowColor: colors.palette.noir,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
      borderRadius: 10,
      backgroundColor: colors.palette.blanc,
    },
    heading: {
      maxWidth: "50%",
      marginEnd: spacing.xl,
      fontSize: 16,
    },
    content: {
      fontSize: 14,
      maxWidth: "100%",
      textAlign: "center",
    },
    tableauInfos: {
      flexDirection: "column",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      paddingStart: spacing.xs,
      paddingEnd: spacing.xs,
      paddingBottom: spacing.xxs,
    },
    ligne: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      minWidth: "100%",
    },
    ligneSup: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: spacing.xxs,
      minWidth: "100%",
      maxWidth: "100%",
      marginBottom: spacing.xxs,
    },
    ligneInf: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: spacing.xxs,
      minWidth: "100%",
    },
    groupeTexteIconeLigneSup: {
      minWidth: "30%",
      maxWidth: "30%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingStart: spacing.xs,
      paddingEnd: spacing.xs,
      marginBottom: spacing.xxs,
    },
    groupeTexteIconeLigneInf: {
      minWidth: "20%",
      maxWidth: "24%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    entete: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingStart: spacing.xs,
      paddingEnd: spacing.xs,
      marginBottom: spacing.xxs,
    },
    imageRando: {
      width: 80,
      height: 50,
      borderRadius: spacing.xs,
    },
    icone: {
      width: spacing.lg,
      height: spacing.lg,
      marginEnd: spacing.xxs,
    },
    valleeFavori: {
      marginEnd: spacing.xxs,
    },
  })

  return (
    <TouchableOpacity onPress={detailExcursion}>
      <View style={styles.carteGlobale}>
        <View style={styles.entete}>
          <Image style={styles.imageRando} source={imageRandonnee} resizeMode="contain" />
          <Text weight="bold" text={nomExcursion} style={styles.heading} />
          <TouchableOpacity onPress={excursionFavorite}>
            <Icon name="heart-o" size={spacing.lg} style={styles.icone} color={coeurTouche ? colors.palette.rouge : colors.palette.noir} />
          </TouchableOpacity>
        </View>
        <View style={styles.tableauInfos}>
          <View style={styles.ligneSup}>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={valleeIcone} resizeMode="contain" />
              <Text text={vallee} style={styles.content} />
            </View>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={typeParcoursIcone} resizeMode="contain" />
              <Text text={typeParcours} style={styles.content} />
            </View>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={dureeIcone} resizeMode="contain" />
              <Text text={duree.h} style={styles.content} />
              <Text text={"h"} style={styles.content} />
              <Text text={duree.m} style={styles.content} />
            </View>
          </View>
          <View style={styles.ligneInf}>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={distanceIcone} resizeMode="contain" />
              <Text text={distance + " km"} style={styles.content} />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={deniveleIcone} resizeMode="contain" />
              <Text text={denivele + "m"} style={styles.content} />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
<<<<<<< HEAD
              <Image style={styles.icone} source={difficulteTechniqueIcone} resizeMode="contain" />
              <Text text={difficulteTechnique} style={styles.content} />
=======
              <Image style={styles.icone} source={iconeDifficulteTechnique} resizeMode="contain" />
              <Text
                text={props.difficulteTechnique}
                style={styles.content}
              />
>>>>>>> e2d17749 (test de resolution de bug avant merge mais pas concluant V333)
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image
                style={styles.icone}
                source={difficulteOrientationIcone}
                resizeMode="contain"
              />
              <Text text={difficulteOrientation} style={styles.content} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
