// Librairies
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
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Text, Screen, CarteSignalement } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
const { width, height } = Dimensions.get("window");

// Composants

interface SuiviTrackScreenProps extends AppStackScreenProps<"SuiviTrack"> { }

export const SuiviTrackScreen: FC<SuiviTrackScreenProps> = observer(
  function SuiviTrackScreen(props: SuiviTrackScreenProps) {
    const { route, navigation } = props;
    let excursion: Record<string, unknown>;
    let params: any;
    if (route?.params !== undefined) {
      params = route?.params;
    }
    params ? (excursion = params.excursion) : (excursion = null);

    // console.log(excursion.distance);


    const [userLocation, setUserLocation] = useState(null);
    const footerHeight = useBottomTabBarHeight();
    const [progress, setProgress] = useState(0);
    const [chronoRunning, setChronoRunning] = useState(false);
    const [chronoTime, setChronoTime] = useState(0);


    function toggleChrono() {
      setChronoRunning(!chronoRunning);
      console.log("Timer démarré");
    };

    function resetChrono() {
      console.log("Timer arrêté");
      setChronoRunning(false);
      setChronoTime(0);
    };

    function formatTime(timeInSeconds: number) {
      const hours = Math.floor(timeInSeconds / 3600);
      const minutes = Math.floor((timeInSeconds % 3600) / 60);
      const seconds = timeInSeconds % 60;
      const format = (num: number) => (num < 10 ? `0${num}` : `${num}`);
      return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
    };

    useEffect(() => {
      let interval: NodeJS.Timeout;

      if (chronoRunning) {
        interval = setInterval(() => {
          setChronoTime((prevTime) => prevTime + 1);
        }, 1000);
      } else {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }, [chronoRunning]);

    useEffect(() => {
      const fetchLocation = async () => {
        const location = await getUserLocation();
        setUserLocation(location);
      };

      fetchLocation();
    }, []);

    return true ? (
      <SafeAreaView style={$container}>
        <TouchableOpacity
          style={$boutonRetour}
          onPress={() => navigation.navigate("Excursions")}
        >
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
        <SwipeUpDown
          itemMini={itemMini(excursion, navigation, progress, setProgress, chronoTime, toggleChrono, resetChrono, formatTime, chronoRunning)}
          itemFull={itemFull(excursion, navigation, progress, setProgress, chronoTime, toggleChrono, resetChrono, formatTime, chronoRunning, userLocation)}
          animation="easeInEaseOut"
          swipeHeight={height / 4.5 + footerHeight}
          disableSwipeIcon={true}
        />
      </SafeAreaView>
    ) : (
      <Screen preset="fixed">
        <TouchableOpacity
          style={$boutonRetour}
          onPress={() => navigation.navigate("Excursions")}
        >
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
  }
);

/* --------------------------------- Fonctions --------------------------------- */

function itemMini(excursion: Record<string, unknown>, navigation: any, progress: number, setProgress: any, chronoTime: number, toggleChrono: () => void, resetChrono: () => void, formatTime: (timeInSeconds: number) => string, chronoRunning: boolean) {
  const increaseProgress = () => {
    if (progress < 100) { // 100 a remplacer par la valeur max de la barre de progression ( la distance totale de l'excursion)
      setProgress(progress + 2); // Augmente la valeur de progression de 2 (à ajuster en fonction de la distance parcourue) 
    }
  };

  let distance = 0;
  if (excursion !== undefined) {
    distance = excursion.distance as number;
  }

  return (
    <View style={$containerPetit}>
      <View style={$containerBouton}>
        <TouchableOpacity onPress={() => { toggleChrono() }}>
          <Image
            style={$boutonPauseArret}
            tintColor={colors.bouton}
            source={chronoRunning ? require("../../assets/icons/pause.png") : require("../../assets/icons/play.png")} />
        </TouchableOpacity>
        {/* Bouton pour augmenter la progression temporaire avant de faire avec l'avancement localisé*/}
        <TouchableOpacity style={$buttonIncreaseProgress} onPress={increaseProgress}>
          <Image source={require("../../assets/icons/caretRight.png")} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { resetChrono() }}>
          <Image style={$boutonPauseArret} source={require("../../assets/icons/arret.png")} />
        </TouchableOpacity>
      </View>
      <View style={$listeInfos}>
        <View style={$containerInfo}>
          <Image style={$icone} source={require("../../assets/icons/temps.png")} />
          <Text style={$texteInfo}>{formatTime(chronoTime)}</Text>
        </View>
        <View style={$containerInfo}>
          <Image
            style={$icone}
            source={require("../../assets/icons/denivelePositifV2.png")}
          />
          <Text style={$texteInfo}> 147 m</Text>
        </View>
        <View style={$containerInfo}>
          <Image style={$icone} source={require("../../assets/icons/deniveleNegatif.png")} />
          <Text style={$texteInfo}> 0 m</Text>
        </View>
      </View>
      {/* Barre de progression */}
      <View>
        <View style={$containerProgress}>
          <View style={$progressBar}>
            <View style={{ ...$progressBarFill, width: `${progress}%` }} />
          </View>
          {/* Flèche d'avancement */}
          <View style={{ ...$fleche, left: `${progress / 1.14}%` }}>
            <Image style={$iconeFleche} source={require("../../assets/icons/fleche.png")} />
          </View>
        </View>
      </View>
      <View style={$listeDistances}>
        <View style={$containerTextVariable}>
          <Text size="xs">Parcourus : </Text>
          <Text size="xs" weight="bold"> 0 km</Text>
        </View>
        <View style={$containerTextVariable}>
          <Text size="xs">Total : </Text>
          <Text size="xs" weight="bold">{distance} km</Text>
        </View>
      </View>
    </View >
  );
}

function itemFull(excursion: Record<string, unknown>, navigation: any, progress: number, setProgress: any, chronoTime: number, toggleChrono: () => void, resetChrono: () => void, formatTime: (timeInSeconds: number) => string, chronoRunning: boolean, userLocation: any) {
  const increaseProgress = () => {
    if (progress < 100) { // 100 a remplacer par la valeur max de la barre de progression ( la distance totale de l'excursion)
      setProgress(progress + 2); // Augmente la valeur de progression de 2 (à ajuster en fonction de la distance parcourue) 
    }
  };

  let distance = 0;
  if (excursion !== undefined) {
    distance = excursion.distance as number;
  }

  return (
    <View style={$containerGrand}>
      <View style={$containerBouton}>
        <TouchableOpacity onPress={() => { toggleChrono() }}>
          <Image
            style={$boutonPauseArret}
            tintColor={colors.bouton}
            source={chronoRunning ? require("../../assets/icons/pause.png") : require("../../assets/icons/play.png")} />
        </TouchableOpacity>
        {/* Bouton pour augmenter la progression temporaire avant de faire avec l'avancement localisé*/}
        <TouchableOpacity style={$buttonIncreaseProgress} onPress={increaseProgress}>
          <Image source={require("../../assets/icons/caretRight.png")} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { resetChrono() }}>
          <Image style={$boutonPauseArret} source={require("../../assets/icons/arret.png")} />
        </TouchableOpacity>
      </View>
      <View style={$listeInfos}>
        <View style={$containerInfo}>
          <Image style={$icone} source={require("../../assets/icons/temps.png")} />
          <Text style={$texteInfo}>{formatTime(chronoTime)}</Text>
        </View>
        <View style={$containerInfo}>
          <Image
            style={$icone}
            source={require("../../assets/icons/denivelePositifV2.png")}
          />
          <Text style={$texteInfo}> 147 m</Text>
        </View>
        <View style={$containerInfo}>
          <Image style={$icone} source={require("../../assets/icons/deniveleNegatif.png")} />
          <Text style={$texteInfo}> 0 m</Text>
        </View>
      </View>
      {/* Barre de progression */}
      <View>
        <View style={$containerProgress}>
          <View style={$progressBar}>
            <View style={{ ...$progressBarFill, width: `${progress}%` }} />
          </View>
          {/* Flèche d'avancement */}
          <View style={{ ...$fleche, left: `${progress / 1.14}%` }}>
            <Image style={$iconeFleche} source={require("../../assets/icons/fleche.png")} />
          </View>
        </View>
      </View>
      <View style={$listeDistances}>
        <View style={$containerTextVariable}>
          <Text size="xs">Parcourus : </Text>
          <Text size="xs" weight="bold"> 0 km</Text>
        </View>
        <View style={$containerTextVariable}>
          <Text size="xs">Total : </Text>
          <Text size="xs" weight="bold">{distance} km</Text>
        </View>
      </View>
      <View>
        <Text weight="bold" style={$titreSignalement}> Signalements </Text>
      </View>
      <View>

      </View>
    </View >
  );
}

