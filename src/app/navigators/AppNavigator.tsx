/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useColorScheme } from "react-native"
import * as Screens from "app/screens"
import Config from "../config"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { colors } from "app/theme"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Image, ImageStyle } from "react-native"
import { useStores } from "app/models"
import { Text } from "app/components"
import I18n from "i18n-js"
import { getActiveRouteName } from "./navigationUtilities"
import { set } from "date-fns"

const explorerLogo = require("./../../assets/icons/explorer.png")
const carteLogo = require("./../../assets/icons/carte.png")
const parametresLogo = require("./../../assets/icons/parametres.png")

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
export type AppStackParamList = {
  // 🔥 Your screens go here
  Filtres: undefined
  Excursions: undefined
  Map: undefined
  DetailsExcursion: undefined
  Parametres: undefined
  NouveauSignalement: undefined
	// IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
  Description: undefined
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

/* -------------------------------------------------------------------------- */
/*                                APP NAVIGATOR                               */
/* -------------------------------------------------------------------------- */

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const colorScheme = useColorScheme()
  const Tab = createBottomTabNavigator()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  const { parametres } = useStores()

  useEffect(() => {
    if (parametres.langues === "fr") {
      I18n.locale = "fr"
    }
    if (parametres.langues === "es") {
      I18n.locale = "es"
    }
  }, [parametres.langues])

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <Tab.Navigator
        initialRouteName="Carte"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            paddingTop: 10,
            backgroundColor: colors.fond,
            borderTopColor: colors.palette.vert,
          },
        }}
      >
        <Tab.Screen
          name="Stack"
          component={StackNavigator}
          options={{ tabBarButton: () => null }}
        />
        <Tab.Screen
          name="Excursions"
          component={Screens.ExcursionsScreen}
          options={{
            tabBarIcon: (props) => (
              <Image
                source={explorerLogo}
                style={[
                  $icon,
                  {
                    tintColor: props.focused
                      ? colors.palette.marron
                      : colors.palette.vert 
                  },
                ]}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  color: focused ? colors.palette.marron : colors.palette.vert,
                  fontSize: 10,
                }}
                tx={"excursions.titre"}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Carte"
          component={Screens.MapScreen}
          options={{
            tabBarIcon: (props) => (
              <Image
                source={carteLogo}
                style={[
                  $icon,
                  { tintColor: props.focused ? colors.palette.marron : colors.palette.vert },
                ]}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  color: focused ? colors.palette.marron : colors.palette.vert,
                  fontSize: 10,
                }}
                tx={"mapScreen.title"}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Parametres"
          component={Screens.ParametresScreen}
          options={{
            tabBarIcon: (props) => (
              <Image
                source={parametresLogo}
                style={[
                  $icon,
                  { tintColor: props.focused ? colors.palette.marron : colors.palette.vert },
                ]}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  color: focused ? colors.palette.marron : colors.palette.vert,
                  fontSize: 10,
                }}
                tx={"parametres.titre"}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
})

const $icon: ImageStyle = {
  width: 25,
  height: 25,
}

/* -------------------------------------------------------------------------- */
/*                                   FOOTER                                   */
/* -------------------------------------------------------------------------- */

function StackNavigator() {
  const Stack = createNativeStackNavigator()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Description" component={Screens.DescriptionScreen} />
      <Stack.Screen name="DetailsExcursion" component={Screens.DetailsExcursionScreen} />
      <Stack.Screen name="Excursions" component={Screens.ExcursionsScreen} />
      <Stack.Screen name="Filtres" component={Screens.FiltresScreen} />
      <Stack.Screen name="NouveauSignalement" component={Screens.NouveauSignalementScreen} />
    </Stack.Navigator>
  )
}
