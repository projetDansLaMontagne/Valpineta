import * as React from "react"
import { ImageStyle, View, ViewStyle, TouchableOpacity, Image, Platform } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"
import { Text } from "app/components"
import { useNavigationState } from "@react-navigation/native"


const explorerLogo = require("./../../assets/icons/explorer.png")
const carteLogo = require("./../../assets/icons/carte.png")
const parametresLogo = require("./../../assets/icons/parametres.png")

const estIos = Platform.OS === "ios"
export interface FooterProps {
  navigation: any
}

/**
 * Footer de l'application
 */
export const Footer = observer(function Footer(props: FooterProps) {
  const { navigation } = props

  const routes = useNavigationState(state => state.routes)
  const currentRoute = routes[routes.length -1].name
  
  const estAccueil = currentRoute === "Accueil"
  const estCarte = currentRoute === "Carte"
  const estParametres = currentRoute === "Parametres"

  return (
    <View style={[$container, estIos ? {paddingBottom: spacing.lg} : {paddingBottom: 0}]}>
      <TouchableOpacity
                onPress={() => navigation.navigate("Accueil")}
                style={$iconEtTexte}
            >
                <Image
                    source={explorerLogo}
                    style={[$icon, estAccueil ? {tintColor: colors.text} : {tintColor: colors.bouton}]}
                />
                <Text
                    style={ estAccueil ? {color: colors.text} : {color : colors.bouton}}
                    size="xs"
                >Accueil</Text>

            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate("Carte")}
                style={$iconEtTexte}
            >
                <Image
                    source={carteLogo}
                    style={[$icon, estCarte ? {tintColor: colors.text} : {tintColor: colors.bouton}]}
                />
                <Text
                    style={ estCarte ? {color: colors.text} : {color : colors.bouton}}
                    size="xs"
                >Carte</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate("Parametres")}
                style={$iconEtTexte}
            >
                <Image
                    source={parametresLogo}
                    style={[$icon, estParametres ? {tintColor: colors.text} : {tintColor: colors.bouton}]}
                />
                <Text
                    style={ estParametres ? {color: colors.text} : {color : colors.bouton}}
                    size="xs"
                >Paramètres</Text>
            </TouchableOpacity>
    </View>
  )
})

const $container: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  backgroundColor: colors.fond,
  padding: spacing.xs,
  borderTopWidth: 1,
  borderTopColor: colors.bordure,
}

const $icon: ImageStyle = {
  width: 30,
  height: 30,
}

const $iconEtTexte: ViewStyle = {
  flexDirection: "column",
  alignItems: "center",
  width: 100,
}
