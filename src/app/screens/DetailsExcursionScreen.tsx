import React, { FC, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { View, SafeAreaView, ViewStyle, TouchableOpacity, Image, TextStyle, ImageStyle, ScrollView, TouchableWithoutFeedback, Dimensions, ActivityIndicator } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Text, CarteAvis, GraphiqueDenivele, GpxDownloader } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { is } from "date-fns/locale";

const { width, height } = Dimensions.get("window");

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {
  navigation: any;
}

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {
    const { navigation } = props;
    const [isLoading, setIsLoading] = useState(true);


    return(
      <SafeAreaView style={$container}>
        <TouchableOpacity
          style={$boutonRetour}
          onPress={() => navigation.navigate("Excursions")}
        >
          <Image
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
        <SwipeUpDown
          itemMini={itemMini()}
          itemFull={itemFull(isLoading, setIsLoading)}
          onShowFull={() => setIsLoading(true)}
          onShowMini={() => setIsLoading(false)}
          disableSwipeIcon={true}
          animation="easeInEaseOut"
          extraMarginTop={125}
          swipeHeight={100}
        />
      </SafeAreaView>
    );
  }
);

/**
 * 
 * @returns le composant réduit des informations, autremeent dit lorsque l'on swipe vers le bas 
 */
function itemMini() {
  return (
    <View style={$containerPetit}>
      <Image
        source={require("../../assets/icons/swipe-up.png")}
      />
    </View>
  )
}

/**
 * @returns le composant complet des informations, autrement dit lorsque l'on swipe vers le haut
 */
function itemFull(isLoading: boolean, setIsLoading: any) {

  const [containerInfoAffiche, setcontainerInfoAffiche] = useState(true);

  //Lance le chrono pour le chargement du graphique de dénivelé
  const chrono = () => {
    setTimeout(() => {
      setIsLoading(false)
    }
      , 2000);
  }

  //Observateur de l'état du containerInfoAffiche
  useEffect(() => {
    if (containerInfoAffiche) {
      chrono();
    }
  }, [containerInfoAffiche]);

  //Observateur de l'état du containerInfoAffiche
  useEffect(() => {
    if (isLoading) {
      chrono();
    }
  }, [isLoading]);

  return (

    <View style={$containerGrand}>
      <Image
        source={require("../../assets/icons/swipe-up.png")}
        style={$iconsSwipeUp}
      />
      <View style={$containerTitre}>
        <Text text="Col de la marmotte" size="xl" style={$titre} />
        <GpxDownloader />
      </View>
      <View>
        <View style={$containerBouton}>
          <TouchableOpacity onPress={() => {
            //lancement du chrono pour le loading
            setIsLoading(true),
            isLoading ? chrono() : null
            setcontainerInfoAffiche(true)
            }} style={$boutonInfoAvis} >
            <Text text="Infos" size="lg" style={[containerInfoAffiche ? { color: colors.bouton } : { color: colors.text }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            //Loading à false pour pouvoir relancer le chrono
            setIsLoading(true)
            setcontainerInfoAffiche(false)}} style={$boutonInfoAvis}>
            <Text text="Avis" size="lg" style={[containerInfoAffiche ? { color: colors.text } : { color: colors.bouton }]} />
          </TouchableOpacity>
        </View>
        <View style={[$souligneInfosAvis, containerInfoAffiche ? { left: spacing.lg } : { left: width - width / 2.5 - spacing.lg / 1.5 }]}>
        </View>
        {containerInfoAffiche ? infos(isLoading): avis()}
      </View>
    </View>
  )
}

/**
 * 
 * @param isLoading 
 * @returns les informations de l'excursion
 */
function infos(isLoading: boolean) {

  return (
    <ScrollView>
      <TouchableWithoutFeedback>
        <View>
          <View style={$containerInformations}>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/temps.png")}
              >
              </Image>
              <Text text="2" size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/explorer.png")}
              >
              </Image>
              <Text text="2" size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/difficulteParcours.png")}
              >
              </Image>
              <Text text="2" size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/difficulteOrientation.png")}
              >
              </Image>
              <Text text="1" size="xs" />
            </View>
          </View>
          <View style={$containerDescriptionSignalements}>
            <View>
              <Text text="Description" size="lg" />
              <Text style={$textDescription} text="Pourquoi les marmottes ne jouent-elles jamais aux cartes avec les blaireaux ? Parce qu'elles ont trop peur qu'elles 'marmottent' les règles !" size="xxs" />
            </View>
            <View>
              <Text text="Signalement" size="lg" />
              <Text text="signalement" size="xs" />
            </View>
          </View>
          <View style={$containerDenivele}>
            <Text text="Dénivelé" size="xl" />
            {
              isLoading ? <ActivityIndicator size="large" color={colors.bouton} /> : <GraphiqueDenivele />
            }
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
          <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
          <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
          <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
          <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const $boutonRetour: ViewStyle = {
  backgroundColor: colors.bouton,
  borderRadius: 5,
  padding: spacing.sm,
  margin: spacing.lg,
  width: 50,
  position: "absolute",
  top: 0,
}

const $container: ViewStyle = {
  flex: 1,
  width: width,
  height: height,
  backgroundColor: colors.fond,
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
  paddingBottom: 275,
}

const $iconsSwipeUp: ImageStyle = {
  transform: [{ rotate: "180deg" }],
}

//Style du container du titre et du bouton de téléchargement

const $containerTitre: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: width,
  padding: spacing.lg,
}

const $titre: ViewStyle = {
  marginTop: spacing.xs,
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
  justifyContent: "space-around",
  padding: spacing.xl,
}

const $containerUneInformation: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  width: spacing.xxl,
}

const $iconInformation: ImageStyle = {
  width: spacing.lg,
  height: spacing.lg,
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

const $containerAvis: ViewStyle = {
  height: 200,
}

const $containerDenivele: ViewStyle = {
  padding: spacing.lg,
}
