import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { spacing } from "app/theme"
import GpxDownloader from "app/components/GpxDownloader"


interface CarteScreenProps extends AppStackScreenProps<"Carte"> {}

export const CarteScreen: FC<CarteScreenProps> = observer(function CarteScreen() {

  return (
    <Screen style={$root} preset="scroll">
      <Text text="Carte" size="xxl" />
      <GpxDownloader></GpxDownloader>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding : spacing.md,
}
