
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, ScrollView, Text, FlatList, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AppStackScreenProps } from "app/navigators"
import { Screen, CarteExcursion } from "app/components"
import { colors, spacing } from 'app/theme';


interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> {
  navigation: any
}

export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(props: ExcursionsScreenProps) {
  const [excursions, setExcursions] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');


  // Fonctions 
  const loadExcursions = async () => {
    try {
      const jsonData = require('../../assets/jsons/excursions.json');

      const excursionsJSON = jsonData.data.map(excursion => ({

        nomExcursion: excursion.nom_excursions,
        duree: excursion.duree,
        typeParcours: excursion.type_parcours.name,
        zone: excursion.vallee,
        distance: excursion.distance_excursion,
        denivelePositif: excursion.denivele,
        difficulteParcours: excursion.difficulte_technique,
        difficulteOrientation: excursion.difficulte_orientation,
        signalements: excursion.signalements,
        descriptionFR: excursion.post_content_fr,
        descriptionES: excursion.post_content_es,

      }));

      setExcursions(excursionsJSON);
    }
    catch (error) {
      console.error('Erreur lors du chargement du fichier JSON :', error);
    }
  };
  const handleFilterPress = () => {
    // Faites ce que vous souhaitez lorsqu'on appuie sur l'icône de filtre
    console.log('Filtrer les excursions');
    // Autres actions à effectuer
  };
  // const excursionsFiltrees = () => {
  //   return excursionsData.filter(excursion =>
  //     excursion.nom_excursions.toLowerCase().includes(searchQuery.toLowerCase())
  //   );
  // };

  var filteredExcursions;
  useEffect(() => {
    loadExcursions();
  }, []);


  const filtreIcone = require("../../assets/icons/filtre.png")

  const renderItem = ({ item }) => (
    <View>
      <CarteExcursion
        excursion={item}
        navigation={props.navigation}
      />
    </View>
  );

  return <Screen style={$root} >
    <View>
      
    </View>
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

      {
        excursions && (
          excursions.length == 0 ?
            <Text>Aucune excursion ne correspond à votre recherche.</Text>
            :
            <ScrollView>
              <FlatList
                data={excursions}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()
                }
                scrollEnabled={false}
              />
            </ScrollView>
        )

      }
    </View>
  </Screen>


})

const $root: ViewStyle = {
  flex: 1,
  padding: spacing.sm,
}

const styles = StyleSheet.create({
  searchBox: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    color: colors.palette.noir,
    backgroundColor: colors.palette.grisClair,
    margin: 10,
    shadowColor: colors.palette.noir,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,

  },

  iconeFiltre: {
    width: spacing.lg,
    height: spacing.lg,
  },

  zoneIcone: {
    marginLeft: "auto",
  }
});