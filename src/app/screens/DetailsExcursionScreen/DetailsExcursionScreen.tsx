import React, { FC, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { View, ViewStyle, TouchableOpacity, Image, TextStyle, Dimensions } from "react-native";
import { AppStackScreenProps, TPoint, T_Signalement } from "app/navigators";
import { GpxDownloader } from "./GpxDownloader";
import { Text, Screen } from "app/components";
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

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {}
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

    // Ce useEffect permet de bouger sur le debut de l'excursion lors de son affichage.
    useEffect(() => {
      setStartPoint({
        latitude: excursion.track[0].lat,
        longitude: excursion.track[0].lon,
      } as LatLng);
    }, [excursion]);

    useEffect(() => {
      (async () => {
        const location = await getUserLocation();
        setUserLocation(location);
      })();
    }, []);

    const swipeUpDown = () => {
      if (swipeUpDownRef) {
        console.log(`[DetailsExcursionScreen - useEffect] aled`);
        swipeUpDownRef.current.showMini();
      } else {
        console.error("swipeUpDownRef.current is null");
      }
    };

    return excursion ? (
      <View style={$container}>
        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
          <Image style={{ tintColor: colors.bouton }} source={require("assets/icons/back.png")} />
        </TouchableOpacity>

        {allPoints && startPoint && (
          /**@warning MapScreen doit etre transforme en composant, ce n est pas un screen */
          <MapScreen startLocation={startPoint} hideOverlay={false} excursionAffichee={excursion} />
        )}

        <SwipeUpDown
          itemMini={itemMini()}
          itemFull={itemFull()}
          animation="easeInEaseOut"
          swipeHeight={30 + footerHeight}
          disableSwipeIcon={true}
          ref={swipeUpDownRef}
        />
      </View>
    ) : (
      <Screen preset="fixed">
        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
          <Image style={{ tintColor: colors.bouton }} source={require("assets/icons/back.png")} />
        </TouchableOpacity>
        <View style={$containerErreur}>
          <Text tx="detailsExcursion.erreur.titre" size="xxl" />
          <Text style={$texteErreur} size="sm" tx="detailsExcursion.erreur.message" />
        </View>
      </Screen>
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
     * @returns le composant complet des informations, autrement dit lorsque l'on swipe vers le haut
     */
    function itemFull() {
      return isAllSignalements ? (
        <ListeSignalements
          excursion={excursion}
          userLocation={userLocation}
          setIsAllSignalements={setIsAllSignalements}
          footerHeight={footerHeight}
          setStartPoint={setStartPoint}
          swipeDown={swipeUpDown}
          style={$containerGrand}
        />
      ) : (
        <View style={$containerGrand}>
          <View style={$containerTitre}>
            <Text text={excursion.nom} size="xl" style={$titre} />
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
  },
);

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
