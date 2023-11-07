import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { spacing } from "app/theme"


interface CarteScreenProps extends AppStackScreenProps<"Carte"> {}

export const CarteScreen: FC<CarteScreenProps> = observer(function CarteScreen() {

  return (
    <Screen style={$root} preset="scroll">
      <Text text="Carte" size="xxl" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding : spacing.md,
}
