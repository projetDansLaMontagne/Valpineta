// Librairies
import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import {
  View,
  ViewStyle,
  TouchableOpacity,
  Image,
  TextStyle,
  ImageStyle,
  Dimensions,
} from "react-native";
import { Text, GraphiqueDenivele } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Erreur } from "./Erreur";
import { ListeSignalements } from "./ListeSignalements";
const { width, height } = Dimensions.get("window");

export interface SuiviTrackProps {
  excursion: Record<string, unknown>;
  navigation: any;
  setIsSuiviTrack: React.Dispatch<React.SetStateAction<boolean>>;
  setStartPoint: React.Dispatch<React.SetStateAction<any>>;
}

export function SuiviTrack(props: SuiviTrackProps) {
  const { excursion, navigation } = props;

  const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [altitudeActuelle, setAltitudeActuelle] = useState(0);
  const [deniveleMonte, setDeniveleMonte] = useState(0);
  const [deniveleDescendu, setDeniveleDescendu] = useState(0);

  const footerHeight = useBottomTabBarHeight();
  const [progress, setProgress] = useState(0);
  const [chronoRunning, setChronoRunning] = useState(false);
  const [chronoTime, setChronoTime] = useState(0);


  function toggleChrono() {
    setChronoRunning(!chronoRunning);
  }

  function resetChrono() {
    setChronoRunning(false);
    setChronoTime(0);
  }

  function formatTime(timeInSeconds: number) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    const format = (num: number) => (num < 10 ? `0${num}` : `${num}`);
    return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (chronoRunning) {
      interval = setInterval(() => {
        setChronoTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [chronoRunning]);

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getUserLocationAndUpdate(
        setAltitudeActuelle,
        setDeniveleMonte,
        deniveleMonte,
        setDeniveleDescendu,
        deniveleDescendu,
      );
      setUserLocation(location);
    };

    fetchLocation();
  }, []);

  return excursion ? (
    <SwipeUpDown
      itemMini={item(true)}
      itemFull={item(false)}
      animation="easeInEaseOut"
      swipeHeight={height / 5 + footerHeight}
      disableSwipeIcon={true}
    />
  ) : (
    //sinon on affiche une erreur
    <Erreur navigation={navigation} />
  );

  //Fonction principale
  function item(isMini) {
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
      <View style={isMini ? $containerPetit : $containerGrand}>
        <View style={$containerBoutonChrono}>
          <TouchableOpacity onPress={() => { toggleChrono() }}>
            <Image
              style={$boutonPauseArret}
              tintColor={colors.bouton}
              source={chronoRunning ? require("assets/icons/pause.png") : require("assets/icons/play.png")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { resetChrono() }}>
            <Image style={$boutonPauseArret} source={require("assets/icons/arret.png")} />
          </TouchableOpacity>
        </View>
        <View style={$listeDescription}>
          <View style={$containerInfo}>
            <Image style={$icone} source={require("assets/icons/duree.png")} />
            <Text style={$texteInfo}>{formatTime(chronoTime)}</Text>
          </View>
          <View style={$containerInfo}>
            <Image
              style={$icone}
              source={require("assets/icons/denivelePositifV2.png")}
            />
            <Text style={$texteInfo}> {deniveleMonte.toFixed()} m</Text>
          </View>
          <View style={$containerInfo}>
            <Image style={$icone} source={require("assets/icons/deniveleNegatif.png")} />
            <Text style={$texteInfo}> {deniveleDescendu.toFixed()} m</Text>
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
              <Image style={$iconeFleche} source={require("assets/icons/fleche.png")} />
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
        {isMini ? null :
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
                  : { left: width / 2 },
              ]}
            ></View>
            {containerInfoAffiche
              ? descritpion(excursion, altitudeActuelle)
              :
              <ListeSignalements
                excursion={excursion}
                footerHeight={footerHeight}
                style={$containerSignalements}
                userLocation={userLocation}
                distanceDepuisUser={true}
                setStartPoint={props.setStartPoint}
              />
            }
          </View>
        }
      </View >
    );
  }
}


/* --------------------------------- Fonctions --------------------------------- */

function getUserLocationAndUpdate(setAltitudeActuelle, setDeniveleMonte, deniveleMonte, setDeniveleDescendu, deniveleDescendu) {
  return new Promise(async (resolve, reject) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission d'accès à la localisation refusée");
        resolve(null);
      }

      let altitudePrecedente = 0;

      // Obtention de la position initiale
      let location = await Location.getCurrentPositionAsync({});
      setAltitudeActuelle(location.coords.altitude); // Mettre à jour l'état

      resolve(location.coords);

      // Mise à jour de la position à intervalles réguliers
      const updateInterval = 1000;
      setInterval(async () => {
        try {
          location = await Location.getCurrentPositionAsync({});
          const nouvelleAltitude = location.coords.altitude;
          setAltitudeActuelle(nouvelleAltitude);

          // Mettre à jour deniveleMonte et deniveleDescendu en fonction de l'altitude
          if (altitudePrecedente != 0) {
            if (nouvelleAltitude > altitudePrecedente) {
              deniveleMonte = deniveleMonte + (nouvelleAltitude - altitudePrecedente);
            } else if (nouvelleAltitude < altitudePrecedente) {
              deniveleDescendu = deniveleDescendu + (altitudePrecedente - nouvelleAltitude);
            }
          } else {
            altitudePrecedente = nouvelleAltitude;
          }

          // Mettre à jour l'altitude précédente
          altitudePrecedente = nouvelleAltitude;

          setDeniveleMonte(deniveleMonte);
          setDeniveleDescendu(deniveleDescendu);

          resolve(location.coords);
        } catch (error) {
          console.error("Erreur lors de la récupération de la position", error);
          reject(error);
        }
      }, updateInterval);
    } catch (error) {
      console.error("Erreur lors de la récupération de la position", error);
      reject(error);
    }
  });
}

