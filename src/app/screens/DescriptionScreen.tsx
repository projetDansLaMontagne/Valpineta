// Librairies
import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TouchableOpacity, Image, Dimensions, ScrollView, TextStyle } from "react-native"
// import { AppStackScreenProps } from "app/navigators"

// Composants
import { Screen } from "app/components"
import { spacing, colors } from "app/theme"
import { Text } from "app/components"
// import { goBack } from "app/navigators"

const { width, height } = Dimensions.get("window")

interface DescriptionScreenProps extends AppStackScreenProps<"Description"> {
  excursion: Record<string, unknown>
}

export const DescriptionScreen: FC<DescriptionScreenProps> = observer(function DescriptionScreen(
  props: DescriptionScreenProps,
) {
  const { route, navigation } = props

  // Vérifier si "excursion" est défini
  if (props?.route?.params?.excursion === undefined) {
    return(
    <Screen style={$container} preset="fixed" >
      <TouchableOpacity style={$boutonRetour} onPress={() => navigation.goBack()}>
        <Image
          style={{ tintColor: colors.bouton }}
          source={require("../../assets/icons/back.png")}
        />
      </TouchableOpacity>
      <ScrollView style={$containerDescription}>
        <Text size="xxl">Erreur</Text>
        <Text style={$texteDescription} size="sm">
          Une erreur est survenue, veuillez réessayer
        </Text>
      </ScrollView>
    </Screen>
    )
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
  textAlign: "justify",
}