import { Button, CarteSignalement } from "app/components";
import { T_flat_point } from "app/navigators";
import { colors, spacing } from "app/theme";
import { recupDistance } from "app/utils/recupDistance";
import { Dimensions, ScrollView, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { LatLng } from "react-native-maps";

/**
 * @returns la liste des signalements
 */
export interface ListeSignalementsProps {
  setInterfaceCourrante: React.Dispatch<React.SetStateAction<"infos" | "avis" | "signalements">>;
  excursion;
  userLocation;
  footerHeight;
  setStartPoint?: React.Dispatch<React.SetStateAction<LatLng>>;
  swipeDown: () => void;
  style: ViewStyle;
}

export function ListeSignalements(props: ListeSignalementsProps) {
  return (
    <>
      <ScrollView>
        <TouchableWithoutFeedback>
          <View style={$containerSignalements}>
            {props?.excursion?.signalements?.map((signalement, index) => {
              // Calcule de la distance pour chaque avertissement
              const distanceSignalement = props.userLocation
                ? recupDistance(signalement as T_flat_point, props.excursion.track)
                : 0;
              const carteType =
                signalement.type === "Avertissement" ? "avertissement" : "pointInteret";
              return (
                <View key={index}>
                  <CarteSignalement
                    type={carteType}
                    details={true}
                    nomSignalement={signalement.nom}
                    distanceDuDepart={`${distanceSignalement}`}
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
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <View>
        <Button
          style={[$sortirDetailSignalement, { bottom: props.footerHeight }]}
          tx="detailsExcursion.boutons.retourInformations"
          onPress={() => props.setInterfaceCourrante("infos")}
        />
      </View>
    </>
  );
}

const { width, height } = Dimensions.get("window");

const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
  paddingBottom: height / 2,
};

const $sortirDetailSignalement: ViewStyle = {
  borderRadius: 15,
  borderWidth: 2,
  backgroundColor: colors.fond,
  borderColor: colors.bordure,
  width: width / 1.5,
  height: 50,
  position: "absolute",
  alignSelf: "center",
};
