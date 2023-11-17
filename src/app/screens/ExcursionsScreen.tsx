
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

/**@todo CSS : agrandir la zone de texte de recherche + la rendre fonctionnelle */
/**@todo CSS : empecher le footer d etre au dessus de la derniere excursion */
interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> {
  Filtres: Record<string, any>
}

export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(props: ExcursionsScreenProps) {
  var filtres: Record<string, any>;

  const [excursions, setExcursions] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { navigation } = props;

  // -- Fonctions --
  /**@warning Cette fonction est utilise pour recuperer des donnes (independemment du composant), 
   * qui vont etre copiees manuellement dans la page filtre */
  /**
   * Recupere les valeurs de chaque filtre (valeurs max, types de parcours, vallees)
   * @param excursions 
   */
  const valeursFiltres = (excursions: Array<any>) => {
    // Parcourt de chaque excursion pour connaitre les maximas 
    var distanceMax = 0;
    var dureeMax = 0;
    var deniveleMax = 0;
    var typesParcours = [];
    var vallees = [];
    var difficultePhysiqueMax = 0;
    var difficulteOrientationMax = 0;

    excursions.forEach(excursion => {
      // Distance
      if (excursion.distance > distanceMax) {
        distanceMax = excursion.distance;
      }
      // Duree
      const duree = excursion.duree.h + excursion.duree.m / 60;
      if (duree > dureeMax) {
        dureeMax = duree;
      }
      // Denivele
      if (excursion.denivelePositif > deniveleMax) {
        deniveleMax = excursion.denivelePositif;
      }
      // Types de parcours
      if (!typesParcours.includes(excursion.typeParcours)) {
        typesParcours.push(excursion.typeParcours);
      }
      // Vallee
      if (!vallees.includes(excursion.vallee)) {
        vallees.push(excursion.vallee);
      }
      // Difficulte physique
      if (excursion.difficulteTechnique > difficultePhysiqueMax) {
        difficultePhysiqueMax = excursion.difficulteTechnique;
      }
      // Difficulte orientation
      if (excursion.difficulteOrientation > difficulteOrientationMax) {
        difficulteOrientationMax = excursion.difficulteOrientation;
      }
    });

    return {
      distanceMax: distanceMax,
      dureeMax: dureeMax,
      deniveleMax: deniveleMax,
      typesParcours: typesParcours,
      vallees: vallees,
      difficultePhysiqueMax: difficultePhysiqueMax,
      difficulteOrientationMax: difficulteOrientationMax,
    }
  }
  const excursionsFiltrees = (excursions: Array<Record<string, any>>, filtres) => {
    console.log(filtres)
    console.log(excursions[0]);

    excursions = excursions.filter(excursion => {
      if (
        excursion.distance < filtres.intervalleDistance.min ||
        excursion.distance > filtres.intervalleDistance.max ||
        (excursion.duree.h == filtres.intervalleDuree.max && excursion.duree.m != 0) ||
        excursion.duree.h < filtres.intervalleDuree.min ||
        excursion.duree.h > filtres.intervalleDuree.max ||
        excursion.denivelePositif < filtres.intervalleDenivele.min ||
        excursion.denivelePositif > filtres.intervalleDenivele.max ||
        !filtres.typesParcours.includes(excursion.typeParcours) ||
        !filtres.vallees.includes(excursion.vallee) ||
        !filtres.difficulteOrientation.includes(excursion.difficulteOrientation) ||
        !filtres.difficultePhysique.includes(excursion.difficulteTechnique)
      ) {
        // On supprime de l excursion
        return false;
      }
      // On garde de l excursion
      return true;
    });
    return excursions;
  }
  const excursionsFormatees = (excursions: Array<Record<string, any>>) => {
    var excursionsFormatees = [];

    const formatDuree = /(\d{1,2})h(\d{0,2})/;

    excursions.forEach(excursion => {
      var malFormatee = false;

      // Duree
      const matchDuree: RegExpMatchArray | null = excursion.duree.match(formatDuree);

      if (matchDuree == null) {
        // MAUVAIS FORMAT DUREE
        console.log("Format de duree d une excursion MAUVAIS, impossible de formater. Il faut que les durees soient de la forme : HHhMM et non : " + excursion.duree);
        malFormatee = true;
      }

      if (!malFormatee) {
        // Conversions string --> number
        excursion.duree = { h: +matchDuree[1], m: +matchDuree[2] };
        excursion.distance = +excursion.distance;
        excursion.denivelePositif = +excursion.denivelePositif;
        excursion.difficulteTechnique = +excursion.difficulteTechnique;
        excursion.difficulteOrientation = +excursion.difficulteOrientation;

        // Verification de la validite des conversions
        if (isNaN(excursion.duree.h) ||
          isNaN(excursion.duree.m) ||
          isNaN(excursion.distance) ||
          isNaN(excursion.denivelePositif) ||
          isNaN(excursion.difficulteTechnique) ||
          isNaN(excursion.difficulteOrientation)) {
          // L excursion est mal formatee, on la retire
          console.log("Format d un attribut de l excursion MAUVAIS, impossible de formater.");
          malFormatee = true;
        }
      }

      if (!malFormatee) {
        // L excursion est bien formatee, on l ajoute
        excursionsFormatees.push(excursion);
      }
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
        difficulteTechnique: excursion.difficulte_technique,
        difficulteOrientation: excursion.difficulte_orientation
      }));

      // REDUCTION POUR DEBUG
      // excursionsBRUT = excursionsBRUT.slice(0, 3);

      excursionsBRUT = excursionsFormatees(excursionsBRUT);

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
                    difficulteParcours={excursion.difficulteTechnique}
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