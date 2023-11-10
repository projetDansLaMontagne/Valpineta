
import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, ScrollView } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { spacing } from "app/theme"
import { CarteExcursion } from "../components"

interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> {
  navigation: any
}

export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(props: ExcursionsScreenProps) {

  const { navigation } = props

  return (
    <Screen style={$root} >
      {/* <CarteExcursion /> */}
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding: spacing.sm,

}

