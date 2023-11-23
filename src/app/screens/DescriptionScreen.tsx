// Librairies
import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TouchableOpacity, Image, Dimensions, ScrollView, TextStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"

// Composants
import { Screen } from "app/components"
import { spacing, colors } from "app/theme"
import { Text } from "app/components"

const { width, height } = Dimensions.get("window")

interface DescriptionScreenProps extends AppStackScreenProps<"Description"> {
  navigation: any
  route: any
}

export const DescriptionScreen: FC<DescriptionScreenProps> = observer(function DescriptionScreen(
  props: DescriptionScreenProps,
) {
  const { navigation } = props
  const { excursion } = props.route.params

  function nettoyageTexte(texte: string) {
    const regex = /<[^>]+>/g
    return texte.replace(regex, "")
  }

  return (
    <Screen style={$container} preset="fixed">
      <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
        <Image
          style={{ tintColor: colors.bouton }}
          source={require("../../assets/icons/back.png")}
        />
      </TouchableOpacity>
      <ScrollView style={$containerDescription}>
        <Text size="xxl">{excursion.nomExcursion}</Text>
        <Text style={$texteDescription} size="sm">
          {nettoyageTexte(excursion.descriptionFR)}
        </Text>
      </ScrollView>
    </Screen>
  )
})

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

const $container: ViewStyle = {
  flex: 1,
  width: width,
  height: height,
  backgroundColor: colors.fond,
  position: "absolute",
}

const $containerDescription: ViewStyle = {
  width: width,
  padding: spacing.lg,
}

const $texteDescription: TextStyle = {
  marginBottom: height / 2,
}
