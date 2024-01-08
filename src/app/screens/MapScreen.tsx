/**
 * TODO
 * Regler pb de zoom au suivi de la loc + ne pas bouger la cam si la loc n'est
 * pas dans la carte
 */

import React, { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  Animated,
  SafeAreaView,
  View,
  StyleSheet,
  GestureResponderEvent,
  Platform,
  ViewStyle,
  Dimensions,
} from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen } from "app/components"
import { spacing, colors } from "../theme"

// location
import * as Location from "expo-location"
import MapView, { UrlTile } from "react-native-maps"
import MapButton from "../components/MapButton"
import { Asset } from "expo-asset"

import * as fileSystem from "expo-file-system"
import TilesRequire from "../services/importAssets/tilesRequire"

// variables
interface MapScreenProps extends AppStackScreenProps<"Map"> {}

type T_animateToLocation = (passedLocation?: Location.LocationObject) => void

let COMPTEUR = 0
import fichier_json from "../../assets/Tiles/tiles_struct.json"
const folder_dest = `${fileSystem.documentDirectory}cartes/OSM`

// Fonction(s)
const copyFilesInBatch = async (filesToCopy, batchCount) => {
  for (let i = 0; i < filesToCopy.length; i += batchCount) {
    const batchFiles = filesToCopy.slice(i, i + batchCount)

    // Copie des fichiers dans ce lot
    await Promise.all(
      batchFiles.map(async (file) => {
        // Effectuer la copie du fichier ici avec FileSystem.copyAsync
        // (Exemple: À adapter selon votre structure de fichier)
        await fileSystem.copyAsync({
          from: file.source,
          to: file.destination,
        })
      }),
    )
  }
}

/**
 * Create the folder structure (recursively)
 *
 * @param folder_struct {Object} The folder structure
 * @param folder_path {string} The path of the folder
 * @param assets_list {Promise<Asset[]>} The list of assets
 */
const create_folder_struct = async (
  folder_struct: any,
  folder_path: string = folder_dest,
  assets_list: Asset[],
) => {
  for (const folder in folder_struct) {
    if (folder_struct.hasOwnProperty(folder)) {
      if (typeof folder_struct[folder] === "string") {
        const file_name = folder_struct[folder].split("/").pop()
        // remove 'folder_dest' from 'folder_path'
        let file_folder = folder_path.replace(folder_dest, "")

        await fileSystem.makeDirectoryAsync(`${folder_dest}${file_folder}`, {
          intermediates: true,
        })

        const assets_list_uri = assets_list[COMPTEUR].localUri
        COMPTEUR++
        console.log(`downloaded ${COMPTEUR} files`)

        // Copier les fichiers en lot en utilisant copyFilesInBatch
        // Préparez la liste de fichiers à copier pour ce dossier
        const filesToCopy = [
          {
            source: assets_list_uri,
            destination: `${folder_dest}${file_folder}/${file_name}`,
          },
          // ... autres fichiers à copier pour ce dossier
        ]

        // Copie par lot des fichiers
        const batchCount = 10 // Nombre de fichiers par lot
        await copyFilesInBatch(filesToCopy, batchCount)
      } else {
        // Récursivement créer la structure des dossiers pour les sous-dossiers
        await create_folder_struct(folder_struct[folder], `${folder_path}/${folder}`, assets_list)
      }
    }
  }
}

