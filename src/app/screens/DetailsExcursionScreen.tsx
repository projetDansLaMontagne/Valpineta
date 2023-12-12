import React, { FC, useEffect, useRef, useState } from "react";
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
}

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {

    let nomExcursion = "";
    let temps = 0;
    let distance = 0;
    let difficulteParcours = 0;
    let difficulteOrientation = 0;
    let signalements = [];
    let navigation = props.navigation;


    if (props.route.params) {
      const routeParams = props.route.params as {
        nomExcursion?: string;
        temps?: number;
        distance?: number;
        difficulteParcours?: number;
        difficulteOrientation?: number;
        signalements?: any[];
      };

      nomExcursion = routeParams.nomExcursion || "";
      temps = routeParams.temps || 0;
      distance = routeParams.distance || 0;
      difficulteParcours = routeParams.difficulteParcours || 0;
      difficulteOrientation = routeParams.difficulteOrientation || 0;
      signalements = routeParams.signalements || [];
    }

    const [isAllSignalements, setisAllSignalements] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    return (
      <SafeAreaView style={$container}>
        <TouchableOpacity
          style={$boutonRetour}
          onPress={() => {
            navigation.navigate("Excursions");
            setisAllSignalements(false)
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
          disableSwipeIcon={true}
          itemFull={itemFull(isLoading, setIsLoading, nomExcursion, temps, distance, difficulteParcours, difficulteOrientation, signalements, isAllSignalements, setisAllSignalements)}
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

    function itemFull(isLoading: boolean, setIsLoading: any, nomExcursion, temps, distance, difficulteParcours, difficulteOrientation, signalements, isAllSignalements, setisAllSignalements) {
      /**
       * @returns le composant complet des informations, autrement dit lorsque l'on swipe vers le haut
       */

      const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true);

      //Lance le chrono pour le chargement du graphique de dénivelé
      const chrono = () => {
        setTimeout(() => {
          setIsLoading(false)
        }
          , 1000);
      }

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
        <View style={$containerGrand}>
          <Image
            source={require("../../assets/icons/swipe-up.png")}
          />
          {isAllSignalements ? listeSignalements(setisAllSignalements, signalements) : infosGenerales(nomExcursion, temps, distance, difficulteParcours, difficulteOrientation, setisAllSignalements, signalements, containerInfoAffiche, setcontainerInfoAffiche)}

        </View >
      )

    }

    function infosGenerales(nomExcursion, temps, distance, difficulteParcours, difficulteOrientation, setisAllSignalements, signalements, containerInfoAffiche, setcontainerInfoAffiche) {

      return (
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
            {containerInfoAffiche ? infos(isLoading, temps, distance, difficulteParcours, difficulteOrientation, setisAllSignalements, signalements) : avis()}
          </View >
        </View >
      )
    }

    function listeSignalements(setisAllSignalements, signalements) {
      const [userLocation, setUserLocation] = useState(null);

      useEffect(() => {
        const fetchLocation = async () => {
          const location = await getUserLocation();
          setUserLocation(location);
        };

        fetchLocation();
      }, []);

      return (
        <View style={$listeSignalements}>
          <ScrollView>
            <TouchableWithoutFeedback>
              <View>
                {signalements?.avertissements?.map((avertissement, index) => {
                  var coordSignalement = { latitude: avertissement.coordonnees.latitude, longitude: avertissement.coordonnees.longitude };
                  //Pour le moment je calcule juste le signalement par rapport a un track et pas par rapport a la pos GPS
                  //Calcule la distance entre l'avertissement le plus proche et le signalement
                  const distanceAvertissement = userLocation ? recupDistance(coordSignalement) : 0;

                  return (
                    <View key={index}>
                      <CarteSignalement type="avertissement" details={true} nomSignalement={avertissement.nom_signalement} description={avertissement.description} coordonnes={distanceAvertissement.toFixed(2)} imageSignalement={avertissement.image} />
                    </View>
                  );
                })}
                {signalements?.pointsInteret?.map((pointInteret, index) => {
                  var coordPointInteret = { latitude: pointInteret.coordonnees.latitude, longitude: pointInteret.coordonnees.longitude };
                  const distancePointInteret = userLocation ? recupDistance(coordPointInteret) : 0;

                  return (
                    <View key={index}>
                      <CarteSignalement type="pointInteret" details={true} nomSignalement={pointInteret.nom_signalement} description={pointInteret.description} coordonnes={distancePointInteret.toFixed(2)} imageSignalement={pointInteret.image} />
                    </View>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
          <View style={$sortirDetailSignalement}>
            <Button text="Revenir aux informations" onPress={() => setisAllSignalements(false)} />
          </View>
        </View>
      );
    }



    /**
     *
     * @param isLoading
     * @returns les informations de l'excursion
     */
    function infos(isLoading: boolean, temps: number, distance: number, difficulteParcours: number, difficulteOrientation: number, setisAllSignalements, signalements) {
      const data = JSON.parse(JSON.stringify(require("./../../assets/JSON/exemple.json")));
      const [userLocation, setUserLocation] = useState(null);

      useEffect(() => {
        const fetchLocation = async () => {
          const location = await getUserLocation();
          setUserLocation(location);
        };

        fetchLocation();
      }, []);

      return (
        <ScrollView>
          <TouchableWithoutFeedback>
            <View>
              <View style={$containerInformations}>
                <View style={$containerUneInformation}>
                  <Image style={$iconInformation}
                    source={require("../../assets/icons/temps.png")}
                  />
                  <Text text={temps.toString()} size="xs" />
                </View>
                <View style={$containerUneInformation}>
                  <Image style={$iconInformation}
                    source={require("../../assets/icons/explorer.png")}
                  />
                  <Text text={distance + ' km'} size="xs" />
                </View>
                <View style={$containerUneInformation}>
                  <Image style={$iconInformation}
                    source={require("../../assets/icons/difficulteParcours.png")}
                  />
                  <Text text={difficulteParcours.toString()} size="xs" />
                </View>
                <View style={$containerUneInformation}>
                  <Image style={$iconInformation}
                    source={require("../../assets/icons/difficulteOrientation.png")}
                  />
                  <Text text={difficulteOrientation.toString()} size="xs" />
                </View>
              </View>
              <View style={$containerDescriptionSignalement}>
                <View>
                  <Text text="Description" size="lg" />
                  <Text style={$textDescription} text="Pourquoi les marmottes ne jouent-elles jamais aux cartes avec les blaireaux ? Parce qu'elles ont trop peur qu'elles 'marmottent' les règles !" size="xxs" />
                </View>

                <View>
                  {signalements?.avertissements?.length > 0 && signalements?.pointsInteret?.length > 0 ? (
                    <View>
                      <Text text="Signalements" size="lg" />
                    </View>
                  ) : (
                    <View>
                      {signalements?.avertissements?.length == 0 && signalements?.pointsInteret?.length > 0 ? (
                        <View>
                          <Text text="Points d'interets" size="lg" />
                        </View>
                      ) : (
                        <View>
                          {signalements?.avertissements?.length > 0 && signalements?.pointsInteret?.length == 0 ? (
                            <View>
                              <Text text="Avertissements" size="lg" />
                            </View>
                          ) : (
                            <View>
                              <Text text="Aucun signalement" size="lg" />
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                  <View>
                    <ScrollView horizontal>
                      <TouchableWithoutFeedback>
                        <View style={$scrollLine}>
                          {signalements?.avertissements?.map((avertissement, index) => {
                            // Calcule de la distance pour chaque avertissement
                            const coordSignalement = { latitude: avertissement.coordonnees.latitude, longitude: avertissement.coordonnees.longitude };
                            const distanceAvertissement = userLocation ? recupDistance(coordSignalement) : 0;

                            return (
                              <View key={index}>
                                <TouchableOpacity onPress={() => setisAllSignalements(true)}>
                                  <CarteSignalement type="avertissement" details={false} nomSignalement={avertissement.nom_signalement} coordonnes={`${distanceAvertissement.toFixed(2)}`} />
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                          {signalements?.pointsInteret?.map((pointInteret, index) => {
                            // Calcule de la distance pour chaque point d'intérêt
                            const coordPointInteret = { latitude: pointInteret.coordonnees.latitude, longitude: pointInteret.coordonnees.longitude };
                            const distancePointInteret = userLocation ? recupDistance(coordPointInteret) : 0;

                            return (
                              <View key={index}>
                                <TouchableOpacity onPress={() => setisAllSignalements(true)}>
                                  <CarteSignalement type="pointInteret" details={false} nomSignalement={pointInteret.nom_signalement} coordonnes={`${distancePointInteret.toFixed(2)}`} />
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                          {signalements?.avertissements?.length > 0 || signalements?.pointsInteret?.length > 0 ? (
                            <TouchableOpacity onPress={() => setisAllSignalements(true)}>
                              <View style={$carteGlobale}>
                                <Text text="Voir détails" size="sm" style={$tousLesSignalements} />
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <View></View>
                          )}
                        </View>
                      </TouchableWithoutFeedback>
                    </ScrollView>
                  </View>

                </View>
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
      if (!coord1 || !coord1.latitude || !coord1.longitude || !coord2 || !coord2.lat || !coord2.long) {
        console.error('Coordonnées non valides');
        return null;
      }

      // Rayon moyen de la Terre en kilomètres
      const R = 6371;

      // Convertir les degrés en radians
      const toRadians = (degree) => degree * (Math.PI / 180);

      // Calcul des distances
      const dLat = toRadians(coord2.lat - coord1.latitude);
      const dLon = toRadians(coord2.long - coord1.longitude);

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
      const data = require('../../assets/jsons/uneExcursion.json');

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
        if (!coord.lat || !coord.long) {
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

      const distanceDepartPointLePlusProche = coordPointPlusProche.dist / 1000

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
  padding: spacing.xl,
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

const $containerDescriptionSignalement: ViewStyle = {
  justifyContent: "space-around",
  paddingLeft: spacing.xl,
  paddingRight: spacing.xl,
}

const $textDescription: TextStyle = {
  width: "100%",
  paddingRight: spacing.xl,
  paddingBottom: spacing.xl
}

const $containerAvis: ViewStyle = {
  height: 200,
}

const $containerDenivele: ViewStyle = {
  padding: spacing.lg,
}

const $tousLesSignalements: TextStyle = {
  justifyContent: "space-between",
  paddingLeft: spacing.xl,
  paddingRight: spacing.xl,
  color: colors.souligne,
}
const $listeSignalements: ViewStyle = {
  height: "115%", //Si je met a 100% il descend pas jusqu'en bas voir avec reio prod
  width: "95%"
}

const $scrollLine: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.xs,
}

const $carteGlobale: ViewStyle = {
  padding: 13,
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
