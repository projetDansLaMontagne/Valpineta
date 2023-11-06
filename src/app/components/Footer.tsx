import * as React from "react"
import { ImageStyle, View, ViewStyle, TouchableOpacity, Image, TextStyle, Platform } from "react-native"
import { observer } from "mobx-react-lite"
import { colors } from "app/theme"
import { Text, Screen } from "app/components"


const explorerLogo = require("./../../assets/icons/explorer.png")
const carteLogo = require("./../../assets/icons/carte.png")
const parametresLogo = require("./../../assets/icons/parametres.png")

const isIos = Platform.OS === "ios"

export interface FooterProps {
  navigation: any
}

/**
 * Footer de l'application
 */
export const Footer = observer(function Footer(props: FooterProps) {
  const { navigation } = props

  return (
    <View style={[$container, isIos ? {paddingBottom: 20} : {paddingBottom: 0}]}>
      <TouchableOpacity
                onPress={() => navigation.navigate("Accueil")}
                style={$iconEtTexte}
            >
                <Image
                    source={explorerLogo}
                    style={$icon}
                />
                <Text
                    style={$texte}
                >Accueil</Text>

            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate("Carte")}
                style={$iconEtTexte}
            >
                <Image
                    source={carteLogo}
                    style={$icon}
                />
                <Text
                    style={$texte}
                >Carte</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate("Parametres")}
                style={$iconEtTexte}
            >
                <Image
                    source={parametresLogo}
                    style={$icon}
                />
                <Text
                    style={$texte}
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
  padding: 10,
  borderTopWidth: 1,
  borderTopColor: colors.bordure,
}

const $icon: ImageStyle = {
  width: 30,
  height: 30,
  tintColor: colors.bouton,
}

const $iconEtTexte: ViewStyle = {
  flexDirection: "column",
  alignItems: "center",
  width: 100,
}

const $texte: TextStyle = {
  color: colors.bouton,
}