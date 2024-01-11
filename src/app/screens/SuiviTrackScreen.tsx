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

    const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true);
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
          itemFull={itemFull(excursion, navigation, progress, setProgress, chronoTime, toggleChrono, resetChrono, formatTime, chronoRunning, userLocation, containerInfoAffiche, setcontainerInfoAffiche)}
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
      <View style={$containerBoutonChrono}>
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
      <View style={$listeDescription}>
        <View style={$containerInfo}>
          <Image style={$icone} source={require("../../assets/icons/duree.png")} />
          <Text style={$texteInfo}>{formatTime(chronoTime)}</Text>
        </View>
        <View style={$containerInfo}>
          <Image
            style={$icone}
            source={require("../../assets/icons/denivelePositifV2.png")}
          />
          <Text style={$texteInfo}> 0 m</Text>
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

function itemFull(excursion: Record<string, unknown>, navigation: any, progress: number, setProgress: any, chronoTime: number, toggleChrono: () => void, resetChrono: () => void, formatTime: (timeInSeconds: number) => string, chronoRunning: boolean, userLocation: any, containerInfoAffiche: boolean, setcontainerInfoAffiche) {
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
      <View style={$containerBoutonChrono}>
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
      <View style={$listeDescription}>
        <View style={$containerInfo}>
          <Image style={$icone} source={require("../../assets/icons/duree.png")} />
          <Text style={$texteInfo}>{formatTime(chronoTime)}</Text>
        </View>
        <View style={$containerInfo}>
          <Image
            style={$icone}
            source={require("../../assets/icons/denivelePositifV2.png")}
          />
          <Text style={$texteInfo}> 0 m</Text>
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
          <Text tx={"suiviTrack.barreAvancement.parcouru"} size="xs" />
          <Text size="xs" weight="bold"> 0 km</Text>
        </View>
        <View style={$containerTextVariable}>
          <Text tx={"suiviTrack.barreAvancement.total"} size="xs" />
          <Text size="xs" weight="bold">{distance} km</Text>
        </View>
      </View>
      <View>
        <View style={$containerBouton}>
          <TouchableOpacity
            onPress={() => {
              setcontainerInfoAffiche(true);
            }}
            style={$boutonDescriptionignalements}
          >
            <Text
              tx="suiviTrack.titres.description"
              size="lg"
              style={[containerInfoAffiche ? { color: colors.bouton, paddingLeft: spacing.lg } : { color: colors.text, paddingLeft: spacing.lg }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setcontainerInfoAffiche(false);
            }}
            style={$boutonDescriptionignalements}
          >
            <Text
              tx="suiviTrack.titres.signalements"
              size="lg"
              style={[containerInfoAffiche ? { color: colors.text, paddingEnd: spacing.lg } : { color: colors.bouton, paddingEnd: spacing.lg }]}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            $souligneDescriptionAvis,
            containerInfoAffiche
              ? { left: spacing.lg }
              // : { left: width - width / 2.5 - spacing.lg / 1.5 },
              : { left: width / 2 },
          ]}
        ></View>
        {containerInfoAffiche
          ? descritpion(excursion)
          : listeSignalements(excursion, userLocation)}
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

function descritpion(excursion) {
  return (
    <View style={$containerDescription}>
      {/* <Text weight="bold" style={$nomExcursion}>{excursion.nom}</Text> */}
      <View style={$typeParcours}>
        <Text tx="suiviTrack.description.typeParcours" />
        <Text>{excursion.typeParcours}</Text>
      </View>
      <View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: "space-around" }}>
          <View style={$blocInfo}>
            <Image style={$iconDescription} source={require("../../assets/icons/distance.png")} />
            <View style={$blocInterieurTexte}>
              <Text style={$texteDescription} tx="suiviTrack.description.distance" />
              <Text style={$texteDescription} >{excursion.distance} km</Text>
            </View>
          </View>
          <View style={$blocInfo}>
            <Image style={$iconDescription} source={require("../../assets/icons/duree.png")} />
            <View style={$blocInterieurTexte}>
              <Text style={$texteDescription} tx="suiviTrack.description.duree" />
              <Text style={$texteDescription} >{excursion.duree.h}h{excursion.duree.m}</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: "space-around" }}>
          <View style={$blocInfo}>
            <Image style={$iconDescription} source={require("../../assets/icons/difficulteTechnique.png")} />
            <View style={$blocInterieurTexte}>
              <Text style={$texteDescription} tx="suiviTrack.description.difficulteTech" />
              <Text style={$texteDescription} >{excursion.difficulteTechnique}/3</Text>
            </View>
          </View>
          <View style={$blocInfo}>
            <Image style={$iconDescription} source={require("../../assets/icons/difficulteOrientation.png")} />
            <View style={$blocInterieurTexte}>
              <Text style={$texteDescription} tx="suiviTrack.description.difficulteOrientation" />
              <Text style={$texteDescription} >{excursion.difficulteOrientation}/3</Text>
            </View>
          </View>
        </View>
      </View>

    </View >
  )
}

function listeSignalements(excursion, userLocation) {
  return (
    <View>
      {/* <Text weight="bold" style={$titreSignalement}> Signalements </Text> */}
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
              const distanceSignalement = userLocation ? recupDistance(coordSignalement, excursion.track) : 0;
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
    </View >
  );
}

