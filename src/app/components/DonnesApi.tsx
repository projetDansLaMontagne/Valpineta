import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card } from '../components'
import { colors, spacing } from 'app/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { Spacing } from 'app/theme';


const DonnesExcursions = () => {
  const [excursionsData, setExcursionsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtreIcone = require("../../assets/icons/filtre.png")

  const handleFilterPress = () => {
    // Faites ce que vous souhaitez lorsqu'on appuie sur l'icône de filtre
    console.log('Filtrer les excursions');
    // Autres actions à effectuer
  };

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
        <View style={styles.searchBox}>
        <TextInput
          placeholder='Rechercher une excursion' 
          autoCorrect={false} 
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          placeholderTextColor={colors.palette.grisFonce}
        />
        <TouchableOpacity onPress={handleFilterPress} style={styles.zoneIcone}>
          <Image style={styles.iconeFiltre} source={filtreIcone} resizeMode="contain" />
        </TouchableOpacity>
        </View>

      <ScrollView>
      {filteredExcursions.length > 0 ? (
        <FlatList
          data={filteredExcursions}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()
          }
          scrollEnabled={false}
        />
      ) : (
        <Text>Aucune excursion ne correspond à votre recherche.</Text>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    display:"flex",
    flexDirection:"row",
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
    
},

iconeFiltre:{
  width: spacing.lg,
  height: spacing.lg,
},

zoneIcone:{
  marginLeft: "auto",
}
});

export default DonnesExcursions;