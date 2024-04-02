import * as React from "react";
import { ScrollView, StyleProp, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { TPoint, T_Signalement, T_flat_point } from "app/navigators";
import { CarteSignalement } from "./CarteSignalement";
import { useEffect, useState } from "react";
import { spacing } from "app/theme";
import { useStores } from "app/models";

export type ListeSignalementsProps = {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>;
  detaille: boolean;
  signalements: T_Signalement[];
  track: TPoint[];
  onPress?: (point: T_flat_point) => void;
};

/**
 * Describe your component here
 */
export const ListeSignalements = observer(function ListeSignalements(
  props: ListeSignalementsProps,
) {
  const { detaille, signalements, track, onPress } = props;

  // /** @todo STATIC, a remplacer par le store */
  // const suiviExcursion = { etat: "enCours", iPointCourant: 1100 };

  const { suiviExcursion } = useStores();

  const [signalementsTries, setSignalementsTries] = useState<T_Signalement[]>([]);

  useEffect(() => {
    setSignalementsTries(
      signalements.sort((a, b) => {
        if (a.idPointLie === undefined || b.idPointLie === undefined) {
          console.log(
            "[ListeSignalement] WARNING excursions.json mal formate : signalement sans idPointLie",
          );
          return 0;
        }

        const distA = track[a.idPointLie].dist;
        const distB = track[b.idPointLie].dist;
        return distA - distB;
      }),
    );
  }, [signalements]);

  return (
    signalementsTries &&
    signalementsTries.map((signalement, index) => {
      const isDistanceRelative = detaille && suiviExcursion.etat === "enCours";
      console.log("isDistanceRelative", isDistanceRelative);
      console.log("suiviExcursion.etat", suiviExcursion.etat);
      console.log("detaille", detaille);

      console.log("signalement.idPointLie", signalement.idPointLie);
      return (
        <View key={index}>
          <CarteSignalement
            type={signalement.type}
            nomSignalement={signalement.nom}
            onPress={onPress ? () => onPress(signalement) : undefined}
            details={detaille}
            distanceDuDepartEnM={
              signalement.idPointLie === undefined
                ? undefined
                : isDistanceRelative
                ? track[signalement.idPointLie].dist - track[suiviExcursion.iPointCourant].dist // Position relative (par rapport a la position utilisateur)
                : track[signalement.idPointLie].dist // Position absolue (par rapport au depart)
            }
            isDistanceAbsolue={!isDistanceRelative}
            imageSignalement={detaille ? signalement.image : undefined}
            description={detaille ? signalement.description : undefined}
          />
        </View>
      );
    })
  );
});
