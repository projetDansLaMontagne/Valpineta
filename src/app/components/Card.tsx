import React, { ComponentType, Fragment, ReactElement } from "react"
import { Image, ImageStyle} from "react-native"
import styled from 'styled-components/native';

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

interface CardProps extends TouchableOpacityProps {

  nomExcursions?: TextProps["text"]

  zone?: TextProps["text"]

  parcours?: TextProps["text"]

  temps?: TextProps["text"]

  distance?: TextProps["text"]

  denivelePositif?: TextProps["text"]

  difficulteParcours?: TextProps["text"]

  difficulteOrientation?: TextProps["text"]
}

export function Card(props: CardProps) {
  const {
    nomExcursions,
    zone,
    parcours,
    temps,
    distance,
    denivelePositif,
    difficulteParcours,
    difficulteOrientation,
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

  return (
      <View style={$carteGlobaleStyle}>
          <View style={$enteteStyle}>
            <Image style={$imageRandoStyle} source={imageRandonnee} resizeMode="contain" />
            <Text
              weight="bold"
              //tx={"carteComposant.titre"}
              text={nomExcursions}
              style={$headingStyle}
            />
            <Image style={$iconeStyle} source={favoriIcone} resizeMode="contain" />
          </View>

          <View style={$tableauInfos}>
            <View style={$ligneSup}>
              <View style={$groupeTexteIconeStyleLigneSup}>
                <Image style={$iconeStyle} source={zoneIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.zone"}
                  text={zone}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneSup}> 
                <Image style={$iconeStyle} source={parcoursIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.parcours"}
                  text={parcours}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneSup}>
                <Image style={$iconeStyle} source={tempsIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.temps"}
                  text={temps}
                  style={$contentStyle}
                />
              </View>
            </View>
            <View style= {$ligneInf}>
              <View style={$groupeTexteIconeStyleLigneInf}>
                <Image style={$iconeStyle} source={distanceIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.distance"}
                  text={distance + " km"}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneInf}>
                <Image style={$iconeStyle} source={denivelePositifIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.denivelePositif"}
                  text={denivelePositif + " m"}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneInf}>
                <Image style={$iconeStyle} source={difficulteParcoursIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.difficulteParcours"}
                  text={difficulteParcours}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneInf}>
                <Image style={$iconeStyle} source={difficulteOrientationIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.difficulteOrientation"}
                  text={difficulteOrientation}
                  style={$contentStyle}
                />
              </View>
            </View>  
          </View>
      </View>
  )
}

const $carteGlobaleStyle: ViewStyle = {
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
}

const $headingStyle: TextStyle = { 
  maxWidth: "50%", 
  marginEnd: spacing.xl, 
  fontSize: 16
}

const $contentStyle: TextStyle = {
  fontSize: 14, 
  maxWidth: "100%", 
  textAlign:"center"
}

const $tableauInfos: ViewStyle = {
  flexDirection: "column",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  paddingStart: spacing.xs,
  paddingEnd: spacing.xs,
  paddingBottom: spacing.xxs
}

const $ligneSup: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: spacing.xxs,
  minWidth: "100%",
  maxWidth: "100%",
  marginBottom: spacing.xxs
}

const $ligneInf: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  paddingStart: spacing.xs,
  paddingEnd: spacing.xs,
  paddingBottom: spacing.xxs,
  minWidth: "100%",
}

const $groupeTexteIconeStyleLigneSup: ViewStyle = {
  minWidth: "30%", 
  maxWidth: "30%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingStart: spacing.xs,
  paddingEnd: spacing.xs,
  marginBottom: spacing.xxs,
}

const $groupeTexteIconeStyleLigneInf: ViewStyle = {
  minWidth: "20%", 
  maxWidth: "24%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}

const $enteteStyle: ViewStyle = {
  //wrappe les deux textes
  flexDirection: "row", 
  alignItems: "center", 
  justifyContent: "space-between",
  paddingStart: spacing.xs,
  paddingEnd: spacing.xs,
  marginBottom: spacing.xxs,
}

const $imageRandoStyle: ImageStyle = {
  width:80,
  height:50,
  //width "25%", 
  borderRadius:spacing.xs
}

const $iconeStyle: ImageStyle = {
  width: spacing.lg,
  height: spacing.lg,
  marginEnd: spacing.xxs
}