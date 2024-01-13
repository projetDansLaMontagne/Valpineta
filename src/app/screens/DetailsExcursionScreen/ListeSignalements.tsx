import { Button, CarteSignalement } from "app/components";
import { T_Point } from "app/screens/DetailsExcursionScreen/";
import { colors, spacing } from "app/theme";
import { recupDistance } from "app/utils/recupDistance";
import { observer } from "mobx-react-lite";
import { Dimensions, ScrollView, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { LatLng } from "react-native-maps";

/**
 * @params setIsAllSignalements, excursion, userLocation
 * @returns la liste des signalements
 */
export interface ListeSignalementsProps {
  setIsAllSignalements;
  excursion;
  userLocation;
  footerHeight;
  setStartPoint?: React.Dispatch<React.SetStateAction<LatLng>>;
  style: ViewStyle;
}

export function ListeSignalements(props: ListeSignalementsProps) {
  return (
    <View style={props.style}>
      <ScrollView>
        <TouchableWithoutFeedback>
          <View style={$containerSignalements}>
            {props?.excursion?.signalements?.map((signalement, index) => {
              // Calcule de la distance pour chaque avertissement
              const coordSignalement: T_Point = {
                lat: signalement.latitude,
                lon: signalement.longitude,
                /**@warning les 0 sont une solution temporaire : c'est le mauvais type */
                alt: 0,
                dist: 0,
                pos: 0,
              };
              const distanceSignalement = props.userLocation
                ? recupDistance(coordSignalement, props.excursion.track)
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
                      // setIsAllSignalements(false);
                      props.setStartPoint &&
                        props.setStartPoint({
                          latitude: signalement.latitude,
                          longitude: signalement.longitude,
                        } as LatLng);
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
          onPress={() => props.setIsAllSignalements(false)}
        />
      </View>
    </View>
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
