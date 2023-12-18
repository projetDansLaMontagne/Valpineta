import React, { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  SafeAreaView,
  ViewStyle,
  TouchableOpacity,
  Image,
  TextStyle,
  ImageStyle,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Text, CarteAvis, GraphiqueDenivele, GpxDownloader } from "app/components"
import { spacing, colors } from "app/theme"
import { navigate } from "app/navigators"
import SwipeUpDown from "react-native-swipe-up-down"

const { width, height } = Dimensions.get("window")

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {
  excursion: Record<string, any>
}

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {
    const { excursion } = props

    var nomExcursion = "";
    var temps = { h: 0, m: 0 };
    var distance = 0;
    var difficulteParcours = 0;
    var difficulteOrientation = 0;
    var navigation = props.navigation;

    /**@warning A MODIFIER : peut generer des erreurs si params est undefined*/
    if (props.route.params !== undefined) {
      nomExcursion = excursion.nomExcursion
      temps = excursion.temps
      distance = excursion.distance
      difficulteParcours = excursion.difficulteParcours
      difficulteOrientation = excursion.difficulteOrientation
    }

    const [isLoading, setIsLoading] = useState(true);

    return (
      <SafeAreaView style={$container}>
        <TouchableOpacity style={$boutonRetour} onPress={() => navigate({ name: "Excursions", params: undefined })}>
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
        <SwipeUpDown
          itemMini={itemMini()}
          itemFull={itemFull(
            excursion,
            isLoading,
            setIsLoading,
            navigation
          )}
          onShowFull={() => setIsLoading(true)}
          onShowMini={() => setIsLoading(false)}
          animation="easeInEaseOut"
          extraMarginTop={125}
          swipeHeight={100}
        />
      </SafeAreaView>
    )
  },
)

/**
 *
 * @returns le composant réduit des informations, autremeent dit lorsque l'on swipe vers le bas
 */
function itemMini() {
  return (
    <View style={$containerPetit}>
      <Image source={require("../../assets/icons/swipe-up.png")} />
    </View>
  )
}

/**
 * @returns le composant complet des informations, autrement dit lorsque l'on swipe vers le haut
 */
function itemFull(
  excursion: any,
  isLoading: boolean,
  setIsLoading: Function,
  navigation: any,
) {
  const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true)

  //Lance le chrono pour le chargement du graphique de dénivelé
  const chrono = () => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  //Observateur de l'état du containerInfoAffiche
  useEffect(() => {
    if (containerInfoAffiche) {
      chrono()
    }
  }, [containerInfoAffiche])

  //Observateur de l'état du containerInfoAffiche
  useEffect(() => {
    if (isLoading) {
      chrono()
    }
  }, [isLoading])

  return (
    <View style={$containerGrand}>
      <View style={$containerTitre}>
        <Text text={excursion.nomExcursion} size="xl" style={$titre} />
        <GpxDownloader />
      </View>
      <View>
        <View style={$containerBouton}>
          <TouchableOpacity
            onPress={() => {
              //lancement du chrono pour le loading
              setIsLoading(true), isLoading ? chrono() : null
              setcontainerInfoAffiche(true)
            }}
            style={$boutonInfoAvis}
          >
            <Text
              tx="detailsExcursion.titres.infos"
              size="lg"
              style={[containerInfoAffiche ? { color: colors.bouton } : { color: colors.text }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              //Loading à false pour pouvoir relancer le chrono
              setIsLoading(true)
              setcontainerInfoAffiche(false)
            }}
            style={$boutonInfoAvis}
          >
            <Text
              tx="detailsExcursion.titres.avis"
              size="lg"
              style={[containerInfoAffiche ? { color: colors.text } : { color: colors.bouton }]}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            $souligneInfosAvis,
            containerInfoAffiche
              ? { left: spacing.lg }
              : { left: width - width / 2.5 - spacing.lg / 1.5 },
          ]}
        ></View>
        {containerInfoAffiche
          ? infos(
              isLoading,
              excursion,
              navigation
            )
          : avis()}
      </View>
    </View>
  )
}

function afficherDescriptionCourte(description: string) {
  const texteCoupe = description.slice(0, 100)
  const texteFinal = texteCoupe + "..."
  return texteFinal
}

/**
 *
 * @param isLoading
 * @returns les informations de l'excursion
 */
