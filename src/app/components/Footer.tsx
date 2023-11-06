import * as React from "react"
import { ImageStyle, StyleProp, View, ViewStyle, TouchableOpacity, Image } from "react-native"
import { observer } from "mobx-react-lite"
import { colors } from "app/theme"

const explorerLogo = require("./../../assets/icons/explorer.png")
const carteLogo = require("./../../assets/icons/carte.png")
const parametresLogo = require("./../../assets/icons/parametres.png")

export interface FooterProps {
  navigation: any
}

/**
 * Footer de l'application
 */
export const Footer = observer(function Footer(props: FooterProps) {
  const { navigation } = props

  return (
    <View style={$container}>
      <TouchableOpacity
                onPress={() => navigation.navigate("Accueil")}
            >
                <Image
                    source={explorerLogo}
                    style={$icon}
                />

            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate("Carte")}
            >
                <Image
                    source={carteLogo}
                    style={$icon}
                />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate("Parametres")}
            >
                <Image
                    source={parametresLogo}
                    style={$icon}
                />
            </TouchableOpacity>
    </View>
  )
})

const $container: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  backgroundColor: colors.background,
  padding: 10,
  borderTopWidth: 1,
  borderTopColor: colors.border,
}

const $icon: ImageStyle = {
  width: 40,
  height: 40,
  tintColor: colors.bouton,
}
