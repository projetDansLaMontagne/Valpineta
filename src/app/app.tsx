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
import React, { useEffect, useState } from "react";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useInitialRootStore, useStores } from "./models";
import { AppNavigator, useNavigationPersistence } from "./navigators";
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary";
import * as storage from "./utils/storage";
import { customFontsToLoad } from "./theme";
import Config from "./config";
import { colors } from "./theme";

// Import pour la synchro
import NetInfo from "@react-native-community/netinfo";
// import BackgroundFetch from "react-native-background-fetch";

//Import pour l'ui de l'ActionSheet
import { ToastProvider } from "react-native-toast-notifications";
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

  // useEffect(() => {
  //   initBackgroundFetch();
  // }, [])

  // const addEvent = (taskId) => {

  //   return NetInfo.fetch().then(state => {
  //     if (state.isConnected) {
  //       // send notification
  //     }
  //   });
  // }

  // const initBackgroundFetch = async () => {
  //   // BackgroundFetch event handler.
  //   const onEvent = async (taskId) => {
  //     console.log('[BackgroundFetch] task: ', taskId);
  //     // Do your background work...
  //     await addEvent(taskId);
  //     // IMPORTANT:  You must signal to the OS that your task is complete.
  //     BackgroundFetch.finish(taskId);
  //   }

  //   // Timeout callback is executed when your Task has exceeded its allowed running-time.
  //   // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
  //   const onTimeout = async (taskId) => {
  //     console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
  //     BackgroundFetch.finish(taskId);
  //   }

  //   // Initialize BackgroundFetch only once when component mounts.
  //   let status = await BackgroundFetch.configure({ minimumFetchInterval: 15 }, onEvent, onTimeout);

  //   console.log('[BackgroundFetch] configure status: ', status);
  // }
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ToastProvider placement="top">
        <ActionSheetProvider>
          <ErrorBoundary catchErrors={Config.catchErrors}>
            <AppNavigator
              linking={linking}
              initialState={initialNavigationState}
              onStateChange={onNavigationStateChange}
            />
          </ErrorBoundary>
        </ActionSheetProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
