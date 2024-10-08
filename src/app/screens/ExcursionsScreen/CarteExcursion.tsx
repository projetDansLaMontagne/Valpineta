import React, { useState } from "react";
import { Image, StyleSheet } from "react-native";

import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { colors, spacing } from "app/theme";
import { Text } from "app/components/Text";
import { GraphiqueDenivele } from "app/components/GraphiqueDenivele";
import { T_excursion } from "app/navigators";

/**@warning L absence de parametre n est pas geree */

interface CarteExcursionProps extends TouchableOpacityProps {
  excursion: T_excursion;
  onPress?: () => void;
}

export function CarteExcursion(props: CarteExcursionProps) {
  let nomExcursion = "";
  let vallee = "";
  let typeParcours = "";
  let duree = { h: 0, m: 0 };
  let distance = 0;
  let denivele = 0;
  let difficulteTechnique = 0;
  let difficulteOrientation = 0;
  let track: any[] = [];

  if (props.excursion) {
    nomExcursion = props.excursion.nom;
    vallee = props.excursion.vallee;
    typeParcours = props.excursion.typeParcours;
    duree = props.excursion.duree;
    distance = props.excursion.distance;
    denivele = props.excursion.denivele;
    difficulteTechnique = props.excursion.difficulteTechnique;
    difficulteOrientation = props.excursion.difficulteOrientation;
    track = props.excursion.track;
  }

  const valleeIcone = require("assets/icons/zone.png");
  const typeParcoursIcone = require("assets/icons/parcours.png");
  const dureeIcone = require("assets/icons/duree.png");
  const distanceIcone = require("assets/icons/distance.png");
  const deniveleIcone = require("assets/icons/denivele.png");
  const difficulteTechniqueIcone = require("assets/icons/difficulteTechnique.png");
  const difficulteOrientationIcone = require("assets/icons/difficulteOrientation.png");

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
      maxWidth: "100%",
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
      alignItems: "center",
      paddingStart: spacing.xs,
      paddingEnd: spacing.xs,
      marginBottom: spacing.xxs,
    },
    icone: {
      width: spacing.lg,
      height: spacing.lg,
      marginEnd: spacing.xxs,
    },
    valleeFavori: {
      marginEnd: spacing.xxs,
    },
  });

  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={styles.carteGlobale}>
        <View style={styles.entete}>
          <Text weight="bold" text={nomExcursion} style={styles.heading} />
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
              <Text text={duree.h + "h" + (duree.m !== 0 ? duree.m : "")} style={styles.content} />
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
              <Image style={styles.icone} source={difficulteTechniqueIcone} resizeMode="contain" />
              <Text text={difficulteTechnique.toString()} style={styles.content} />
            </View>
            <View style={styles.groupeTexteIconeLigneInf}>
              <Image
                style={styles.icone}
                source={difficulteOrientationIcone}
                resizeMode="contain"
              />
              <Text text={difficulteOrientation.toString()} style={styles.content} />
            </View>
            <View>{track && <GraphiqueDenivele points={track} detaille={false} />}</View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
