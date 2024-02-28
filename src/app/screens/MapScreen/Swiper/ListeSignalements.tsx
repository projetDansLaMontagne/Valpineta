import { Button, CarteSignalement } from "app/components";
import { TPoint, T_Signalement } from "app/navigators";
import { colors, spacing } from "app/theme";
import { Dimensions, ScrollView, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { LatLng } from "react-native-maps";

/**
 * @returns la liste des signalements
 */
export interface ListeSignalementsProps {
  setInterfaceCourrante: React.Dispatch<React.SetStateAction<"infos" | "avis" | "signalements">>;
  track: TPoint[]; // pour connaitre les distances des points qui sont lies aux signalements
  signalements: T_Signalement[];
  setStartPoint?: React.Dispatch<React.SetStateAction<LatLng>>;
  swipeDown: () => void;
}

export function ListeSignalements(props: ListeSignalementsProps) {
  const { track, signalements } = props;
  /** @todo STATIC, a remplacer par le store */
  const SuiviExcursion = { etat: "enCours", iPointCourant: 1100 };

  const signalementsTries = (signalements: T_Signalement[]) =>
    signalements.sort((a, b) => {
      return track[a.idPointLie ?? 0].dist - track[b.idPointLie ?? 0].dist;
    });

  return (
    <>
      <ScrollView>
        <TouchableWithoutFeedback>
          <View style={$containerSignalements}>
            {signalements &&
              signalementsTries(signalements).map((signalement, index) => {
                const distFromUserByTrack =
                  track[signalement.idPointLie ?? 0].dist -
                  track[SuiviExcursion.iPointCourant].dist;
                return (
                  <View key={index}>
                    <CarteSignalement
                      type={signalement.type}
                      details={true}
                      nomSignalement={signalement.nom}
                      distanceDuDepartEnM={
                        SuiviExcursion.etat === "enCours"
                          ? // distance de l utilisateur
                            distFromUserByTrack
                          : // distance a partir du depart
                            track[signalement.idPointLie ?? 0].dist
                      }
                      description={signalement.description}
                      imageSignalement={signalement.image}
                      onPress={() => {
                        // go to the signalement on the map
                        props.setStartPoint &&
                          props.setStartPoint({
                            latitude: signalement.lat,
                            longitude: signalement.lon,
                          } as LatLng);

                        props.swipeDown();
                      }}
                    />
                  </View>
                );
              })}
            <View>
              <Button
                style={[$sortirDetailSignalement]}
                tx="detailsExcursion.boutons.retourInformations"
                onPress={() => props.setInterfaceCourrante("infos")}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </>
  );
}

const { width, height } = Dimensions.get("window");

const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
  paddingBottom: 250 /**@warning solution moche et temporaire */,
};

const $sortirDetailSignalement: ViewStyle = {
  borderRadius: 15,
  borderWidth: 2,
  backgroundColor: colors.fond,
  borderColor: colors.bordure,
  width: width / 1.5,
  height: 50,
  alignSelf: "center",
};