function getUserLocation() {
  return new Promise(async (resolve, reject) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        resolve(null);
      }

      let location = await Location.getCurrentPositionAsync({});
      resolve(location.coords);
    } catch (error) {
      console.error("Error getting location", error);
      reject(error);
    }
  });
}

function listeSignalements(excursion, userLocation, footerHeight) {
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
              const distanceSignalement = userLocation ? recupDistance(coordSignalement) : 0;
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
                  />
                </View>
              );
            })}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </View>
  );
}

/* --------------------------------- Styles --------------------------------- */

const $root: ViewStyle = {
  flex: 1,
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

// const $containerPetit: ViewStyle = {
//   flex: 1,
//   width: width,
//   backgroundColor: colors.fond,
//   alignItems: "center",
//   borderWidth: 1,
//   borderColor: colors.bordure,
//   borderRadius: 10,
//   padding: spacing.xxs,
// };

const $containerPetit: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  // marginTop: height / 1.6,
  paddingTop: spacing.md,
};


const $containerGrand: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  marginTop: height / 4,
  paddingTop: spacing.md,
};

const $containerInfo: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  backgroundColor: "#F5F5F5",
  borderRadius: 20,
  padding: spacing.xs,
};

const $texteInfo: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
};

const $containerBouton: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
};

const $boutonPauseArret: ImageStyle = {
  width: 60,
  height: 60,
};

