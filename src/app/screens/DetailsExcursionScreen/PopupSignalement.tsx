import { View, } from "react-native";
import { Text } from "app/components";
import { T_flat_point } from "app/navigators";
import { distanceEntrePoints } from "app/utils/distanceEntrePoints";
import { useEffect } from "react";
import { useToast } from "react-native-toast-notifications";

export interface PopupSignalementProps {
    signalement;
    userLocation;
}

export function PopupSignalement(props: PopupSignalementProps) {
    const { signalement, userLocation } = props;
    const toast = useToast();

    //utilsier useEffect pour déclancher le toast lorsqu'on est a moins de 5 mètre d'un signalement

    useEffect(() => {
        if (userLocation) {
            const coordUser: T_flat_point = {
                lat: userLocation?.latitude,
                lon: userLocation?.longitude,
            };

            for (let i = 0; i < signalement.length; i++) {
                const coordSignalement: T_flat_point = {
                    lat: signalement[i].latitude,
                    lon: signalement[i].longitude,
                };
                console.log("coordSignalement", coordSignalement);
                const distance = distanceEntrePoints(coordUser, coordSignalement);
                if (distance < 0.03) {
                    toast.show(
                        signalement[i].nom,
                        {
                            type: "signalement",
                            data: {
                                type: signalement[i].type,
                                description: signalement[i].description,
                                image: signalement[i].image,
                            },
                            duration: 20000,
                        }
                    )
                }
            }
            console.log("coordUser", coordUser);
        }
    }
        , [userLocation]);
}
