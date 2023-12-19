import * as React from "react"
import { View, StyleSheet, Image } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"
import { Text } from "app/components/Text"

export interface CarteSignalementProps {
  /**
   * An optional style override useful for padding & margin.
   */
  details?: boolean

  type?: string

  nomSignalement?: string

  description?: string

  distanceDuDepart?: string

  imageSignalement?: string

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
    distanceDuDepart,
    imageSignalement
  } = props

  const checkAndWarn = (paramName, paramValue) => {
    if (!paramValue) {
      console.warn(`CarteSignalement : ${paramName} non défini pour le signalement: ${nomSignalement}`);
    }
  };

  if (details) {
    checkAndWarn('type', type);
    checkAndWarn('nomSignalement', nomSignalement);
    checkAndWarn('description', description);
    checkAndWarn('distanceDuDepart', distanceDuDepart);
    checkAndWarn('imageSignalement', imageSignalement);
  } else {
    checkAndWarn('type', type);
    checkAndWarn('nomSignalement', nomSignalement);
    checkAndWarn('distanceDuDepart', distanceDuDepart);
  }


  return details ?
    <View style={styles.carteGlobale}>
      <View style={styles.entete}>
        {type === 'pointInteret' ? (
          <Image source={require('../../assets/icons/pin.png')} style={{ width: 25, height: 25, tintColor: 'green' }} />
        ) : (
          <Image source={require('../../assets/icons/pin.png')} style={{ width: 25, height: 25, tintColor: 'red' }} />
        )}
        <Text style={styles.heading}>
          {nomSignalement}
        </Text>
        <Text>
          {distanceDuDepart} km
        </Text>


      </View>

      <View style={styles.contenu}>
        {/* {require(`../../assets/images/${imageSignalement}`)}  */}
        <Text style={styles.texte}>
          {description}
        </Text>
      </View>
    </View>
    :
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
            {distanceDuDepart} km
          </Text>
        </View>
      </View>
    </View>

})

const styles = StyleSheet.create({
  carteGlobale: {
    padding: spacing.sm,
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
  },
  contenu: {
    fontSize: 14,
    maxWidth: "100%",
  },
  icone: {
    color: colors.palette.vert,
  },
  heading: {
    fontSize: spacing.md,
    paddingEnd: 15,
    paddingStart: 15,
  },
  imageSignalement: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  texte: {
    fontSize: 14,
    maxWidth: "100%",
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
})

