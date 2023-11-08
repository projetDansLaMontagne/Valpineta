import React, { ComponentType, Fragment, ReactElement, useState, useEffect } from "react"
import { Image, ImageStyle, StyleSheet,} from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';




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

  post_id?: TextProps["text"]
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
    post_id,
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

  let uneExcursion = {
    post_id: post_id,
    nomExcursions: nomExcursions,
    zone: zone,
    parcours: parcours,
    temps: temps,
    distance: distance,
    denivelePositif: denivelePositif,
    difficulteParcours: difficulteParcours,
    difficulteOrientation: difficulteOrientation,
  };
  
  const [isFavori, setIsFavori] = useState(false);

  useEffect(() => {
    verifierStatutFavori();
  }, []);

  const verifierStatutFavori = async () => {
    try {
      const excursionsFavorites = await AsyncStorage.getItem('excursionsFavorites');
      if (excursionsFavorites) {
        const parsedExcursions = JSON.parse(excursionsFavorites);
        const found = parsedExcursions.some(e => e.post_id === uneExcursion.post_id);
        setIsFavori(found);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut de l'excursion en favori :", error);
    }
  };

  const gererFavori = async () => {
    try {
      let excursionsFavorites = await AsyncStorage.getItem('excursionsFavorites');
      const parsedExcursions = excursionsFavorites ? JSON.parse(excursionsFavorites) : [];

      const found = parsedExcursions.some(e => e.post_id === uneExcursion.post_id);

      if (found) {
        const nouvellesExcursions = parsedExcursions.filter(e => e.post_id !== uneExcursion.post_id);
        await AsyncStorage.setItem('excursionsFavorites', JSON.stringify(nouvellesExcursions));
        console.log('Excursion supprimée des favoris');
        setIsFavori(false);
      } else {
        parsedExcursions.push(uneExcursion);
        await AsyncStorage.setItem('excursionsFavorites', JSON.stringify(parsedExcursions));
        console.log('Excursion ajoutée aux favoris');
        setIsFavori(true);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des excursions en favori :', error);
    }
  };


  
  

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
      color: isFavori ? 'red' : 'black',
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
              //tx={"carteComposant.titre"}
              text={nomExcursions}
              style={styles.heading}
            />
            <TouchableOpacity onPress={gererFavori}>
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
                  //tx={"carteComposant.zone"}
                  text={zone}
                  style={styles.content}
                />
              </View>
              <View style={styles.groupeTexteIconeLigneSup}> 
                <Image style={styles.icone} source={parcoursIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.parcours"}
                  text={parcours}
                  style={styles.content}
                />
              </View>
              <View style={styles.groupeTexteIconeLigneSup}>
                <Image style={styles.icone} source={tempsIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.temps"}
                  text={temps}
                  style={styles.content}
                />
              </View>
            </View>
            <View style= {styles.ligneInf}>
              <View style={styles.groupeTexteIconeLigneInf}>
                <Image style={styles.icone} source={distanceIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.distance"}
                  text={distance + " km"}
                  style={styles.content}
                />
              </View>
              <View style={styles.groupeTexteIconeLigneInf}>
                <Image style={styles.icone} source={denivelePositifIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.denivelePositif"}
                  text={denivelePositif + " m"}
                  style={styles.content}
                />
              </View>
              <View style={styles.groupeTexteIconeLigneInf}>
                <Image style={styles.icone} source={difficulteParcoursIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.difficulteParcours"}
                  text={difficulteParcours}
                  style={styles.content}
                />
              </View>
              <View style={styles.groupeTexteIconeLigneInf}>
                <Image style={styles.icone} source={difficulteOrientationIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.difficulteOrientation"}
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