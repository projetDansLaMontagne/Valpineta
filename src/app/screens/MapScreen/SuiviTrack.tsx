// Librairies
import React, { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import {
  View,
  ViewStyle,
  TouchableOpacity,
  Image,
  TextStyle,
  ImageStyle,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Text, GraphiqueDenivele, Erreur } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ListeSignalements } from "../../components/ListeSignalements";
import { recupDistance } from "app/utils/recupDistance";
import { T_flat_point, T_excursion } from "app/navigators";
import { useStores } from "app/models";
import { distanceEntrePoints } from "app/utils/distanceEntrePoints";
const { width, height } = Dimensions.get("window");

export interface SuiviTrackProps {
  excursion: T_excursion;
  navigation: any;
}

export function SuiviTrack(props: SuiviTrackProps) {
  const { excursion, navigation } = props;
  const { suiviExcursion } = useStores();
  const footerHeight = useBottomTabBarHeight();
  const swipeUpDownRef = useRef();

  const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [altitudeActuelle, setAltitudeActuelle] = useState(0);
  const [deniveleMonte, setDeniveleMonte] = useState(0);
  const [deniveleDescendu, setDeniveleDescendu] = useState(0);
  const [progress, setProgress] = useState(0);
  const [chronoRunning, setChronoRunning] = useState(false);
  const [chronoTime, setChronoTime] = useState(0);
  const [avancement, setAvancement] = useState(0);

  function showMini() {
    if (swipeUpDownRef.current) swipeUpDownRef.current.showMini();
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
    if (suiviExcursion.etat == "enCours") {
      setChronoRunning(true);
    } else if (suiviExcursion.etat == "enPause") {
      setChronoRunning(false);
    }
  }, [suiviExcursion.etat]);

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

  useEffect(() => {
    console.log("useEffect");
    // Convertir la distance en nombre
    const distanceNumber = excursion.distance;

    if (!isNaN(distanceNumber) && avancement / 1000 < distanceNumber) {
      console.log;
      // On récupère la distance parcourue grace a trackSuivi et là distance du point courant par rapport au départ, car on veut pas afficher que l'utilisateur a parcouru plus que la distance totale
      setAvancement(() => {
        console.log("setAvancement");
        if (suiviExcursion.iPointCourant > 0) {
          console.log("distance mise a jour");
          console.log(suiviExcursion.trackSuivi[suiviExcursion.iPointCourant].dist);
          return suiviExcursion.trackSuivi[suiviExcursion.iPointCourant].dist;
        } else {
          return 0;
        }
      });

      setProgress((avancement / 1000 / distanceNumber) * 100);
    } else {
      console.log("avancement :", avancement, "distanceNumber", distanceNumber);
      // Réinitialiser les valeurs si nécessaire
    }
  }, [suiviExcursion.iPointCourant]);

  return excursion ? (
    <SwipeUpDown
      ref={swipeUpDownRef}
      itemMini={item(excursion, true)}
      itemFull={item(excursion, false)}
      animation="easeInEaseOut"
      swipeHeight={height / 5 + footerHeight}
      disableSwipeIcon={true}
    />
  ) : (
    //sinon on affiche une erreur
    <Erreur navigation={navigation} />
  );

  //Fonction principale
  function item(excursion, isMini) {
    return (
      <View style={isMini ? $containerPetit : $containerGrand}>
        <View style={$containerBoutonChrono}>
          <TouchableOpacity
            onPress={() => {
              modifierEtatExcursion(suiviExcursion);
            }}
          >
            <Image
              style={$boutonPauseArret}
              tintColor={colors.bouton}
              source={
                suiviExcursion.etat == "enCours"
                  ? require("assets/icons/pause.png")
                  : require("assets/icons/play.png")
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              resetChrono();
              suiviExcursion.setEtat({ newEtat: "terminee" });
            }}
          >
            <Image style={$boutonPauseArret} source={require("assets/icons/arret.png")} />
          </TouchableOpacity>
        </View>
        <View style={$listeDescription}>
          <View style={$containerInfo}>
            <Image style={$icone} source={require("assets/icons/duree.png")} />
            <Text style={$texteInfo}>{formatTime(chronoTime)}</Text>
          </View>
          <View style={$containerInfo}>
            <Image style={$icone} source={require("assets/icons/denivelePositifV2.png")} />
            <Text style={$texteInfo}> {deniveleMonte.toFixed()} m</Text>
          </View>
          <View style={$containerInfo}>
            <Image style={$icone} source={require("assets/icons/deniveleNegatif.png")} />
            <Text style={$texteInfo}> {deniveleDescendu.toFixed()} m</Text>
          </View>
        </View>
        <View style={{ bottom: spacing.xs }}>
          <View>
            <View style={$containerProgress}>
              {excursion.signalements &&
                //pour chaque signalement, en fonction de son type on affiche une icone differente
                excursion.signalements.map((signalement, index) => {
                  let icone;
                  if (signalement.type == "PointInteret") {
                    icone = require("assets/icons/view.png");
                  } else {
                    icone = require("assets/icons/attentionV2.png");
                  }

                  const coordonnesSignalement: T_flat_point = {
                    lat: signalement.lat,
                    lon: signalement.lon,
                  };

                  const positionPercentage =
                    (recupDistance(coordonnesSignalement, excursion.track) / excursion.distance) *
                    100;
                  return (
                    <View
                      key={index}
                      style={{
                        position: "absolute",
                        left: `${positionPercentage}%`,
                        bottom: spacing.xs,
                      }}
                    >
                      <Image
                        source={require("assets/icons/pinFull.png")}
                        style={{
                          width: 33,
                          height: 33,
                          tintColor:
                            signalement.type == "PointInteret"
                              ? colors.palette.vert
                              : colors.palette.rouge,
                        }}
                      />
                      <Image source={icone} style={iconeStyle} />
                    </View>
                  );
                })}
              <View style={$progressBar}>
                <View style={{ ...$progressBarFill, width: `${progress}%` }} />
              </View>
              <View style={{ ...$fleche, left: `${progress / 1.14}%` }}>
                <Image style={$iconeFleche} source={require("assets/icons/fleche.png")} />
              </View>
            </View>
          </View>
          <View style={$listeDistances}>
            <View style={$containerTextVariable}>
              <Text tx={"suiviTrack.barreAvancement.parcouru"} size="xs" />
              <Text size="xs" weight="bold">
                {(avancement / 1000).toFixed(3)} km
              </Text>
              {/*A remplacer par la distance parcourue par l'utilisateur*/}
            </View>
            <View style={$containerTextVariable}>
              <Text tx={"suiviTrack.barreAvancement.total"} size="xs" />
              <Text size="xs" weight="bold">
                {excursion.distance} km
              </Text>
            </View>
          </View>
        </View>
        {isMini ? null : (
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
                  style={[
                    containerInfoAffiche
                      ? { color: colors.bouton, paddingLeft: spacing.lg }
                      : { color: colors.text, paddingLeft: spacing.lg },
                  ]}
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
                  style={[
                    containerInfoAffiche
                      ? { color: colors.text, paddingEnd: spacing.lg }
                      : { color: colors.bouton, paddingEnd: spacing.lg },
                  ]}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                $souligneDescriptionAvis,
                containerInfoAffiche ? { left: spacing.lg } : { left: width / 2 },
              ]}
            ></View>
            {containerInfoAffiche ? (
              descritpion(excursion, altitudeActuelle)
            ) : userLocation == null ? (
              <View style={$containerLoader}>
                <ActivityIndicator size="large" color={colors.palette.vert} />
              </View>
            ) : (
              <ListeSignalements
                style={$containerSignalements}
                detaille={true}
                signalements={excursion.signalements}
                track={excursion.track}
                onPress={showMini}
              />
            )}
          </View>
        )}
      </View>
    );
  }
}

