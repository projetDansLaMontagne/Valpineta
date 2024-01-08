import React, { useEffect, useState } from 'react';
import NetInfo from "@react-native-community/netinfo";
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

  imageSignalement?: any
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

  const [isConnected, setIsConnected] = useState(true); // État de la connexion Internet

  useEffect(() => {
    const checkConnection = async () => {
      const netInfoState = await NetInfo.fetch();
      setIsConnected(netInfoState.isConnected);
    };

    // Vérifier la connexion au montage du composant
    checkConnection();

    // Abonnement aux changements d'état de la connexion
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Nettoyage de l'abonnement lors du démontage du composant
    return () => unsubscribe();
  }, []);

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

  const renderImage = () => {
    if (isConnected && type === 'pointInteret' && imageSignalement) {
      return (
        <View style={styles.container}>
          <Image
            source={{ uri: `data:image/png;base64,${imageSignalement}` }}
            style={styles.image}
          />
          <Text style={styles.texte}>
            {description}
          </Text>
        </View>
      );
    } else {
      return (
        <Text style={styles.texte}>
          {description}
        </Text>
      );
    }
  };

  return details ? (
    <View style={styles.carteGlobale}>
      {entete(type, nomSignalement, distanceDuDepart)}
      <View style={styles.contenu}>
        {renderImage()}
      </View>
    </View>
  ) : (
    <View>
      <View style={styles.carteGlobale}>
        {entete(type, nomSignalement, distanceDuDepart)}
      </View>
    </View>
  );
});



function entete(type, nomSignalement, distanceDuDepart) {
  return (
    <View style={styles.entete}>
      {type === 'pointInteret' ? (
        <Image source={require('../../assets/icons/pin.png')} style={styles.iconeVert} />
      ) : (
        <Image source={require('../../assets/icons/pin.png')} style={styles.iconeRouge} />
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
    flex: 0.5,
    // maxWidth: "50%",
  },
  iconeRouge: {
    width: 25, height: 25, tintColor: 'red'
  },
  iconeVert: {
    width: 25, height: 25, tintColor: 'green'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  image: {
    flex: 0.5,
    width: 100, // ajustez la largeur selon vos besoins
    height: 100, // ajustez la hauteur selon vos besoins
  },

})

