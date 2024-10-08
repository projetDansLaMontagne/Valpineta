/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { ImageSourcePropType, useColorScheme, Image } from "react-native";
import * as Screens from "app/screens";
import Config from "../config";
import { navigationRef, useBackButtonHandler } from "./navigationUtilities";
import { colors } from "app/theme";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { Text } from "app/components";

import { useStores } from "app/models";
import React, { useEffect } from "react";

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */

/* ---------------------------------- Types --------------------------------- */
export type T_valeurs_filtres = {
  distanceMax: number;
  dureeMax: number;
  deniveleMax: number;
  typesParcours: string[];
  vallees: string[];
  difficulteTechniqueMax: number;
  difficulteOrientationMax: number;
};
export interface T_flat_point {
  lat: number; // Latitude
  lon: number; // Longitude
}
export interface T_point extends T_flat_point {
  alt: number; // Altitude
  dist: number; // Distance par rapport au point de départ
  pos: number; // Denivele positif
}
export type T_filtres = {
  critereTri: string;
  intervalleDistance: { min: number; max: number };
  intervalleDuree: { min: number; max: number };
  intervalleDenivele: { min: number; max: number };
  indexTypesParcours: number[];
  vallees: string[];
  difficultesTechniques: number[];
  difficultesOrientation: number[];
};

export type T_type_signalement = "PointInteret" | "Avertissement";

export type T_signalement = {
  nom: string;
  type: T_type_signalement;
  description: string;
  image: string;
  lat: number;
  lon: number;
};

export type T_signalement_lie = {
  idExcursion: number; //id de l'excursion sur laquelle le signalement est lié
  idPointLie: number; // id du point du track sur lequel le signalement est lié
} & T_signalement;

export type T_info_langue = {
  nom: string;
  description: string;
  typeParcours: "Ida" | "Ida y Vuelta" | "Circular";
};

export type T_excursion = {
  denivele: number;
  description: string;
  difficulteOrientation: number;
  difficulteTechnique: number;
  distance: number;
  duree: { h: number; m: number };
  nomTrackGpx: string;
  vallee: string;

  es?: T_info_langue;
  fr?: T_info_langue;

  signalements: T_signalement_lie[];
  track: T_point[];
} & Partial<T_info_langue>;

// TYPES STACKS
type ExcursionStackParamList = {
  Filtres: undefined;
  Excursions: undefined | { filtres?: T_filtres };
};

type CarteStackParamList = {
  Carte: undefined | { excursion: T_excursion };
  Description: { excursion: T_excursion };
  NouveauSignalement: { type: T_type_signalement };
};

type ParametresStackParamList = {
  Parametres: undefined;
};

export type AppStackParamList = {
  ExcursionsStack: NavigatorScreenParams<ExcursionStackParamList> | undefined;
  CarteStack: NavigatorScreenParams<CarteStackParamList> | undefined;
  ParametresStack: NavigatorScreenParams<ParametresStackParamList> | undefined;
} & ExcursionStackParamList &
  CarteStackParamList &
  ParametresStackParamList;

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes;

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;

/* -------------------------------------------------------------------------- */
/*                                APP NAVIGATOR                               */
/* -------------------------------------------------------------------------- */

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const colorScheme = useColorScheme();
  /* --------------------------------- Assets --------------------------------- */
  const excursionLogo = require("./../../assets/icons/explorer.png");
  const carteLogo = require("./../../assets/icons/carte.png");
  const parametresLogo = require("./../../assets/icons/parametres.png");
  useBackButtonHandler(routeName => exitRoutes.includes(routeName));

  const { parametres } = useStores();
  /**
   * @warning CODE REDONDANT mais sans cette partie le footer ne change pas de langue... raison inconnue
   */
  useEffect(() => {}, [parametres.langue]);

  const optionsBoutons = (tx: any, logo: ImageSourcePropType): BottomTabNavigationOptions => ({
    tabBarIcon: ({ color }) => (
      <Image source={logo} style={{ width: 30, height: 30, tintColor: color }} />
    ),
    tabBarLabel: ({ color }) => <Text tx={tx} style={{ color, fontSize: 10 }} />,
  });

  const Tab = createBottomTabNavigator();
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <Tab.Navigator
        initialRouteName={"CarteStack"}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            paddingTop: 10,
            backgroundColor: colors.fond,
            borderTopColor: colors.palette.vert,
          },
          tabBarActiveTintColor: colors.palette.noir, // Couleur de l'onglet actif
          tabBarInactiveTintColor: colors.palette.vert, // Couleur de l'onglet inactif
        }}
      >
        <Tab.Screen
          name="ExcursionsStack"
          component={ExcursionStackScreen}
          options={optionsBoutons("excursions.titre", excursionLogo)}
        />
        <Tab.Screen
          name="CarteStack"
          component={CarteStackScreen}
          options={optionsBoutons("mapScreen.title", carteLogo)}
        />
        <Tab.Screen
          name="ParametresStack"
          component={ParametresStackScreen}
          options={optionsBoutons("parametres.titre", parametresLogo)}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
});

/* -------------------------------------------------------------------------- */
/*                                   STACKS                                   */
/* -------------------------------------------------------------------------- */
const ExcursionStack = createNativeStackNavigator<ExcursionStackParamList>();
const ExcursionStackScreen = () => (
  <ExcursionStack.Navigator
    initialRouteName={"Excursions"}
    screenOptions={{
      headerShown: false,
    }}
  >
    <ExcursionStack.Screen name="Excursions" component={Screens.ExcursionsScreen} />
    <ExcursionStack.Screen name="Filtres" component={Screens.FiltresScreen} />
  </ExcursionStack.Navigator>
);

const CarteStack = createNativeStackNavigator<CarteStackParamList>();
const CarteStackScreen = () => (
  <CarteStack.Navigator
    initialRouteName={"Carte"}
    screenOptions={{
      headerShown: false,
    }}
  >
    <CarteStack.Screen name="Carte" component={Screens.MapScreen} />
    <CarteStack.Screen name="Description" component={Screens.DescriptionScreen} />
    <CarteStack.Screen name="NouveauSignalement" component={Screens.NouveauSignalementScreen} />
  </CarteStack.Navigator>
);

const ParametresStack = createNativeStackNavigator<ParametresStackParamList>();
const ParametresStackScreen = () => (
  <ParametresStack.Navigator
    initialRouteName={"Parametres"}
    screenOptions={{
      headerShown: false,
    }}
  >
    <ParametresStack.Screen name="Parametres" component={Screens.ParametresScreen} />
  </ParametresStack.Navigator>
);
