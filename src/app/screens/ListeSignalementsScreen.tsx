// Librairies
import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, Dimensions, View, Image } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import SwipeUpDown from "react-native-swipe-up-down";

// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

// Composants
import { Screen, Text } from "app/components"
import { colors } from "app/theme/colors";
import { spacing } from "app/theme";

interface ListeSignalementsScreenProps extends AppStackScreenProps<"ListeSignalements"> {}

const { width, height } = Dimensions.get("window");

export const ListeSignalementsScreen: FC<ListeSignalementsScreenProps> = observer(function ListeSignalementsScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()



  function itemMini() {
    return (
      <View style={$containerPetit}>
        <Image
          source={require("../../assets/icons/swipe-up.png")}
        />
      </View>
    )
  }

  function itemFull(){
    return (
      <View style={$containerGrand}>
        
      </View>
    )
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text text="listeSignalements" />
      <SwipeUpDown
          itemMini={itemMini()}
          itemFull={itemFull()}
          disableSwipeIcon={true}
          animation="easeInEaseOut"
          extraMarginTop={125}
          swipeHeight={100}
        />
    </Screen>
  )

  

})



const $root: ViewStyle = {
  flex: 1,
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
