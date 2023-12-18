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
  excursion: Record<string, unknown>
}

export const DescriptionScreen: FC<DescriptionScreenProps> = observer(function DescriptionScreen(
  props: DescriptionScreenProps,
) {
  const { navigation } = props
  const { route } = props

  // Vérifier si "route" est défini
  if (!route || !route.params || !route.params.excursion) {
    // Si "route" ou "route.params.excursion" n'est pas défini, revenir en arrière
    navigation.goBack()
    console.log("Erreur: route.params.excursion n'est pas défini")
    return null  // Important pour éviter l'exécution du reste du code
  }

  const { excursion } = route.params
  var nomExcursion = ""
  var description = ""

  if (excursion) {
    nomExcursion = excursion.nom
    description = excursion.description
  }

  return (
    <Screen style={$container} preset="fixed" >
      <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
        <Image
          style={{ tintColor: colors.bouton }}
          source={require("../../assets/icons/back.png")}
        />
      </TouchableOpacity>
      <ScrollView style={$containerDescription}>
        <Text size="xxl">{nomExcursion}</Text>
        <Text style={$texteDescription} size="sm">
          {description}
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
  marginTop: spacing.lg,
  marginBottom: height / 2,
}