import * as React from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { colors, typography } from "app/theme";
import { Text } from "app/components/Text";
import { TPoint, T_Signalement } from "app/navigators";
import { CarteSignalement } from "./CarteSignalement";
import { useEffect, useState } from "react";

export interface ListeSignalementsProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>;
  detaille?: boolean;
  onPress?: () => void;
  signalements: T_Signalement[];
  track: TPoint[];
}

/**
 * Describe your component here
 */
export const ListeSignalements = observer(function ListeSignalements(
  props: ListeSignalementsProps,
) {
  const { signalements, track, onPress } = props;

  const [signalementsTries, setSignalementsTries] = useState<T_Signalement[]>([]);
  console.log(track.length);
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
                details={false}
                nomSignalement={signalement.nom}
                distanceDuDepartEnM={track[signalement.idPointLie ?? 0].dist}
                onPress={onPress}
              />
            </View>
          );
        })}
    </>
  );
});
