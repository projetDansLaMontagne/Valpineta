import React, { FC, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Animated,
  View,
  StyleSheet,
  GestureResponderEvent,
  Platform,
  ViewStyle,
  Dimensions,
  Image,
} from "react-native";
import { AppStackScreenProps, T_Signalement, T_excursion } from "app/navigators";
import { Screen } from "app/components";
import { spacing, colors } from "app/theme";
import { T_Point } from "app/screens/DetailsExcursionScreen";
import { ImageSource } from "react-native-vector-icons/Icon";

// location
import * as Location from "expo-location";
import MapView, { LatLng, Marker, Polyline, UrlTile } from "react-native-maps";
import MapButton from "./MapButton";
import { Asset } from "expo-asset";

// files
import * as fileSystem from "expo-file-system";
import TilesRequire from "app/services/importAssets/tilesRequire";
import fichierJson from "assets/Tiles/tiles_struct.json";

// images
const binoculars: ImageSource = require("assets/icons/binoculars.png");
const attention: ImageSource = require("assets/icons/attention.png");
const markerImage: ImageSource = require("assets/icons/location.png");

type MapScreenProps = AppStackScreenProps<"Carte"> & {
  excursionAffichee?: T_excursion;
};
export const MapScreen: FC<MapScreenProps> = observer(function EcranTestScreen(_props) {
  const { navigation, route } = _props;
  const excursionAffichee = route?.params?.excursion ?? _props.excursionAffichee;

  // Constants
  const USER_LOCATION_INTERVAL_MS = 1000; // ! mabye change this value

  // States
  const [gavePermission, setGavePermission] = useState(false);
  const [location, setLocation] = useState(null);
  const [followUserLocation, setFollowUserLocation] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [allExcursions, setAllExcursions] = useState<T_excursion[]>(undefined);
  const [startPoint, setStartPoint] = useState<LatLng>();

  // Refs
  const intervalRef = useRef(null);
  const watchPositionSubscriptionRef = useRef<Location.LocationSubscription>(null);
  const mapRef = useRef<MapView>(null);

  // Buttons
  const followLocationButtonRef = useRef(null);
  const toggleBtnMenuRef = useRef(null);
  const addPOIBtnRef = useRef(null);
  const addWarningBtnRef = useRef(null);

  // Animation(s)
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Functions
  /**
   * Animate the map to follow the user location.
   * @param passedLocation {Location.LocationObject} The location to animate to
   * @returns {void}
   */
  const animateToLocation = (passedLocation?: Location.LocationObject | LatLng): void => {
    if (mapRef.current) {
      if (!location && !passedLocation) {
        console.log("[MapScreen] location is null");
        return;
      }

      const finalLocation = passedLocation ?? location;

      mapRef.current.animateCamera({
        center: {
          latitude: finalLocation.coords ? finalLocation.coords.latitude : finalLocation.latitude,
          longitude: finalLocation.coords
            ? finalLocation.coords.longitude
            : finalLocation.longitude,
        },
      });
    } else {
      console.log("[MapScreen] mapRef.current is null");
    }
  };

  /**
   * Remove the location subscription
   */
  const removeLocationSubscription = () => {
    if (watchPositionSubscriptionRef.current) {
      watchPositionSubscriptionRef.current.remove();
      setLocation(null);
    }
  };

  /**
   * Get the user location (authorization is asked if not already given).
   * @returns {Promise<void>}
   */
  const startLocationAsync = async (): Promise<void> => {
    const permissionsOK = await askPermissions();

    if (permissionsOK) {
      // write code for the app to handle GPS changes
      watchPositionSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: USER_LOCATION_INTERVAL_MS,
          distanceInterval: 1,
        },
        location => {
          setLocation(location);
        },
      );
    }
  };

  const askPermissions = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const permissionsOK = status === "granted";

    if (!permissionsOK) {
      console.log("[MapScreen] Permission to access location was denied");
    }
    setGavePermission(permissionsOK);

    return permissionsOK;
  };

  /* ------------------------------- CALL BACKS ------------------------------- */
  /**
   * Handle the map moves
   * I want the map to follow the user location if the map is centered on the user location
   * withing a certain radius. If the user moves the map outside of this radius, the map
   * stops following the user location.
   *
   * @param _ {GestureResponderEvent} The gesture event
   */
  const handleMapMoves = (_: GestureResponderEvent) => {
    setFollowUserLocation(false);

    return false;
  };

  const toggleFollowUserLocation = () => {
    setFollowUserLocation(!followUserLocation);
  };

  const ButtonOnPressAvertissement = () => {
    navigation.navigate("CarteStack", {
      screen: "NouveauSignalement",
      params: { type: "Avertissement" },
    });
  };

  const ButtonOnPressPointInteret = () => {
    navigation.navigate("CarteStack", {
      screen: "NouveauSignalement",
      params: { type: "PointInteret" },
    });
  };

  const toggleMenu = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  /* ------------------------------- USE EFFECTS ------------------------------ */
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [gavePermission]);

  useEffect(() => {
    followUserLocation && animateToLocation(location);
  }, [location]);

  useEffect(() => {
    if (menuIsOpen) {
      // animate the 'addPOIBtnRef' and 'addWarningBtnRef' buttons
      Animated.sequence([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuIsOpen]);

  useEffect(() => {
    startPoint && animateToLocation(startPoint);
  }, [startPoint]);

  useEffect(() => {
    if (followUserLocation) {
      startLocationAsync();
    } else {
      removeLocationSubscription();
    }
  }, [followUserLocation]);

  // Ce useEffect permet de bouger sur le debut de l'excursion lors de son affichage.
  useEffect(() => {
    if (excursionAffichee !== undefined) {
      setStartPoint({
        latitude: excursionAffichee.track[0].lat,
        longitude: excursionAffichee.track[0].lon,
      } as LatLng);
    }
  }, [excursionAffichee]);

  useEffect(() => {
    downloadTiles().then(() => console.log("[MapScreen] PAGE CHARGEE"));

    if (!excursionAffichee) {
      const excursions = require("assets/JSON/excursions.json") as T_excursion[];
      setAllExcursions(excursions);
    }

    return () => {
      removeLocationSubscription();
    };
  }, []);

  /* -------------------------------- Constants ------------------------------- */
  const { width, height } = Dimensions.get("window");

  const ASPECT_RATIO = width / height;
  const LATITUDE = 42.63099943470989;
  const LONGITUDE = 0.21949934093707602;
  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  return (
    <Screen style={$container} safeAreaEdges={["bottom"]}>
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          <MapView
            mapType={Platform.OS === "android" ? "none" : "standard"}
            ref={mapRef}
            style={{
              height,
              width,

              ...styles.map,
            }}
            initialRegion={{
              latitude: startPoint?.latitude ?? LATITUDE,
              longitude: startPoint?.longitude ?? LONGITUDE,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            initialCamera={{
              center: {
                latitude: startPoint?.latitude ?? LATITUDE,
                longitude: startPoint?.longitude ?? LONGITUDE,
              },
              pitch: 0,
              heading: 0,
              altitude: 6000,
              zoom: 5,
            }}
            onMoveShouldSetResponder={handleMapMoves}
            showsBuildings={true}
            showsCompass={true}
            showsMyLocationButton={false} // only for Android
            shouldRasterizeIOS={true} // only for iOS
            showsScale={true} // only for iOS
            showsUserLocation={true}
            zoomControlEnabled={false}
            zoomEnabled={true}
            minZoomLevel={12} // Niveau de zoom minimum
            maxZoomLevel={15} // Niveau de zoom maximum
          >
            <UrlTile
              urlTemplate={folderDest + "/{z}/{x}/{y}.jpg"}
              tileSize={256}
              // shouldReplaceMapContent={true}
              style={{
                zIndex: -1,
                pointerEvents: "none",
              }}
            />

            {excursionAffichee ? (
              // Affichage de l excursion, des markers et des signalements
              <>
                <Polyline
                  coordinates={excursionAffichee.track.map(
                    (point: T_Point) =>
                      ({
                        latitude: point.lat,
                        longitude: point.lon,
                      } as LatLng),
                  )}
                  strokeColor={colors.bouton}
                  strokeWidth={5}
                />

                <StartMiddleAndEndHandler
                  track={excursionAffichee.track}
                  typeParcours={excursionAffichee.es.typeParcours}
                />

                {excursionAffichee?.signalements.map((signalement, i) => (
                  <SignalementHandler signalement={signalement} key={i} />
                ))}
              </>
            ) : (
              // Oier voulait toutes les excursions sur la carte
              // si on était pas dans la page détail excursion.
              allExcursions !== undefined &&
              allExcursions.map((excursion, index) => {
                if (excursion.track) {
                  return (
                    <React.Fragment key={index}>
                      <Polyline
                        coordinates={excursion.track.map(point => {
                          return {
                            latitude: point.lat,
                            longitude: point.lon,
                          } as LatLng;
                        })}
                        strokeColor={colors.palette.vert}
                        strokeWidth={5}
                        style={{
                          zIndex: 1000000,
                        }}
                      />

                      <Marker
                        coordinate={
                          {
                            latitude: excursion.track[0].lat ?? 0,
                            longitude: excursion.track[0].lon ?? 0,
                          } as LatLng
                        }
                        title={excursion.fr.nom}
                        centerOffset={{ x: 0, y: -15 }}
                      >
                        <Image
                          source={markerImage}
                          style={{
                            width: 30,
                            height: 30,
                            tintColor: colors.palette.marron,
                          }}
                        />
                      </Marker>
                    </React.Fragment>
                  );
                } else {
                  return null;
                }
              })
            )}
          </MapView>

          <View
            style={{
              ...styles.mapOverlayLeft,
              bottom: excursionAffichee ? 20 : 0,
            }}
          >
            <MapButton
              ref={followLocationButtonRef}
              style={{
                ...styles.locateButtonContainer,
              }}
              onPress={toggleFollowUserLocation}
              icon="location-arrow"
              iconSize={spacing.lg}
              iconColor={
                followUserLocation ? colors.palette.bleuLocActive : colors.palette.bleuLocInactive
              }
            />
          </View>
          {
            /**@todo DOIT DEPENDRE DU STORE SuiviExcursion.etat (pour n'afficher les boutons que lorsqu'on est en rando) */
            "enCours" === "enCours" && (
              <View
                style={{
                  ...styles.mapOverlay,
                  bottom: excursionAffichee ? 20 : 0,
                }}
              >
                {menuIsOpen && (
                  <>
                    <MapButton
                      ref={addPOIBtnRef}
                      style={{
                        ...styles.actionsButtonContainer,
                      }}
                      onPress={ButtonOnPressAvertissement}
                      icon={"eye"}
                      iconSize={spacing.lg}
                      iconColor={colors.palette.blanc}
                    />
                    <MapButton
                      ref={addWarningBtnRef}
                      style={{
                        ...styles.actionsButtonContainer,
                      }}
                      onPress={ButtonOnPressPointInteret}
                      icon="exclamation-circle"
                      iconSize={spacing.lg}
                      iconColor={colors.palette.blanc}
                    />
                  </>
                )}
                <MapButton
                  ref={toggleBtnMenuRef}
                  style={{
                    ...styles.actionsButtonContainer,
                  }}
                  onPress={toggleMenu}
                  icon={menuIsOpen ? "times" : "map-marker-alt"}
                  iconSize={spacing.lg}
                  iconColor={colors.palette.blanc}
                />
              </View>
            )
          }
        </View>
      </View>
    </Screen>
  );
});

/* ------------------------------ JSX ELEMENTS ------------------------------ */
/**
 * @description Affiche les points de départ, milieu et fin de l'excursion en fonction du type de parcours.
 * Un parcours en boucle n'a pas de point d'arrivée.
 * Un parcours en aller-retour a un point d'arrivée.
 * Tous les parcours ont un point de départ et un point de milieu.
 *
 * @param track {T_Point[]} - le fichier gpx de l'excursion
 * @param typeParcours {"Ida" | "Ida y Vuelta" | "Circular"} - le type de parcours
 *
 * @returns les points de départ, milieu et fin de l'excursion
 */
type StartMiddleAndEndHandlerProps = {
  track: T_Point[];
  typeParcours: "Ida" | "Ida y Vuelta" | "Circular";
};
const StartMiddleAndEndHandler = (props: StartMiddleAndEndHandlerProps) => {
  const { track, typeParcours } = props;

  // Point d'arrivée
  const start = {
    ...track[0],
    title: "Départ",
  };
  const end = {
    ...track[track.length - 1],
    title: "Arrivée",
  };
  let points: T_Point[];

  // Calcul du point du milieu
  // Si c'est un aller-retour, le parcours étant symétrique,
  // on prend le point à la moitié de la distance totale
  const middleDistance = end.dist / (typeParcours === "Ida y Vuelta" ? 1 : 2);

  const middle = {
    ...track
      .sort((a, b) => {
        return a.dist - b.dist;
      })
      .find(point => point.dist >= middleDistance),
    title: "Milieu",
  };
  // find prend le premier élément qui correspond à la condition, vu que c'est sorted, on a le bon point

  // À ce stade, on a les points d'arrivée et du milieu.
  switch (typeParcours) {
    case "Ida": // aller simple
      // Point de départ si c'est un aller simple
      points = [start, middle, end];
      break;
    case "Ida y Vuelta":
    case "Circular":
      // Point d'arrivée si c'est un aller-retour
      start.title = "Départ / Arrivée";

      points = [start, middle];
      break;
  }

  const image: ImageSource = require("assets/icons/location.png");

  return points.map((point, index) => (
    <Marker
      coordinate={{
        latitude: point.lat ?? 0,
        longitude: point.lon ?? 0,
      }}
      key={index}
      // Si l'array de points ne contient que 2 points,
      // on est sur un aller simple, le deuxième point est donc l'arrivée
      title={point.title}
      pinColor={index === 1 ? colors.bouton : colors.text}
      style={{
        zIndex: 999,
      }}
      centerOffset={{ x: 0, y: -15 }}
    >
      <Image
        source={image}
        style={{
          width: 30,
          height: 30,
          tintColor: index === 1 ? colors.bouton : colors.text,
        }}
      />
    </Marker>
  ));
};
/**
 * @description Affiche les signalements sur la carte.
 *
 * @param signalements {T_Signalement[]} - les signalements de l'excursion
 *
 * @returns les signalements à afficher sur la carte.
 */
const SignalementHandler = ({ signalement }: { signalement: T_Signalement }) => {
  let iconColor: string;
  let image: ImageSource;

  switch (signalement.type) {
    case "PointInteret":
      image = binoculars;
      break;
    case "Avertissement":
      image = attention;
      break;
    default:
      iconColor = "black";
      image = binoculars;
      break;
  }

  return (
    <Marker
      coordinate={{
        latitude: signalement.lat ?? 0,
        longitude: signalement.lon ?? 0,
      }}
      title={signalement.nom}
      style={{
        zIndex: 999,
      }}
      centerOffset={{ x: 0, y: signalement.type === "PointInteret" ? 0 : -15 }}
    >
      <Image
        source={image}
        style={{
          width: 30,
          height: 30,
          tintColor: iconColor,
        }}
      />
    </Marker>
  );
};

/* ------------------------------ TILES IMPORT ------------------------------ */
let COMPTEUR = 0;
const folderDest = `${fileSystem.documentDirectory}cartes/OSM`;
const cacheDirectory = `${fileSystem.cacheDirectory}cartes/OSM`;

/**
 * Create the folder structure (recursively)
 *
 * @param folderStruct {Object} The folder structure
 * @param folderPath {string} The path of the folder
 * @param assetsList {Promise<Asset[]>} The list of assets
 */
const createFolderStruct = async (
  folderStruct: any,
  folderPath: string = folderDest,
  assetsList: Asset[],
) => {
  for (const folder in folderStruct) {
    if (folderStruct.hasOwnProperty(folder)) {
      if (typeof folderStruct[folder] === "string") {
        const fileName = folderStruct[folder].split("/").pop();
        // remove 'folderDest' from 'folderPath'
        const fileFolder = folderPath.replace(folderDest, "");

        await fileSystem.makeDirectoryAsync(`${folderDest}${fileFolder}`, {
          intermediates: true,
        });

        const assetsListUri = assetsList[COMPTEUR].localUri;
        COMPTEUR++;

        await fileSystem.copyAsync({
          from: assetsListUri,
          to: `${folderDest}${fileFolder}/${fileName}`,
        });
      } else {
        // Récursivement créer la structure des dossiers pour les sous-dossiers
        await createFolderStruct(folderStruct[folder], `${folderPath}/${folder}`, assetsList);
      }
    }
  }
};
const downloadTiles = async () => {
  const folderInfo = await fileSystem.getInfoAsync(folderDest + "/17/65682/48390.jpg");
  console.log("[MapScreen] folderInfo: ", folderInfo);

  if (folderInfo.exists && !folderInfo.isDirectory) {
    console.log("Tuiles déjà DL");
    await fileSystem.deleteAsync(cacheDirectory, { idempotent: true });
  } else {
    // Supprimer le dossier
    console.log("[MapScreen] Suppression du dossier");
    await fileSystem.deleteAsync(folderDest, { idempotent: true });

    const assets = await TilesRequire();

    await createFolderStruct(fichierJson, folderDest, assets);
  }
};

const values = {
  locateBtnContainerSize: 50,
};

const $container: ViewStyle = {
  display: "flex",
};

const mapOverlayStyle: ViewStyle = {
  position: "absolute",
  right: 0,

  // height: "max-content",
  width: "20%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: spacing.sm,

  padding: spacing.sm,

  zIndex: 1000,
};

const buttonContainer = {
  height: values.locateBtnContainerSize,
  width: values.locateBtnContainerSize,

  backgroundColor: colors.palette.vert,
  borderRadius: values.locateBtnContainerSize / 2,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  pointerEvents: "auto",
};

const styles = StyleSheet.create({
  actionsButtonContainer: {
    ...(buttonContainer as ViewStyle),
    backgroundColor: colors.palette.vert,
  },
  button: {
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: "75%",
  },
  container: {
    alignItems: "center",
    color: colors.text,
    height: "100%",
  },
  locateButton: {
    display: "flex",
    height: 40,
    justifyContent: "center",
    width: 40,
    zIndex: 1000,
  },
  locateButtonContainer: {
    ...(buttonContainer as ViewStyle),
    backgroundColor: "#eeeeee50",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
  },
  mapContainer: {
    alignItems: "center",
    display: "flex",
    flex: 1,
    position: "relative",
    width: "100%",
  },
  mapOverlay: {
    ...mapOverlayStyle,
  },
  mapOverlayLeft: {
    ...mapOverlayStyle,
    left: 0,
  },
});
