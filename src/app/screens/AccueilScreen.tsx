
import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import {spacing } from "app/theme"

interface AccueilScreenProps extends AppStackScreenProps<"Accueil"> {}

export const AccueilScreen: FC<AccueilScreenProps> = observer(function AccueilScreen() {
  return (
    <Screen style={$root} preset="scroll">
      <Text text="Accueil" size="xxl" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding : spacing.md,
}