function infos(
  isLoading: boolean,
  excursion: any,
  navigation: any,
) {
  const data = JSON.parse(JSON.stringify(require("./../../assets/JSON/exemple.json")))

  return (
    <ScrollView>
      <TouchableWithoutFeedback>
        <View>
          <View style={$containerInformations}>
            <View style={$containerUneInformation}>
              <Image
                style={$iconInformation}
                source={require("../../assets/icons/duree.png")}
              ></Image>
              <Text text={excursion.duree} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image
                style={$iconInformation}
                source={require("../../assets/icons/explorer.png")}
              ></Image>
              <Text text={excursion.distance + " km"} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image
                style={$iconInformation}
                source={require("../../assets/icons/difficulteParcours.png")}
              ></Image>
              <Text text={excursion.difficulteParcours} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image
                style={$iconInformation}
                source={require("../../assets/icons/difficulteOrientation.png")}
              ></Image>
              <Text text={excursion.difficulteOrientation} size="xs" />
            </View>
          </View>
          <View style={$containerDescriptionSignalements}>
            <View>
              <Text tx="detailsExcursion.titres.description" size="lg" />
              <Text
                style={$textDescription}
                text={afficherDescriptionCourte(excursion.description)}
                size="xxs"
              />
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Description", {excursion : excursion })
                }}
              >
                <Text style={$lienDescription} tx="detailsExcursion.boutons.lireSuite" size="xs" />
              </TouchableOpacity>
            </View>
            <View>
              <Text tx="detailsExcursion.titres.signalement" size="lg" />
              <Text text="signalement" size="xs" />
            </View>
          </View>
          <View style={$containerDenivele}>
            <Text tx="detailsExcursion.titres.denivele" size="xl" />
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.bouton} />
            ) : (
              <GraphiqueDenivele data={data} />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  )
}

/**
 * @returns les avis de l'excursion
 */
function avis() {
  return (
    <ScrollView style={$containerAvis}>
      <TouchableWithoutFeedback>
        <View>
          <CarteAvis
            nombreEtoiles={3}
            texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
          />
          <CarteAvis
            nombreEtoiles={3}
            texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
          />
          <CarteAvis
            nombreEtoiles={3}
            texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
          />
          <CarteAvis
            nombreEtoiles={3}
            texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
          />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const $boutonRetour: ViewStyle = {
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.sm,
  margin: spacing.lg,
  width: 50,
  position: "absolute",
  top: 15,
}

const $container: ViewStyle = {
  flex: 1,
  width: width,
  height: height,
  backgroundColor: colors.erreur,
}

//Style de itemMini

const $containerPetit: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.xxs,
}

//Style de itemFull

const $containerGrand: ViewStyle = {
  flex: 1,
  alignItems: "center",
  width: width,
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.xs,
  paddingBottom: 250,
}

//Style du container du titre et du bouton de téléchargement

const $containerTitre: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: width - (width / 5),
  margin: spacing.lg,
}

const $titre: ViewStyle = {
  marginTop: spacing.xs,
  paddingRight: spacing.xl,
}

//Style du container des boutons infos et avis

const $containerBouton: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  width: width,
}

const $boutonInfoAvis: ViewStyle = {
  paddingLeft: spacing.xxl,
  paddingRight: spacing.xxl,
}

const $souligneInfosAvis: ViewStyle = {
  backgroundColor: colors.bouton,
  height: 2,
  width: width / 2.5,
  position: "relative",
}

//Style des informations

const $containerInformations: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  padding: spacing.xl,
}

const $containerUneInformation: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $iconInformation: ImageStyle = {
  width: spacing.lg,
  height: spacing.lg,
  marginRight: spacing.xs,
}

//Style de la description et des signalements

const $containerDescriptionSignalements: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  paddingLeft: spacing.xl,
  paddingRight: spacing.xl,
}

const $textDescription: TextStyle = {
  width: width / 2,
  paddingRight: spacing.xl,
}

const $lienDescription: TextStyle = {
  color: colors.bouton,
  paddingTop: spacing.xs,
  textDecorationLine: "underline",
}

const $containerAvis: ViewStyle = {
  height: 200,
}

const $containerDenivele: ViewStyle = {
  padding: spacing.lg,
}
