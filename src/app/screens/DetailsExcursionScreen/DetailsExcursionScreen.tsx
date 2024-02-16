import React, { FC, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { View, ViewStyle, TouchableOpacity, Image, TextStyle, Dimensions } from "react-native";
import { AppStackScreenProps, TPoint, T_Signalement, T_excursion, T_flat_point } from "app/navigators";
import { GpxDownloader } from "./GpxDownloader";
import { Text, Erreur, Button } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { NativeStackNavigationProp } from "@react-navigation/native-stack/lib/typescript/src/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ListeSignalements } from "./ListeSignalements";
import { getUserLocation } from "app/utils/getUserLocation";
import { InfosExcursion } from "./InfosExcursion";
import { Avis } from "./Avis";
import { LatLng, Marker, Polyline } from "react-native-maps";
import { ImageSource } from "react-native-vector-icons/Icon";
import { MapScreen } from "app/screens/MapScreen";
import { SuiviTrack } from "./SuiviTrack";
import { distanceEntrePoints } from "app/utils/distanceEntrePoints";
import { PopupSignalement } from "./PopupSignalement";
import { ExcursionTerminee } from "./ExcursionTerminee";
import { useStores } from "app/models";

const { width, height } = Dimensions.get("window");

/**@warning types a mettre dans appNavigator */
export interface Coordonnees {
  lat: number;
  lon: number;
  alt: number;
  dist: number;
}
export interface T_Point extends TPoint {
  title?: string;
}
type T_Language = "fr" | "es";
type T_TypeParcoursEs = "Ida" | "Ida y Vuelta" | "Circular";
type T_TypeParcoursFr = "Aller simple" | "Aller-retour" | "Boucle";
type T_LanguageContent<T extends T_Language> = {
  nom: string;
  description: string;
  typeParcours: T extends "fr" ? T_TypeParcoursFr : T_TypeParcoursEs;
};

export type TExcursion = {
  [key in T_Language]: T_LanguageContent<key>;
} & {
  denivele: string;
  difficulteOrientation: string;
  difficulteTechnique: string;
  distance: string;
  duree: string;
  vallee: string;
  postId: number;
  signalements: T_Signalement[];
  nomTrackGpx: string;
  track: T_Point[];
};

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> { }
export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {
    const { route, navigation } = props;
    const { suiviExcursion } = useStores();
    const excursion = route.params?.excursion;
    const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true);
    const [isAllSignalements, setIsAllSignalements] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [startPoint, setStartPoint] = useState<LatLng>();
    const [isSuiviTrack, setIsSuiviTrack] = useState(false);
    const [estEntier, setEstEntier] = useState(false);
    const [modalSignalementVisible, setModalSignalementVisible] = useState(false);
    const [signalementPopup, setSignalementPopup] = useState(null);
    const [modalExcursionTermineeVisible, setModalExcursionTermineeVisible] = useState(false);

    const swipeUpDownRef = React.useRef<SwipeUpDown>(null);
    const footerHeight = useBottomTabBarHeight();
    const allPoints = excursion.track.map(
      (point: T_Point) =>
      ({
        latitude: point.lat,
        longitude: point.lon,
      } as LatLng),
    );

    // Ce useEffect permet de bouger sur le debut de l'excursion lors de son affichage.
    useEffect(() => {
      setStartPoint({
        latitude: excursion.track[0].lat,
        longitude: excursion.track[0].lon,
      } as LatLng);
    }, [excursion]);

    useEffect(() => {
      const fetchLocation = async () => {
        const location = await getUserLocation();
        setUserLocation(location);
      };

      fetchLocation();
    }, []);

    const swipeUpDown = () => {
      if (swipeUpDownRef) {
        swipeUpDownRef.current.showMini();
      } else {
        console.error("swipeUpDownRef.current is null");
      }
    };

    //utilser useEffect pour déclancher le popup lorsqu'on est a moins de 30 mètres d'un signalement
    useEffect(() => {
      const interval = setInterval(() => {
        if (userLocation) {
          const coordUser: T_flat_point = {
            lat: userLocation?.latitude,
            lon: userLocation?.longitude,
          };

          for (let i = 0; i < excursion.signalements.length; i++) {
            const coordSignalement: T_flat_point = {
              lat: excursion.signalements[i].lat,
              lon: excursion.signalements[i].lon,
            };

            const distance = distanceEntrePoints(coordUser, coordSignalement);
            if (distance < 0.03) {
              setModalSignalementVisible(true)
              setSignalementPopup(excursion.signalements[i])
            }
          }
        }
      }, 5000); // exécute toutes les 5 secondes (5000 millisecondes)

      return () => clearInterval(interval); // Nettoie l'intervalle
    }, []); // Utilisation d'une dépendance vide pour n'exécuter l'effet qu'une seule fois

    useEffect(() => {
      if (suiviExcursion.etat === "terminee") {
        setModalExcursionTermineeVisible(true)
      }
    }
      , [suiviExcursion.etat]);

    // si excursion est défini, on affiche les informations de l'excursion
    return excursion ? (
      <View style={$container}>

        {modalSignalementVisible && isSuiviTrack && (
          <PopupSignalement signalement={signalementPopup} modalSignalementVisible={modalSignalementVisible} setModalSignalementVisible={setModalSignalementVisible} estEntier={estEntier} setEstEntier={setEstEntier} />
        )}

        {modalExcursionTermineeVisible && isSuiviTrack && (
          <ExcursionTerminee navigation={navigation} modalExcursionTermineeVisible={modalExcursionTermineeVisible} setModalExcursionTermineeVisible={setModalExcursionTermineeVisible} />
        )}

        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
          <Image style={{ tintColor: colors.bouton }} source={require("assets/icons/back.png")} />
        </TouchableOpacity>

        {allPoints && startPoint && (
          /**@warning MapScreen doit etre transforme en composant, ce n est pas un screen */
          <MapScreen startLocation={startPoint} isInDetailExcursion={true} hideOverlay={false}>
            <Polyline coordinates={allPoints} strokeColor={colors.bouton} strokeWidth={5} />

            {startMiddleAndEndHandler(
              excursion.track,
              excursion.es.typeParcours as "Ida" | "Ida y Vuelta" | "Circular",
            )}

            {signalementsHandler(excursion.signalements)}
          </MapScreen>
        )}

        {isSuiviTrack ? (
          <SuiviTrack
            excursion={excursion}
            navigation={navigation}
            setStartPoint={setStartPoint}
          />
        ) : (
          <SwipeUpDown
            itemMini={itemMini()}
            itemFull={itemFull(
              excursion,
              navigation,
              containerInfoAffiche,
              setcontainerInfoAffiche,
              isAllSignalements,
              setIsAllSignalements,
              userLocation,
              footerHeight,
            )}
            animation="easeInEaseOut"
            swipeHeight={30 + footerHeight}
            disableSwipeIcon={true}
            ref={swipeUpDownRef}
          />)}
      </View>
    ) : (
      <Erreur navigation={navigation} />
    );

    /**
     * @returns le composant réduit des informations, autremeent dit lorsque l'on swipe vers le bas
     */
    function itemMini() {
      return (
        <View style={$containerPetit}>
          <Image source={require("assets/icons/swipe-up.png")} />
        </View>
      );
    }

    /**
     * @param excursion, navigation, containerInfoAffiche, setcontainerInfoAffiche, isAllSignalements, setIsAllSignalements, userLocation,
     * @returns le composant complet des informations, autrement dit lorsque l'on swipe vers le haut
     */
    function itemFull(
      excursion: T_excursion,
      navigation: NativeStackNavigationProp<any>,
      containerInfoAffiche: boolean,
      setcontainerInfoAffiche: React.Dispatch<any>,
      isAllSignalements: boolean,
      setIsAllSignalements: React.Dispatch<any>,
      userLocation: LatLng,
      footerHeight: number,
    ) {
      let nomExcursion = "";
      if (excursion !== undefined) {
        nomExcursion = excursion.nom as string;
      }
      if (isAllSignalements) {
        return (
          <ListeSignalements
            excursion={excursion}
            userLocation={userLocation}
            setIsAllSignalements={setIsAllSignalements}
            footerHeight={footerHeight}
            setStartPoint={setStartPoint}
            swipeDown={swipeUpDown}
            style={$containerGrand}
          />
        );
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
                    setcontainerInfoAffiche(true);
                  }}
                  style={$boutonInfoAvis}
                >
                  <Text
                    tx="detailsExcursion.titres.infos"
                    size="lg"
                    style={{ color: containerInfoAffiche ? colors.text : colors.bouton }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setcontainerInfoAffiche(false);
                  }}
                  style={$boutonInfoAvis}
                >
                  <Text
                    tx="detailsExcursion.titres.avis"
                    size="lg"
                    style={{ color: containerInfoAffiche ? colors.text : colors.bouton }}
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
              />
              <Button
                style={[$buttonCommencer, { bottom: 200 }]}
                textStyle={{ color: colors.palette.blanc, fontSize: 22, fontWeight: "bold", justifyContent: "center" }}
                text="Commencer"
                onPress={() => setIsSuiviTrack(!isSuiviTrack)}
              />
              {containerInfoAffiche ? (
                <InfosExcursion
                  excursion={excursion}
                  navigation={navigation}
                  setIsAllSignalements={setIsAllSignalements}
                  userLocation={userLocation}
                />
              ) : (
                <Avis />
              )}
            </View>
          </View>
        );
      }
    }
  },
);

