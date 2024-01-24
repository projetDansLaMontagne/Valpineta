/**
 * ! PROPS
 *
 * - startLocation: LatLng, si on veut centrer la carte sur une position au chargement,
 * si on met un state et que l'on change la valeur, la carte se recentre
 * - hideOverlay: boolean, si on veut afficher les boutons de la carte.®
 */

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
import { AppStackScreenProps } from "app/navigators";
import { Screen } from "app/components";
import { spacing, colors } from "app/theme";

// location
import * as Location from "expo-location";
import MapView, { LatLng, Marker, Polyline, UrlTile } from "react-native-maps";
import MapButton from "./MapButton";
import { Asset } from "expo-asset";

import * as fileSystem from "expo-file-system";
import TilesRequire from "app/services/importAssets/tilesRequire";

import fichierJson from "assets/Tiles/tiles_struct.json";
import { TExcursion } from "app/screens/DetailsExcursionScreen";
import { ImageSource } from "react-native-vector-icons/Icon";
// variables
type MapScreenProps = AppStackScreenProps<"Carte"> & {
  startLocation?: LatLng;

  isInDetailExcursion?: boolean;
  children?: React.ReactNode;
} & (
    | {
      hideOverlay: true;
    }
    | {
      hideOverlay: false;
      overlayDebugMode?: boolean;
    }
  );

type T_animateToLocation = (passedLocation?: Location.LocationObject | LatLng) => void;

let COMPTEUR = 0;
const folderDest = `${fileSystem.documentDirectory}cartes/OSM`;
const cacheDirectory = `${fileSystem.cacheDirectory}cartes/OSM`;

// Fonction(s)
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

/**
 * Get all the tracks of the `src/assets/JSON/excursions.json` file.
 *
 * @returns {Promise<TExcursion[]>} The list of all the tracks
 */
const getAllTracks = (): TExcursion[] => {
  return require("assets/JSON/excursions.json") as TExcursion[];
};

