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
  Keyboard,
} from "react-native";
import { AppStackScreenProps, T_excursion, TFiltres, T_valeurs_filtres } from "app/navigators";
import { Screen, Text } from "app/components";
import { CarteExcursion } from "./CarteExcursion";
import { colors, spacing } from "app/theme";
import { useStores } from "app/models";

interface ExcursionsScreenProps extends AppStackScreenProps<"Excursions"> { }

export const ExcursionsScreen: FC<ExcursionsScreenProps> = observer(function ExcursionsScreen(
  props: ExcursionsScreenProps,
) {
  const { parametres } = useStores();

  const filtres = props.route.params?.filtres;

  const filtreIcone = require("assets/icons/filtre.png");

  // -- FONCTIONS D INITIALISATION --
  /**
   * Cette fonction doit etre executee systematiquement lors de la synchro descendante
   * Recupere les valeurs max et les intervalles de chaque filtre (valeurs max, types de parcours, vallees)
   */
  const calculValeursFiltres = (excursions: T_excursion[]): T_valeurs_filtres => {
    // Parcourt de chaque excursion pour connaitre les maximas
    let distanceMax = 0;
    let dureeMax = 0;
    let deniveleMax = 0;
    let typesParcours = [];
    let vallees = [];
    let difficulteTechniqueMax = 0;
    let difficulteOrientationMax = 0;

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
  function filtrageParametre(excursions: T_excursion[], filtres: TFiltres) {
    const nomsTypesParcours =
      parametres.langue == "fr"
        ? ["Aller simple", "Aller/retour", "Circuit"]
        : ["Ida", "Ida y Vuelta", "Circular"];

    // Application des filtres en parametre
    excursions = excursions.filter(excursion => {
      const indexTypeParcours = nomsTypesParcours.indexOf(excursion.typeParcours);

      return !(
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
      );
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
  function filtrageBarre(excursionsAFiltrer: T_excursion[], recherche: string) {
    // Filtre de la barre de recherche
    return excursionsAFiltrer.filter(excursion =>
      excursion.nom.toLowerCase().includes(recherche?.toLowerCase()),
    );
  }

  // Applique la langue aux excursions
  function applicationLangue(excursions: T_excursion[]) {
    const langue = parametres.langue;

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
    [allExcursions],
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
      setAllExcursions(require("assets/JSON/excursions.json"));
    } catch (error) {
      throw new Error("Erreur lors du chargement du fichier JSON : " + error);
    }
  }, []);

  /* ------------------------------- CALL BACKS ------------------------------- */
  const clicExcursion = (excursion: T_excursion) => {
    props.navigation.navigate("CarteStack", {
      screen: "DetailsExcursion",
      params: { excursion },
    });
  };

  return (
    <Screen style={$root} safeAreaEdges={["top"]}>
      <View style={styles.searchBox}>
        <TextInput
          placeholder={
            parametres.langue === "fr" ? "Rechercher une excursion" : "Buscar una excursión"
          }
          autoCorrect={false}
          placeholderTextColor={colors.palette.grisFonce}
          style={styles.barreRecherche}
          onSubmitEditing={e => {
            // Le timeout permet de laiser le temps au clavier de se fermer
            const texteSaisi = e.nativeEvent.text;
            setTimeout(() => setSaisieBarre(texteSaisi), 100);
          }}
        />
        <TouchableOpacity
          onPress={() => props.navigation.navigate("Filtres")}
          style={styles.valleeIcone}
        >
          <Image style={styles.iconeFiltre} source={filtreIcone} />
        </TouchableOpacity>
      </View>

      {excursionsFiltreesBarre &&
        (excursionsFiltreesBarre.length == 0 ? (
          <Text tx="excursions.absenceResultats" />
        ) : (
          <ScrollView style={styles.scrollContainer}>
            {excursionsFiltreesBarre.map((excursion, i) =>
              excursion.track ? (
                <CarteExcursion
                  key={i}
                  excursion={excursion}
                  onPress={() => clicExcursion(excursion)}
                />
              ) : null,
            )}
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
    height: "100%",
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