function descritpion(excursion, altitudeActuelle) {
  let track = excursion.track;
  let altitudeMax = 0;
  let altitudeMin = Infinity;

  if (track !== undefined) {
    track.forEach(element => {
      if (element.alt > altitudeMax) {
        altitudeMax = element.alt;
      }
      if (element.alt < altitudeMin) {
        altitudeMin = element.alt;
      }
    });
  }
  return (
    <View style={$containerDescription}>
      <Text weight="bold" style={$nomExcursion}>
        {excursion.nom}
      </Text>
      <View style={$typeParcours}>
        <Text size="xs" tx="suiviTrack.description.typeParcours" />
        <Text size="xs">{excursion.typeParcours}</Text>
      </View>
      <View>
        <View style={$listeInfos}>
          <View style={$blocInfo}>
            <Image style={$iconDescription} source={require("assets/icons/distance.png")} />
            <View style={$blocInterieurTexte}>
              <Text style={$texteDescription} tx="suiviTrack.description.distance" />
              <Text style={$texteDescription}>{excursion.distance} km</Text>
            </View>
          </View>
          <View style={$blocInfo}>
            <Image style={$iconDescription} source={require("assets/icons/duree.png")} />
            <View style={$blocInterieurTexte}>
              <Text style={$texteDescription} tx="suiviTrack.description.duree" />
              <Text style={$texteDescription}>
                {excursion.duree.h}h{excursion.duree.m}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around" }}>
          <View style={$blocInfo}>
            <Image
              style={$iconDescription}
              source={require("assets/icons/difficulteTechnique.png")}
            />
            <View style={$blocInterieurTexte}>
              <Text style={$texteDescription} tx="suiviTrack.description.difficulteTech" />
              <Text style={$texteDescription}>{excursion.difficulteTechnique}/3</Text>
            </View>
          </View>
          <View style={$blocInfo}>
            <Image
              style={$iconDescription}
              source={require("assets/icons/difficulteOrientation.png")}
            />
            <View style={$blocInterieurTexte}>
              <Text style={$texteDescription} tx="suiviTrack.description.difficulteOrientation" />
              <Text style={$texteDescription}>{excursion.difficulteOrientation}/3</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={$containerDenivele}>
        <View>
          <Text style={$texteDenivele} weight="bold" tx="suiviTrack.description.denivele" />
          {excursion.track && (
            <GraphiqueDenivele points={excursion.track} detaille={false} largeur={width / 1.5} />
          )}
        </View>
        <View style={$listeAltitudes}>
          <View style={$blocAltitude}>
            <Text tx="suiviTrack.description.altitudeActuelle" style={$texteDescription} />
            <Text style={$texteDescription}>{altitudeActuelle.toFixed()} m</Text>
          </View>
          <View style={$blocAltitude}>
            <Text tx="suiviTrack.description.altitudeMax" style={$texteDescription} />
            <Text style={$texteDescription}>{altitudeMax.toFixed()} m</Text>
          </View>
          <View style={$blocAltitude}>
            <Text tx="suiviTrack.description.altitudeMin" style={$texteDescription} />
            <Text style={$texteDescription}>{altitudeMin.toFixed()} m</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* --------------------------------- Styles --------------------------------- */
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
  marginTop: height / 4.5,
  paddingTop: spacing.md,
  height: height,
};

const $containerInfo: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  backgroundColor: "#F5F5F5",
  borderRadius: 20,
  paddingVertical: spacing.xxs,
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
  marginBottom: spacing.xs,
};

const $containerBouton: ViewStyle = {
  marginTop: spacing.md,
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
  padding: spacing.xxs,
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

const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
};

/* ------------------------------ Description/Signalements ------------------------------ */
const $boutonDescriptionignalements: ViewStyle = {
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
  fontSize: 18,
  textAlign: "center",
  alignSelf: "center",
  paddingBottom: spacing.xxs,
};

const $containerDescription: ViewStyle = {
  padding: spacing.md,
};

const $typeParcours: ViewStyle = {
  flexDirection: "row",
  alignSelf: "center",
};

const $iconDescription: ImageStyle = {
  width: 25,
  height: 25,
  // tintColor: colors.palette.vert,
  marginEnd: spacing.xs,
};

const $listeInfos: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-around",
};

const $blocInfo: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  height: 42,
  width: 150, // A modifier en fonction du nombre de mot / ligne que je veux
};

const $blocInterieurTexte: ViewStyle = {
  flexDirection: "column",
};

const $texteDescription: TextStyle = {
  fontSize: 12,
  lineHeight: 14,
};

const $containerDenivele: ViewStyle = {
  width: width * 0.5,
  flexDirection: "row",
  paddingTop: spacing.md,
};

const $texteDenivele: TextStyle = {
  fontSize: spacing.md,
  lineHeight: 16,
  textAlign: "center",
  paddingStart: spacing.xxl,
};

const $listeAltitudes: ViewStyle = {
  paddingStart: spacing.sm,
  marginTop: spacing.xl,
};

const $blocAltitude: ViewStyle = {
  flexDirection: "row",
  paddingBottom: spacing.md,
};