// Component(s)
export const MapScreen: FC<MapScreenProps> = observer(function EcranTestScreen(_props) {
  // Variables
  const userLocationIntervalMs = 1000; // ! mabye change this value

  // State(s)
  const [gavePermission, setGavePermission] = useState(false);
  const [location, setLocation] = useState(null);

  const [followUserLocation, setFollowUserLocation] = useState(false);

  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const [excursions, setExcursions] = useState<TExcursion[]>(undefined);

  // Ref(s)
  const intervalRef = useRef(null);

  const watchPositionSubscriptionRef = useRef<Location.LocationSubscription>(null);
  const mapRef = useRef<MapView>(null);

  // buttons
  /**@warning la navigation doit se faire avec props.navigation avec Ignite */
  const followLocationButtonRef = useRef(null);
  const toggleBtnMenuRef = useRef(null);
  const addPOIBtnRef = useRef(null);
  const addWarningBtnRef = useRef(null);

  // Animation(s)
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Var(s)

  // Method(s)
  /**
   * Animate the map to follow the user location.
   * @param passedLocation {Location.LocationObject} The location to animate to
   * @returns {void}
   */
  const animateToLocation: T_animateToLocation = (
    passedLocation: Location.LocationObject | LatLng,
  ): void => {
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

  const downloadTiles = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("[MapScreen] Permission to access location was denied");
    } else {
      console.log("[MapScreen] Permission ok");
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
    }
  };

  /**
   * Remove the location subscription
   */
  const removeLocationSubscription = () => {
    if (watchPositionSubscriptionRef.current) {
      console.log("[MapScreen] watchPositionSubscriptionRef.current.remove() ");
      watchPositionSubscriptionRef.current.remove();

      setLocation(null);
    }
  };

  /**
   * Get the user location (authorization is asked if not already given).
   * @param debug {boolean} If true, log some debug information
   * @returns {Promise<void>}
   */
  const getLocationAsync = async (debug?: boolean): Promise<void> => {
    if (debug) {
      console.log(`[[MapScreen]] getLocationAsync()`);
      console.log(
        `[[MapScreen]] Platform.OS: ${Platform.OS} -- Platform.Version: ${Platform.Version}`,
      );
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("[MapScreen] Permission to access location was denied");
    }

    // write code for the app to handle GPS changes
    watchPositionSubscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: userLocationIntervalMs,
        distanceInterval: 1,
      },
      location => {
        if (debug) {
          console.log(`[[MapScreen]] watchPositionAsync()`);
          console.log(`[[MapScreen]] location.coords.latitude: ${location.coords.latitude}`);
          console.log(`[[MapScreen]] location.coords.longitude: ${location.coords.longitude}`);
        }
        setLocation(location);
      },
    );
  };

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
    if (!gavePermission) {
      askUserLocation().then(() => console.log("[MapScreen] aled"));
    }

    setFollowUserLocation(!followUserLocation);
  };

  const askUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("[MapScreen] Permission to access location was denied");
      setGavePermission(false);
      return;
    }
    setGavePermission(true);
  };

  const poiButtonOnPress = async () => {
    console.log("[MapScreen] poiButtonOnPress()");
  };

  const toggleMenu = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  // Effect(s)
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
    console.log(`[MapScreen] _props.startLocation: ${JSON.stringify(_props.startLocation)}`);
    _props.startLocation && animateToLocation(_props.startLocation);
  }, [_props.startLocation]);

  useEffect(() => {
    console.log(`[[MapScreen]] followUserLocation: ${followUserLocation}`);

    if (followUserLocation) {
      getLocationAsync(true)
        .then(() => console.log("[MapScreen] getLocationAsync() ok"))
        .catch(e => console.log("[MapScreen] getLocationAsync() error: ", e));
    } else {
      removeLocationSubscription();
    }
  }, [followUserLocation]);

  useEffect(() => {
    if (excursions !== undefined && excursions.length > 0) {
      console.log(`[MapScreen] excursions[]: ${JSON.stringify(excursions[0].track[0])}`);
    }
  }, [excursions]);

  useEffect(() => {
    downloadTiles().then(() => console.log("[MapScreen] PAGE CHARGEE"));

    if (!_props.isInDetailExcursion) {
      setExcursions(getAllTracks());
    }

    return () => {
      removeLocationSubscription();
    };
  }, []);

  const { width, height } = Dimensions.get("window");

  const ASPECT_RATIO = width / height;
  const LATITUDE = 42.63099943470989;
  const LONGITUDE = 0.21949934093707602;
  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const image: ImageSource = require("assets/icons/location.png");

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
              latitude: _props.startLocation?.latitude ?? LATITUDE,
              longitude: _props.startLocation?.longitude ?? LONGITUDE,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            initialCamera={{
              center: {
                latitude: _props.startLocation?.latitude ?? LATITUDE,
                longitude: _props.startLocation?.longitude ?? LONGITUDE,
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

            {_props.children}

            {
              // Oier voulait toutes les excursions sur la carte
              // si on était pas dans la page détail excursion.
              !_props.isInDetailExcursion &&
              excursions !== undefined &&
              excursions.length > 0 &&
              excursions.map((excursion, index) => {
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
                          source={image}
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
            }
          </MapView>

          {!_props.hideOverlay && (
            <>
              <View
                style={{
                  ...styles.mapOverlay,
                  ...(!_props.hideOverlay && _props.overlayDebugMode && mapOverlayStyleDebug),
                  bottom: _props.isInDetailExcursion ? 20 : 0,
                }}
              >
                {menuIsOpen && (
                  <>
                    <MapButton
                      ref={addPOIBtnRef}
                      style={{
                        ...styles.actionsButtonContainer,
                      }}
                      onPress={poiButtonOnPress}
                      icon={"eye"}
                      iconSize={spacing.lg}
                      iconColor={colors.palette.blanc}
                    />
                    <MapButton
                      ref={addWarningBtnRef}
                      style={{
                        ...styles.actionsButtonContainer,
                      }}
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
              <View
                style={{
                  ...styles.mapOverlayLeft,
                  ...(!_props.hideOverlay && _props.overlayDebugMode && mapOverlayStyleDebug),
                  bottom: _props.isInDetailExcursion ? 20 : 0,
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
                    followUserLocation
                      ? colors.palette.bleuLocActive
                      : colors.palette.bleuLocInactive
                  }
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Screen>
  );
});

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

const mapOverlayStyleDebug: ViewStyle = {
  borderColor: colors.palette.vert,
  borderWidth: 4,
  borderRadius: 10,
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
