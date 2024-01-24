import { Button } from "app/components";
import { T_flat_point } from "app/navigators";
import { colors } from "app/theme";
import { distanceEntrePoints, recupDistance } from "app/utils/distanceEntrePoints";
import { Dimensions, ViewStyle } from "react-native";
const { width, height } = Dimensions.get("window");


export interface DemarrerExcursionProps {
    /**
     * An optional style override useful for padding & margin.
     */
    excursion
    setIsSuiviTrack
    isSuiviTrack
    userLocation
}

/**
 * Describe your component here
 */
export function DemarrerExcursion(props: DemarrerExcursionProps) {
    const { excursion, setIsSuiviTrack, isSuiviTrack, userLocation } = props;

    // calculer la distance entre l'utilisateur et le point de départ de l'excursion
    const coordUser: T_flat_point = {
        lat: userLocation?.latitude,
        lon: userLocation?.longitude,
    };
    const coordDepartExcursion: T_flat_point = {
        lat: excursion.track[0].lat,
        lon: excursion.track[0].lon,
    };

    const distanceDepartExcursion = distanceEntrePoints(coordUser, coordDepartExcursion);

    if (distanceDepartExcursion < 0.05) {
        return (
            <>
                <Button
                    style={[$buttonCommencer]}
                    textStyle={{ color: colors.palette.blanc, fontSize: 22, fontWeight: "bold", justifyContent: "center" }}
                    text="Commencer"
                    onPress={() => setIsSuiviTrack(!isSuiviTrack)}
                />
            </>
        )
    }
};

const $buttonCommencer: ViewStyle = {
    alignSelf: "center",
    width: width / 2,
    backgroundColor: colors.bouton,
    borderRadius: 13,
    position: "absolute",
    top: 345,
    zIndex: 3,
    minHeight: 10,
    height: 41,
    borderColor: colors.bouton,
};