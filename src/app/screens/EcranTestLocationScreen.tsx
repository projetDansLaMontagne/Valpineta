import React, {FC, useEffect, useRef, useState} from "react"
import { observer } from "mobx-react-lite"
import {
  SafeAreaView,
  View,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  Platform,
  TouchableOpacity, Image, ViewStyle, Dimensions,
} from "react-native"
import { AppStackScreenProps } from "app/navigators"
import {Button, Screen, Text} from "app/components"
import {spacing, colors} from "../theme";
import { FontAwesome5 } from '@expo/vector-icons';

// location
import * as Location from 'expo-location';
import MapView, { LocalTile, PROVIDER_GOOGLE } from "react-native-maps"

// variables
interface EcranTestScreenProps extends AppStackScreenProps<"EcranTest"> {}

type T_animateToLocation = (
  passedLocation?: Location.LocationObject
) => void;

// Component(s)
export const EcranTestScreen: FC<EcranTestScreenProps> = observer(function EcranTestScreen(
  _props,
) {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // State(s)
  const [gavePermission, setGavePermission] = useState(false);
  const [location, setLocation] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [nbFetch, setNbFetch] = useState(0);
  const [followUserLocation, setFollowUserLocation] = useState(false);

  const intervalRef = useRef(null);

  const watchPositionSubscriptionRef = useRef<Location.LocationSubscription>(null);
  const mapRef = useRef<MapView>(null);
  const locateButtonRef = useRef(null);

  // Method(s)
  const animateToLocation: T_animateToLocation = (passedLocation) => {
    if (mapRef.current) {

      if (!location && !passedLocation) {
        console.log("location is null");
        return;
      }

      const finalLocation = passedLocation ?? location;

      mapRef.current.animateCamera({
        center: {
          latitude: finalLocation.coords.latitude,
          longitude: finalLocation.coords.longitude,
        },
        pitch: 0,
        heading: 0,
        altitude: 2000,
        zoom: 15,
      });
    } else {
      console.log("mapRef.current is null");
    }
  }

  const removeLocationSubscription = () => {
    if (watchPositionSubscriptionRef.current) {
      console.log("watchPositionSubscriptionRef.current.remove() ");
      watchPositionSubscriptionRef.current.remove();

      setLocation(null);
    }
  }


  const getLocationAsync = async () => {
    console.log(`[EcranTestScreen] getLocationAsync()`);
    console.log(`[EcranTestScreen] Platform.OS: ${Platform.OS} -- Platform.Version: ${Platform.Version}`);
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission to access location was denied');
    }

    // write code for the app to handle GPS changes
    watchPositionSubscriptionRef.current = await Location.watchPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000, distanceInterval: 1
    }, (location) => {
      setNbFetch(nbFetch => nbFetch + 1);
      setLocation(location);
    });
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

    return false
  }

  const onPress = async () => {
    setIsFetching(true);
    console.log("[EcranTestScreen] onPress()");

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setGavePermission(false);
      return;
    }

    setGavePermission(true);


    await getLocationAsync();

  }

  const toggleFollowUserLocation = () => {
    setFollowUserLocation(!followUserLocation);
  }

  const locateButtonOnPressIn = () => {
    // change the background color of the button
    locateButtonRef.current.setNativeProps({
      style: {
        backgroundColor: colors.palette.transparentButtonOnPress,
      }
    });
  }

  const locateButtonOnPressOut = () => {
    // change the background color of the button
    locateButtonRef.current.setNativeProps({
      style: {
        backgroundColor: colors.palette.transparentButton,
      }
    });
  }

  // Effect(s)
  useEffect(() => {

    return () => {
      clearInterval(intervalRef.current);
    }
  }, [gavePermission])

  useEffect(() => {
    if (!location) {
      setNbFetch(0)
      return;
    }

    setIsFetching(false);
    // followUserLocation && animateToLocation(location);
  }, [location]);

  useEffect(() => {
    if (isFetching) {
      console.log("isFetching is true");
    }
  }, [isFetching])

  useEffect(() => {

    return () => {
      removeLocationSubscription();
    }
  }, []);

  // const Wrapper = Platform.OS === 'ios' ? SafeAreaView : View;

  const { width, height } = Dimensions.get('window');

  const ASPECT_RATIO = width / height;
  const LATITUDE = -12.054985242912784;
  const LONGITUDE = -75.24545159952076;
  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const region = {
    latitude: LATITUDE,
    longitude: LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  }

  return (
    <Screen style={$container}>
      <SafeAreaView style={styles.container} >
        <Text
          tx="testScreen.title"
          preset="heading"
        />
        <View style={styles.mapContainer}>
          {
            location ? (
              <>
                <MapView
                  ref={mapRef}
                  style={styles.map}

                  // initialRegion={{
                  //   latitude: location.coords.latitude,
                  //   longitude: location.coords.longitude,
                  //   latitudeDelta: 0.0922,
                  //   longitudeDelta: 0.0421,
                  // }}

                  initialRegion={region}

                  maxZoomLevel={14}
                  minZoomLevel={12}

                  // initialCamera={{
                  //   center: {
                  //     // latitude: location.coords.latitude,
                  //     // longitude: location.coords.longitude,
                  //     latitude: LATITUDE,
                  //     longitude: LONGITUDE,
                  //   },
                  //   pitch: 0,
                  //   heading: location.coords.heading ?? 0,
                  //   altitude: Platform.OS === 'ios' ? 2000 : 0,
                  //   zoom: Platform.OS === 'ios' ? 15 : 10,
                  // }}

                  // onMapLoaded={() => {
                  //   animateToLocation(location)
                  // }}
                  onMoveShouldSetResponder={handleMapMoves}

                  // if the default google map location button is clicked
                  // we want to stop following the user location
                  // onUserLocationChange={(event) => {
                  //   console.log("onUserLocationChange");
                  //   console.log(event.nativeEvent);
                  // }}

                  mapType={Platform.OS == "android" ? "none" : "standard"}

                  showsBuildings={true}
                  showsCompass={true}
                  showsMyLocationButton={true} // only for Android
                  shouldRasterizeIOS={true} // only for iOS
                  showsScale={true} // only for iOS
                  showsUserLocation={true}

                  zoomControlEnabled={true}
                >
                  <LocalTile
                    pathTemplate={'/Users/tom_planche/Desktop/BUT/BUT3/SAE_Valpineta/Valpineta/src/Chupaca/{z}/{x}/{y}.png'}
                    tileSize={256}
                    // zIndex={-1}
                  />
                </MapView>
                {/*<View style={styles.mapOverlay}>*/}
                {/*  <TouchableOpacity*/}
                {/*      ref={locateButtonRef}*/}
                {/*      style={{*/}
                {/*        ...styles.locateButtonContainer,*/}
                {/*      }}*/}

                {/*      onPressIn={locateButtonOnPressIn}*/}
                {/*      onPressOut={locateButtonOnPressOut}*/}
                {/*      onPress={toggleFollowUserLocation}*/}
                {/*    >*/}
                {/*      <FontAwesome5*/}
                {/*        name="location-arrow"*/}
                {/*        size={20}*/}
                {/*        color={*/}
                {/*          followUserLocation ? colors.palette.locationBlue : colors.palette.locationBlueDisabled*/}
                {/*        }*/}
                {/*      />*/}
                {/*  </TouchableOpacity>*/}
                {/*</View>*/}
              </>
            ) : (
              <>
                {
                  isFetching ? (
                    <>
                      <Text tx={"testScreen.locate.fetching"} style={{color: "white"}} />
                    </>
                  ) : (
                    <>
                      <Text tx={"testScreen.locate.notLocated.title"} style={{color: "white"}} />

                      <Button
                        tx={"testScreen.locate.locate_btn"}
                        onPress={onPress}
                        style={styles.button}
                      />
                    </>
                  )
                }
              </>
            )
          }
        </View>
      </SafeAreaView>
    </Screen>
  )
});

const values = {
  locateBtnContainerSize: 50,
}

const $container: ViewStyle = {
  display: 'flex',
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: "100%",
  },
  container: {
    height: '100%',

    alignItems: "center",
    color: colors.text,
  },
  locateButton: {
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    width: 40,
    zIndex: 1000,
  },
  locateButtonContainer: {
    height: values.locateBtnContainerSize,
    width: values.locateBtnContainerSize,

    backgroundColor: colors.palette.transparentButton,
    borderRadius: values.locateBtnContainerSize / 2,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.sm,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
  },
  mapContainer: {
    flex: 1,

    display: 'flex',

    width: '100%',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,

    height: "40%",
    width: "20%",

    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "red",

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 1000,
  }
});
