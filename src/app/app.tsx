/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("./devtools/ReactotronConfig.ts");
}
import "./i18n";
import "./utils/ignoreWarnings";
import { useFonts } from "expo-font";
import React from "react";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useInitialRootStore } from "./models";
import { AppNavigator, useNavigationPersistence } from "./navigators";
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary";
import * as storage from "./utils/storage";
import { customFontsToLoad, spacing, colors } from "./theme";
import Config from "./config";
import { ToastProvider } from "react-native-toast-notifications";
import { View, Image, TouchableOpacity, ViewStyle, ImageStyle, TextStyle } from "react-native";
import { Button, Text } from "app/components";

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE";

// Web linking configuration
const prefix = Linking.createURL("/");
const config = {
  screens: {
    Login: {
      path: "",
    },
    Welcome: "welcome",
    Demo: {
      screens: {
        DemoShowroom: {
          path: "showroom/:queryIndex?/:itemIndex?",
        },
        DemoDebug: "debug",
        DemoPodcastList: "podcast",
        DemoCommunity: "community",
      },
    },
  },
};

interface AppProps {
  hideSplashScreen: () => Promise<void>;
}

/**
 * This is the root component of our app.
 */
function App(props: AppProps) {
  const { hideSplashScreen } = props;
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY);

  const [areFontsLoaded] = useFonts(customFontsToLoad);

  const { rehydrated } = useInitialRootStore(() => {
    // This runs after the root store has been initialized and rehydrated.

    // If your initialization scripts run very fast, it's good to show the splash screen for just a bit longer to prevent flicker.
    // Slightly delaying splash screen hiding for better UX; can be customized or removed as needed,
    // Note: (vanilla Android) The splash-screen will not appear if you launch your app via the terminal or Android Studio. Kill the app and launch it normally by tapping on the launcher icon. https://stackoverflow.com/a/69831106
    // Note: (vanilla iOS) You might notice the splash-screen logo change size. This happens in debug/development mode. Try building the app for release.
    setTimeout(hideSplashScreen, 500);
  });

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!rehydrated || !isNavigationStateRestored || !areFontsLoaded) return null;

  const linking = {
    prefixes: [prefix],
    config,
  };

  // otherwise, we're ready to render the app
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ToastProvider placement="top"
        renderType={{
          signalement: (toast) => (
            <View style={$containerSignalement}>
              <View style={$containerTitre}>
                <Image tintColor={toast.data.type == "PointInteret" ? colors.palette.vert : colors.palette.rouge} source={toast.data.type == "PointInteret" ? require("assets/icons/view.png") : require("assets/icons/attentionV2.png")} style={$iconeStyle} />
                <Text weight="bold" size="xl" style={$titreSignalement}>{toast.message}</Text>
                <Image tintColor={toast.data.type == "PointInteret" ? colors.palette.vert : colors.palette.rouge} source={toast.data.type == "PointInteret" ? require("assets/icons/view.png") : require("assets/icons/attentionV2.png")} style={$iconeStyle} />
              </View>
              <View style={$containerImageDesc}>
                <Image source={{ uri: `data:image/png;base64,${toast.data.image}` }} style={$imageStyle} />
                <Text style={$descriptionSignalement}>{toast.data.description}</Text>
              </View>
              <View style={$containerBoutons}>
                <Button
                  style={[$bouton, { backgroundColor: colors.bouton }]}
                  textStyle={$texteBouton}
                  text="Toujours présent"
                // onPress={() => }
                />
                <Button
                  style={[$bouton, { backgroundColor: colors.palette.orange }]}
                  textStyle={$texteBouton}
                  text="Voir moins"
                // onPress={() => }
                />
                {/* <View>
                  <Text style={{ width: 100, textAlign: "center" }}>Toujours présent ?</Text>
                  <Image source={require("assets/icons/aime.png")} tintColor={colors.bouton} style={[$iconeStyle, { width: 40, height: 40 }]} />
                </View>
                <Image source={require("assets/icons/deployer.png")} style={$iconeStyle} /> */}
              </View>
            </View>
          ),
        }}>
        <ErrorBoundary catchErrors={Config.catchErrors}>
          <AppNavigator
            linking={linking}
            initialState={initialNavigationState}
            onStateChange={onNavigationStateChange}
          />
        </ErrorBoundary>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const $containerSignalement: ViewStyle = {
  backgroundColor: colors.palette.blanc,
  padding: 10,
  borderRadius: 20,
  margin: spacing.sm,
  width: "90%"
}

const $containerTitre: ViewStyle = {
  flexDirection: "row",
  alignSelf: "center",
  marginBottom: spacing.sm
}

const $titreSignalement: TextStyle = {
  color: "black",
  paddingLeft: spacing.sm,
  paddingRight: spacing.sm
}

const $iconeStyle: ImageStyle = {
  width: 30,
  height: 30,
  alignSelf: "center"
}

const $imageStyle: ImageStyle = {
  marginStart: spacing.md,
  width: 125,
  height: 125,
  alignSelf: "center",
  borderRadius: 10
}

const $descriptionSignalement: TextStyle = {
  padding: spacing.sm,
  textAlign: "center",
  color: "black",
  flex: 1,
}

const $containerBoutons: ViewStyle = {
  flexDirection: "row",
  alignSelf: "center",
  justifyContent: "space-around",
  padding: 12,
  width: "100%"
}

const $containerImageDesc: ViewStyle = {
  flexDirection: "row",
  alignSelf: "center",
  paddingHorizontal: spacing.sm
}

const $bouton: ViewStyle = {
  alignSelf: "center",
  backgroundColor: colors.bouton,
  borderRadius: 13,
  borderColor: colors.fond,
  minHeight: 10,
  height: 25,
  paddingVertical: 0,
  paddingHorizontal: spacing.sm,
  marginLeft: spacing.sm,
  marginRight: spacing.sm
}

const $texteBouton: TextStyle = {
  color: colors.palette.blanc,
  fontSize: spacing.md,
  fontWeight: "bold",
  justifyContent: "center"
}

export default App;
