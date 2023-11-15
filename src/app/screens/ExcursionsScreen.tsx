
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, ScrollView, Text, FlatList, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AppStackScreenProps } from "app/navigators"
import { Screen, CarteExcursion } from "app/components"
import { colors, spacing } from 'app/theme';

/**@warning ATTENTION LE PARAMETRE "filtres" en minuscule est BUGGE est est defini lorsqu on navigue vers la page grace au foot */
/**@warning Pas de gestion des erreurs de recuperation du track */
/**@bug Il faut cliquer 2 fois sur le le bouton des filtres pour etre redirige */

/**@todo agrandir la zone de texte de recherche + la rendre fonctionnelle */
interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> {
  Filtres: Record<string, any>
}

export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(props: ExcursionsScreenProps) {
  var filtresAppliques;

  const [excursions, setExcursions] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { navigation } = props;

  // Fonctions 
  const excursionsFiltrees = (excursions) => {
    return [excursions[0]];
  }

  const loadExcursions = async (): Promise<void> => {
    try {
      const jsonData = require('../../assets/jsons/excursions.json');

      const excursionsJSON = jsonData.data.map(excursion => ({
        nom: excursion.nom_excursions,
        duree: excursion.duree,
        typeParcours: excursion.type_parcours.name,
        zone: excursion.vallee,
        distance: excursion.distance_excursion,
        denivelePositif: excursion.denivele,
        difficulteParcours: excursion.difficulte_technique,
        difficulteOrientation: excursion.difficulte_orientation
      }));

      if (filtresAppliques) {
        // Application des filtres
        setExcursions(excursionsFiltrees(excursionsJSON))
      }
      else {
        setExcursions(excursionsJSON);
      }
    }
    catch (error) {
      console.error('Erreur lors du chargement du fichier JSON :', error);
    }
  };


  useEffect(() => {
    filtresAppliques = (props.route.params.Filtres !== undefined);
    loadExcursions();
    console.log("(DEBUG) parametres de navigation : " + props.route.params);
  }, []);


  const filtreIcone = require("../../assets/icons/filtre.png")

  return <Screen style={$root} >
    <View>
      <View style={styles.searchBox}>
        <TextInput
          placeholder='Rechercher une excursion'
          autoCorrect={false}
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          placeholderTextColor={colors.palette.grisFonce}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("Stack", { screen: 'Filtres' })}
          style={styles.zoneIcone}
        >
          <Image
            style={styles.iconeFiltre}
            source={filtreIcone}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {
        excursions && (
          excursions.length == 0 ?
            <Text>Aucune excursion ne correspond à votre recherche.</Text>
            :
            <ScrollView>
              {
                excursions.map((excursion, i) => (
                  <CarteExcursion
                    key={i}
                    nomExcursions={excursion.nom}
                    parcours={excursion.typeParcours}
                    zone={excursion.zone}
                    temps={excursion.duree}
                    distance={excursion.distance}
                    denivelePositif={excursion.denivelePositif}
                    difficulteParcours={excursion.difficulteParcours}
                    difficulteOrientation={excursion.difficulteOrientation}
                  />
                ))
              }
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
    shadowColor: "#000",
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