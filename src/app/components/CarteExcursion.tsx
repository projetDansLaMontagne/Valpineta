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

/**@warning Tous les parametres sont declares comme optionnels et ne sont pas geres */

interface CarteExcursionProps extends TouchableOpacityProps {
  nomExcursions?: string
  vallee?: string
  parcours?: string
  duree?: Record<"h" | "m", number>
  distance?: string
  denivelePositif?: string
  difficulteParcours?: string
  difficulteOrientation?: string
}

export function CarteExcursion(props: CarteExcursionProps) {
  const favoriIcone = require("../../assets/icons/favori.png")
  const valleeIcone = require("../../assets/icons/zone.png")
  const parcoursIcone = require("../../assets/icons/parcours.png")
  const tempsIcone = require("../../assets/icons/temps.png")
  const distanceIcone = require("../../assets/icons/distance.png")
  const denivelePositifIcone = require("../../assets/icons/denivelePositif.png")
  const difficulteParcoursIcone = require("../../assets/icons/difficulteParcours.png")
  const difficulteOrientationIcone = require("../../assets/icons/difficulteOrientation.png")

  const imageRandonnee = require("../../assets/images/randonnee.png")

  const [coeurTouche, setCoeurTouche] = useState(false);

  const detailExcursion = () => {
    console.log('Détail de l\'excursion');
  }

  const styles = StyleSheet.create({
    carteGlobale: {
      padding: 5,
      margin: 10,
      shadowColor: "#000",
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
    },
    coeur: {
      color: coeurTouche ? 'red' : 'black',
    },
    valleeFavori: {
      marginEnd: spacing.xxs,
    },
  });


  return (
    <TouchableOpacity onPress={detailExcursion}>
      <View style={styles.carteGlobale}>
        <View style={styles.entete}>
          <Image style={styles.imageRando} source={imageRandonnee} resizeMode="contain" />
          <Text
            text={props.nomExcursions}
            weight="bold"
            style={styles.heading}
          />
          <TouchableOpacity onPress={() => setCoeurTouche(!coeurTouche)}>
            <Icon
              name="heart-o"
              size={spacing.lg}
              style={styles.coeur}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tableauInfos}>
          <View style={styles.ligneSup}>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={valleeIcone} resizeMode="contain" />
              <Text
                //tx={"carteComposant.vallee"}
                text={props.vallee}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={parcoursIcone} resizeMode="contain" />
              <Text
                //tx={"carteComposant.parcours"}
                text={props.parcours}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneSup}>
              <Image style={styles.icone} source={tempsIcone} resizeMode="contain" />
              <Text
                //tx={"carteComposant.duree"}
                text={props.duree.h + "h" + (props.duree.m == 0 ? "" : props.duree.m)}
                style={styles.content}
              />
            </View>
          </View>
          <View style={styles.ligneInf}>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={distanceIcone} resizeMode="contain" />
              <Text
                //tx={"carteComposant.distance"}
                text={props.distance + " km"}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={denivelePositifIcone} resizeMode="contain" />
              <Text
                //tx={"carteComposant.denivelePositif"}
                text={props.denivelePositif + " m"}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={difficulteParcoursIcone} resizeMode="contain" />
              <Text
                //tx={"carteComposant.difficulteParcours"}
                text={props.difficulteParcours}
                style={styles.content}
              />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image style={styles.icone} source={difficulteOrientationIcone} resizeMode="contain" />
              <Text
                //tx={"carteComposant.difficulteOrientation"}
                text={props.difficulteOrientation}
                style={styles.content}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}