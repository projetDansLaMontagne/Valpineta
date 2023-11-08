import React, { FC, useState } from "react";
import { observer } from "mobx-react-lite";
import { View, SafeAreaView, ViewStyle, TouchableOpacity, Image, TextStyle, ImageStyle, ScrollView } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Text, CarteAvis } from "app/components";
import { spacing, colors } from "app/theme";
import { Dimensions } from "react-native";
import SwipeUpDown from "react-native-swipe-up-down";

const { width, height } = Dimensions.get("window");

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {
  navigation: any;
}

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {

    const { navigation } = props;

    return (
      < SafeAreaView
        style={$container}
      >
        <Text text="Ici il y aura la carte" size="xxl" />
        <TouchableOpacity
          style={$boutonRetour}
          onPress={() => navigation.navigate("Accueil")}
        >
          <Image
            source={require("../../assets/icons/back.png")}
          >

          </Image>
        </TouchableOpacity>
        <SwipeUpDown
          itemMini={itemMini()}
          itemFull={itemFull()}
          disableSwipeIcon={false}
          animation="easeInEaseOut"
        />
      </SafeAreaView>
    );
  }
);

function itemMini() {
  return (
    <View style={$containerPetit}>
    </View>
  )
}

function itemFull() {

  const [isInfos, setIsInfos] = useState(true);

  return (
    <View style={$containerGrand} >
      <View style={$containerTitre}>
        <Text text="Col de la marmotte" size="xl" style={$titre} />
        <TouchableOpacity>
          <Image
            source={require("../../assets/icons/download.png")}
            style={$iconDownload}
          >
          </Image>
        </TouchableOpacity>
      </View>
      <View>
        <View style={$containerBouton}>
          <TouchableOpacity onPress={() => setIsInfos(true)} >
            <Text text="Infos" size="lg" style={[$boutonInfosAvis, isInfos ? { color: colors.bouton } : { color: colors.text }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsInfos(false)}>
            <Text text="Avis" size="lg" style={[$boutonInfosAvis, isInfos ? { color: colors.text } : { color: colors.bouton }]} />
          </TouchableOpacity>
        </View>
          <View style={[$souligneInfosAvis, isInfos ? { left: spacing.lg } : { left: width - width / 2.5 - spacing.lg / 1.5 }]}>
        </View>
        {isInfos ? infos() : avis()}
      </View>
    </View>
  )
}

function infos() {
  return (
    <>
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
      <View style={$containerDescriptionSignalement}>
        <View>
          <Text text="Description" size="xl" />
          <Text style={$textDescription} text="Pourquoi les marmottes ne jouent-elles jamais aux cartes avec les blaireaux ? Parce qu'elles ont trop peur qu'elles 'marmottent' les règles !" size="xxs" />
        </View>
        <View>
          <Text text="Signalement" size="xl" />
          <Text text="signalement" size="xs" />
        </View>
      </View>
      <View style={$containerDenivele}>
        <Text text="Dénivelé" size="xl" />
        <Image
          source={require("../../assets/images/denivele.jpeg")}
          style={$imageDenivele}
        >
        </Image>
      </View>
    </>
  )
}

function avis() {
  return (
    <ScrollView>
      <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
      <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
      <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
      <CarteAvis nombreEtoiles={3} texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️" />
    </ScrollView>
  )
}


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

const $containerGrand: ViewStyle = {
  flex: 1,
  width: width,
  backgroundColor: colors.fond,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.xs,
  paddingBottom: spacing.xxl,
}

const $containerTitre: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  width: width,
  padding: spacing.lg,
}

const $titre: ViewStyle = {
  marginTop: spacing.xs,
}

const $iconDownload: ViewStyle = {
  width: 40,
  height: 40,
}

const $containerBouton: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  width: width,
}

const $boutonInfosAvis: TextStyle = {
  borderBottomWidth: 1,
  borderBottomColor: colors.bouton,
}

const $souligneInfosAvis: ViewStyle = {
  backgroundColor: colors.bouton,
  height: 2,
  width: width / 2.5,
  position: "relative",
}

const $containerInformations: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  width: width,
  padding: spacing.lg,
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

const $containerDescriptionSignalement: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
}

const $textDescription: TextStyle = {
  width: width / 2,
}

const $containerDenivele: ViewStyle = {
  padding: spacing.lg,
}

const $imageDenivele: ViewStyle = {
  height: 100,
  width: width - spacing.xxl,
  marginTop: spacing.xs,
}