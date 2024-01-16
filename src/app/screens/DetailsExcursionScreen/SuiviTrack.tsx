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
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Text, CarteSignalement, GraphiqueDenivele, T_Point } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { recupDistance } from "app/utils/recupDistance";
import { T_flat_point } from "app/navigators";
import { Erreur } from "./Erreur";
const { width, height } = Dimensions.get("window");


export interface SuiviTrackProps {
  excursion: Record<string, unknown>;
  navigation: any;
  setIsSuiviTrack: React.Dispatch<React.SetStateAction<boolean>>;
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
          {/* Bouton pour augmenter la progression temporaire avant de faire avec l'avancement localisé*/}
          <TouchableOpacity style={$buttonIncreaseProgress} onPress={increaseProgress}>
            <Image source={require("assets/icons/caretRight.png")} />
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
              : listeSignalements(excursion, userLocation)}
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

function listeSignalements(excursion, userLocation) {
  return (
    <View>
      <ScrollView>
        <TouchableWithoutFeedback>
          <View style={$containerSignalements}>
            {excursion?.signalements?.map((signalement, index) => {
              // Calcule de la distance pour chaque avertissement
              const coordSignalement: T_flat_point = {
                lat: signalement.latitude,
                lon: signalement.longitude,
              };

              let distanceDepartPointLePlusProcheSignalement = recupDistance(coordSignalement, excursion.track);

              let distanceDepartPointLePlusProcheUtilisateur = recupDistance(userLocation as T_flat_point, excursion.track);

              let distanceSignalement = (distanceDepartPointLePlusProcheSignalement - distanceDepartPointLePlusProcheUtilisateur).toFixed(2); //distance entre le point le plus proche de l'utilisateur et le point le plus proche du signalement

              //Distance totale DANS UN MONDE PARFAIT et pour calculer le temps de parcours en ajoutant la distance entre le point le plus proche et le départ sauf qu'il faut faire un algo parce que le point le pls proche peut ne pas être le point suivant (exemple un circuit qui fait un aller retour ou les points allez et retour sont proches)
              // const distanceTotale = distanceMinimale + distanceDepartPointLePlusProcheSignalement; //c'est donc pas vraiment ce calcul qu'il faut faire
              // return distanceTotale;

              if (Number(distanceSignalement) < 0) {
                distanceSignalement = "depassé                                    ";
              }

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



// function recupDistance(coordonneeSignalement, data: any, userLocation) {
//   //on va devoir trouver le point le plus proche de nos coordonnées, puis on calcule la distance entre ce point et le signalement
//   const cooredonneesUtilsateur = {
//     lat: userLocation.latitude,
//     lon: userLocation.longitude,
//     alt: null,
//     dist: null,
//   };

//   // Assurez-vous que les coordonnées du signalement sont définies
//   if (!coordonneeSignalement || !coordonneeSignalement.lat || !coordonneeSignalement.lon) {
//     throw new Error("Coordonnées du signalement non valides");
//   }

//   // Initialiser la distance minimale avec une valeur élevée
//   let distanceMinimaleSignalement: number = Number.MAX_VALUE;
//   let distanceMinimaleUtilisateur: number = Number.MAX_VALUE;

//   let coordPointPlusProcheSignalement;
//   let coordPointPlusProcheUtilisateur;

//   // Parcourir toutes les coordonnées dans le fichier
//   for (const coord of data) {
//     // Assurez-vous que les coordonnées dans le fichier sont définies
//     if (!coord.lat || !coord.lon) {
//       console.error("Coordonnées dans le fichier non valides");
//       continue;
//     }

//     // Calculer la distance entre le signalement et la coordonnée actuelle du fichier
//     const distanceSignalementPointLePlusProche = calculeDistanceEntreDeuxPoints(
//       coordonneeSignalement,
//       coord,
//     );  //on ignore pour l'instant 

//     // Mettre à jour la distance minimale si la distance actuelle est plus petite
//     if (distanceSignalementPointLePlusProche < distanceMinimaleSignalement) {
//       distanceMinimaleSignalement = distanceSignalementPointLePlusProche;
//       coordPointPlusProcheSignalement = coord;
//     }

//     //on fait la même chpse pour trouver le point le plus proche de l'utilisateur
//     // on trouve le point le plus proche de l'utilisateur
//     // on calcule la distance entre ce point et le point de départ en faisant coordPointPlusProche.dist

//     const distanceUtilisateurPointLePlusProche = calculeDistanceEntreDeuxPoints(
//       cooredonneesUtilsateur,
//       coord,
//     );

//     if (distanceUtilisateurPointLePlusProche < distanceMinimaleUtilisateur) {
//       distanceMinimaleUtilisateur = distanceUtilisateurPointLePlusProche;
//       coordPointPlusProcheUtilisateur = coord;
//     }
//   }

//   const distanceDepartPointLePlusProcheSignalement: number = (coordPointPlusProcheSignalement.dist / 1000); //distance entre le point de départ et le point le plus proche du signalement

//   const distanceDepartPointLePlusProcheUtilisateur: number = (coordPointPlusProcheUtilisateur.dist / 1000); //distance entre le point de départ et le point le plus proche de l'utilisateur

//   const distancePointLePlusProcheUtilisateur_PointLePlusProcheSignalement = (distanceDepartPointLePlusProcheSignalement - distanceDepartPointLePlusProcheUtilisateur).toFixed(2); //distance entre le point le plus proche de l'utilisateur et le point le plus proche du signalement

//   //Distance totale DANS UN MONDE PARFAIT et pour calculer le temps de parcours en ajoutant la distance entre le point le plus proche et le départ sauf qu'il faut faire un algo parce que le point le pls proche peut ne pas être le point suivant (exemple un circuit qui fait un aller retour ou les points allez et retour sont proches)
//   // const distanceTotale = distanceMinimale + distanceDepartPointLePlusProcheSignalement; //c'est donc pas vraiment ce calcul qu'il faut faire
//   // return distanceTotale;
//   return distancePointLePlusProcheUtilisateur_PointLePlusProcheSignalement;
// }

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
  height: height / 2,
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

const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
  paddingBottom: height / 2,
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
