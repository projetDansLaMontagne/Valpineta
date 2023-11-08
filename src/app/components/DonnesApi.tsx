import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { Card } from '../components'
import { colors } from 'app/theme';


const DonnesExcursions = () => {
  const [excursionsData, setExcursionsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadExcursions = async () => {
      try {
        const jsonData = require('../../assets/jsons/excursions.json');

        const excursions = jsonData.data.map(excursion => ({
          nom_excursions: excursion.nom_excursions,
          duree: excursion.duree,
          typeParcours: excursion.type_parcours.name,
          zone: excursion.vallee,
          distance: excursion.distance_excursion,
          denivelePositif: excursion.denivele,
          difficulteParcours: excursion.difficulte_technique,
          difficulteOrientation:  excursion.difficulte_orientation          
        }));

        setExcursionsData(excursions);
      } 
      catch (error) {
        console.error('Erreur lors du chargement du fichier JSON :', error);
      }
    };

    loadExcursions();
  }, []);

  const filterExcursions = () => {
    return excursionsData.filter(excursion =>
      excursion.nom_excursions.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredExcursions = filterExcursions();

  const renderItem = ({ item }) => (
    <View>
        <Card
        nomExcursions={item.nom_excursions} 
        parcours={item.typeParcours} 
        zone={item.zone} 
        temps={item.duree} 
        distance={item.distance}
        denivelePositif={item.denivelePositif}
        difficulteParcours={item.difficulteParcours}
        difficulteOrientation={item.difficulteOrientation}
        />    
    </View>
  );

  return (
    <View>
      <TextInput
        placeholder='Rechercher une excursion' 
        style={styles.searchBox} 
        autoCorrect={false} 
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
        placeholderTextColor={colors.palette.gris}
      />

      {filteredExcursions.length > 0 ? (
        <FlatList
          data={filteredExcursions}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text>Aucune excursion ne correspond à votre recherche.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    color: colors.palette.noir,
    backgroundColor: colors.palette.grisClair,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
}});

export default DonnesExcursions;