const $listeInfos: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  marginTop: spacing.sm,
  padding: spacing.xs,
};

const $icone: ImageStyle = {
  width: 22,
  height: 22,
};

const $listeDistances: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  padding: spacing.xxs,
};

const $containerTextVariable: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
};

/* --------------------------- Barre d'avancement --------------------------- */

/* Styles pour la barre de progression */
const $containerProgress: ViewStyle = {
  marginTop: spacing.sm,
  alignItems: "center",
};

const $progressBar: ViewStyle = {
  width: "90%", // Ajustez la largeur de la barre de progression selon vos besoins
  height: 10, // Ajustez la hauteur de la barre de progression selon vos besoins
  backgroundColor: "#F5F5F5", // Couleur de fond de la barre de progression
  borderRadius: 10,
  overflow: "hidden",
};

const $progressBarFill: ViewStyle = {
  height: "100%",
  backgroundColor: colors.palette.vert, // Couleur de la partie remplie de la barre de progression
};

/* Styles pour le bouton d'augmentation de la progression */
const $buttonIncreaseProgress: ViewStyle = {
  marginTop: spacing.sm,
  padding: spacing.sm,
  backgroundColor: colors.bouton, // Couleur du bouton
  borderRadius: 10,
  alignItems: "center",
};

const $textButton: TextStyle = {
  color: colors.palette.gris, // Couleur du texte du bouton
  fontSize: 16, // Taille de la police du texte du bouton
  fontWeight: "bold",
};

/* -------------------------------- La fleche ------------------------------- */

/* Styles pour la flèche d'avancement */
const $fleche: ViewStyle = {
  position: "absolute",
  top: -5, // Ajustez la position verticale de la flèche par rapport à la barre de progression
  width: "100%", // Ajustez la largeur pour qu'elle suive 90% de la page
  justifyContent: "flex-start", // Pour aligner le texte au début de la vue parente
  marginStart: "4%", // Ajustez la position horizontale de la flèche par rapport à la barre de progression
};

const $iconeFleche: ImageStyle = {
  width: 20, // Ajustez la largeur de la flèche selon vos besoins
  height: 20, // Ajustez la hauteur de la flèche selon vos besoins
  tintColor: colors.palette.vert, // Couleur de la flèche
};

/* ------------------------------ Signalements ------------------------------ */

const $titreSignalement: TextStyle = {
  fontSize: 20,
  textAlign: "center",
  marginTop: spacing.md,
};

const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
  paddingBottom: height / 2,
};

/* ------------------------------ Style Erreur ------------------------------ */

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
