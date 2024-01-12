import React, { FC, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import * as Location from "expo-location";
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
} from "react-native";
import { AppStackScreenProps, TPoint, TSignalement } from "app/navigators";
import {
  Text,
  CarteAvis,
  GraphiqueDenivele,
  GpxDownloader,
  Screen,
  CarteSignalement,
  Button,
} from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { NativeStackNavigationProp } from "@react-navigation/native-stack/lib/typescript/src/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LatLng, Marker, Polyline } from "react-native-maps";
import { ImageSource } from "react-native-vector-icons/Icon";
import { MapScreen } from "./MapScreen";
const { width, height } = Dimensions.get("window");

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {}

interface T_Point extends TPoint {
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
  signalements: TSignalement[];
  nomTrackGpx: string;
  track: T_Point[];
};

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

  const image: ImageSource = require("../../assets/icons/location.png");

  return points.map((point, index) => {
    return (
      <Marker
        coordinate={{
          latitude: point.lat,
          longitude: point.lon,
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
 * @param signalements {TSignalement[]} - les signalements de l'excursion
 *
 * @returns les signalements à afficher sur la carte.
 */
const signalementsHandler = (signalements: TSignalement[]) => {
  const binoculars: ImageSource = require("../../assets/icons/binoculars.png");
  const attention: ImageSource = require("../../assets/icons/attention.png");

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
              latitude: signalement.latitude,
              longitude: signalement.longitude,
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

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {
    const { route, navigation } = props;

    const excursion = route.params?.excursion;

    const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true);
    const [isAllSignalements, setIsAllSignalements] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [startPoint, setStartPoint] = useState<LatLng>();

    const swipeUpDownRef = React.useRef<SwipeUpDown>(null);

    const footerHeight = useBottomTabBarHeight();

    const allPoints = excursion.track.map(
      (point: T_Point) =>
        ({
          latitude: point.lat,
          longitude: point.lon,
        } as LatLng),
    );

    const changeStartPoint = (point: LatLng) => {
      setStartPoint(point);
    };

    // Ce useEffect permet de bouger sur le debut de l'excursion lors de son affichage.
    useEffect(() => {
      setStartPoint({
        latitude: excursion.track[0].lat,
        longitude: excursion.track[0].lon,
      } as LatLng);
    }, [excursion]);

    /**
     * ! Pas nécessaire pour le moment
     */
    useEffect(() => {
      const fetchLocation = async () => {
        const location = await getUserLocation();
        setUserLocation(location);
      };

      fetchLocation();
    }, []);
    /**
     * ! FIN Pas nécessaire pour le moment
     */

    /**
     * ! NON FONCTIONNEL
     * J'aimerai que le swipeUpDown se baisse automatiquement
     * lors du click sur un signalement
     */
    // if (swipeUpDownRef) {
    //   r(`[DetailsExcursionScreen - useEffect] aled`);
    //   swipeUpDownRef.current.showMini();
    // } else {
    //   console.error("swipeUpDownRef.current is null");
    // }
    /**
     * ! FIN NON FONCTIONNEL
     */

    // si excursion est défini, on affiche les informations de l'excursion
    return excursion ? (
      <SafeAreaView style={$container}>
        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.navigate("Excursions")}>
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>

        {allPoints && startPoint && (
          <MapScreen startLocation={startPoint} isInDetailExcursion={true} hideOverlay={false}>
            <Polyline coordinates={allPoints} strokeColor={colors.bouton} strokeWidth={5} />

            {startMiddleAndEndHandler(
              excursion.track,
              excursion.es.typeParcours as "Ida" | "Ida y Vuelta" | "Circular",
            )}

            {signalementsHandler(excursion.signalements)}
          </MapScreen>
        )}

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

            changeStartPoint,
          )}
          animation="easeInEaseOut"
          swipeHeight={30 + footerHeight}
          disableSwipeIcon={true}
          ref={swipeUpDownRef}
        />
      </SafeAreaView>
    ) : (
      // sinon on affiche une erreur
      <Screen preset="fixed">
        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
        <View style={$containerErreur}>
          <Text tx="detailsExcursion.erreur.titre" size="xxl" />
          <Text style={$texteErreur} size="sm" tx="detailsExcursion.erreur.message" />
        </View>
      </Screen>
    );
  },
);

/**
 * @returns le composant réduit des informations, autremeent dit lorsque l'on swipe vers le bas
 */
function itemMini() {
  return (
    <View style={$containerPetit}>
      <Image source={require("../../assets/icons/swipe-up.png")} />
    </View>
  );
}

/**
 * @param excursion, navigation, containerInfoAffiche, setcontainerInfoAffiche, isAllSignalements, setIsAllSignalements, userLocation,
 * @returns le composant complet des informations, autrement dit lorsque l'on swipe vers le haut
 */
function itemFull(
  excursion: Record<string, unknown>,
  navigation: NativeStackNavigationProp<any>,
  containerInfoAffiche: boolean,
  setcontainerInfoAffiche: React.Dispatch<any>,
  isAllSignalements: boolean,
  setIsAllSignalements: React.Dispatch<any>,
  userLocation: Array<number>,
  footerHeight: number,

  changeStartPoint?: (point: LatLng) => void,
) {
  let nomExcursion = "";
  if (excursion !== undefined) {
    nomExcursion = excursion.nom as string;
  }
  if (isAllSignalements) {
    return listeSignalements(
      setIsAllSignalements,
      excursion,
      userLocation,
      footerHeight,
      changeStartPoint,
    );
  } else {
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
                style={containerInfoAffiche ? { color: colors.bouton } : { color: colors.text }}
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
                style={containerInfoAffiche ? { color: colors.text } : { color: colors.bouton }}
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
          {containerInfoAffiche
            ? infos(excursion, navigation, setIsAllSignalements, userLocation)
            : avis()}
        </View>
      </View>
    );
  }
}

