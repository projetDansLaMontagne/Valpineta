import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { spacing } from "app/theme"

interface ParametresScreenProps extends AppStackScreenProps<"Parametres"> {}

export const ParametresScreen: FC<ParametresScreenProps> = observer(function ParametresScreen() {
  return (
    <Screen style={$root} preset="scroll">
      <Text text="Parametres" size="xxl" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding : spacing.md,
}
