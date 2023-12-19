import React, { FC, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { View, SafeAreaView, ViewStyle, TouchableOpacity, Image, TextStyle, ImageStyle, ScrollView, TouchableWithoutFeedback, Dimensions, ActivityIndicator } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Text, CarteAvis, GraphiqueDenivele, GpxDownloader } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import {MapScreen} from "./MapScreen";
import {Marker, Polyline} from "react-native-maps";

const { width, height } = Dimensions.get("window");

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {
  temps: Record<'h' | 'm', number>,
}

export type T_Point = {
  lon: number,
  lat: number,
  alt: number | null,
  dist: number,
}

type T_Track = {
  points: T_Point[],
  typeParcours: "Ida y Vuelta" | "Circular" | "Ida"
}
/**
 * @function getExcursionTrack
 * @description Récupère le fichier gpx de l'excursion afin de l'afficher sur la carte.
 * @param nomExcursion
 * @returns le fichier gpx de l'excursion
 */
const getExcursionTrack: (nomFichier) => Promise<T_Track> = async (nomExcursion: string) => {
  // les fichiers sont stockés dans le dossier assets/tracks
  // ! TO REMOVE BEFORE PRODUCTION - name is hardcoded
  return {
    points: await require(`../../assets/tracks/caminokique.json`),
    typeParcours: "Ida y Vuelta"
  } as T_Track;
  // ! TO REMOVE BEFORE PRODUCTION - hardcoded
}

const startMiddleAndEndHandler = (track: T_Track) => {
  console.log(JSON.stringify(track));

  let points: T_Point[] = [];

  let end = track.points[track.points.length - 1];

  const middleDistance = Math.round(end.dist / 2);
  const middle = track.points.find((point) => point.dist >= middleDistance);

  points.push(track.points[0]);
  points.push(middle);

  if (track.typeParcours === "Ida") {
    // Point d'arrivée
    points.push(end);
  }


  return (
    <>
      {
        points.map((point, index) => {
          return (
            <Marker
              coordinate={{
                latitude: point.lat,
                longitude: point.lon
              }}
              key={point.dist}

              pinColor={index === 1 ? colors.bouton : colors.text}

              style={{
                zIndex: 999,
              }}
            />
          )
        })
      }
    </>
  )
}

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {

    let nomExcursion = "";
    let temps = { h: 0, m: 0 };
    let distance = 0;
    let difficulteParcours = 0;
    let difficulteOrientation = 0;


    let navigation = props.navigation;

    if (props.route.params !== undefined) {
      nomExcursion = props.route.params.nomExcursion
      temps = props.route.params.temps
      distance = props.route.params.distance
      difficulteParcours = props.route.params.difficulteParcours
      difficulteOrientation = props.route.params.difficulteOrientation
    }

    const [isLoading, setIsLoading] = useState(true);

    const [startPoint, setStartPoint] = useState<T_Point | null>(null);
    const [allPoints, setAllPoints] = useState<T_Point[] | null>(null);
    useEffect(() => {
      console.log(`[DetailsExcursionScreen] useEffect: ${nomExcursion}`);

      getExcursionTrack(nomExcursion)
        .then((response) => {
          console.log(`[DetailsExcursionScreen] useEffect: ${nomExcursion} - POINTS OK`);
          setAllPoints(response.points);

          setTimeout(() => {
            console.log(`[DetailsExcursionScreen] useEffect: ${nomExcursion} - START POINT OK`);
            setStartPoint(response.points[0]);
          }, 5000)
        })
        .catch((error) => {
          console.log(`[DetailsExcursionScreen] useEffect: ${nomExcursion} - error: ${error}`);
        });
    }, []);

    return (
      <SafeAreaView style={$container}>
        <TouchableOpacity
          style={$boutonRetour}
          onPress={() => navigation.navigate("Excursions")}
        >
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>

        <MapScreen
          startLocation={startPoint}
        >
          {/*{*/}
          {/*  allPoints &&*/}
          {/*  allPoints.map((point, index) => {*/}
          {/*    return (*/}
          {/*      <Marker*/}
          {/*        coordinate={{*/}
          {/*          latitude: point.lat,*/}
          {/*          longitude: point.lon*/}
          {/*        }}*/}

          {/*        tappable={false}*/}

          {/*        key={index}*/}
          {/*        style={{*/}
          {/*          zIndex: 999,*/}
          {/*        }}*/}
          {/*      />*/}
          {/*    )*/}
          {/*  })*/}
          {/*}*/}

          {
            allPoints &&
            <>
              <Polyline
                coordinates={
                  allPoints.map((point) => {
                    return {
                      latitude: point.lat,
                      longitude: point.lon,
                    }
                  })
                }
                strokeColor={colors.bouton}
                strokeWidth={10}
              />

              {
                startMiddleAndEndHandler({
                  points: allPoints,
                  typeParcours: "Ida y Vuelta"
                } as T_Track)
              }
            </>
          }



        </MapScreen>

        <SwipeUpDown
          itemMini={itemMini()}
          itemFull={itemFull(isLoading, setIsLoading, nomExcursion, temps, distance, difficulteParcours, difficulteOrientation)}
          onShowFull={() => setIsLoading(true)}
          onShowMini={() => setIsLoading(false)}
          animation="easeInEaseOut"
          extraMarginTop={125}
          swipeHeight={100}
        />
      </SafeAreaView>
    );
  }
);

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