/**
 * @param description
 * @returns la description courte
 */
function afficherDescriptionCourte(description: string) {
  if (description == null) {
    return null;
  } else {
    const descriptionCoupe: string = description.slice(0, 100);
    let descriptionFinale: string = descriptionCoupe + "...";
    descriptionFinale = descriptionFinale.replace(/<[^>]*>?/gm, "");
    return descriptionFinale;
  }
}
/**
 *
 * @returns les coordonnées de l'utilisateur
 */
function getUserLocation() {
  return new Promise(async (resolve, reject) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync(); // utiliser la fonction requestForegroundPermissionsAsync de Location pour demander la permission à l'utilisateur
      if (status !== "granted") {
        // Si l'utilisateur n'a pas accepté la permission
        console.error("Permission to access location was denied"); // Afficher une erreur
        resolve(null);
      }

      const location = await Location.getCurrentPositionAsync({}); // utilise la fonction getCurrentPositionAsync de Location pour récupérer la position de l'utilisateur
      resolve(location.coords); // Renvoie les coordonnées de l'utilisateur (latitude et lontude) pour pouvoir calculer la distance
    } catch (error) {
      console.error("Error getting location", error);
      reject(error);
    }
  });
}

/**
 *
 * @params setIsAllSignalements, excursion, userLocation
 * @returns la liste des signalements
 */
function listeSignalements(
  setIsAllSignalements,
  excursion,
  userLocation,
  footerHeight,
  changeStartPoint?: (point: LatLng) => void,
) {
  return (
    <View style={$containerGrand}>
      <ScrollView>
        <TouchableWithoutFeedback>
          <View style={$containerSignalements}>
            {excursion?.signalements?.map((signalement, index) => {
              // Calcule de la distance pour chaque avertissement
              const coordSignalement = {
                lat: signalement.latitude,
                lon: signalement.longitude,
                alt: null,
                dist: null,
              };
              const distanceSignalement = userLocation
                ? recupDistance(coordSignalement, excursion.track)
                : 0;
              const carteType =
                signalement.type === "Avertissement" ? "avertissement" : "pointInteret";
              return (
                <View key={index}>
                  <CarteSignalement
                    type={carteType}
                    details={true}
                    nomSignalement={signalement.nom}
                    distanceDuDepart={`${distanceSignalement}`}
                    description={signalement.description}
                    imageSignalement={signalement.image}
                    onPress={() => {
                      // go to the signalement on the map
                      // setIsAllSignalements(false);
                      changeStartPoint &&
                        changeStartPoint({
                          latitude: signalement.latitude,
                          longitude: signalement.longitude,
                        } as LatLng);
                    }}
                  />
                </View>
              );
            })}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <View>
        <Button
          style={[$sortirDetailSignalement, { bottom: footerHeight }]}
          tx="detailsExcursion.boutons.retourInformations"
          onPress={() => setIsAllSignalements(false)}
        />
      </View>
    </View>
  );
}

/**
 *
 * @params excursion, navigation, setIsAllSignalements, userLocation
 * @returns les informations de l'excursion
 */
