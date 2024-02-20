import { Button, CarteSignalement } from "app/components";
import { colors, spacing } from "app/theme";
import { recupDistance } from "app/utils/recupDistance";
import { Dimensions, ScrollView, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { LatLng } from "react-native-maps";
import { T_excursion, T_flat_point } from "app/navigators";
import { translate } from "app/i18n";

/**
 * @params setIsAllSignalements, excursion, userLocation
 * @returns la liste des signalements
 */
export interface ListeSignalementsProps {
  setIsAllSignalements?: React.Dispatch<React.SetStateAction<boolean>>;
  excursion: T_excursion;
  userLocation: LatLng;
  footerHeight: number;
  setStartPoint?: React.Dispatch<React.SetStateAction<LatLng>>;
  swipeDown: () => void;
  style: ViewStyle;
  distanceDepuisUser?: boolean; // Si true, on trie les signalements par rapport à la distance depuis l'utilisateur sinon on trie par rapport à la distance depuis le départ
}
export function ListeSignalements(props: ListeSignalementsProps) {
  const calculerDistanceSignalement = signalement => {
    // Déclaration des coordonnées à l'intérieur de la fonction
    const coordSignalement: T_flat_point = {
      lat: signalement.lat,
      lon: signalement.lon,
    };
    const coordUser: T_flat_point = {
      lat: props.userLocation?.latitude,
      lon: props.userLocation?.longitude,
    };

    if (props.distanceDepuisUser) {
      const distanceDepartPointLePlusProcheSignalement = recupDistance(
        coordSignalement,
        props.excursion.track,
      );
      const distanceDepartPointLePlusProcheUtilisateur = recupDistance(
        coordUser,
        props.excursion.track,
      );
      let distanceSignalement =
        distanceDepartPointLePlusProcheSignalement - distanceDepartPointLePlusProcheUtilisateur;
      return distanceSignalement < 0
        ? translate("listeSignalements.signalementDepasse")
        : distanceSignalement;
    } else {
      return props.userLocation ? recupDistance(coordSignalement, props.excursion.track) : Infinity;
    }
  };

  const renderSignalements = () => {
    // Trier les signalements en fonction de leur distance par rapport à l'utilisateur
    const signalementsTriés = [...props.excursion.signalements].sort((a, b) => {
      const distanceA = calculerDistanceSignalement(a);
      const distanceB = calculerDistanceSignalement(b);
      return Number(distanceA) - Number(distanceB);
    });

    return signalementsTriés.map((signalement, index) => {
      const carteType = signalement.type === "Avertissement" ? "avertissement" : "pointInteret";
      let distanceSignalement: string | number = calculerDistanceSignalement(signalement);
      if (typeof distanceSignalement === "number" && !isNaN(distanceSignalement)) {
        distanceSignalement = distanceSignalement.toFixed(2);
        //ajouter unité
        distanceSignalement += " km";
      }
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
    });
  };

  return (
    <View style={props.style}>
      <ScrollView>
        <TouchableWithoutFeedback>
          <View style={$containerSignalements}>{renderSignalements()}</View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {props.setIsAllSignalements ? (
        <View>
          <Button
            style={[$sortirDetailSignalement, { bottom: props.footerHeight }]}
            tx="detailsExcursion.boutons.retourInformations"
            onPress={() => props.setIsAllSignalements(false)}
          />
        </View>
      ) : null}
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