/* --------------------------------- Fonctions --------------------------------- */

function getUserLocationAndUpdate(
  setAltitudeActuelle,
  setDeniveleMonte,
  deniveleMonte,
  setDeniveleDescendu,
  deniveleDescendu,
) {
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
  const { suiviExcursion } = useStores();

  let track = excursion.track;
  let altitudeMax = 0;
  let altitudeMin = 0;

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
      {suiviExcursion.trackReel.map((point, i) => (
        <Text key={i}>
          {new Date(point.timestamp).toLocaleTimeString()} {point.lat} {point.lon} {point.alt}
        </Text>
      ))}
    </View>
  );
}

function modifierEtatExcursion(suiviExcursion) {
  if (suiviExcursion.etat === "enCours") {
    suiviExcursion.setEtat({ newEtat: "enPause" });
  } else {
    suiviExcursion.setEtat({ newEtat: "enCours" });
  }
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
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
};

const $boutonPauseArret: ImageStyle = {
  tintColor: colors.palette.rouge,
  width: 50,
  height: 50,
};

const $listeDescription: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
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
  marginTop: spacing.xxl,
  alignItems: "center",
};

const $progressBar: ViewStyle = {
  width: "85%", // Ajuste la largeur de la barre de progression
  height: 10, // Ajuste la hauteur de la barre de progression
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
  top: -5, // Ajuste la position verticale de la flèche par rapport à la barre de progression
  width: "100%", // Ajuste la largeur pour qu'elle suive 90% de la page
  justifyContent: "flex-start", // Pour aligner le texte au début de la vue parente
  marginStart: "4%", // Ajuste la position horizontale de la flèche par rapport à la barre de progression
};

const $iconeFleche: ImageStyle = {
  width: 20, // Ajuste la largeur de la flèche selon vos besoins
  height: 20, // Ajuste la hauteur de la flèche selon vos besoins
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

const iconeStyle: ImageStyle = {
  width: 18,
  height: 18,
  top: 4,
  left: 7.2,
  position: "absolute",
  tintColor: colors.palette.blanc,
};

const $containerLoader: ViewStyle = {
  top: height / 7,
};
