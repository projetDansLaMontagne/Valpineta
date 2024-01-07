import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import * as Location from 'expo-location';
import {
  View,
  SafeAreaView,
  ViewStyle,
  TouchableOpacity,
  Image,
  TextStyle,
  ImageStyle,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Text, CarteAvis, GraphiqueDenivele, GpxDownloader, Screen, CarteSignalement, Button } from "app/components"
import { spacing, colors } from "app/theme"
import SwipeUpDown from "react-native-swipe-up-down"
// import { isLoading } from "expo-font"

const { width, height } = Dimensions.get("window")

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {
  excursion: Record<string, unknown>
}

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {
    const { route, navigation } = props
    const excursion = route.params?.excursion
    const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true)
    const [isAllSignalements, setIsAllSignalements] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const chrono = () => {
      setTimeout(() => {
        setIsLoading(false)
      }
        , 1000);
    }

    useEffect(() => {
      const fetchLocation = async () => {
        const location = await getUserLocation();
        setUserLocation(location);
      };

      fetchLocation();
    }, []);

    useEffect(() => {
      if (isLoading) {
        chrono();
      }
    }, [isLoading]);

    //si excursion est défini, on affiche les informations de l'excursion
    return excursion ? (
      <SafeAreaView style={$container}>
        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.navigate("Excursions")}>
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
        <SwipeUpDown
          itemMini={itemMini()}
          itemFull={itemFull(excursion, navigation, containerInfoAffiche, setcontainerInfoAffiche, isAllSignalements, setIsAllSignalements, userLocation, isLoading)}
          animation="easeInEaseOut"
          extraMarginTop={125}
          swipeHeight={100}
        />
      </SafeAreaView>
    ) :
      //sinon on affiche une erreur
      (
        <Screen preset="fixed">
          <TouchableOpacity style={$boutonRetour} onPress={() => navigation.navigate("Excursions")}>
            <Image
              style={{ tintColor: colors.bouton }}
              source={require("../../assets/icons/back.png")}
            />
          </TouchableOpacity>
          <View style={$containerErreur}>
            <Text size="xxl">Erreur</Text>
            <Text style={$texteErreur} size="sm">
              Une erreur est survenue, veuillez réessayer
            </Text>
          </View>
        </Screen>
      )
  }
)

/**
 *
 * @returns le composant réduit des informations, autremeent dit lorsque l'on swipe vers le bas
 */
function itemMini() {
  return (
    <View style={$containerPetit}>
      <Image source={require("../../assets/icons/swipe-up.png")} />
    </View>
  )
}

/**
 * @returns le composant complet des informations, autrement dit lorsque l'on swipe vers le haut
 */
function itemFull(
  excursion: Record<string, unknown>,
  navigation: any,
  containerInfoAffiche: boolean,
  setcontainerInfoAffiche: any,
  isAllSignalements: any,
  setIsAllSignalements: any,
  userLocation: any,
  isLoading: any
) {

  var nomExcursion = ""
  if (excursion !== undefined) {
    nomExcursion = excursion.nom
  }
  if (isAllSignalements) {
    return listeSignalements(setIsAllSignalements, excursion, userLocation);
  }
  else {
    return (
      <View style={$containerGrand}>
        <View style={$containerTitre}>
          <Text text={nomExcursion} size="xl" style={$titre} />
          <GpxDownloader />
        </View>
        <View>
          <View style={$containerBouton}>
            <TouchableOpacity
              onPress={() => {
                setcontainerInfoAffiche(true)
              }}
              style={$boutonInfoAvis}
            >
              <Text
                text="Infos"
                size="lg"
                style={[containerInfoAffiche ? { color: colors.bouton } : { color: colors.text }]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setcontainerInfoAffiche(false)
              }}
              style={$boutonInfoAvis}
            >
              <Text
                text="Avis"
                size="lg"
                style={[containerInfoAffiche ? { color: colors.text } : { color: colors.bouton }]}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[
              $souligneInfosAvis,
              containerInfoAffiche
                ? { left: spacing.lg }
                : { left: width - width / 2.5 - spacing.lg / 1.5 },
            ]}
          ></View>
          {containerInfoAffiche ? infos(excursion, navigation, setIsAllSignalements, userLocation, isLoading) : avis()}
        </View>
      </View>
    )
  }
}

