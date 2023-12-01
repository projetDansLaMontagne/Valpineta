import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle, StyleSheet, Image } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing, typography } from "app/theme"
import { Text } from "app/components/Text"

import { TextProps } from "./Text"

export interface CarteSignalementProps {
  /**
   * An optional style override useful for padding & margin.
   */

  details?: boolean

  type?: TextProps["text"]

  nomSignalement?: TextProps["text"]

  description?: TextProps["text"]

  coordonnes?: TextProps["text"]

  imageSignalement?: TextProps["text"]

}

/**
 * Describe your component here
 */
export const CarteSignalement = observer(function CarteSignalement(props: CarteSignalementProps) {
  const {
    details,
    type,
    nomSignalement,
    description,
    coordonnes,
    imageSignalement
  } = props

  return (
    <>
      {details ? (
        <View style={styles.carteGlobale}>
          <View style={styles.entete}>
            {type === 'pointInteret' ? (
              <Image source={require('../../assets/icons/pin.png')} style={{ width: 20, height: 20, tintColor: 'green' }} />
            ) : (
              <Image source={require('../../assets/icons/pin.png')} style={{ width: 20, height: 20, tintColor: 'red' }} />
            )}
            <Text style={styles.heading}>
              {nomSignalement}
            </Text>
            <Text>
              {coordonnes} km
            </Text>


          </View>

          <View style={styles.contenu}>
            {/* {require(`../../assets/images/${imageSignalement}`)}  */}
            <Text style={styles.texte}>
              {description}
            </Text>
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.carteGlobale}>
            <View style={styles.entete}>
              {type === 'pointInteret' ? (
                <Image source={require('../../assets/icons/pin.png')} style={{ width: 20, height: 20, tintColor: 'green' }} />
              ) : (
                <Image source={require('../../assets/icons/pin.png')} style={{ width: 20, height: 20, tintColor: 'red' }} />
              )}
              <Text style={styles.heading}>
                {nomSignalement}
              </Text>
              <Text>
                {coordonnes} km
              </Text>
            </View>
          </View>
        </View>
      )}
    </>
  )
})



const styles = StyleSheet.create({
  carteGlobale: {
    padding: 5,
    margin: 10,
    shadowColor: colors.palette.noir,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderRadius: 10,
    backgroundColor: colors.palette.blanc,
  },
  entete: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingStart: spacing.xs,
    paddingEnd: spacing.xs,
    marginBottom: spacing.xxs,
  },
  contenu: {
    fontSize: 14,
    maxWidth: "100%",
    textAlign: "center",
  },
  icone: {
    color: colors.palette.vert,
  },
  heading: {
    fontSize: 16,
    paddingEnd: 15,
    paddingStart: 15,
    padding: 5
  },
  imageSignalement: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  texte: {
    fontSize: 14,
    maxWidth: "100%",
    textAlign: "center",
  },
})

