import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TextStyle, Dimensions, View, TouchableOpacity } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import Icon from "react-native-vector-icons/FontAwesome"
import { useStores } from "app/models"

interface ParametresScreenProps extends AppStackScreenProps<"Parametres"> {}
const { width, height } = Dimensions.get("window")

export const ParametresScreen: FC<ParametresScreenProps> = observer(function ParametresScreen() {
  const { parametres } = useStores()

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]}>
      <View style={$souligne}>
        <Text style={$titre} text="Paramètres de l'application" size="xl" />
      </View>
      <View style={$containerUnParametre}>
        <View style={$containerIconTexte}>
          <Icon name="language" size={30} color={colors.text} />
          <Text style={$texteParametre} text="Changer de langue" size="sm" />
        </View>
        <View style={$containerBoutons}>
        <View style={[$souligneBouton, parametres.langues === "fr" ? {left:0}:{left:'50%'}]}></View>
          <TouchableOpacity
            onPress={() => {
              parametres.setLangues("fr")
            }}
          >
            <Text style={$texteBouton} text="Français" size="sm" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              parametres.setLangues("es")
            }}
          >
            <Text style={$texteBouton} text="Espagnol" size="sm" />
          </TouchableOpacity>
        </View>
      </View>
      <Text></Text>
    </Screen>
  )
})

const $titre: TextStyle = {
  marginTop: spacing.lg,
  marginBottom: spacing.xs,
  width: width,
  textAlign: "center",
  color: colors.text,
}

const $souligne: ViewStyle = {
  borderBottomColor: colors.text,
  borderBottomWidth: 1,
  width: width,
}

const $containerUnParametre: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  padding: spacing.xs,
  paddingTop: spacing.lg,
  width: width,
}

const $containerIconTexte: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
}

const $containerBoutons: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}


const $texteParametre: TextStyle = {
  marginStart: spacing.xs,
}

const $souligneBouton: ViewStyle = {
  backgroundColor: colors.bouton,
  height: 2,
  width: "50%",
  bottom: 0,
  position: "absolute",
}

const $texteBouton: TextStyle = {
  color: colors.text,
  paddingRight: spacing.xs,
  paddingLeft: spacing.xs,
}