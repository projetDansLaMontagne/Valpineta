import React, { FC, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  View,
  SafeAreaView,
  ViewStyle,
  TouchableOpacity,
  Image,
  TextStyle,
  Dimensions,
} from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Text, GpxDownloader, Screen } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { NativeStackNavigationProp } from "@react-navigation/native-stack/lib/typescript/src/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ListeSignalements } from "./ListeSignalements";
import { getUserLocation } from "app/utils/getUserLocation";
import { InfosExcursion } from "./InfosExcursion";
import { Avis } from "./Avis";

const { width, height } = Dimensions.get("window");

/**@warning types a mettre dans appNavigator */
export interface Coordonnees {
  lat: number;
  lon: number;
  alt: number;
  dist: number;
}

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {
  excursion: Record<string, unknown>;
  temps: Record<"h" | "m", number>;
}
export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {
    const { route, navigation } = props;
    let excursion: Record<string, unknown>;
    let params: any;
    if (route?.params !== undefined) {
      params = route?.params;
    }
    params ? (excursion = params.excursion) : (excursion = null); //si params est défini, on récupère l'excursion, sinon on met excursion à null

    const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true);
    const [isAllSignalements, setIsAllSignalements] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const footerHeight = useBottomTabBarHeight();

    useEffect(() => {
      const fetchLocation = async () => {
        const location = await getUserLocation();
        setUserLocation(location);
      };

      fetchLocation();
    }, []);

    //si excursion est défini, on affiche les informations de l'excursion
    return excursion ? (
      <SafeAreaView style={$container}>
        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.navigate("Excursions")}>
          <Image style={{ tintColor: colors.bouton }} source={require("assets/icons/back.png")} />
        </TouchableOpacity>
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
        />
      </SafeAreaView>
    ) : (
      //sinon on affiche une erreur
      <Screen preset="fixed">
        <TouchableOpacity style={$boutonRetour} onPress={() => navigation.navigate("Excursions")}>
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
    ) {
      var nomExcursion: string = "";
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
            style={$containerGrand}
          />
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
                    style={[
                      containerInfoAffiche ? { color: colors.bouton } : { color: colors.text },
                    ]}
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
                    style={[
                      containerInfoAffiche ? { color: colors.text } : { color: colors.bouton },
                    ]}
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
