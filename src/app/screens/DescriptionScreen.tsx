// Librairies
import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TouchableOpacity, Image, Dimensions, ScrollView, TextStyle } from "react-native"
<<<<<<< HEAD
import { AppStackScreenProps } from "app/navigators"
=======
// import { AppStackScreenProps } from "app/navigators"
>>>>>>> main

// Composants
import { Screen } from "app/components"
import { spacing, colors } from "app/theme"
import { Text } from "app/components"
<<<<<<< HEAD
=======
// import { goBack } from "app/navigators"
>>>>>>> main

const { width, height } = Dimensions.get("window")

interface DescriptionScreenProps extends AppStackScreenProps<"Description"> {
<<<<<<< HEAD
  navigation: any
  route: any
=======
  excursion: Record<string, unknown>
>>>>>>> main
}

export const DescriptionScreen: FC<DescriptionScreenProps> = observer(function DescriptionScreen(
  props: DescriptionScreenProps,
) {
<<<<<<< HEAD
  const { navigation } = props
  const { excursion } = props.route.params

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
          {excursion.description}
        </Text>
      </ScrollView>
    </Screen>
  )
})

=======
  const { route, navigation } = props

  // Vérifier si "excursion" est défini
  if (props?.route?.params?.excursion === undefined) {
    return (
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
  else {
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
  }
})


>>>>>>> main
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
<<<<<<< HEAD
=======
  textAlign: "justify",
>>>>>>> main
}
