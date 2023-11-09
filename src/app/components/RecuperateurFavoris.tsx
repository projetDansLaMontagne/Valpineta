import React, { useEffect, useState, } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from './Card';

const EcranFavoris = ({ navigation }) => {
  const [excursionsFavorites, setExcursionsFavorites] = useState([]);

  const chargerExcursionsFavorites = async () => {
    try {
      const excursionsEnFavoris = await AsyncStorage.getItem('excursionsFavorites');
      if (excursionsEnFavoris) {
        setExcursionsFavorites(JSON.parse(excursionsEnFavoris));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des excursions favorites :', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      chargerExcursionsFavorites();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View>
      <Text style={styles.titre}>Excursions Favorites :</Text>

      
      {excursionsFavorites.length > 0 ? (
        excursionsFavorites.map(excursion => (
          <Card
            key={excursion.post_id}
            nomExcursions={excursion.nomExcursions}
            parcours={excursion.parcours}
            zone={excursion.zone}
            temps={excursion.temps}
            distance={excursion.distance}
            denivelePositif={excursion.denivelePositif}
            difficulteParcours={excursion.difficulteParcours}
            difficulteOrientation={excursion.difficulteOrientation}
            post_id={excursion.post_id}
          />
        ))
      ) : (
        <Text style={styles.pasDeFavorites}>Aucune excursion en favori</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titre: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  pasDeFavorites: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
});
export default EcranFavoris;