function afficherDescriptionCourte(description: string) {
  if (description == null) {
    return null
  } else {
    const descriptionCoupe = description.slice(0, 100)
    const descriptionFinale = descriptionCoupe + "..."
    return descriptionFinale
  }
}


function getUserLocation() {
  return new Promise(async (resolve, reject) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        resolve(null);
      }

      let location = await Location.getCurrentPositionAsync({}); // Use the getCurrentPositionAsync function from Location
      resolve(location.coords);
    } catch (error) {
      console.error('Error getting location', error);
      reject(error);
    }
  });
}

/**
 *
 * @param isLoading
 * @returns les informations de l'excursion
 */


function listeSignalements(setIsAllSignalements, excursion, userLocation) {
  return (
    <View style={$containerGrand}>
      <View style={$listeSignalements}>
        <ScrollView>
          <TouchableWithoutFeedback>
            <View>
              {excursion?.signalements?.map((signalement, index) => {
                // Calcule de la distance pour chaque avertissement
                const coordSignalement = { latitude: signalement.latitude, longitude: signalement.longitude };
                const distanceSignalement = userLocation ? recupDistance(coordSignalement) : 0;

                if (signalement.type == "Avertissement")
                  return (
                    <View key={index}>
                      <CarteSignalement type="avertissement" details={true} nomSignalement={signalement.nom} distanceDuDepart={`${distanceSignalement}`} description={signalement.description} />
                    </View>
                  );
                else {
                  return (
                    <View key={index}>
                      <CarteSignalement type="pointInteret" details={true} nomSignalement={signalement.nom} distanceDuDepart={`${distanceSignalement}`} description={signalement.description} />
                    </View>
                  );
                }
              })}

            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        <View style={$sortirDetailSignalement}>
          <Button tx="detailEscursion.bouttonRetourInformations" onPress={() => setIsAllSignalements(false)} />
        </View>
      </View>
    </View>
  );
}

/**
 *
 * @param isLoading
 * @returns les informations de l'excursion
 */