function recupDistance(coordonneeSignalement, data: any) {
  // Charger le fichier JSON avec les coordonnées

  // Assurez-vous que les coordonnées du signalement sont définies
  if (!coordonneeSignalement || !coordonneeSignalement.lat || !coordonneeSignalement.lon) {
    throw new Error("Coordonnées du signalement non valides");
  }

  // Initialiser la distance minimale avec une valeur élevée
  let distanceMinimale: number = Number.MAX_VALUE;

  let coordPointPlusProche;

  // Parcourir toutes les coordonnées dans le fichier
  for (const coord of data) {
    // Assurez-vous que les coordonnées dans le fichier sont définies
    if (!coord.lat || !coord.lon) {
      console.error("Coordonnées dans le fichier non valides");
      continue;
    }

    // Calculer la distance entre le signalement et la coordonnée actuelle du fichier
    const distanceSignalementPointLePlusProche = calculeDistanceEntreDeuxPoints(
      coordonneeSignalement,
      coord,
    );

    // Mettre à jour la distance minimale si la distance actuelle est plus petite
    if (distanceSignalementPointLePlusProche < distanceMinimale) {
      distanceMinimale = distanceSignalementPointLePlusProche;
      coordPointPlusProche = coord;
    }
  }

  const distanceDepartPointLePlusProche = (coordPointPlusProche.dist / 1000).toFixed(2);

  //Distance totale DANS UN MONDE PARFAIT et pour calculer le temps de parcours en ajoutant la distance entre le point le plus proche et le départ sauf qu'il faut faire un algo parce que le point le pls proche peut ne pas être le point suivant (exemple un circuit qui fait un aller retour ou les points allez et retour sont proches)
  // const distanceTotale = distanceMinimale + distanceDepartPointLePlusProche; //c'est donc pas vraiment ce calcul qu'il faut faire
  // return distanceTotale;
  return distanceDepartPointLePlusProche;
}

// Fonction de calcul de distance entre deux coordonnées
function calculeDistanceEntreDeuxPoints(coord1, coord2) {
  // Assurez-vous que coord1 et coord2 sont définis
  if (
    !coord1 ||
    typeof coord1.lat === "undefined" ||
    typeof coord1.lon === "undefined" ||
    !coord2 ||
    typeof coord2.lat === "undefined" ||
    typeof coord2.lon === "undefined"
  ) {
    throw new Error("Coordonnées non valides");
  }

  // Rayon moyen de la Terre en kilomètres
  const R = 6371;

  // Convertir les degrés en radians
  const toRadians = degree => degree * (Math.PI / 180);

  // Calcul des distances
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);

  // Formule de Haversine pour calculer la distance entre deux points
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
    Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  // Distance en radians
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance en kilomètres
  const distance = R * c;

  return distance;
}

/* --------------------------------- Styles --------------------------------- */

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

const $containerPetit: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
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
  height: height
};

const $containerInfo: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  backgroundColor: "#F5F5F5",
  borderRadius: 20,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
};

const $texteInfo: TextStyle = {
  fontSize: spacing.md,
  fontWeight: "bold",
  paddingStart: spacing.xxs,
};

const $containerBoutonChrono: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
};

const $containerBouton: ViewStyle = {
  marginTop: spacing.xs,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
};

const $boutonPauseArret: ImageStyle = {
  tintColor: colors.palette.rouge,
  width: 55,
  height: 55,
};

const $listeDescription: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  marginTop: spacing.sm,
  padding: spacing.xs,
};

const $icone: ImageStyle = {
  width: 20,
  height: 20,
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
  zIndex: 1,
  fontSize: spacing.lg,
  textAlign: "center",
  marginTop: spacing.xs,
  position: "absolute",
  alignSelf: "center",
};

const $listeSignalements: ViewStyle = {
  marginTop: spacing.xl,
};

const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
  paddingBottom: height / 2,
};

/* ------------------------------ Description/Signalements ------------------------------ */
const $boutonDescriptionignalements: ViewStyle = {
  // paddingLeft: spacing.xl,
  // paddingRight: spacing.xl,
  justifyContent: "center",
};

const $souligneDescriptionAvis: ViewStyle = {
  backgroundColor: colors.bouton,
  height: 2,
  width: width / 2.5,
  position: "relative",
};

/* ------------------------------- Description ------------------------------ */
const $nomExcursion: TextStyle = {
  fontSize: 24,
  textAlign: "center",
  marginTop: spacing.sm,
  alignSelf: "center",
};

const $containerDescription: ViewStyle = {
  padding: spacing.md,
};

const $typeParcours: ViewStyle = {
  flexDirection: "row",
  paddingBottom: spacing.sm,
  paddingStart: spacing.sm,
};

const $iconDescription: ImageStyle = {
  width: 25,
  height: 25,
  // tintColor: colors.palette.vert,
  marginEnd: spacing.xs
};

const $blocInfo: ViewStyle = {
  // justifyContent: "space-between",
  // flexBasis: '50%',
  flexDirection: "row",
  alignItems: "center",
  height: 50,
  width: 150,
  // justifyContent: "space-between",
  // marginTop: spacing.sm,
  // padding: spacing.sm,
};

const $blocInterieurTexte: ViewStyle = {
  flexDirection: "column",
  // alignItems: "center",
  // justifyContent: "space-between",
  // marginTop: spacing.sm,
  // padding: spacing.sm,
};

const $texteDescription: TextStyle = {
  // fontWeight: "bold",
  fontSize: 12,
  lineHeight: 18,
};

const $containerBlocs: ViewStyle = {};
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