/**
 * @function startMiddleAndEndHandler
 * @description Affiche les points de départ, milieu et fin de l'excursion en fonction du type de parcours.
 * Un parcours en boucle n'a pas de point d'arrivée.
 * Un parcours en aller-retour a un point d'arrivée.
 * Tous les parcours ont un point de départ et un point de milieu.
 *
 * @param track {T_Point[]} - le fichier gpx de l'excursion
 * @param typeParcours {"Ida" | "Ida y Vuelta" | "Circular"} - le type de parcours
 *
 * @returns les points de départ, milieu et fin de l'excursion
 */
const startMiddleAndEndHandler = (
  track: T_Point[],
  typeParcours: "Ida" | "Ida y Vuelta" | "Circular",
) => {
  // Point d'arrivée
  const start = {
    ...track[0],
    title: "Départ",
  };
  const end = {
    ...track[track.length - 1],
    title: "Arrivée",
  };
  let points: T_Point[];

  // Calcul du point du milieu
  // Si c'est un aller-retour, le parcours étant symétrique,
  // on prend le point à la moitié de la distance totale
  const middleDistance = end.dist / (typeParcours === "Ida y Vuelta" ? 1 : 2);

  const middle = {
    ...track
      .sort((a, b) => {
        return a.dist - b.dist;
      })
      .find(point => point.dist >= middleDistance),
    title: "Milieu",
  };
  // find prend le premier élément qui correspond à la condition, vu que c'est sorted, on a le bon point

  // À ce stade, on a les points d'arrivée et du milieu.
  switch (typeParcours) {
    case "Ida": // aller simple
      // Point de départ si c'est un aller simple
      points = [start, middle, end];
      break;
    case "Ida y Vuelta":
    case "Circular":
      // Point d'arrivée si c'est un aller-retour
      start.title = "Départ / Arrivée";

      points = [start, middle];
      break;
  }

  const image: ImageSource = require("assets/icons/location.png");

  return points.map((point, index) => {
    return (
      <Marker
        coordinate={{
          latitude: point.lat ?? 0,
          longitude: point.lon ?? 0,
        }}
        key={index}
        // Si l'array de points ne contient que 2 points,
        // on est sur un aller simple, le deuxième point est donc l'arrivée
        title={point.title}
        pinColor={index === 1 ? colors.bouton : colors.text}
        style={{
          zIndex: 999,
        }}
        centerOffset={{ x: 0, y: -15 }}
      >
        <Image
          source={image}
          style={{
            width: 30,
            height: 30,
            tintColor: index === 1 ? colors.bouton : colors.text,
          }}
        />
      </Marker>
    );
  });
};

