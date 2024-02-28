import * as React from "react";
import {
  StyleProp,
  View,
  ViewStyle,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  ImageStyle,
} from "react-native";
import { observer } from "mobx-react-lite";
import { colors, spacing } from "app/theme";
import { ListeSignalements, Text } from "app/components";
import SwipeUpDown from "react-native-swipe-up-down";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useRef, useState } from "react";
import { AppStackParamList, T_excursion, T_flat_point } from "app/navigators";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { InfosExcursion } from "./InfosExcursion";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LocationObject } from "expo-location";
import { LatLng } from "react-native-maps";

const { width, height } = Dimensions.get("window");

export type SwiperProps = {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>;
  navigation: NativeStackNavigationProp<AppStackParamList, "Carte", undefined>;

  excursion: T_excursion;
  userLocation: LocationObject;
  setCameraTarget: React.Dispatch<React.SetStateAction<LatLng>>;
};

/**
 * Describe your component here
 */
export const Swiper = observer(function Swiper(props: SwiperProps) {
  const { style, userLocation, excursion, navigation, setCameraTarget } = props;
  const $styles = [$container, style];

  const bottomMargin = useBottomTabBarHeight() + useSafeAreaInsets().bottom;
  const swipeUpDownRef = useRef<any>();

  const [interfaceCourrante, setInterfaceCourrante] = useState<"infos" | "signalements">("infos");

  const closeSwiper = () => {
    if (swipeUpDownRef.current) {
      swipeUpDownRef.current.showMini();
    }
  };

  // Ce useEffect permet de bouger sur le debut de l'excursion lors de son affichage.
  useEffect(() => {
    setCameraTarget({
      latitude: excursion.track[0].lat,
      longitude: excursion.track[0].lon,
    } as LatLng);
  }, []);

  return (
    <SwipeUpDown
      itemMini={<ItemMini />}
      itemFull={<ItemFull />}
      animation="easeInEaseOut"
      swipeHeight={bottomMargin} // barre de navigation + footer + hauteur du swiper
      disableSwipeIcon={false}
      ref={swipeUpDownRef}
      extraMarginTop={height / 6}
    />
  );

  /**
   * @returns le composant réduit des informations, autremeent dit lorsque l'on swipe vers le bas
   */
  function ItemMini() {
    return (
      <View style={[$styles, { alignItems: "center", padding: spacing.xxs }]}>
        <Image source={require("assets/icons/swipe-up.png")} />
      </View>
    );
  }

  /**
   * @returns le composant complet des informations, autrement dit lorsque l'on swipe vers le haut
   */
  function ItemFull() {
    return (
      <View style={[$styles]}>
        <>
          <View style={$containerTitre}>
            <Text text={excursion.nom} size="xl" style={$titre} />
            <View style={{ justifyContent: "center" }}>
              <TouchableOpacity onPress={() => downloadAndSaveFile()}>
                <Image source={require("assets/icons/download.png")} style={$iconDownload}></Image>
              </TouchableOpacity>
            </View>
          </View>
          <View style={$containerBouton}>
            <TouchableOpacity
              onPress={() => {
                setInterfaceCourrante("infos");
              }}
              style={$boutonInfoAvis}
            >
              <Text
                tx="detailsExcursion.titres.infos"
                size="lg"
                style={{ color: interfaceCourrante === "infos" ? colors.bouton : colors.text }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setInterfaceCourrante("signalements");
              }}
              style={$boutonInfoAvis}
            >
              <Text
                text="Signalements"
                size="lg"
                style={{
                  color: interfaceCourrante === "signalements" ? colors.bouton : colors.text,
                }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[
              $souligneInfosAvis,
              interfaceCourrante === "infos"
                ? { left: spacing.lg }
                : { left: width - width / 2.5 - spacing.lg / 1.5 },
            ]}
          />
          {interfaceCourrante === "infos" ? (
            <InfosExcursion
              excursion={excursion}
              navigation={navigation}
              setInterfaceCourrante={setInterfaceCourrante}
              userLocation={userLocation}
            />
          ) : excursion.signalements.length > 0 ? (
            <ScrollView>
              <TouchableWithoutFeedback>
                <View style={$containerSignalements}>
                  <ListeSignalements
                    detaille={true}
                    signalements={excursion.signalements}
                    track={excursion.track}
                    onPress={(point: T_flat_point) => {
                      props.setCameraTarget({
                        latitude: point.lat,
                        longitude: point.lon,
                      } as LatLng);
                      closeSwiper();
                    }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          ) : (
            <Text
              text={"Aucun signalement pour cette excursion"}
              size="sm"
              style={{ textAlign: "center", marginTop: spacing.lg }}
            />
          )}
        </>
      </View>
    );
  }

  function downloadAndSaveFile() {
    if (excursion) {
      Sharing.shareAsync(FileSystem.documentDirectory + excursion.nomTrackGpx);
    }
  }
});

const $container: ViewStyle = {
  flex: 1,
  width: width,
  height: height,
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
};

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
  justifyContent: "center",
  width: "100%",
};

const $boutonInfoAvis: ViewStyle = {
  flex: 1,
  alignItems: "center",
};

const $souligneInfosAvis: ViewStyle = {
  backgroundColor: colors.bouton,
  height: 2,
  width: width / 2.5,
  position: "relative",
};
const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
  paddingBottom: 250 /**@warning solution moche et temporaire */,
};

const $iconDownload: ImageStyle = {
  width: 40,
  height: 40,
  tintColor: colors.bouton,
};
