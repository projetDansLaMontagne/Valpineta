import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface CarteScreenProps extends AppStackScreenProps<"Carte"> { }

export const CarteScreen: FC<CarteScreenProps> = observer(function CarteScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()

  return (
    <Screen style={$root} preset="scroll">
      <View style={{ flex: 1 }}>
        
      </View>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
