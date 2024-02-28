import { Button, ListeSignalements } from "app/components";
import { TPoint, T_Signalement, T_flat_point } from "app/navigators";
import { colors, spacing } from "app/theme";
import { Dimensions, ScrollView, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { LatLng } from "react-native-maps";

/**
 * @returns la liste des signalements
 */
export interface PageSignalementsProps {
  track: TPoint[]; // pour connaitre les distances des points qui sont lies aux signalements
  signalements: T_Signalement[];
  setCameraTarget?: React.Dispatch<React.SetStateAction<LatLng>>;
  swipeDown: () => void;
}

export function PageSignalements(props: PageSignalementsProps) {
  const { track, signalements, swipeDown } = props;

  return (
    <View style={$containerSignalements}>
      <ListeSignalements
        detaille={true}
        signalements={signalements}
        track={track}
        onPress={(point: T_flat_point) => {
          props.setCameraTarget({
            latitude: point.lat,
            longitude: point.lon,
          } as LatLng);
          swipeDown();
        }}
      />
    </View>
  );
}


const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
  paddingBottom: 250 /**@warning solution moche et temporaire */,
};

