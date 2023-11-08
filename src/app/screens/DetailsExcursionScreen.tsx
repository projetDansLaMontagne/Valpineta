import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { View, StyleSheet } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { Screen, Text } from "app/components";
import { spacing, colors } from "app/theme";
import { Dimensions } from "react-native";
import SwipeUpDown from "react-native-swipe-up-down";

const { width, height } = Dimensions.get("window");

interface DetailsExcursionScreenProps extends AppStackScreenProps<"DetailsExcursion"> {}

export const DetailsExcursionScreen: FC<DetailsExcursionScreenProps> = observer(
  function DetailsExcursionScreen() {
    return (
      <View 
      style={style.container}
      >
        <Text text="Ici il y aura la carte" size="xxl" />
        <SwipeUpDown
          itemMini={() => (
            <View>
              <Text 
              style={{backgroundColor: colors.erreur, marginBottom: 50}}
              text="je suis le petit" size="sm" />
            </View>
          )}
          itemFull={(close) => (
            <View >
              <Text text="Ici il y aura les détails" size="xxl" />
              <Text text="Vous pouvez swiper vers le bas pour fermer." />
            </View>
          )}
          disableSwipeIcon={false}
          onShowMini={() => console.log("mini")}
          onShowFull={() => console.log("full")}
          animation="easeInEaseOut"
        />
      </View>
    );
  }
);

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bordure,
    alignItems: "center",
    justifyContent: "flex-start",
  }
});

