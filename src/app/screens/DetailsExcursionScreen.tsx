import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { View, SafeAreaView, ViewStyle, TouchableOpacity, Image } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Button, Text, } from "app/components";
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
  return(
  <View style={$containerPetit}>
  </View>
  )
}

function itemFull() {
  return (
    <View style={$containerGrand} >
      <View style={$containerTitre}>
        <Text text="Col de la marmotte" size="xl" style={$titre} />
        <TouchableOpacity
        >
          <Image
            source={require("../../assets/icons/download.png")}
            style={$iconDownload}
          >
          </Image>
        </TouchableOpacity>

      </View>
      <View style={$containerBouton}>
        <Button text="Infos"/>
        <Button text="Avis" />
      </View>
      <View style={$containerBouton}>
        <Text text="Description" size="xs" />
        <Text text="Description" size="xs" />
        <Text text="Description" size="xs" />
        <Text text="Description" size="xs" />
      </View>
      <View style={$containerDescriptionSignalement}>
        <View>
          <Text text="Description" size="xl" />
          <Text text="loremp ipsum" size="xs" />
        </View>
        <View>
          <Text text="Signalement" size="xl" />
          <Text text="loremp ipsum" size="xs" />
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
  padding: spacing.lg,
}



const $containerDescriptionSignalement: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  width: width,
}

const $containerDenivele: ViewStyle = {
  width: width,
  padding: spacing.lg,
}

const $imageDenivele: ViewStyle = {
  height: 100,
  width: width - spacing.xl,
  marginTop: spacing.xs,
}