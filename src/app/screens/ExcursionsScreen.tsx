
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, ScrollView, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AppStackScreenProps } from "app/navigators"
import { Screen, CarteExcursion } from "app/components"
import { colors, spacing } from 'app/theme';
import { useStores } from "app/models";

/**@warning La navigation vers filtres est dans le mauvais sens (l'écran slide vers la gauche au lieu de la droite) */

/**@warning Cliquer sur excursions dans le footer redirige vers la page en retirant les parametre "Filtres" mais donne un parametre buggé "filtres" */
/**@warning Pas de gestion des erreurs de recuperation du track */

/**@todo CSS : agrandir la zone de texte de recherche + la rendre fonctionnelle */
/**@todo CSS : empecher le footer d etre au dessus de la derniere excursion */
interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> {
  Filtres: Record<string, any>
}


export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(props: ExcursionsScreenProps) {
  type excursionsType = Array<Record<string, any>>;

  const { parametres } = useStores()

  var filtres: typeof props.Filtres;

  const [excursionsFiltrees1, setExcursionsFiltrees1] = useState(undefined);  // Excursions triées par le 1e filtre (filtres en parametre)
  const [excursionsFiltrees2, setExcursionsFiltrees2] = useState(undefined);  // Excursions triées par le 2e filtre (barre de recherche)

  const { navigation } = props;
  const filtreIcone = require("../../assets/icons/filtre.png")

  // -- FONCTIONS D INITIALISATION -- 
  /**
   * Cette fonction doit etre executee systematiquement lors de la synchro descendante
   * Recupere les valeurs max et les intervalles de chaque filtre (valeurs max, types de parcours, vallees)
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
   * Cette fonction doit etre executee systematiquement lors de la synchro descendante
   * Formate les fichiers de maniere a n avoir que le type necessaire (au lieu des strings)
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
  /**
   * Initialise les excursions
   * recuperation --> formatage --> application des filtres de parametres
   */
  const loadExcursions = async (): Promise<void> => {
    try {
      let jsonData: Record<string, any>[] = [];
      if(parametres.langues === "fr"){
        jsonData = require('../../assets/JSON/excursionsFR.json');
      }
      else if (parametres.langues === "es"){
        jsonData = require('../../assets/JSON/excursionsES.json');
      }

      // -- RECUPERATION DU FICHIER --
      var excursionsBRUT = jsonData;
      excursionsBRUT = excursionsBRUT.map(excursion => ({
        nom: excursion.nom_excursion,
        denivele: excursion.denivele,
        duree: excursion.duree,
        typeParcours: excursion.type_parcours,
        zone: excursion.vallee,
        distance: excursion.distance_excursion,
        typeParcours: excursion.type_parcours,
        vallee: excursion.vallee,
        difficulteTechnique: excursion.difficulte_technique,
        difficulteOrientation: excursion.difficulte_orientation,
        description : excursion.post_content
      }));


      // -- FORMATAGE DES DONNEES RECUPEREES --
      const excursionsFormatees = formatageExcursions(excursionsBRUT);

      // -- TRI DES DONNEES RECUPEREES --
      const excursionsFiltrees = filtrageParametres(excursionsFormatees, filtres);  // Premier filtre
      setExcursionsFiltrees1(excursionsFiltrees);
      setExcursionsFiltrees2(excursionsFiltrees); // Copie car aucune recherche n a pu etre effectuee des le rendu

      // -- CALCUL DES VALEURS DE FILTRES --
      /**@warning : ligne inutile */
      /**@todo faire ceci automatiquement avec le formatage lors de la synchro descendante */
      // const valeursFiltres = calculValeursFiltres(excursionsFormatees);
      // console.log(valeursFiltres);
    }
    catch (error) {
      console.error('Erreur lors du chargement du fichier JSON :', error);
    }
  };


  // -- FONCTIONS DE TRI --
  /**
   * Tri et filtre des excursions avec les filtres
   * Doit etre effectué a chaque modification des filtres
   */
  function filtrageParametres(excursionsAFiltrer: excursionsType, filtres: typeof props.Filtres) {
    var excursionsFiltrees = excursionsAFiltrer;


    // Filtre de la page des filtres
    if (filtres !== undefined) {
      // Application des filtres en parametre
      excursionsFiltrees = excursionsFiltrees.filter(excursion => {
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
        else {
          // On garde de l excursion
          return true;
        }
      });

      // Application du critere de tri
      excursionsFiltrees = excursionsFiltrees.sort((a, b) => {
        const critere = filtres.critereTri;

        if (critere === "duree") {
          // On tri par la duree (avec h et m)
          const duree1 = a.duree.h + a.duree.m / 60;
          const duree2 = b.duree.h + b.duree.m / 60;
          return duree1 - duree2
        }
        return a[critere] - b[critere]
      })
    }

    return excursionsFiltrees;
  }
  /**
   * Filtre les excursions contenant le texte de la barre de recherche
   */
  function filtrageBarre(excursionsAFiltrer: excursionsType, recherche: String) {
    // Filtre de la barre de recherche
    if (recherche !== undefined) {
      return excursionsAFiltrer.filter(excursion =>
        excursion.nom.toLowerCase().includes(recherche.toLowerCase())
      );
    }
    else {
      console.error("Impossible de filtrer : manque un parametre");
      return excursionsAFiltrer;
    }
  }


  // -- FONCTIONS CALL BACK --
  const clicRecherche = (saisie) => {
    setExcursionsFiltrees2(filtrageBarre(excursionsFiltrees1, saisie))
  }


  useEffect(() => {
    // Initialisation du filtre
    if (props.route.params) {
      filtres = props.Filtres;
      console.log(filtres);
    }

    // Chargement des excursions
    loadExcursions();

    // Changement apporté : Ajout de props.route.params en dependance pour que loadExcurison soit appelé a chaque changement de filtre et de la langue
  }, [props.route.params, parametres.langues]);

  return <Screen style={$root} safeAreaEdges={["top", "bottom"]}>
    <View style={styles.searchBox}>
      <TextInput
        placeholder={parametres.langues === "fr" ? "Rechercher une excursion" : "Buscar una excursión"}
        autoCorrect={false}
        onChangeText={text => clicRecherche(text)}
        placeholderTextColor={colors.palette.grisFonce}
        style={styles.barreRecherche}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("Filtres")}
        style={styles.valleeIcone}
      >
        <Image
          style={styles.iconeFiltre}
          source={filtreIcone}
        />
      </TouchableOpacity>
    </View>

    {
      excursionsFiltrees1 && (
        excursionsFiltrees1.length == 0 ?
          <Text>Aucune excursion ne répond aux critères selectionnés.</Text>
          :
          (
            excursionsFiltrees2 && (
              excursionsFiltrees2.length == 0 ?
                <Text>Aucune excursion ne porte ce nom.</Text>
                :
                <ScrollView style={styles.scrollContainer}>
                  {
                    excursionsFiltrees2.map((excursion, i) => (
                      <CarteExcursion
                        key={i}
                        excursion={excursion}
                        navigation={navigation}
                      />
                    ))
                  }
                </ScrollView>
            )
          )
      )

    }
  </Screen>


})

const $root: ViewStyle = {
  flex: 1,
  padding: spacing.md,
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginBottom: 30,
  },
  searchBox: {
    display: "flex",
    flexDirection: "row",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    height: 50,
    color: colors.palette.noir,
    backgroundColor: colors.palette.grisClair,
    shadowColor: colors.palette.noir,
    justifyContent: "space-between",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },

  barreRecherche: {
    flex: 1,
    paddingLeft: 20,
  },

  valleeIcone: {
    height: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconeFiltre: {
    width: 30,
    height: 30,
  },
});