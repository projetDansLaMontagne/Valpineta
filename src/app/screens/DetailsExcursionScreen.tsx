import React, { FC, useState } from "react";
import { observer } from "mobx-react-lite";
import { View, SafeAreaView, ViewStyle, TouchableOpacity, Image, TextStyle, ImageStyle, ScrollView, TouchableWithoutFeedback, Dimensions } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Text, CarteAvis, GpxDownloader, Button } from "app/components";
import { spacing, colors } from "app/theme";
import SwipeUpDown from "react-native-swipe-up-down";
import { CarteSignalement } from "app/components/CarteSignalement";

const { width, height } = Dimensions.get("window");



interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {
}

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen(props: DetailsExcursionScreenProps) {

    const {
      navigation,
      route: {
        params: {
          nomExcursion,
          temps,
          distance,
          difficulteParcours,
          difficulteOrientation,
          signalements
        }
      }
    } = props as DetailsExcursionScreenProps;


    return (
      < SafeAreaView
        style={$container}
      >
        <TouchableOpacity
          style={$boutonRetour}
          onPress={() => navigation.navigate("Excursions")}
        >
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          >
          </Image>
        </TouchableOpacity>
        <SwipeUpDown
          itemMini={itemMini()}
          itemFull={itemFull(nomExcursion, temps, distance, difficulteParcours, difficulteOrientation, signalements)}
          disableSwipeIcon={true}
          animation="easeInEaseOut"
          extraMarginTop={125}
          swipeHeight={100}
        />
      </SafeAreaView>
    );
  }
);

function itemMini() {
  return (
    <View style={$containerPetit}>
      <Image
        source={require("../../assets/icons/swipe-up.png")}
      />
    </View>
  )
}

function itemFull(nomExcursion, temps, distance, difficulteParcours, difficulteOrientation, signalements) {

  const [isInfos, setIsInfos] = useState(true);

  const [isAllSignalements, setisAllSignalements] = useState(false);


  return (
    <View style={$containerGrand}>
      <Image
        source={require("../../assets/icons/swipe-up.png")}
        style={$iconsSwipeUp}
      />
      {isAllSignalements ? listeSignalements(setisAllSignalements, signalements) : infosGenerales(nomExcursion, setIsInfos, isInfos, temps, distance, difficulteParcours, difficulteOrientation, setisAllSignalements, signalements)}

    </View>
  )

}