function infos(
  excursion: Record<string, unknown>,
  navigation: any,
  setIsAllSignalements,
  userLocation,
) {
  let duree = "";
  let distance = "";
  let difficulteOrientation = 0;
  let difficulteTechnique = 0;
  let description = "";
  let signalements: TSignalement[] = [];
  if (
    excursion.duree !== undefined ||
    excursion.distance !== undefined ||
    excursion.difficulteOrientation !== undefined ||
    excursion.difficulteTechnique !== undefined ||
    excursion.description !== undefined ||
    excursion.signalements != undefined
  ) {
    duree = (excursion.duree as { h: number }).h + "h";
    if ((excursion.duree as { m: number }).m !== 0) {
      // Si la durée en minutes est différente de 0, on l'affiche en plus de la durée en heures
      duree = duree + (excursion.duree as { m: number }).m;
    }
    distance = excursion.distance as string;
    difficulteTechnique = excursion.difficulteTechnique as number;
    difficulteOrientation = excursion.difficulteOrientation as number;
    description = excursion.description as string;
    signalements = excursion.signalements as TSignalement[];
  }

  return (
    <ScrollView>
      <TouchableWithoutFeedback>
        <View style={$stylePage}>
          <View style={$containerInformations}>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation} source={require("../../assets/icons/temps.png")} />
              <Text text={duree} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation} source={require("../../assets/icons/explorer.png")} />
              <Text text={distance + " km"} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image
                style={$iconInformation}
                source={require("../../assets/icons/difficulteTechnique.png")}
              />
              <Text text={difficulteTechnique.toString()} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image
                style={$iconInformation}
                source={require("../../assets/icons/difficulteOrientation.png")}
              />
              <Text text={difficulteOrientation.toString()} size="xs" />
            </View>
          </View>
          <View style={$containerDescriptionEtSignalements}>
            <Text text="Description" size="lg" />
            <Text text={afficherDescriptionCourte(description)} size="xxs" />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Description", { excursion: excursion });
              }}
            >
              {description === "" ? null : (
                <Text style={$lienDescription} tx="detailsExcursion.boutons.lireSuite" size="xxs" />
              )}
            </TouchableOpacity>
          </View>
          <View>
            {signalements?.length > 0 && (
              <>
                <View style={$headerSignalement}>
                  <View>
                    <Text tx="detailsExcursion.titres.signalements" size="lg" />
                  </View>
                  <View>
                    {signalements.length > 0 && (
                      <TouchableOpacity onPress={() => setIsAllSignalements(true)}>
                        <Text
                          style={$lienSignalements}
                          tx="detailsExcursion.boutons.voirDetails"
                          size="xs"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <ScrollView horizontal>
                  <TouchableWithoutFeedback>
                    <View style={$scrollLine}>
                      {signalements.map((signalement, index) => {
                        // Calculate the distance for each warning
                        const coordSignalement = {
                          lat: signalement.latitude,
                          lon: signalement.longitude,
                          alt: null,
                          dist: null,
                        };
                        const distanceSignalement = userLocation
                          ? recupDistance(coordSignalement, excursion.track)
                          : 0;
                        const carteType =
                          signalement.type === "Avertissement" ? "avertissement" : "pointInteret";

                        return (
                          <View key={index}>
                            <TouchableOpacity onPress={() => setIsAllSignalements(true)}>
                              <CarteSignalement
                                type={carteType}
                                details={false}
                                nomSignalement={signalement.nom}
                                distanceDuDepart={`${distanceSignalement}`}
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </TouchableWithoutFeedback>
                </ScrollView>
              </>
            )}
          </View>

          <View style={$containerDenivele}>
            <Text tx="detailsExcursion.titres.denivele" size="xl" />
            {excursion.track && <GraphiqueDenivele points={excursion.track} detaille={true} />}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

/**
 * @returns les avis de l'excursion
 */
function avis() {
  return (
    <ScrollView>
      <TouchableWithoutFeedback>
        <View style={$containerAvis}>
          <CarteAvis
            nombreEtoiles={3}
            texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
          />
          <CarteAvis
            nombreEtoiles={3}
            texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
          />
          <CarteAvis
            nombreEtoiles={3}
            texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
          />
          <CarteAvis
            nombreEtoiles={3}
            texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
          />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

// Fonction de calcul de distance entre deux coordonnées
function calculeDistanceEntreDeuxPoints(coord1: T_Point, coord2: T_Point) {
  // Assurez-vous que coord1 et coord2 sont définis
  if (
    !coord1 ||
    typeof coord1.lat === "undefined" ||
    typeof coord1.lon === "undefined" ||
    !coord2 ||
    typeof coord2.lat === "undefined" ||
    typeof coord2.lon === "undefined"
  ) {
    throw new Error("Coordonnées non valides");
  }

  // Rayon moyen de la Terre en kilomètres
  const R = 6371;

  // Convertir les degrés en radians
  const toRadians = degree => degree * (Math.PI / 180);

  // Calcul des distances
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);

  // Formule de Haversine pour calculer la distance entre deux points
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // Distance en radians
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance en kilomètres
  const distance = R * c;

  return distance;
}

//Fonction me permettant de récupérer la distance entre l'utilisateur et le signalement en passant par les points du tracé
function recupDistance(coordonneeSignalement: T_Point, data: any) {
  // Assurez-vous que les coordonnées du signalement sont définies
  if (!coordonneeSignalement || !coordonneeSignalement.lat || !coordonneeSignalement.lon) {
    console.error("Coordonnées du signalement non valides");
    return 0;
  }

  // Initialiser la distance minimale avec une valeur élevée
  let distanceMinimale: number = Number.MAX_VALUE;

  let coordPointPlusProche: T_Point;

  // Parcourir toutes les coordonnées dans le fichier
  for (const coord of data) {
    // Assurez-vous que les coordonnées dans le fichier sont définies
    if (!coord.lat || !coord.lon) {
      console.error("Coordonnées dans le fichier non valides");
      continue;
    }

    // Calculer la distance entre le signalement et la coordonnée actuelle du fichier
    const distanceSignalementPointLePlusProche = calculeDistanceEntreDeuxPoints(
      coordonneeSignalement,
      coord,
    );

    // Mettre à jour la distance minimale si la distance actuelle est plus petite
    if (distanceSignalementPointLePlusProche < distanceMinimale) {
      distanceMinimale = distanceSignalementPointLePlusProche;
      coordPointPlusProche = coord;
    }
  }
  const distanceDepartPointLePlusProche = (coordPointPlusProche.dist / 1000).toFixed(2);

  //Distance totale DANS UN MONDE PARFAIT et pour calculer le temps de parcours en ajoutant la distance entre le point le plus proche et le départ sauf qu'il faut faire un algo parce que le point le pls proche peut ne pas être le point suivant (exemple un circuit qui fait un aller retour ou les points allez et retour sont proches)
  // const distanceTotale = distanceMinimale + distanceDepartPointLePlusProche; //c'est donc pas vraiment ce calcul qu'il faut faire
  // return distanceTotale;

  return distanceDepartPointLePlusProche;
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const $stylePage: ViewStyle = {
  paddingRight: spacing.lg,
  paddingLeft: spacing.lg,
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
  backgroundColor: colors.erreur,
};

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
};

//Style de itemFull

const $containerGrand: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  marginTop: height / 4,
};

//Style du container du titre et du bouton de téléchargement

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

//Style du container des boutons infos et avis

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

//Style des informations

const $containerInformations: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingTop: spacing.xl,
  paddingBottom: spacing.xl,
};

const $containerUneInformation: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const $iconInformation: ImageStyle = {
  width: spacing.lg,
  height: spacing.lg,
  marginRight: spacing.xs,
};

//Style de la description et des signalements
const $containerDescriptionEtSignalements: ViewStyle = {
  paddingBottom: spacing.xl,
};

const $lienDescription: TextStyle = {
  color: colors.bouton,
  paddingTop: spacing.xs,
  textDecorationLine: "underline",
};

const $containerAvis: ViewStyle = {
  paddingBottom: height / 3, //pour pouvoir afficher les avis
};

const $containerDenivele: ViewStyle = {
  marginBottom: height / 3, //pour pouvoir afficher le graphique
};

const $scrollLine: ViewStyle = {
  flexDirection: "row",
  paddingBottom: spacing.xl,
};

const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
  paddingBottom: height / 2,
};

const $sortirDetailSignalement: ViewStyle = {
  borderRadius: 15,
  borderWidth: 2,
  backgroundColor: colors.fond,
  borderColor: colors.bordure,
  width: width / 1.5,
  height: 50,
  position: "absolute",
  alignSelf: "center",
};

const $headerSignalement: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const $lienSignalements: TextStyle = {
  textDecorationLine: "underline",
  color: colors.bouton,
  paddingStart: spacing.xs,
};

/* --------------------------------- ERREUR --------------------------------- */

const $containerErreur: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  width: width,
  height: height,
  padding: spacing.lg,
};

const $texteErreur: TextStyle = {
  marginTop: spacing.lg,
  marginBottom: height / 2,
};
