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

    return (
      <View style={$container}>
        {excursion && (
          /**@warning MapScreen doit etre transforme en composant, ce n est pas un screen */
          <MapScreen excursion={excursion} />
        )}
      </View>
    );
  },
);
