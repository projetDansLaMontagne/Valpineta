import { Button, ListeSignalements } from "app/components";
import { TPoint, T_Signalement, T_flat_point } from "app/navigators";
import { colors, spacing } from "app/theme";
import { Dimensions, ScrollView, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { LatLng } from "react-native-maps";

/**
 * @returns la liste des signalements
 */
export interface PageSignalementsProps {
  setInterfaceCourrante: React.Dispatch<React.SetStateAction<"infos" | "avis" | "signalements">>;
  track: TPoint[]; // pour connaitre les distances des points qui sont lies aux signalements
  signalements: T_Signalement[];
  setCameraTarget?: React.Dispatch<React.SetStateAction<LatLng>>;
  swipeDown: () => void;
}

export function PageSignalements(props: PageSignalementsProps) {
  const { track, signalements, swipeDown } = props;

  return (
    <>
      <ScrollView>
        <TouchableWithoutFeedback>
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
            <View>
              <Button
                style={[$sortirDetailSignalement]}
                tx="detailsExcursion.boutons.retourInformations"
                onPress={() => props.setInterfaceCourrante("infos")}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </>
  );
}

const { width, height } = Dimensions.get("window");

const $containerSignalements: ViewStyle = {
  margin: spacing.xs,
  paddingBottom: 250 /**@warning solution moche et temporaire */,
};

const $sortirDetailSignalement: ViewStyle = {
  borderRadius: 15,
  borderWidth: 2,
  backgroundColor: colors.fond,
  borderColor: colors.bordure,
  width: width / 1.5,
  height: 50,
  alignSelf: "center",
};
