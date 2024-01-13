import { Button, CarteSignalement } from "app/components";
import { colors, spacing } from "app/theme";
import { recupDistance } from "app/utils/recupDistance";
import { observer } from "mobx-react-lite";
import { Dimensions, ScrollView, TouchableWithoutFeedback, View, ViewStyle } from "react-native";

/**
 * @params setIsAllSignalements, excursion, userLocation
 * @returns la liste des signalements
 */
export interface ListeSignalementsProps {
  setIsAllSignalements;
  excursion;
  userLocation;
  footerHeight;
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
              const coordSignalement = {
                lat: signalement.latitude,
                lon: signalement.longitude,
                alt: null,
                dist: null,
              };
              const distanceSignalement = props.userLocation ? recupDistance(coordSignalement) : 0;
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
