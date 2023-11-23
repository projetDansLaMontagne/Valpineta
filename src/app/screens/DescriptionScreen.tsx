// Librairies
import React, { FC, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TouchableOpacity, Image, Dimensions, View } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Text } from "app/components"

// Composants
import { Screen } from "app/components"
import { spacing, colors } from "app/theme"

const { width, height } = Dimensions.get("window")


interface DescriptionScreenProps extends AppStackScreenProps<"Description"> {
  nomExcursion: string
}

export const DescriptionScreen: FC<DescriptionScreenProps> = observer(function DescriptionScreen(
  props: DescriptionScreenProps,
) 

{
  const { navigation, route } = props
  const { nomExcursion } = route.params

  return (
    <Screen style={$container} preset="scroll">
      <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
        <Image
          style={{ tintColor: colors.bouton }}
          source={require("../../assets/icons/back.png")}
        />
      </TouchableOpacity>
      <View style={$containerDescription}>
        <Text size="xxl">{nomExcursion}</Text>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  position: "absolute",
}

const $containerDescription : ViewStyle = {
  flex: 1,
  padding: spacing.lg,
}

const $boutonRetour: ViewStyle = {
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.sm,
  margin: spacing.lg,
  width: 50,
  position: "relative",
  top: 15,
}
