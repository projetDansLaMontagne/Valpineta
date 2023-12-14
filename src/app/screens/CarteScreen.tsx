import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text, Button } from "app/components"
import { spacing } from "app/theme"


interface CarteScreenProps extends AppStackScreenProps<"Carte"> { }

export const CarteScreen: FC<CarteScreenProps> = observer(function CarteScreen(props) {

  return (
    <Screen style={$root} preset="scroll">
      <Text text="Carte" size="xxl" />
      <Button text="TEST nouveau signalement" onPress={() => props.navigation.navigate("Stack", { screen: "NouveauSignalement" })} />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding: spacing.md,
}
