import React, { FC, useEffect, useState  } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, Text, TextStyle  } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen } from "app/components"
import RecuperateurFavoris from "app/components/RecuperateurFavoris"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../components';
import { ScrollView } from "react-native-gesture-handler"

 import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface FavorisScreenProps extends AppStackScreenProps<"Favoris"> {}

export const FavorisScreen: FC<FavorisScreenProps> = observer(function FavorisScreen(props : FavorisScreenProps) {
  const navigation = useNavigation()
  
return (
    <Screen>
      <ScrollView>
        <RecuperateurFavoris navigation={navigation}/>
      </ScrollView>
    </Screen>
  )
}
)