
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, ScrollView, Text, FlatList, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AppStackScreenProps } from "app/navigators"
import { Screen, CarteExcursion } from "app/components"
import { colors, spacing } from 'app/theme';

/**@warning La navigation vers filtres est dans le mauvais sens (l'écran slide vers la gauche au lieu de la droite) */

/**@warning Cliquer sur excursions dans le footer redirige vers la page en retirant les parametre "Filtres" mais donne un parametre buggé "filtres" */
/**@warning Pas de gestion des erreurs de recuperation du track */

/**@todo CSS : agrandir la zone de texte de recherche + la rendre fonctionnelle */
/**@todo CSS : empecher le footer d etre au dessus de la derniere excursion */
interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> {
  Filtres: Record<string, any>
}


export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(props: ExcursionsScreenProps) {
  var filtres: typeof props.Filtres;

  type excursionsType = Array<Record<string, any>>;

  const [excursions, setExcursions] = useState(undefined);
  const [valeursFiltres, setValeursFiltres] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { navigation } = props;
  const filtreIcone = require("../../assets/icons/filtre.png")

  // -- Primitives --
  /**
   * Cette fonction doit etre executee systematiquement lors de la synchro descendante
   * Recupere les valeurs max et les intervalles de chaque filtre (valeurs max, types de parcours, vallees)
   * @param excursions 
   */
  const calculValeursFiltres = (excursions: excursionsType): Record<string, number | Array<number>> => {
    // Parcourt de chaque excursion pour connaitre les maximas 
    var distanceMax = 0;
    var dureeMax = 0;
    var deniveleMax = 0;
    var typesParcours = [];
    var vallees = [];
    var difficulteTechniqueMax = 0;
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
        deniveleMax = excursion.denivele;
      }
      // Types de parcours
      if (!typesParcours.includes(excursion.typeParcours)) {
        typesParcours.push(excursion.typeParcours);
      }
      // Vallee
      if (!vallees.includes(excursion.vallee)) {
        vallees.push(excursion.vallee);
      }
      // Difficulte technique
      if (excursion.difficulteTechnique > difficulteTechniqueMax) {
        difficulteTechniqueMax = excursion.difficulteTechnique;
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
      difficulteTechniqueMax: difficulteTechniqueMax,
      difficulteOrientationMax: difficulteOrientationMax,
    }
  }
  /**
   * Tri et filtre des excursions avec les filtres
   * @returns 
   */
  const filtrageExcursions = (excursions: excursionsType, filtres) => {
    excursions = excursions.filter(excursion => {
      if (
        excursion.distance < filtres.intervalleDistance.min ||
        excursion.distance > filtres.intervalleDistance.max ||
        (excursion.duree.h == filtres.intervalleDuree.max && excursion.duree.m != 0) ||
        excursion.duree.h < filtres.intervalleDuree.min ||
        excursion.duree.h > filtres.intervalleDuree.max ||
        excursion.denivele < filtres.intervalleDenivele.min ||
        excursion.denivele > filtres.intervalleDenivele.max ||
        !filtres.typesParcours.includes(excursion.typeParcours) ||
        !filtres.vallees.includes(excursion.vallee) ||
        !filtres.difficultesTechniques.includes(excursion.difficulteTechnique) ||
        !filtres.difficultesOrientation.includes(excursion.difficulteOrientation)
      ) {
        // On supprime de l excursion
        return false;
      }
      // On garde de l excursion
      return true;
    });

    // Tri en fonction du critere de tri
    excursions = excursions.sort((a, b) => {
      const critere = filtres.critereTri;

      if (critere === "duree") {
        // On tri par la duree (avec h et m)
        const duree1 = a.duree.h + a.duree.m / 60;
        const duree2 = b.duree.h + b.duree.m / 60;
        return duree1 - duree2
      }
      return a[critere] - b[critere]
    })

    return excursions;
  }
  /**
   * Cette fonction doit etre executee systematiquement lors de la synchro descendante
   * Formate les fichiers de maniere a n avoir que le type necessaire (au lieu des strings)
   * @param excursions 
   * @returns 
   */
  const formatageExcursions = (excursions: excursionsType) => {
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
        excursion.denivele = +excursion.denivele;
        excursion.difficulteTechnique = +excursion.difficulteTechnique;
        excursion.difficulteOrientation = +excursion.difficulteOrientation;

        // Verification de la validite des conversions
        if (isNaN(excursion.duree.h) ||
          isNaN(excursion.duree.m) ||
          isNaN(excursion.distance) ||
          isNaN(excursion.denivele) ||
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


  // -- Fonctions -- 
  const loadExcursions = async (): Promise<void> => {
    try {
      // -- RECUPERATION DU FICHIER --
      var excursionsBRUT = require('../../assets/jsons/excursions.json');
      excursionsBRUT = excursionsBRUT.data.map(excursion => ({
        nom: excursion.nom_excursions,
        denivele: excursion.denivele,
        duree: excursion.duree,
        distance: excursion.distance_excursion,
        typeParcours: excursion.type_parcours.name,
        vallee: excursion.vallee,
        difficulteTechnique: excursion.difficulte_technique,
        difficulteOrientation: excursion.difficulte_orientation
      }));

      // -- FORMATAGE DES DONNEES RECUPEREES --
      const excursionsFormatees = formatageExcursions(excursionsBRUT);


      // -- APPLICATION DES FILTRES --
      if (filtres === undefined) {
        // Pas de filtre
        setExcursions(excursionsFormatees);
      }
      else {
        // Application des filtres
        setExcursions(filtrageExcursions(excursionsFormatees, filtres))
      }

      // -- CALCUL DES VALEURS DE FILTRES --
      setValeursFiltres(calculValeursFiltres(excursionsFormatees));
    }
    catch (error) {
      console.error('Erreur lors du chargement du fichier JSON :', error);
    }
  };

  // CALL BACKS
  const navigationFiltres = () => {
    if (valeursFiltres) {
      navigation.navigate("Stack", { screen: 'Filtres' });
    }
    else {
      console.log("Impossible de naviguer vers la page filtres sans les filtres par défaut");
    }
  }

  useEffect(() => {
    if (props.route.params) {
      filtres = props.route.params.Filtres;
    }
    loadExcursions();
  }, []);

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
          onPress={() => navigationFiltres()}
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
                    nom={excursion.nom}
                    denivele={excursion.denivele}
                    distance={excursion.distance}
                    duree={excursion.duree}
                    vallee={excursion.vallee}
                    typeParcours={excursion.typeParcours}
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

  valleeIcone: {
    marginLeft: "auto",
  }
});