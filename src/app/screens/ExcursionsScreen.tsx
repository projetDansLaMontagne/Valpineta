import React, { FC, useEffect, useState, useMemo } from "react";
import { observer } from "mobx-react-lite";
import {
  View,
  ViewStyle,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { AppStackScreenProps, T_excursion, T_filtres, T_valeurs_filtres } from "app/navigators";
import { Screen, CarteExcursion, Text } from "app/components";
import { colors, spacing } from "app/theme";
import { useStores } from "app/models";

/**@warning La navigation vers filtres est dans le mauvais sens (l'écran slide vers la gauche au lieu de la droite) */

/**@warning Cliquer sur excursions dans le footer redirige vers la page en retirant les parametre "Filtres" mais donne un parametre buggé "filtres" */

/**@todo CSS : agrandir la zone de texte de recherche + la rendre fonctionnelle */
/**@todo CSS : empecher le footer d etre au dessus de la derniere excursion */

interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> {}

export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(
  props: ExcursionsScreenProps,
) {
  const filtres = props.route.params?.filtres;
  const { parametres } = useStores();

  const { navigation } = props;
  const filtreIcone = require("../../assets/icons/filtre.png");

  // -- FONCTIONS D INITIALISATION --
  /**
   * Cette fonction doit etre executee systematiquement lors de la synchro descendante
   * Recupere les valeurs max et les intervalles de chaque filtre (valeurs max, types de parcours, vallees)
   */
  const calculValeursFiltres = (excursions: T_excursion[]): T_valeurs_filtres => {
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
      if (excursion.denivele > deniveleMax) {
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
    };
  };

  // -- FONCTIONS --
  /**
   * Tri et filtre des excursions avec les filtres
   * Doit etre effectué a chaque modification des filtres
   */
  function filtrageParametre(excursions: T_excursion[], filtres: T_filtres) {
    const nomsTypesParcours =
      parametres.langues == "fr"
        ? ["Aller simple", "Aller/retour", "Circuit"]
        : ["Ida", "Ida y Vuelta", "Circular"];

    // Application des filtres en parametre
      excursions = excursions.filter(excursion => {
        const indexTypeParcours = nomsTypesParcours.indexOf(excursion.typeParcours);

        if (
          excursion.distance < filtres.intervalleDistance.min ||
          excursion.distance > filtres.intervalleDistance.max ||
          (excursion.duree.h == filtres.intervalleDuree.max && excursion.duree.m != 0) ||
          excursion.duree.h < filtres.intervalleDuree.min ||
          excursion.duree.h > filtres.intervalleDuree.max ||
          excursion.denivele < filtres.intervalleDenivele.min ||
          excursion.denivele > filtres.intervalleDenivele.max ||
          !filtres.indexTypesParcours.includes(indexTypeParcours) || // le type de l excursion est present dans les filtres
          !filtres.vallees.includes(excursion.vallee) ||
          !filtres.difficultesTechniques.includes(excursion.difficulteTechnique) ||
          !filtres.difficultesOrientation.includes(excursion.difficulteOrientation)
        ) {
          // On supprime de l excursion
          return false;
        } else {
          // On garde de l excursion
          return true;
        }
      });

      // Application du critere de tri
      excursions = excursions.sort((a, b) => {
        const critere = filtres.critereTri;

        if (critere === "duree") {
          // On tri par la duree (avec h et m)
          const duree1 = a.duree.h + a.duree.m / 60;
          const duree2 = b.duree.h + b.duree.m / 60;
          return duree1 - duree2;
        }
        return a[critere] - b[critere];
      });

      return excursions;
  }
  /**
   * Filtre les excursions contenant le texte de la barre de recherche
   */
  function filtrageBarre(excursionsAFiltrer: T_excursion[], recherche: String) {
    // Filtre de la barre de recherche
    return excursionsAFiltrer.filter(excursion =>
      excursion.nom.toLowerCase().includes(recherche?.toLowerCase()),
    );
  }

  // Applique la langue aux excursions
  function applicationLangue(excursions: T_excursion[]) {
    const langue = parametres.langues;

    return excursions.map(excursion => {
      if (langue === "fr") {
        return {
          ...excursion,
          nom: excursion.fr.nom,
          description: excursion.fr.description,
          typeParcours: excursion.fr.typeParcours,
        };
      } else if (langue === "es") {
        return {
          ...excursion,
          nom: excursion.es.nom,
          description: excursion.es.description,
          typeParcours: excursion.es.typeParcours,
        };
      } else {
        throw new Error("Langue non prise en charge : " + langue);
      }
    });
  }

  /* --------------------------------- STATES --------------------------------- */
  const [allExcursions, setAllExcursions] = useState<T_excursion[]>(undefined);
  const [saisieBarre, setSaisieBarre] = useState<string>("");

  const excursionsTraduites = useMemo<T_excursion[]>(
    () => allExcursions && applicationLangue(allExcursions),
    [allExcursions, parametres.langues],
  );

  const excursionsFiltreesParams = useMemo<T_excursion[]>(
    () =>
      excursionsTraduites && filtres
        ? filtrageParametre(excursionsTraduites, filtres)
        : excursionsTraduites,
    [excursionsTraduites, filtres],
  );

  const excursionsFiltreesBarre = useMemo(
    () =>
      excursionsFiltreesParams && saisieBarre
        ? filtrageBarre(excursionsFiltreesParams, saisieBarre)
        : excursionsFiltreesParams,
    [excursionsFiltreesParams, saisieBarre],
  );

  // Initialisation des excursions
  useEffect(() => {
    try {
      setAllExcursions(require("../../assets/JSON/excursions.json"));
    } catch (error) {
      throw new Error("Erreur lors du chargement du fichier JSON : " + error);
    }
  }, []);

  return (
    <Screen style={$root} safeAreaEdges={["top"]}>
      <View style={styles.searchBox}>
        <TextInput
          placeholder={
            parametres.langues === "fr" ? "Rechercher une excursion" : "Buscar una excursión"
          }
          autoCorrect={false}
          onChangeText={text => setSaisieBarre(text)}
          value={saisieBarre}
          placeholderTextColor={colors.palette.grisFonce}
          style={styles.barreRecherche}
        />
        <TouchableOpacity onPress={() => navigation.navigate("Filtres")} style={styles.valleeIcone}>
          <Image style={styles.iconeFiltre} source={filtreIcone} />
        </TouchableOpacity>
      </View>

      {excursionsFiltreesBarre &&
        (excursionsFiltreesBarre.length == 0 ? (
          <Text tx="excursions.absenceResultats" />
        ) : (
          <ScrollView style={styles.scrollContainer}>
            {excursionsFiltreesBarre.map((excursion, i) => (
              <CarteExcursion key={i} excursion={excursion} navigation={navigation} />
            ))}
          </ScrollView>
        ))}
    </Screen>
  );
});

const $root: ViewStyle = {
  flex: 1,
  padding: spacing.md,
};

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
