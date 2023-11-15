
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, ScrollView, Text, FlatList, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AppStackScreenProps } from "app/navigators"
import { Screen, CarteExcursion } from "app/components"
import { colors, spacing } from 'app/theme';

/**@bug Il faut cliquer 2 fois sur le le bouton des filtres pour etre redirige */

/**@warning ATTENTION LE PARAMETRE "filtres" en minuscule est BUGGE est est defini lorsqu on navigue vers la page grace au foot */
/**@warning Cliquer sur excursions dans le footer redirige vers la page en retirant les filtres */
/**@warning Pas de gestion des erreurs de recuperation du track */

/**@todo agrandir la zone de texte de recherche + la rendre fonctionnelle */
interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> {
  Filtres: Record<string, any>
}

export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(props: ExcursionsScreenProps) {
  var filtres: Record<string, any>;

  const [excursions, setExcursions] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { navigation } = props;

  // Fonctions 
  const excursionsFiltrees = (excursions: Array<Record<string, any>>, filtres) => {
    excursions = excursions.filter(excursion => {
      if (excursion.duree.h < filtres.intervalleDuree.min ||
        (excursion.duree.h == filtres.intervalleDuree.max && excursion.duree.m != 0) ||
        (excursion.duree.h > filtres.intervalleDuree.max)
      ) {
        // On supprime de l excursion
        return false;
      }
      // On garde de l excursion
      return true;
    });

    console.log(excursions);
    return excursions;
  }

  const formatageExcursions = (excursions: Array<Record<string, any>>) => {
    var excursionsFormatees = [];

    const formatDuree = /(\d{1,2})h(\d{0,2})/;

    excursions.forEach(excursion => {
      const matchDuree: RegExpMatchArray | null = excursion.duree.match(formatDuree);

      if (matchDuree == null) {
        // Si le format est mauvais, on ne formate pas la duree et on retire l excursion
        console.log("Format de duree de l excursion MAUVAIS, impossible de formater. Il faut que la duree soit de la forme : 1h30");
      }
      else {
        // Formatage duree
        excursion.duree = { h: +matchDuree[1], m: +matchDuree[2] };
      }


      excursionsFormatees.push(excursion)
    })


    return excursionsFormatees;
  }

  const loadExcursions = async (): Promise<void> => {
    try {
      var excursionsBRUT = require('../../assets/jsons/excursions.json');

      excursionsBRUT = excursionsBRUT.data.map(excursion => ({
        nom: excursion.nom_excursions,
        duree: excursion.duree,
        typeParcours: excursion.type_parcours.name,
        vallee: excursion.vallee,
        distance: excursion.distance_excursion,
        denivelePositif: excursion.denivele,
        difficulteParcours: excursion.difficulte_technique,
        difficulteOrientation: excursion.difficulte_orientation
      }));

      // REDUCTION POUR DEBUG
      excursionsBRUT = excursionsBRUT.slice(0, 3);

      excursionsBRUT = formatageExcursions(excursionsBRUT);

      if (filtres === undefined) {
        setExcursions(excursionsBRUT);
      }
      else {
        // Application des filtres
        setExcursions(excursionsFiltrees(excursionsBRUT, filtres))
      }
    }
    catch (error) {
      console.error('Erreur lors du chargement du fichier JSON :', error);
    }
  };


  useEffect(() => {
    filtres = props.route.params.Filtres;
    loadExcursions();
    // console.log("(DEBUG) parametres de navigation :");
    // console.log(props.route.params);
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
          style={styles.valleeIcone}
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
                    vallee={excursion.vallee}
                    duree={excursion.duree}
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

  valleeIcone: {
    marginLeft: "auto",
  }
});