/**
 * @function signalementsHandler
 * @description Affiche les signalements sur la carte.
 *
 * @param signalements {T_Signalement[]} - les signalements de l'excursion
 *
 * @returns les signalements à afficher sur la carte.
 */
const signalementsHandler = (signalements: T_Signalement[]) => {
  const binoculars: ImageSource = require("assets/icons/binoculars.png");
  const attention: ImageSource = require("assets/icons/attention.png");

  return (
    <>
      {signalements.map((signalement, index) => {
        /**
         * ! ATTENDRE PR DE NICO QUI A TYPÉ LES SIGNALEMENTS
         */
        let iconColor: string;
        let image: ImageSource;

        switch (signalement.type) {
          case "PointInteret":
            image = binoculars;
            break;
          case "Avertissement":
            image = attention;
            break;
          default:
            iconColor = "black";
            image = binoculars;
            break;
        }

        return (
          <Marker
            coordinate={{
              latitude: signalement.lat ?? 0,
              longitude: signalement.lon ?? 0,
            }}
            // key={point.dist}
            key={index}
            // Si l'array de points ne contient que 2 points,
            // on est sur un aller simple, le deuxième point est donc l'arrivée
            title={signalement.nom}
            // pinColor={iconColor}
            style={{
              zIndex: 999,
            }}
            centerOffset={{ x: 0, y: signalement.type === "PointInteret" ? 0 : -15 }}
          >
            <Image
              source={image}
              style={{
                width: 30,
                height: 30,
                tintColor: iconColor,
              }}
            />
          </Marker>
        );
      })}
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */
const $containerGrand: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  marginTop: height / 4,
};

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
};

const $container: ViewStyle = {
  flex: 1,
  width: width,
  height: height,
  backgroundColor: colors.fond,
};

/* ---------------------------- Style de itemMini --------------------------- */

const $containerPetit: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.xxs,
};

/* ------ Style du container du titre et du bouton de téléchargement ------ */

const $containerTitre: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: width - width / 5,
  margin: spacing.lg,
};

const $titre: ViewStyle = {
  marginTop: spacing.xs,
  paddingRight: spacing.xl,
};

/* -------------- Style du container des boutons infos et avis -------------- */

const $containerBouton: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  width: width,
};

const $boutonInfoAvis: ViewStyle = {
  paddingLeft: spacing.xxl,
  paddingRight: spacing.xxl,
};

const $souligneInfosAvis: ViewStyle = {
  backgroundColor: colors.bouton,
  height: 2,
  width: width / 2.5,
  position: "relative",
};

/* ---------------------------- Style du bouton commencer --------------------------- */

const $buttonCommencer: ViewStyle = {
  alignSelf: "center",
  width: width / 2,
  backgroundColor: colors.bouton,
  borderRadius: 13,
  position: "absolute",
  zIndex: 3,
  minHeight: 10,
  height: 41,
  borderColor: colors.bouton,
};