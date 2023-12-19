import * as React from "react"
import { View, StyleSheet, Image } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"
import { Text } from "app/components/Text"

export interface CarteSignalementProps {
  details: boolean

  type: string

  nomSignalement: string

  description?: string

  distanceDuDepart: string

  imageSignalement?: string
}

export const CarteSignalement = observer(function CarteSignalement(props: CarteSignalementProps) {
  const {
    details,
    type,
    nomSignalement,
    description,
    distanceDuDepart,
    imageSignalement
  } = props

  if (details === undefined) {
    console.error(`CarteSignalement : details non défini pour le signalement: ${nomSignalement}`);
    console.log(details)
  }

  const check = (paramName, paramValue) => {
    if (!paramValue) {
      if (paramName != 'imageSignalement') {
        console.error(`CarteSignalement : ${paramName} non défini pour le signalement: ${nomSignalement}`);
      }
      else {
        console.warn(`CarteSignalement : imageSignalement non défini pour le signalement: ${nomSignalement}`);
      }
    }
  };

  if (details) {
    check('type', type);
    check('nomSignalement', nomSignalement);
    check('description', description);
    check('distanceDuDepart', distanceDuDepart);
    check('imageSignalement', imageSignalement);
  } else {
    check('type', type);
    check('nomSignalement', nomSignalement);
    check('distanceDuDepart', distanceDuDepart);
  }

  return details ?
    <View style={styles.carteGlobale}>
      {entete(type, nomSignalement, distanceDuDepart)}
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
        {entete(type, nomSignalement, distanceDuDepart)}
      </View>
    </View>
})

function entete(type, nomSignalement, distanceDuDepart) {
  return (
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
  )
}

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