// Component(s)
export const MapScreen: FC<MapScreenProps> = observer(function EcranTestScreen(_props) {
  // Variables
  const userLocationIntervalMs = 1000 // ! mabye change this value

  // State(s)
  const [gavePermission, setGavePermission] = useState(false)
  const [location, setLocation] = useState(null)

  const [followUserLocation, setFollowUserLocation] = useState(false)

  const [menuIsOpen, setMenuIsOpen] = useState(false)

  // Ref(s)
  const intervalRef = useRef(null)

  const watchPositionSubscriptionRef = useRef<Location.LocationSubscription>(null)
  const mapRef = useRef<MapView>(null)

  // buttons
  const followLocationButtonRef = useRef(null)
  const toggleBtnMenuRef = useRef(null)
  const addPOIBtnRef = useRef(null)
  const addWarningBtnRef = useRef(null)

  // Animation(s)
  const buttonOpacity = useRef(new Animated.Value(0)).current

  // Method(s)
  /**
   * Animate the map to follow the user location.
   * @param passedLocation {Location.LocationObject} The location to animate to
   * @returns {void}
   */
  const animateToLocation: T_animateToLocation = (
    passedLocation: Location.LocationObject,
  ): void => {
    if (mapRef.current) {
      if (!location && !passedLocation) {
        console.log("location is null")
        return
      }

      const finalLocation = passedLocation ?? location

      mapRef.current.animateCamera({
        center: {
          latitude: finalLocation.coords.latitude,
          longitude: finalLocation.coords.longitude,
        },
      })
    } else {
      console.log("mapRef.current is null")
    }
  }

  const downloadTiles = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== "granted") {
      console.log("Permission to access location was denied")
    } else {
      console.log("Permission ok")
      // Vérifier si les tuiles sont déjà dl cartes/OSM/17/65682/48390.jpg
      const folderInfo = await fileSystem.getInfoAsync(folder_dest + "/17/65682/48390.jpg")
      if (folderInfo.exists && folderInfo.isDirectory) {
        console.log("Tuiles déjà DL")
      } else {
        //Supprimer le dossier
        await fileSystem.deleteAsync(folder_dest, { idempotent: true })

        const assets = [] //await TilesRequire()

        await create_folder_struct(fichier_json, folder_dest, assets)
      }
    }
  }

  /**
   * Remove the location subscription
   */
  const removeLocationSubscription = () => {
    if (watchPositionSubscriptionRef.current) {
      console.log("watchPositionSubscriptionRef.current.remove() ")
      watchPositionSubscriptionRef.current.remove()

      setLocation(null)
    }
  }

  /**
   * Get the user location (authorization is asked if not already given).
   * @param debug {boolean} If true, log some debug information
   * @returns {Promise<void>}
   */
  const getLocationAsync = async (debug?: boolean): Promise<void> => {
    if (debug) {
      console.log(`[EcranTestScreen] getLocationAsync()`)
      console.log(
        `[EcranTestScreen] Platform.OS: ${Platform.OS} -- Platform.Version: ${Platform.Version}`,
      )
    }

    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== "granted") {
      console.log("Permission to access location was denied")
    }

    // write code for the app to handle GPS changes
    watchPositionSubscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: userLocationIntervalMs,
        distanceInterval: 1,
      },
      (location) => {
        if (debug) {
          console.log(`[EcranTestScreen] watchPositionAsync()`)
          console.log(`[EcranTestScreen] location.coords.latitude: ${location.coords.latitude}`)
          console.log(`[EcranTestScreen] location.coords.longitude: ${location.coords.longitude}`)
        }
        setLocation(location)
      },
    )
  }

  /**
   * Handle the map moves
   * I want the map to follow the user location if the map is centered on the user location
   * withing a certain radius. If the user moves the map outside of this radius, the map
   * stops following the user location.
   *
   * @param _ {GestureResponderEvent} The gesture event
   */
  const handleMapMoves = (_: GestureResponderEvent) => {
    setFollowUserLocation(false)

    return false
  }

  const toggleFollowUserLocation = () => {
    if (!gavePermission) {
      askUserLocation().then(() => console.log("aled"))
    }

    setFollowUserLocation(!followUserLocation)
  }

  const askUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      console.log("Permission to access location was denied")
      setGavePermission(false)
      return
    }
    setGavePermission(true)
  }

  const poiButtonOnPress = async () => {
    console.log("poiButtonOnPress()")
  }

  const toggleMenu = () => {
    setMenuIsOpen(!menuIsOpen)
  }

  // Effect(s)
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
    }
  }, [gavePermission])

  useEffect(() => {
    followUserLocation && animateToLocation(location)
  }, [location])

  useEffect(() => {
    if (menuIsOpen) {
      // animate the 'addPOIBtnRef' and 'addWarningBtnRef' buttons
      Animated.sequence([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [menuIsOpen])

  useEffect(() => {
    console.log(`[EcranTestScreen] followUserLocation: ${followUserLocation}`)
  }, [followUserLocation])

  useEffect(() => {
    downloadTiles().then(() => console.log("PAGE CHARGEE"))

    return () => {
      removeLocationSubscription()
    }
  }, [])

  const { width, height } = Dimensions.get("window")

  const ASPECT_RATIO = width / height
  const LATITUDE = 42.63099943470989
  const LONGITUDE = 0.21949934093707602
  const LATITUDE_DELTA = 0.0922
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

  const region = {
    latitude: LATITUDE,
    longitude: LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  }

  return (
    <Screen style={$container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.mapContainer}>
          <>
            <MapView
              mapType={Platform.OS === "android" ? "none" : "standard"}
              ref={mapRef}
              style={{
                height,
                width,

                ...styles.map,
              }}
              initialRegion={region}
              initialCamera={{
                center: {
                  latitude: LATITUDE,
                  longitude: LONGITUDE,
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
              <UrlTile urlTemplate={folder_dest + "/{z}/{x}/{y}.jpg"} tileSize={256} />
            </MapView>

            <View style={styles.mapOverlay}>
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
            <View style={styles.mapOverlayLeft}>
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
          </>
        </View>
      </SafeAreaView>
    </Screen>
  )
})

const values = {
  locateBtnContainerSize: 50,
}

const $container: ViewStyle = {
  display: "flex",
}

const mapOverlayStyle: ViewStyle = {
  position: "absolute",
  bottom: 0,
  right: 0,

  height: "40%",
  width: "20%",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: spacing.sm,

  paddingBottom: spacing.xl,

  zIndex: 1000,
}

const buttonContainer = {
  height: values.locateBtnContainerSize,
  width: values.locateBtnContainerSize,

  backgroundColor: colors.palette.vert,
  borderRadius: values.locateBtnContainerSize / 2,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  pointerEvents: "auto",
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: "75%",
  },
  container: {
    height: "100%",

    alignItems: "center",
    color: colors.text,
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
  actionsButtonContainer: {
    ...(buttonContainer as ViewStyle),
    backgroundColor: colors.palette.vert,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
  },
  mapContainer: {
    flex: 1,

    display: "flex",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  mapOverlay: {
    ...mapOverlayStyle,
  },
  mapOverlayLeft: {
    ...mapOverlayStyle,
    left: 0,
  },
})
