
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, ScrollView, Text, FlatList, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AppStackScreenProps } from "app/navigators"
import { Screen, CarteExcursion } from "app/components"
import { colors, spacing } from 'app/theme';
import { useStores } from "app/models";
import { translate } from "i18n-js";


interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> {
  navigation: any
}

export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(props: ExcursionsScreenProps) {
  const [excursions, setExcursions] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { parametres } = useStores()


  // Fonctions 
  const loadExcursions = async () => {
    try {
      let jsonData: Record<string, any>[] = [];
      if(parametres.langues === "fr"){
        jsonData = require('../../assets/JSON/excursionsFR.json');
      }
      else if (parametres.langues === "es"){
        jsonData = require('../../assets/JSON/excursionsES.json');
      }

      const excursionsJSON = jsonData.map(excursion => ({

        nomExcursion: excursion.nom_excursion,
        duree: excursion.duree,
        typeParcours: excursion.type_parcours,
        zone: excursion.vallee,
        distance: excursion.distance_excursion,
        denivelePositif: excursion.denivele,
        difficulteParcours: excursion.difficulte_technique,
        difficulteOrientation: excursion.difficulte_orientation,
        signalements: excursion.signalements,
        description: excursion.post_content,
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
  }, [parametres.langues]);


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
          placeholder={parametres.langues === "fr" ? "Rechercher une excursion" : "Buscar una excursión"}
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
            <Text>{translate("excursion.erreur")}</Text>
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