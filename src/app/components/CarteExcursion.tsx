import React, { ComponentType, Fragment, ReactElement, useState } from "react"
import { Image, ImageStyle, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"

import { TouchableOpacity, TouchableOpacityProps, View } from "react-native"
import { colors, spacing } from "../theme"
import { Text, TextProps } from "./Text"

interface CarteExcursionProps extends TouchableOpacityProps {
  excursion: JSON
  navigation: any
  route: any
}

export function CarteExcursion(props: CarteExcursionProps) {
  const { navigation } = props

  const {
    nomExcursion,
    duree,
    typeParcours,
    zone,
    distance,
    denivelePositif,
    difficulteParcours,
    difficulteOrientation,
  } = props.excursion

  const zoneIcone = require("../../assets/icons/zone.png")
  const typeParcoursIcone = require("../../assets/icons/parcours.png")
  const dureeIcone = require("../../assets/icons/duree.png")
  const distanceIcone = require("../../assets/icons/distance.png")
  const denivelePositifIcone = require("../../assets/icons/denivelePositif.png")
  const difficulteParcoursIcone = require("../../assets/icons/difficulteParcours.png")
  const difficulteOrientationIcone = require("../../assets/icons/difficulteOrientation.png")

  const imageRandonnee = require("../../assets/images/randonnee.png")

  const [coeurTouche, setcoeurTouche] = useState(false)

  const excursionFavorite = () => {
    if (coeurTouche) {
      setcoeurTouche(false)
    } else {
      setcoeurTouche(true)
    }
  }

  const detailExcursion = () => {
    navigation.navigate("Stack", {
      screen: "DetailsExcursion",
      params: { excursion: props.excursion, navigation: navigation }
    })
  }

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
      paddingStart: spacing.xs,
      paddingEnd: spacing.xs,
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
      color: coeurTouche ? colors.palette.rouge : null,
    },
    zoneFavori: {
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
            <Icon name="heart-o" size={spacing.lg} style={styles.icone} />
          </TouchableOpacity>
        </View>
        <View style={styles.tableauInfos}>
          <View style={styles.ligneSup}>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={zoneIcone} resizeMode="contain" />
              <Text text={zone} style={styles.content} />
            </View>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={typeParcoursIcone} resizeMode="contain" />
              <Text text={typeParcours} style={styles.content} />
            </View>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={dureeIcone} resizeMode="contain" />
              <Text text={duree} style={styles.content} />
            </View>
          </View>
          <View style={styles.ligneInf}>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={distanceIcone} resizeMode="contain" />
              <Text text={distance + " km"} style={styles.content} />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={denivelePositifIcone} resizeMode="contain" />
              <Text text={denivelePositif + " m"} style={styles.content} />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={difficulteParcoursIcone} resizeMode="contain" />
              <Text text={difficulteParcours} style={styles.content} />
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
