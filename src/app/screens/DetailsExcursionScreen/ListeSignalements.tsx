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
  swipeDown: () => void;
  style: ViewStyle;
  distanceDepuisUser?: boolean;
}
export function ListeSignalements(props: ListeSignalementsProps) {
  // Fonction pour calculer la distance d'un signalement par rapport à la position de l'utilisateur
  const calculerDistanceSignalement = (signalement) => {
    // Déclaration des coordonnées à l'intérieur de la fonction
    const coordSignalement: T_flat_point = {
      lat: signalement.latitude,
      lon: signalement.longitude,
    };
    const coordUser: T_flat_point = {
      lat: props.userLocation?.latitude,
      lon: props.userLocation?.longitude,
    };

    if (props.distanceDepuisUser) {
      const distanceDepartPointLePlusProcheSignalement = recupDistance(coordSignalement, props.excursion.track);
      const distanceDepartPointLePlusProcheUtilisateur = recupDistance(coordUser, props.excursion.track);
      let distanceSignalement = distanceDepartPointLePlusProcheSignalement - distanceDepartPointLePlusProcheUtilisateur;
      return distanceSignalement < 0 ? Infinity : distanceSignalement;
    } else {
      return props.userLocation ? recupDistance(coordSignalement, props.excursion.track) : Infinity;
    }
  };

  // Trier les signalements en fonction de leur distance par rapport à l'utilisateur
  const signalementsTriés = [...props.excursion.signalements].sort((a, b) => {
    const distanceA = calculerDistanceSignalement(a);
    const distanceB = calculerDistanceSignalement(b);
    return distanceA - distanceB;
  });

  return (
    <View style={props.style}>
      <ScrollView>
        <TouchableWithoutFeedback>
          <View style={$containerSignalements}>
            {signalementsTriés.map((signalement, index) => {
              const carteType = signalement.type === "Avertissement" ? "avertissement" : "pointInteret";
              const distanceSignalement = calculerDistanceSignalement(signalement).toFixed(2);
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
            })}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {props.setIsAllSignalements ? ( // Si on veux afficher le bouton pour retourner aux informations de l'excursion, on passe setIsAllSignalements en paramètre
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
