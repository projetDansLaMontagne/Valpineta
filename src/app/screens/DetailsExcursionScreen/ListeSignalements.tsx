import { Button, CarteSignalement } from "app/components";
import { colors, spacing } from "app/theme";
import { recupDistance } from "app/utils/recupDistance";
import { Dimensions, ScrollView, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { LatLng } from "react-native-maps";
import { T_flat_point } from "app/navigators";

/**
 * @params setIsAllSignalements, excursion, userLocation
 * @returns la liste des signalements
 */
export interface ListeSignalementsProps {
  setIsAllSignalements?;
  excursion;
  userLocation;
  footerHeight;
  setStartPoint?: React.Dispatch<React.SetStateAction<LatLng>>;
  style: ViewStyle;
  distanceDepuisUser?: boolean;
  swipeDown?: () => void;
}

export function ListeSignalements(props: ListeSignalementsProps) {
  return (
    <View style={props.style}>
      <ScrollView>
        <TouchableWithoutFeedback>
          <View style={$containerSignalements}>
            {props?.excursion?.signalements?.map((signalement, index) => {
              // Calcule de la distance pour chaque avertissement
              const coordSignalement: T_flat_point = {
                lat: signalement.latitude,
                lon: signalement.longitude,
              };

              let distanceSignalement;

              if (props.distanceDepuisUser) {
                const coordUser: T_flat_point = {
                  lat: props.userLocation?.latitude,
                  lon: props.userLocation?.longitude,
                };

                let distanceDepartPointLePlusProcheSignalement = recupDistance(coordSignalement, props.excursion.track);

                let distanceDepartPointLePlusProcheUtilisateur = recupDistance(coordUser, props.excursion.track);

                distanceSignalement = (distanceDepartPointLePlusProcheSignalement - distanceDepartPointLePlusProcheUtilisateur).toFixed(2); //distance entre le point le plus proche de l'utilisateur et le point le plus proche du signalement

                if (Number(distanceSignalement) < 0) {
                  distanceSignalement = "depassé                                    ";
                }
              }
              else {
                distanceSignalement = props.userLocation
                  ? recupDistance(coordSignalement, props.excursion.track)
                  : 0;
              }
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
                      props.swipeDown();
                    }}
                  />
                </View>
              );
            })}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {props.setIsAllSignalements ? <View>
        <Button
          style={[$sortirDetailSignalement, { bottom: props.footerHeight }]}
          tx="detailsExcursion.boutons.retourInformations"
          onPress={() => props.setIsAllSignalements(false)}
        />
      </View> : null}
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
