
import React, { FC, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { View, SafeAreaView, ViewStyle, TouchableOpacity, Image, TextStyle, ImageStyle, ScrollView, TouchableWithoutFeedback, Dimensions, ActivityIndicator } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Text, CarteAvis, GraphiqueDenivele, GpxDownloader, Button } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { CarteSignalement } from "app/components/CarteSignalement";
import * as Location from 'expo-location';

const { width, height } = Dimensions.get("window");
interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {
  temps: Record<'h' | 'm', number>,
  distance: number,
  difficulteTechnique: number,
  difficulteOrientation: number,
  signalements: any,
  nomExcursion: string,
}

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {
    console.log("DetailsExcursionScreen");
    var navigation;
    var excursion;
    var nomExcursion;
    var temps;
    var distance;
    var difficulteTechnique;
    var difficulteOrientation;
    var signalements;
    if (
      props?.route?.params ||
      props?.route?.params?.excursion ||
      props?.route?.params?.excursion?.nom ||
      props?.route?.params?.excursion?.duree ||
      props?.route?.params?.excursion?.distance ||
      props?.route?.params?.excursion?.difficulteTechnique ||
      props?.route?.params?.excursion?.difficulteOrientation ||
      props?.route?.params?.excursion?.signalements
    ) {
      navigation = props.navigation;
      excursion = props.route.params.excursion;
      nomExcursion = excursion.nom;
      temps = excursion.duree;
      distance = excursion.distance;
      difficulteTechnique = excursion.difficulteTechnique;
      difficulteOrientation = excursion.difficulteOrientation;
      signalements = excursion.signalements;
      // console.log(nomExcursion, temps, distance, difficulteTechnique, difficulteOrientation, signalements, "if")
      // console.log(excursion, "excursion")
    }
    else if (
      props?.route?.params?.nom ||
      props?.route?.params?.duree ||
      props?.route?.params?.distance ||
      props?.route?.params?.difficulteTechnique ||
      props?.route?.params?.difficulteOrientation ||
      props?.route?.params?.signalements
    ) {

      navigation = props.navigation;
      nomExcursion = excursion.nom;
      temps = excursion.duree;
      distance = excursion.distance;
      difficulteTechnique = excursion.difficulteTechnique;
      difficulteOrientation = excursion.difficulteOrientation;
      signalements = excursion.signalements;
      // console.log(nomExcursion, temps, distance, difficulteTechnique, difficulteOrientation, signalements, "else if")
    }
    else {
      // console.log(props?.route?.params?.excursion);
      throw new Error("Mauvais parametres");
    }


    // var nomExcursion = props.route.params.nomExcursion;
    // var temps = props.route.params.duree
    // var distance = props.route.params.distance
    // var difficulteTechnique = props.route.params.difficulteTechnique
    // var difficulteOrientation = props.route.params.difficulteOrientation
    // var signalements = props.route.params.signalements

    //Lance le chrono pour le chargement du graphique de dénivelé
    const chrono = () => {
      setTimeout(() => {
        setIsLoading(false)
      }
        , 1000);
    }

    const [isAllSignalements, setIsAllSignalements] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
      const fetchLocation = async () => {
        const location = await getUserLocation();
        setUserLocation(location);
      };

      fetchLocation();
    }, []);

    //Observateur de l'état du containerInfoAffiche
    useEffect(() => {
      if (containerInfoAffiche) {
        chrono();
      }
    }, [containerInfoAffiche]);

    //Observateur de l'état du containerInfoAffiche
    useEffect(() => {
      if (isLoading) {
        chrono();
      }
    }, [isLoading]);


    return (
      <SafeAreaView style={$container}>
        <TouchableOpacity
          style={$boutonRetour}
          onPress={() => {
            navigation.navigate("Excursions");
            setIsAllSignalements(false)
          }
          }
        >
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
        <SwipeUpDown
          itemMini={itemMini()}
          itemFull={itemFull(isLoading, setIsLoading, nomExcursion, temps, distance, difficulteTechnique, difficulteOrientation, signalements, isAllSignalements, setIsAllSignalements)}
          onShowFull={() => setIsLoading(true)}
          onShowMini={() => setIsLoading(false)}
          animation="easeInEaseOut"
          extraMarginTop={125}
          swipeHeight={100}
        />
      </SafeAreaView>
    );

    // Fonction pour récupérer la localisation de l'utilisateur
    function getUserLocation() {
      return new Promise(async (resolve, reject) => {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.error('Permission to access location was denied');
            resolve(null);
          }

          let location = await Location.getCurrentPositionAsync({});
          resolve(location.coords);
        } catch (error) {
          console.error('Error getting location', error);
          reject(error);
        }
      });
    }

    /**
     *
     * @returns le composant réduit des informations, autremeent dit lorsque l'on swipe vers le bas
     */
    function itemMini() {
      return (
        <View style={$containerPetit}>
          <Image
            source={require("../../assets/icons/swipe-up.png")}
          />
        </View>
      )
    }

    function itemFull(isLoading: boolean, setIsLoading: any, nomExcursion, temps, distance, difficulteTechnique, difficulteOrientation, signalements, isAllSignalements, setIsAllSignalements) {

      if (isAllSignalements) {
        return listeSignalements(setIsAllSignalements, signalements);
      }
      else {
        return (
          <View style={$containerGrand}>
            {
              <View>
                <View style={$containerTitre}>
                  <Text text={nomExcursion} size="xl" style={$titre} />
                  <GpxDownloader />
                </View>
                <View>
                  <View style={$containerBouton}>
                    <TouchableOpacity onPress={() => {
                      //lancement du chrono pour le loading
                      setIsLoading(true),
                        isLoading ? chrono() : null
                      setcontainerInfoAffiche(true)
                    }} style={$boutonInfoAvis} >
                      <Text text="Infos" size="lg" style={[containerInfoAffiche ? { color: colors.bouton } : { color: colors.text }]} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      //Loading à false pour pouvoir relancer le chrono
                      setIsLoading(true)
                      setcontainerInfoAffiche(false)
                    }} style={$boutonInfoAvis}>
                      <Text text="Avis" size="lg" style={[containerInfoAffiche ? { color: colors.text } : { color: colors.bouton }]} />
                    </TouchableOpacity>
                  </View>
                  <View style={[$souligneInfosAvis, containerInfoAffiche ? { left: spacing.lg } : { left: width - width / 2.5 - spacing.lg / 1.5 }]}>
                  </View>
                  {containerInfoAffiche ? infos(isLoading, temps, distance, difficulteTechnique, difficulteOrientation, setIsAllSignalements, signalements) : avis()}
                </View>
              </View >
            }
          </View>
        );
      }
    }

    function listeSignalements(setIsAllSignalements, signalements) {
      return (
        <View style={$containerGrand}>
          <View style={$listeSignalements}>
            <ScrollView>
              <TouchableWithoutFeedback>
                <View>
                  {signalements?.map((signalement, index) => {
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
    function infos(isLoading: boolean, temps, distance: number, difficulteTechnique: number, difficulteOrientation: number, setIsAllSignalements, signalements) {
      const data = JSON.parse(JSON.stringify(require("./../../assets/JSON/exemple.json")));
      return (
        <ScrollView>
          <TouchableWithoutFeedback>
            <View style={$stylePage}>
              <View style={$containerInformations}>
                <View style={$containerUneInformation}>
                  <Image style={$iconInformation}
                    source={require("../../assets/icons/temps.png")}
                  />
                  <Text text={temps.h + "h" + temps.m} size="xs" />
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
  }
);

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
  width: width - (width / 5),
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

const $containerAvis: ViewStyle = {
  height: 200,
}

const $containerDenivele: ViewStyle = {
  paddingBottom: spacing.xl,
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