function infos(excursion: Record<string, unknown>, navigation: any, setIsAllSignalements, userLocation, isLoading) {
  const data = JSON.parse(JSON.stringify(require("./../../assets/JSON/exemple.json")));
  var duree = ""
  var distance = ""
  var difficulteOrientation = 0
  var difficulteTechnique = 0
  var description = ""
  var signalements = []
  if (
    excursion.duree !== undefined ||
    excursion.distance !== undefined ||
    excursion.difficulteOrientation !== undefined ||
    excursion.difficulteTechnique !== undefined ||
    excursion.description !== undefined ||
    excursion.signalements != undefined
  ) {
    duree = excursion.duree.h + "h"
    if (excursion.duree.m !== 0) {
      duree = duree + excursion.duree.m
    }
    distance = excursion.distance
    difficulteTechnique = excursion.difficulteTechnique
    difficulteOrientation = excursion.difficulteOrientation
    description = excursion.description
    signalements = excursion.signalements
  }



  return (
    <ScrollView>
      <TouchableWithoutFeedback>
        <View style={$stylePage}>
          <View style={$containerInformations}>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/temps.png")}
              />
              <Text text={duree} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/explorer.png")}
              />
              <Text text={distance + ' km'} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/difficulteTechnique.png")}
              />
              <Text text={difficulteTechnique.toString()} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/difficulteOrientation.png")}
              />
              <Text text={difficulteOrientation.toString()} size="xs" />
            </View>
          </View>
          <View style={$containerDescriptionEtSignalements}>
            <Text text="Description" size="lg" />
            <Text text="Pourquoi les marmottes ne jouent-elles jamais aux cartes avec les blaireaux ? Parce qu'elles ont trop peur qu'elles 'marmottent' les règles !" size="xxs" />
          </View>
          <View style={$containerDescriptionEtSignalements}>
            <View>
              {signalements?.length > 0 && (
                <Text tx="detailEscursion.signalements" size="lg" />
              )}
            </View>
            <ScrollView horizontal>
              <TouchableWithoutFeedback>
                <View style={$scrollLine}>
                  {signalements?.map((signalement, index) => {
                    // Calcule de la distance pour chaque avertissement
                    const coordSignalement = { latitude: signalement.latitude, longitude: signalement.longitude };
                    const distanceSignalement = userLocation ? recupDistance(coordSignalement) : 0;

                    if (signalement.type == "Avertissement")
                      return (
                        <View key={index}>
                          <TouchableOpacity onPress={() => setIsAllSignalements(true)}>
                            <CarteSignalement type="avertissement" details={false} nomSignalement={signalement.nom} distanceDuDepart={`${distanceSignalement}`} />
                          </TouchableOpacity>
                        </View>
                      );
                    else {
                      return (
                        <View key={index}>
                          <TouchableOpacity onPress={() => setIsAllSignalements(true)}>
                            <CarteSignalement type="pointInteret" details={false} nomSignalement={signalement.nom} distanceDuDepart={`${distanceSignalement}`} />
                          </TouchableOpacity>
                        </View>
                      );
                    }
                  })}
                  {signalements?.length > 0 ? (
                    <TouchableOpacity onPress={() => setIsAllSignalements(true)}>
                      <View style={$carteGlobale}>
                        <Text tx="detailEscursion.voirDetails" style={$tousLesSignalements} />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View></View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
          <View style={$containerDenivele}>
            <Text text="Dénivelé" size="lg" />
            {
              isLoading ? <ActivityIndicator size="large" color={colors.bouton} /> : <GraphiqueDenivele data={data} />
            }
          </View >
        </View >
      </TouchableWithoutFeedback >
    </ScrollView >
  )
}

/**
 * @returns les avis de l'excursion
 */
function avis() {
  return (
    <ScrollView style={$containerAvis}>
      <TouchableWithoutFeedback>
        <View>
          <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
          <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
          <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
          <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

// Fonction de calcul de distance entre deux coordonnées
function calculeDistanceEntreDeuxPoints(coord1, coord2) {
  // Assurez-vous que coord1 et coord2 sont définis
  if (!coord1 || typeof coord1.latitude === 'undefined' || typeof coord1.longitude === 'undefined' || !coord2 || typeof coord2.lat === 'undefined' || typeof coord2.lon === 'undefined') {
    console.error('Coordonnées non valides');
    return null;
  }

  // Rayon moyen de la Terre en kilomètres
  const R = 6371;

  // Convertir les degrés en radians
  const toRadians = (degree) => degree * (Math.PI / 180);

  // Calcul des distances
  const dLat = toRadians(coord2.lat - coord1.latitude);
  const dLon = toRadians(coord2.lon - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
    Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance en kilomètres
  const distance = R * c;

  return distance;
}

//Fonction me permettant de récupérer la distance entre l'utilisateur et le signalement en passant par les points du tracé
function recupDistance(coordonneeSignalement) {
  // Charger le fichier JSON avec les coordonnées
  const data = require('../../assets/JSON/exemple_cruz_del_guardia.json');

  // Assurez-vous que les coordonnées du signalement sont définies
  if (!coordonneeSignalement || !coordonneeSignalement.latitude || !coordonneeSignalement.longitude) {
    console.error('Coordonnées du signalement non valides');
    return null;
  }

  // Initialiser la distance minimale avec une valeur élevée
  let distanceMinimale = Number.MAX_VALUE;

  var coordPointPlusProche;

  // Parcourir toutes les coordonnées dans le fichier
  for (const coord of data) {
    // Assurez-vous que les coordonnées dans le fichier sont définies
    if (!coord.lat || !coord.lon) {
      console.error('Coordonnées dans le fichier non valides');
      continue;
    }

    // Calculer la distance entre le signalement et la coordonnée actuelle du fichier
    const distanceSignalementPointLePlusProche = calculeDistanceEntreDeuxPoints(coordonneeSignalement, coord);

    // Mettre à jour la distance minimale si la distance actuelle est plus petite
    if (distanceSignalementPointLePlusProche < distanceMinimale) {
      distanceMinimale = distanceSignalementPointLePlusProche;
      coordPointPlusProche = coord;
    }
  }

  const distanceDepartPointLePlusProche = (coordPointPlusProche.dist / 1000).toFixed(2);

  //Distance totale DANS UN MONDE PARFAIT
  // const distanceTotale = distanceMinimale + distanceDepartPointLePlusProche;
  // return distanceTotale;
  return distanceDepartPointLePlusProche;
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const $stylePage: ViewStyle = {
  paddingRight: spacing.xl,
  paddingLeft: spacing.xl,
}

const $boutonRetour: ViewStyle = {
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.sm,
  margin: spacing.lg,
  width: 50,
  position: "absolute",
  top: 15,
  zIndex: 1,
}

const $container: ViewStyle = {
  flex: 1,
  width: width,
  height: height,
  backgroundColor: colors.erreur,
}

//Style de itemMini

const $containerPetit: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.xxs,
}

//Style de itemFull

const $containerGrand: ViewStyle = {
  flex: 1,
  alignItems: "center",
  width: width,
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.xs,
  paddingBottom: 250,
}

//Style du container du titre et du bouton de téléchargement

const $containerTitre: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: width - width / 5,
  margin: spacing.lg,
}

const $titre: ViewStyle = {
  marginTop: spacing.xs,
  paddingRight: spacing.xl,
}

//Style du container des boutons infos et avis

const $containerBouton: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  width: width,
}

const $boutonInfoAvis: ViewStyle = {
  paddingLeft: spacing.xxl,
  paddingRight: spacing.xxl,
}

const $souligneInfosAvis: ViewStyle = {
  backgroundColor: colors.bouton,
  height: 2,
  width: width / 2.5,
  position: "relative",
}

//Style des informations

const $containerInformations: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingTop: spacing.xl,
  paddingBottom: spacing.xl
}

const $containerUneInformation: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $iconInformation: ImageStyle = {
  width: spacing.lg,
  height: spacing.lg,
  marginRight: spacing.xs,
}

//Style de la description et des signalements
const $containerDescriptionEtSignalements: ViewStyle = {
  paddingBottom: spacing.xl
}

const $lienDescription: TextStyle = {
  color: colors.bouton,
  paddingTop: spacing.xs,
  textDecorationLine: "underline",
}

const $containerAvis: ViewStyle = {
  height: 200,
}

const $containerDenivele: ViewStyle = {
  marginBottom: 100 //pour pouvoir afficher le graphique
}

/* --------------------------------- ERREUR --------------------------------- */

const $containerErreur: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  width: width,
  height: height,
  padding: spacing.lg,
}

const $texteErreur: TextStyle = {
  marginTop: spacing.lg,
  marginBottom: height / 2,
}

const $tousLesSignalements: TextStyle = {
  fontSize: spacing.md,
  justifyContent: "space-between",
  color: colors.souligne,
}
const $listeSignalements: ViewStyle = {
  marginTop: spacing.lg,
  height: "115%", //Si je met a 100% il descend pas jusqu'en bas voir avec reio prod
  width: "95%"
}

const $scrollLine: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $carteGlobale: ViewStyle = {
  padding: spacing.sm,
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
}

const $sortirDetailSignalement: ViewStyle = {
  justifyContent: "center",
  marginBottom: spacing.xl,
}

