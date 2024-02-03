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
import React, { useEffect } from "react";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useInitialRootStore, useStores } from "./models";
import { AppNavigator, useNavigationPersistence } from "./navigators";
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary";
import * as storage from "./utils/storage";
import { customFontsToLoad } from "./theme";
import Config from "./config";

// Import pour la synchro
import NetInfo from "@react-native-community/netinfo";
import {
  envoieBaseDeDonneesSignalement,
  alertSynchroEffectuee,
} from "./services/synchroMontanteService";

//Import pour l'ui de l'ActionSheet
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

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
  let isConnected = false;
  const { synchroMontanteStore, parametres } = useStores();

  // Verifie la connexion avec l'interval défini dans les paramètres et s'il y a des signalements à envoyer
  useEffect(() => {
    const setupInterval = async () => {
      const intervalId = setInterval(async () => {

        // Vérifie la connexion
        const state = await NetInfo.fetch();
        isConnected = state.isConnected;

        let envoiResult = false;
        if (isConnected && synchroMontanteStore.signalements.length > 0) {
          envoiResult = await envoieBaseDeDonneesSignalement(synchroMontanteStore.signalements, synchroMontanteStore);
          
          if (envoiResult) {
            alertSynchroEffectuee();
          }
        }
      }, parametres.intervalSynchro * 3600000);
  
      return () => clearInterval(intervalId);
    };
  
    setupInterval();
  }, [isConnected]);

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

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ActionSheetProvider>
        <ErrorBoundary catchErrors={Config.catchErrors}>
          <AppNavigator
            linking={linking}
            initialState={initialNavigationState}
            onStateChange={onNavigationStateChange}
          />
        </ErrorBoundary>
      </ActionSheetProvider>
    </SafeAreaProvider>
  );
}

export default App;
