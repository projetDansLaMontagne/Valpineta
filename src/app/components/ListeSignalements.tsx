import * as React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { TPoint, T_Signalement, T_flat_point } from "app/navigators";
import { CarteSignalement } from "./CarteSignalement";
import { useEffect, useState } from "react";

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

  /** @todo STATIC, a remplacer par le store */
  const SuiviExcursion = { etat: "enCours", iPointCourant: 1100 };

  const [signalementsTries, setSignalementsTries] = useState<T_Signalement[]>([]);

  useEffect(() => {
    setSignalementsTries(
      signalements.sort((a, b) => {
        const distA = track[a.idPointLie ?? 0].dist;
        const distB = track[b.idPointLie ?? 0].dist;
        return distA - distB;
      }),
    );
  }, [signalements]);

  return (
    <>
      {signalementsTries &&
        signalementsTries.map((signalement, index) => {
          return (
            <View key={index}>
              <CarteSignalement
                type={signalement.type}
                nomSignalement={signalement.nom}
                onPress={onPress ? () => onPress(signalement) : undefined}
                details={detaille}
                distanceDuDepartEnM={
                  detaille && SuiviExcursion.etat === "enCours"
                    ? track[signalement.idPointLie ?? 0].dist -
                      track[SuiviExcursion.iPointCourant].dist // Position relative (par rapport a la position utilisateur)
                    : track[signalement.idPointLie ?? 0].dist // Position absolue (par rapport au depart)
                }
                imageSignalement={detaille ? signalement.image : undefined}
                description={detaille ? signalement.description : undefined}
              />
            </View>
          );
        })}
    </>
  );
});
