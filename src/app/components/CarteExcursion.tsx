import React, { ComponentType, Fragment, ReactElement, useState } from "react"
import { Image, ImageStyle, StyleSheet } from "react-native"
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir importé les icônes correctement
import Icon from 'react-native-vector-icons/FontAwesome';



import {
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native"
import { colors, spacing } from "../theme"
import { Text, TextProps } from "./Text"

interface CarteExcursionProps extends TouchableOpacityProps {

  nomExcursions?: TextProps["text"]

  zone?: TextProps["text"]

  parcours?: TextProps["text"]

  temps?: TextProps["text"]

  distance?: TextProps["text"]

  denivelePositif?: TextProps["text"]

  difficulteParcours?: TextProps["text"]

  difficulteOrientation?: TextProps["text"]

  navigation?: any
}

export function CarteExcursion(props: CarteExcursionProps) {
  const {
    nomExcursions,
    zone,
    parcours,
    temps,
    distance,
    denivelePositif,
    difficulteParcours,
    difficulteOrientation,
    navigation,
  } = props

  const favoriIcone = require("../../assets/icons/favori.png")
  const zoneIcone = require("../../assets/icons/zone.png")
  const parcoursIcone = require("../../assets/icons/parcours.png")
  const tempsIcone = require("../../assets/icons/temps.png")
  const distanceIcone = require("../../assets/icons/distance.png")
  const denivelePositifIcone = require("../../assets/icons/denivelePositif.png")
  const difficulteParcoursIcone = require("../../assets/icons/difficulteParcours.png")
  const difficulteOrientationIcone = require("../../assets/icons/difficulteOrientation.png")

  const imageRandonnee = require("../../assets/images/randonnee.png")

  const [coeurTouche, setcoeurTouche] = useState(false);


  const excursionFavorite = () => {
    if (coeurTouche) {
      setcoeurTouche(false);
    } else {
      setcoeurTouche(true);
    }
  }

  const detailExcursion = () => {
    navigation.navigate('Stack', { screen: 'DetailsExcursion', params: { nomExcursion: nomExcursions } });
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
      marginBottom: spacing.xxs
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
      color: coeurTouche ? colors.palette.rouge : colors.palette.noir,
    },
    zoneFavori: {
      marginEnd: spacing.xxs,
    },
  });


  return (
    <TouchableOpacity onPress={detailExcursion}>
      <View style={styles.carteGlobale}>
        <View style={styles.entete}>
          <Image style={styles.imageRando} source={imageRandonnee} resizeMode="contain" />
          <Text
            weight="bold"
            text={nomExcursions}
            style={styles.heading}
          />
          <TouchableOpacity onPress={excursionFavorite}>
            <Icon
              name="heart-o"
              size={spacing.lg}
              style={styles.icone}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tableauInfos}>
          <View style={styles.ligneSup}>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={zoneIcone} resizeMode="contain" />
              <Text
                text={zone}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={parcoursIcone} resizeMode="contain" />
              <Text
                text={parcours}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={tempsIcone} resizeMode="contain" />
              <Text
                text={temps}
                style={styles.content}
              />
            </View>
          </View>
          <View style={styles.ligneInf}>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={distanceIcone} resizeMode="contain" />
              <Text
                text={distance + " km"}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={denivelePositifIcone} resizeMode="contain" />
              <Text
                text={denivelePositif + " m"}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={difficulteParcoursIcone} resizeMode="contain" />
              <Text
                text={difficulteParcours}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={difficulteOrientationIcone} resizeMode="contain" />
              <Text
                text={difficulteOrientation}
                style={styles.content}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}