/**
 * @returns le composant complet des informations, autrement dit lorsque l'on swipe vers le haut
 */
function itemFull(isLoading: boolean, setIsLoading: any, nomExcursion, temps, distance, difficulteParcours, difficulteOrientation) {

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
        {containerInfoAffiche ? infos(isLoading, temps, distance, difficulteParcours, difficulteOrientation) : avis()}
      </View>
    </View >
  )
}

/**
 *
 * @param isLoading
 * @returns les informations de l'excursion
 */
function infos(isLoading: boolean, temps, distance: number, difficulteParcours: number, difficulteOrientation: number) {

  const data = JSON.parse(JSON.stringify(require("./../../assets/JSON/exemple.json")));

  return (
    <ScrollView>
      <TouchableWithoutFeedback>
        <View>
          <View style={$containerInformations}>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/temps.png")}
              >
              </Image>
              <Text text={temps.h + "h" + temps.m} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/explorer.png")}
              >
              </Image>
              <Text text={distance + ' km'} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/difficulteParcours.png")}
              >
              </Image>
              <Text text={difficulteParcours} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/difficulteOrientation.png")}
              >
              </Image>
              <Text text={difficulteOrientation} size="xs" />
            </View>
          </View>
          <View style={$containerDescriptionSignalements}>
            <View>
              <Text text="Description" size="lg" />
              <Text style={$textDescription} text="Pourquoi les marmottes ne jouent-elles jamais aux cartes avec les blaireaux ? Parce qu'elles ont trop peur qu'elles 'marmottent' les règles !" size="xxs" />
            </View>
            <View>
              <Text text="Signalement" size="lg" />
              <Text text="signalement" size="xs" />
            </View>
          </View>
          <View style={$containerDenivele}>
            <Text text="Dénivelé" size="xl" />
            {
              isLoading ? <ActivityIndicator size="large" color={colors.bouton} /> : <GraphiqueDenivele data={data} />
            }
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
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

  zIndex: 2,
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

//Style de la description et des signalements

const $containerDescriptionSignalements: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  paddingLeft: spacing.xl,
  paddingRight: spacing.xl,
}

const $textDescription: TextStyle = {
  width: width / 2,
  paddingRight: spacing.xl,
}

const $containerAvis: ViewStyle = {
  height: 200,
}

const $containerDenivele: ViewStyle = {
  padding: spacing.lg,
}
