import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View } from "react-native"
import MapView, { Marker } from 'react-native-maps';
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface CarteScreenProps extends AppStackScreenProps<"Carte"> { }

import exempleGPX from '../../assets/exemple.gpx';


export const CarteScreen: FC<CarteScreenProps> = observer(function CarteScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  const waypoints = [];

  console.log(exempleGPX);


  return (
    <Screen style={$root} preset="scroll">
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{ /* initial region settings */ }}
        >
          {waypoints.map((waypoint, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: waypoint.latitude, longitude: waypoint.longitude }}
              title={waypoint.name}
            />
          ))}
        </MapView>
      </View>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