function infosGenerales(nomExcursion, setIsInfos, isInfos, temps, distance, difficulteParcours, difficulteOrientation, setisAllSignalements, signalements) {

  return (
    <View>
      <View style={$containerTitre}>
        <Text text={nomExcursion} size="xl" style={$titre} />
        <GpxDownloader />
      </View>
      <View>
        <View style={$containerBouton}>
          <TouchableOpacity onPress={() => setIsInfos(true)} style={$boutonInfoAvis} >
            <Text text="Infos" size="lg" style={[isInfos ? { color: colors.bouton } : { color: colors.text }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsInfos(false)} style={$boutonInfoAvis}>
            <Text text="Avis" size="lg" style={[isInfos ? { color: colors.text } : { color: colors.bouton }]} />
          </TouchableOpacity>
        </View>
        <View style={[$souligneInfosAvis, isInfos ? { left: spacing.lg } : { left: width - width / 2.5 - spacing.lg / 1.5 }]}>
        </View>
        {isInfos ? infos(temps, distance, difficulteParcours, difficulteOrientation, setisAllSignalements, signalements) : avis()}
      </View>
    </View>
  )
}

function listeSignalements(setisAllSignalements, signalements) {

  return (
    <View style={$listeSignalements}>
      <ScrollView>
        <TouchableWithoutFeedback>
          <View>

            {signalements?.avertissements.length > 0 ? (
              signalements.avertissements.map((avertissement, index) => (
                <View key={index}>
                  <CarteSignalement type="avertissement" details={true} nomSignalement={avertissement.nom_signalement} description={avertissement.description} coordonnes={avertissement.coordonnees.longitude} imageSignalement={avertissement.image} />
                </View>
              ))
            ) : (
              <Text>Aucun avertissement à afficher</Text>
            )}

            {signalements?.pointsInteret.length > 0 ? (
              signalements.pointsInteret.map((pointInteret, index) => (
                <View key={index}>
                  <CarteSignalement type="pointInteret" details={true} nomSignalement={pointInteret.nom_signalement} description={pointInteret.description} coordonnes={pointInteret.coordonnees.longitude} imageSignalement={pointInteret.image} />
                </View>
              ))
            ) : (
              <Text>Aucun point d'intérêt à afficher</Text>
            )}


          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <View>
        <Button text="Revenir aux informations" onPress={() => setisAllSignalements(false)} />

      </View>
    </View>
  )
}

function infos(temps, distance, difficulteParcours, difficulteOrientation, setisAllSignalements, signalements) {

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
              <Text text={temps} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/explorer.png")}
              >
              </Image>
              <Text text={distance + ' km'} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/difficulteParcours.png")}
              >
              </Image>
              <Text text={difficulteParcours} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation}
                source={require("../../assets/icons/difficulteOrientation.png")}
              >
              </Image>
              <Text text={difficulteOrientation} size="xs" />
            </View>
          </View>
          <View style={$containerDescriptionSignalement}>
            <View>
              <Text text="Description" size="lg" />
              <Text style={$textDescription} text="Pourquoi les marmottes ne jouent-elles jamais aux cartes avec les blaireaux ? Parce qu'elles ont trop peur qu'elles 'marmottent' les règles !" size="xxs" />
            </View>

            <View>
              <Text text="Signalements" size="lg" />

              <ScrollView horizontal>
                <TouchableWithoutFeedback>
                  <View style={$scrollLine}>
                    {signalements?.avertissements.length > 0 ? (
                      signalements.avertissements.map((avertissement, index) => (
                        <View key={index}>
                          <CarteSignalement type="avertissement" details={false} nomSignalement={avertissement.nom_signalement} coordonnes={avertissement.coordonnees.longitude} />
                        </View>
                      ))
                    ) : (
                      <Text>Aucun avertissement à afficher</Text>
                    )}

                    {signalements?.pointsInteret.length > 0 ? (
                      signalements.pointsInteret.map((pointInteret, index) => (
                        <View key={index}>
                          <CarteSignalement type="pointInteret" details={false} nomSignalement={pointInteret.nom_signalement} coordonnes={pointInteret.coordonnees.longitude} />
                        </View>
                      ))
                    ) : (
                      <Text>Aucun point d'intérêt à afficher</Text>
                    )}

                    {/* <CarteSignalement type="avertissement" details={false} nomSignalement="Marmotte agressive" coordonnes="" /> */}

                    <TouchableOpacity onPress={() => setisAllSignalements(true)}>
                      <Text text="Voir détails" size="sm" style={$tousLesSignalements} />
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </ScrollView>

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
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  )
}



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

const $containerDescriptionSignalement: ViewStyle = {
  justifyContent: "space-around",
  paddingLeft: spacing.xl,
  paddingRight: spacing.xl,
}

const $textDescription: TextStyle = {
  width: "100%",
  paddingRight: spacing.xl,
  paddingBottom: spacing.xl
}

const $containerDenivele: ViewStyle = {
  padding: spacing.lg,
}

const $imageDenivele: ViewStyle = {
  height: 100,
  width: width - spacing.xxl,
  marginTop: spacing.xs,
}

const $containerAvis: ViewStyle = {
  height: 200,
}

const $tousLesSignalements: TextStyle = {
  justifyContent: "space-between",
  paddingLeft: spacing.xl,
  paddingRight: spacing.xl,
  color: colors.souligne,
  textDecorationLine: "underline",
}
const $listeSignalements: ViewStyle = {
  height: "115%", //Si je met a 100% il descend pas jusqu'en bas voir avec reio prod
  width: "95%"
}

const $scrollLine: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.xs,
}