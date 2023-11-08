import React, {FC, useEffect, useRef, useState} from "react"
import { observer } from "mobx-react-lite"
import { SafeAreaView, View, StyleSheet, Pressable, GestureResponderEvent, Platform } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import {Button, Screen, Text} from "app/components"
import {spacing, colors} from "../theme";
import { FontAwesome5 } from '@expo/vector-icons';

// location
import * as Location from 'expo-location';
import MapView, { LocalTile } from "react-native-maps"

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
  const [followUserLocation, setFollowUserLocation] = useState(true);

  const intervalRef = useRef(null);

  const watchPositionSubscriptionRef = useRef<Location.LocationSubscription>(null);
  const mapRef = useRef<MapView>(null);

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
   * @param gesture {GestureResponderEvent} The gesture event
   */
  const handleMapMoves = (gesture: GestureResponderEvent) => {

    setFollowUserLocation(false);
  }

  const onPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setGavePermission(false);
      return;
    }

    setGavePermission(true);
    setIsFetching(true);

    await getLocationAsync();

    setIsFetching(false);
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
    }
    followUserLocation && animateToLocation(location);
  }, [location]);

  useEffect(() => {

    return () => {
      removeLocationSubscription();
    }
  }, []);

  const Wrapper = Platform.OS === 'ios' ? SafeAreaView : View;

  return (
    <Screen style={styles.fullScreen}>
      <Wrapper style={styles.container} >
        <Text
          tx="testScreen.title"
          preset="heading"
          style={{color: colors.text}}
        />
        <View style={styles.mapContainer}>
          {
            location ? (
              <MapView
                ref={mapRef}

                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                initialCamera={{
                  center: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  },
                  pitch: 0,
                  heading: location.coords.heading ?? 0,
                  altitude: 2000,
                  zoom: 15,
                }}
                zoomControlEnabled={true}
                onMapLoaded={() => {
                  animateToLocation(location)
                }}
                showsBuildings={true}
                showsUserLocation={true}
              >
                <Pressable
                  onPress={() => {
                    setFollowUserLocation(!followUserLocation);
                  }}
                  style={styles.locateButtonContainer}
                >
                  {/*<View style={styles.locateButtonContainer}>*/}
                  {/*  <FontAwesome5 name="location-arrow" size={24} style={styles.locateButtonContainer} />*/}
                  {/*</View>*/}
                </Pressable>
              </MapView>
            ) : (
              <>
                {
                  isFetching ? (
                    <Text tx={"testScreen.locate.fetching"} style={{color: "white"}} />
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
      </Wrapper>
    </Screen>
  )
});


const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    color: colors.text,
    height: 50,
    justifyContent: "center",
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: "100%",
  },
  container: {
    alignItems: "center",
    color: colors.palette.neutral900,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingTop: "5%",

  },
  fullScreen: {
    flex: 1,
    height: '70%',
    width: '100%',
  },
  locateButton: {
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40,
    zIndex: 1000,
  },
  locateButtonContainer: {
    alignSelf: 'flex-end',
    backgroundColor: colors.palette.angry500,
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  mapContainer: {
    height: '100%',
    width: '100%',
  },
});
