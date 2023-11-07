
import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps, navigate } from "app/navigators"
import { Screen, Text, Button } from "app/components"
import {spacing } from "app/theme" 

interface AccueilScreenProps extends AppStackScreenProps<"Accueil"> {
  navigation: any
}

export const AccueilScreen: FC<AccueilScreenProps> = observer(function AccueilScreen(props : AccueilScreenProps) {

  const { navigation } = props

  return (
    <Screen style={$root} preset="scroll">
      <Text text="Accueil" size="xxl" />
      <Button 
      text="Voir détails"
      onPress={() => navigation.navigate('DetailsExcursion')}
      />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding : spacing.md,
}

