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
import { T_Signalement, T_excursion } from "app/navigators";

export interface InfosExcursionProps {
  excursion: T_excursion;
  navigation: any;
  setIsAllSignalements;
  userLocation;
}

/**
 *
 * @precondition l'excursion doit absolument être définie
 */
export function InfosExcursion(props: InfosExcursionProps) {
  const { excursion, navigation, setIsAllSignalements, userLocation } = props;

  /**
   * @returns la description courte
   */
  function descriptionFormatee(description: string): string {
    const descriptionCoupe: string = description.slice(0, 100);
    let descriptionFinale: string = descriptionCoupe + "...";
    descriptionFinale = descriptionFinale.replace(/<[^>]*>?/gm, "");
    return descriptionFinale;
  }

  /**
   * @returns une version affichable du type {h m}
   */
  function dureeAffichable(duree: typeof excursion.duree): string {
    let dureeAffichable = duree.h + "h";
    if (duree.m !== 0) {
      dureeAffichable = dureeAffichable + duree.m;
    }
    return dureeAffichable;
  }

  return (
    <ScrollView>
      <TouchableWithoutFeedback>
        <View style={$stylePage}>
          <View style={$containerInformations}>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation} source={require("assets/icons/temps.png")} />
              <Text text={dureeAffichable(excursion.duree)} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image style={$iconInformation} source={require("assets/icons/explorer.png")} />
              <Text text={excursion.distance + " km"} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image
                style={$iconInformation}
                source={require("assets/icons/difficulteTechnique.png")}
              />
              <Text text={excursion.difficulteTechnique.toString()} size="xs" />
            </View>
            <View style={$containerUneInformation}>
              <Image
                style={$iconInformation}
                source={require("assets/icons/difficulteOrientation.png")}
              />
              <Text text={excursion.difficulteOrientation.toString()} size="xs" />
            </View>
          </View>
          <View style={$containerDescriptionEtSignalements}>
            <Text text="Description" size="lg" />
            <Text text={descriptionFormatee(excursion.description)} size="xxs" />
            {excursion.description !== "" && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Description", { excursion: excursion });
                }}
              >
                <Text style={$lienDescription} tx="detailsExcursion.boutons.lireSuite" size="xxs" />
              </TouchableOpacity>
            )}
          </View>
          <View>
            {excursion.signalements.length > 0 && (
              <>
                <View style={$headerSignalement}>
                  <View>
                    <Text tx="detailsExcursion.titres.signalements" size="lg" />
                  </View>
                  <View>
                    {excursion.signalements.length > 0 && (
                      <TouchableOpacity onPress={() => setIsAllSignalements(true)}>
                        <Text
                          style={$lienSignalements}
                          tx="detailsExcursion.boutons.voirDetails"
                          size="xs"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <ScrollView horizontal>
                  <TouchableWithoutFeedback>
                    <View style={$scrollLine}>
                      {excursion?.signalements.map((signalement, index) => {
                        // Calculate the distance for each warning
                        const coordSignalement: T_Point = {
                          lat: signalement.lat,
                          lon: signalement.lon,
                          /**@warning les 0 sont une solution temporaire : c'est le mauvais type */
                          alt: 0,
                          dist: 0,
                          pos: 0,
                        };
                        const distanceSignalement = userLocation
                          ? recupDistance(coordSignalement, props.excursion.track)
                          : 0;
                        const carteType =
                          signalement.type === "Avertissement" ? "avertissement" : "pointInteret";

                        return (
                          <View key={index}>
                            <CarteSignalement
                              type={carteType}
                              details={false}
                              nomSignalement={signalement.nom}
                              distanceDuDepart={`${distanceSignalement}`}
                              onPress={() => setIsAllSignalements(true)}
                            />
                          </View>
                        );
                      })}
                    </View>
                  </TouchableWithoutFeedback>
                </ScrollView>
              </>
            )}
          </View>

          <View style={$containerDenivele}>
            <Text tx="detailsExcursion.titres.denivele" size="xl" />
            {excursion.track && (
              <GraphiqueDenivele points={excursion.track as T_Point[]} detaille={true} />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
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
