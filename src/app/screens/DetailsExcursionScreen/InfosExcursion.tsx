import { CarteSignalement } from "app/components/CarteSignalement";
import { colors, spacing } from "app/theme";
import { recupDistance } from "app/utils/recupDistance";
import {
  View,
  ViewStyle,
  TouchableOpacity,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  ImageStyle,
  Dimensions,
  TextStyle,
} from "react-native";
import { Text, GraphiqueDenivele } from "app/components";
/**@warning A SUPPRIMER ET DECALER DANS APPNAVIGATOR : */
import { T_Point } from "app/screens/DetailsExcursionScreen/";
import { T_Signalement, T_flat_point } from "app/navigators";

export interface InfosExcursionProps {
  excursion: Record<string, unknown>;
  navigation: any;
  setIsAllSignalements;
  userLocation;
}

export function InfosExcursion(props: InfosExcursionProps) {
  const { excursion, navigation, setIsAllSignalements, userLocation } = props;

  let duree: string = "";
  let distance: string = "";
  let difficulteOrientation: number = 0;
  let difficulteTechnique: number = 0;
  let description: string = "";
  let signalements: T_Signalement[] = [];
  if (
    excursion.duree !== undefined ||
    excursion.distance !== undefined ||
    excursion.difficulteOrientation !== undefined ||
    excursion.difficulteTechnique !== undefined ||
    excursion.description !== undefined ||
    excursion.signalements != undefined
  ) {
    duree = (excursion.duree as { h: number }).h + "h";
    if ((excursion.duree as { m: number }).m !== 0) {
      // Si la durée en minutes est différente de 0, on l'affiche en plus de la durée en heures
      duree = duree + (excursion.duree as { m: number }).m;
    }
    distance = excursion.distance as string;
    difficulteTechnique = excursion.difficulteTechnique as number;
    difficulteOrientation = excursion.difficulteOrientation as number;
    description = excursion.description as string;
    signalements = excursion.signalements as T_Signalement[];

    return (
      <ScrollView>
        <TouchableWithoutFeedback>
          <View style={$stylePage}>
            <View style={$containerInformations}>
              <View style={$containerUneInformation}>
                <Image style={$iconInformation} source={require("assets/icons/temps.png")} />
                <Text text={duree} size="xs" />
              </View>
              <View style={$containerUneInformation}>
                <Image style={$iconInformation} source={require("assets/icons/explorer.png")} />
                <Text text={distance + " km"} size="xs" />
              </View>
              <View style={$containerUneInformation}>
                <Image
                  style={$iconInformation}
                  source={require("assets/icons/difficulteTechnique.png")}
                />
                <Text text={difficulteTechnique.toString()} size="xs" />
              </View>
              <View style={$containerUneInformation}>
                <Image
                  style={$iconInformation}
                  source={require("assets/icons/difficulteOrientation.png")}
                />
                <Text text={difficulteOrientation.toString()} size="xs" />
              </View>
            </View>
            <View style={$containerDescriptionEtSignalements}>
              <Text text="Description" size="lg" />
              <Text text={afficherDescriptionCourte(description)} size="xxs" />
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Description", { excursion: excursion });
                }}
              >
                {description === "" ? null : (
                  <Text style={$lienDescription} tx="detailsExcursion.boutons.lireSuite" size="xxs" />
                )}
              </TouchableOpacity>
            </View>
            {/* Appel de la fonction pour traiter les signalements et générer les éléments JSX correspondants */}
            {renderSignalements(signalements, setIsAllSignalements, userLocation, props.excursion.track)}
            <View style={$containerDenivele}>
              <Text tx="detailsExcursion.titres.denivele" size="xl" />
              {excursion.track && (
                <GraphiqueDenivele points={excursion.track as T_Point[]} detaille={true} />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    )
  }

  /**
   * @param description
   * @returns la description courte
   */
  function afficherDescriptionCourte(description: string) {
    if (description == null) {
      return null;
    } else {
      const descriptionCoupe: string = description.slice(0, 100);
      let descriptionFinale: string = descriptionCoupe + "...";
      descriptionFinale = descriptionFinale.replace(/<[^>]*>?/gm, "");
      return descriptionFinale;
    }
  }

  // Fonction pour traiter les signalements et générer les éléments JSX correspondants
  function renderSignalements(signalements: T_Signalement[], setIsAllSignalements: Function, userLocation: any, track: any) {
    // Trier les signalements en fonction de leur distance par rapport à l'utilisateur
    const sortedSignalements = signalements
      .slice() // Pour créer une copie du tableau afin de ne pas modifier l'original
      .map((signalement) => {
        // Calcul de la distance pour chaque signalement
        const coordSignalement: T_flat_point = {
          lat: signalement.lat,
          lon: signalement.lon,
        };
        const distanceSignalement = userLocation ? recupDistance(coordSignalement, track) : 0;
        return { signalement, distanceSignalement };
      })
      .sort((a, b) => a.distanceSignalement - b.distanceSignalement);
    // Générer les éléments JSX pour chaque signalement
    return (
      <>
        {signalements.length > 0 && (
          <View>
            <View style={$headerSignalement}>
              <View>
                <Text tx="detailsExcursion.titres.signalements" size="lg" />
              </View>
              <View>
                <TouchableOpacity onPress={() => setIsAllSignalements(true)}>
                  <Text
                    style={$lienSignalements}
                    tx="detailsExcursion.boutons.voirDetails"
                    size="xs"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView horizontal>
              <View style={$scrollLine}>
                {sortedSignalements.map(({ signalement, distanceSignalement }, index) => (
                  <View key={index}>
                    <TouchableOpacity onPress={() => setIsAllSignalements(true)}>
                      <CarteSignalement
                        type={signalement.type === "Avertissement" ? "avertissement" : "pointInteret"}
                        details={false}
                        nomSignalement={signalement.nom}
                        distanceDuDepart={`${distanceSignalement + " km"}`}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </>
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */
const { height } = Dimensions.get("window");

const $stylePage: ViewStyle = {
  paddingRight: spacing.lg,
  paddingLeft: spacing.lg,
};

const $containerInformations: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingTop: spacing.xl,
  paddingBottom: spacing.xl,
};

const $containerUneInformation: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const $iconInformation: ImageStyle = {
  width: spacing.lg,
  height: spacing.lg,
  marginRight: spacing.xs,
};

//Style de la description et des signalements
const $containerDescriptionEtSignalements: ViewStyle = {
  paddingBottom: spacing.xl,
};

const $lienDescription: TextStyle = {
  color: colors.bouton,
  paddingTop: spacing.xs,
  textDecorationLine: "underline",
};

const $containerDenivele: ViewStyle = {
  marginBottom: height / 3, //pour pouvoir afficher le graphique
};

const $scrollLine: ViewStyle = {
  flexDirection: "row",
  paddingBottom: spacing.xl,
};

const $headerSignalement: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const $lienSignalements: TextStyle = {
  textDecorationLine: "underline",
  color: colors.bouton,
  paddingStart: spacing.xs,
};
