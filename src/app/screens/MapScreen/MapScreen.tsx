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
  TouchableOpacity,
} from "react-native";
import { AppStackScreenProps, T_Signalement, T_excursion, TPoint } from "app/navigators";
import { Screen } from "app/components";
import { spacing, colors } from "app/theme";
import { ImageSource } from "react-native-vector-icons/Icon";
import { useStores } from "app/models";

import { applicationLangue } from "app/screens/ExcursionsScreen";

// location
import * as Location from "expo-location";
import MapView, { LatLng, Marker, Polyline, UrlTile } from "react-native-maps";
import MapButton from "./MapButton";
import { Asset } from "expo-asset";

// files
import * as fileSystem from "expo-file-system";
import TilesRequire from "app/services/importAssets/tilesRequire";
import fichierJson from "assets/Tiles/tiles_struct.json";
import { Swiper } from "./Swiper";

// images
const binoculars: ImageSource = require("assets/icons/binoculars.png");
const attention: ImageSource = require("assets/icons/attention.png");
const markerImage: ImageSource = require("assets/icons/location.png");

const { width, height } = Dimensions.get("window");

type MapScreenProps = AppStackScreenProps<"Carte"> & {};
export const MapScreen: FC<MapScreenProps> = observer(function MapScreenProps(_props) {
  // Constants
  const { navigation, route } = _props;
  const excursion = route?.params?.excursion;
  const USER_LOCATION_INTERVAL_MS = 1000; // ! mabye change this value

  // States
  const [gavePermission, setGavePermission] = useState(false);
  const [location, setLocation] = useState<null | Location.LocationObject>(null);
  const [followUserLocation, setFollowUserLocation] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [allExcursions, setAllExcursions] = useState<T_excursion[]>(undefined);
  const [cameraTarget, setCameraTarget] = useState<LatLng>();

  // Refs
  /** @todo STATIC, a remplacer par le store */
  const SuiviExcursion = { etat: "enCours" };
  const { parametres } = useStores();
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

  /**
   * Affiche la couleur a utiliser pour l excursion en fonction de son index
   * @param index intensite de la couleur (0 à 1)
   */
  const excursionColor = (intensite: number) => {
    const greenMin = 80;
    const greenMax = 220;
    const greenValue = Math.floor(intensite * (greenMax - greenMin) + greenMin); // valeur de green (de 94 à 194)
    const greenValueHexa = greenValue.toString(16);
    return `#00${greenValueHexa}27`;
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
    cameraTarget && animateToLocation(cameraTarget);
  }, [cameraTarget]);

  useEffect(() => {
    if (followUserLocation) {
      startLocationAsync();
    } else {
      removeLocationSubscription();
    }
  }, [followUserLocation]);

  useEffect(() => {
    downloadTiles();

    const excursions: T_excursion[] = require("assets/JSON/excursions.json");
    setAllExcursions(applicationLangue(excursions, parametres.langue));

    return () => {
      removeLocationSubscription();
    };
  }, []);

  /* -------------------------------- Constants ------------------------------- */
  const ASPECT_RATIO = width / height;
  const LATITUDE = 42.63099943470989;
  const LONGITUDE = 0.21949934093707602;
  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  return (
    <Screen style={$screen}>
      <View style={styles.container}>
        {/* Map */}
        <MapView
          mapType={Platform.OS === "android" ? "none" : "standard"} // pour n avoir aucune autre tuile que Valpineta sur android
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: cameraTarget?.latitude ?? LATITUDE,
            longitude: cameraTarget?.longitude ?? LONGITUDE,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          initialCamera={{
            center: {
              latitude: cameraTarget?.latitude ?? LATITUDE,
              longitude: cameraTarget?.longitude ?? LONGITUDE,
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
          maxZoomLevel={20} // Niveau de zoom maximum
        >
          <UrlTile
            urlTemplate={folderDest + "/{z}/{x}/{y}.jpg"}
            tileSize={256}
            offlineMode={true}
            style={{
              zIndex: -1,
              pointerEvents: "none",
            }}
          />

          {/* Tracés */}
          {excursion ? (
            // Affichage de l excursion, des markers et des signalements
            <>
              <Polyline
                coordinates={excursion.track.map(
                  (point: TPoint) =>
                    ({
                      latitude: point.lat,
                      longitude: point.lon,
                    } as LatLng),
                )}
                strokeColor={colors.bouton}
                strokeWidth={5}
              />

              <StartMiddleAndEndHandler
                track={excursion.track}
                typeParcours={excursion.es.typeParcours}
              />

              {excursion?.signalements.map((signalement, i) => (
                <SignalementHandler signalement={signalement} key={i} />
              ))}
            </>
          ) : (
            // Toutes les excursions
            allExcursions !== undefined &&
            allExcursions.map((exc, index) => {
              const color = excursionColor(index / allExcursions.length);

              return (
                exc.track && (
                  <React.Fragment key={index}>
                    <Polyline
                      coordinates={exc.track.map(point => {
                        return {
                          latitude: point.lat,
                          longitude: point.lon,
                        } as LatLng;
                      })}
                      strokeColor={color}
                      strokeWidth={5}
                      style={{
                        zIndex: 1000000,
                      }}
                      onPress={() =>
                        navigation.navigate("CarteStack", {
                          screen: "Carte",
                          params: { excursion: exc },
                        })
                      }
                      tappable={true} // pour permettre le onpress sur Anroid
                    />

                    <Marker
                      coordinate={
                        {
                          latitude: exc.track[0].lat ?? 0,
                          longitude: exc.track[0].lon ?? 0,
                        } as LatLng
                      }
                      title={exc.nom}
                      centerOffset={{ x: 0, y: -15 }}
                    >
                      <Image
                        source={markerImage}
                        style={{
                          width: 30,
                          height: 30,
                          tintColor: color,
                        }}
                      />
                    </Marker>
                  </React.Fragment>
                )
              );
            })
          )}
        </MapView>

        {/* Bouton de centrage */}
        <View
          style={{
            ...styles.mapOverlayLeft,
            bottom: excursion ? 60 : 0, // taille par defaut du swiper
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

        {/* Boutons de signalements */}
        {SuiviExcursion.etat === "enCours" && (
          <View
            style={{
              ...styles.mapOverlay,
              bottom: excursion ? 60 : 0, // taille par defaut du swiper
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
        )}

        {/* Swiper et bouton retour */}
        {excursion && (
          <>
            <Swiper
              excursion={excursion}
              navigation={navigation}
              userLocation={location}
              setCameraTarget={setCameraTarget}
            />

            <TouchableOpacity
              style={$boutonRetour}
              onPress={() => navigation.navigate("CarteStack", { screen: "Carte" })}
            >
              <Image
                style={{ tintColor: colors.bouton }}
                source={require("assets/icons/back.png")}
              />
            </TouchableOpacity>
          </>
        )}
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
  track: TPoint[];
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
  let points: TPoint[] & { title: string }[];

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

  if (folderInfo.exists && !folderInfo.isDirectory) {
    await fileSystem.deleteAsync(cacheDirectory, { idempotent: true });
  } else {
    // Supprimer le dossier
    await fileSystem.deleteAsync(folderDest, { idempotent: true });

    const assets = await TilesRequire();

    await createFolderStruct(fichierJson, folderDest, assets);
  }
};

/* ------------------------------ STYLES ------------------------------ */
const values = {
  locateBtnContainerSize: 50,
};
const $screen: ViewStyle = {
  display: "flex",
};
const mapOverlayStyle: ViewStyle = {
  position: "absolute",
  right: 0,

  width: "20%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: spacing.sm,

  paddingBottom: spacing.sm,
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
    height: "100%",
  },
  mapOverlay: {
    ...mapOverlayStyle,
  },
  mapOverlayLeft: {
    ...mapOverlayStyle,
    left: 0,
  },
});
const $boutonRetour: ViewStyle = {
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.sm,
  margin: spacing.lg,
  width: 50,
  position: "absolute",
  top: 20,
  left: 0,
  zIndex: 1,
};
