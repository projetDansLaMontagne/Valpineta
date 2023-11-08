import React, { useEffect, useState, } from 'react';
import { View, Text } from 'react-native';
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


  console.log('Excursions dans le state :', excursionsFavorites); // Vérifier les données stockées dans le state

  return (
    <View>
      <Text>Excursions Favorites :</Text>
      {excursionsFavorites.map((excursion) => (
        <View key={excursion.post_id}>
          <Card
            nomExcursions={excursion.nomExcursions}
            parcours={excursion.typeParcours}
            zone={excursion.zone}
            distance={excursion.distance}
            denivelePositif={excursion.denivelePositif}
            difficulteParcours={excursion.difficulteParcours}
            difficulteOrientation={excursion.difficulteOrientation}
          />
          {/* Afficher d'autres détails de l'excursion si nécessaire */}
        </View>
      ))}
    </View>
  );
};

export default EcranFavoris;
