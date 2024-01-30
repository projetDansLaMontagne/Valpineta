import NetInfo from "@react-native-community/netinfo";
import { SynchroMontanteStore } from "app/models";
import { api } from "../api";
import { getGeneralApiProblem } from "../api/apiProblem";
import * as ImageManipulator from "expo-image-manipulator";
import { Alert } from "react-native";

export async function synchroMontante(
    titreSignalement: string,
    type: string,
    descriptionSignalement: string,
    photoSignalement: string,
    lat: number,
    lon: number,
    synchroMontanteStore: SynchroMontanteStore,
): Promise<string> {
    let status = "";

    try {
        const isConnected = await NetInfo.fetch().then(state => state.isConnected);

        // const imageRedimensionnee = await resizeImageFromBlob(photoSignalement);
        const blob = await fetch(photoSignalement).then(response => response.blob());
        const base64data = await blobToBase64(blob);

        if (
            !rechercheMemeSignalement(
                titreSignalement,
                type,
                descriptionSignalement,
                base64data,
                lat,
                lon,
                synchroMontanteStore,
            )
        ) {
            const newSignalement = {
                nom: titreSignalement,
                type: type,
                description: descriptionSignalement,
                image: base64data,
                lat: lat,
                lon: lon,
            };

            synchroMontanteStore.addSignalement(newSignalement);

            if (isConnected) {
                const sendStatus = await envoieBaseDeDonnees(
                    synchroMontanteStore.signalements,
                    synchroMontanteStore,
                );
                // const sendStatus = "envoye"

                if (sendStatus) {
                    status = "envoye";
                } else {
                    status = "erreur";
                }
            } else {
                status = "ajoute";
            }
        } else {
            status = "existe";
        }
    } catch (error) {
        console.error("[SynchroMontanteService -> synchroMontante] Erreur :", error);
        status = "erreur";
    }

    return status;
}

/**
 *
 * @param titreSignalement
 * @param type
 * @param descriptionSignalement
 * @param photoSignalement
 * @param lat
 * @param lon
 * @param synchroMontanteStore
 * @returns
 */
function rechercheMemeSignalement(
    titreSignalement: string,
    type: string,
    descriptionSignalement: string,
    photoSignalement: unknown,
    lat: number,
    lon: number,
    synchroMontanteStore: SynchroMontanteStore,
): boolean {
    let memeSignalement = false;

    synchroMontanteStore.signalements.forEach(signalement => {
        if (
            signalement.nom === titreSignalement &&
            signalement.type === type &&
            signalement.description === descriptionSignalement &&
            signalement.image === photoSignalement &&
            signalement.lat === lat &&
            signalement.lon === lon
        ) {
            memeSignalement = true;
        }
    });

    return memeSignalement;
}

/**
 *
 * @param signalement
 * @param synchroMontanteStore
 * @returns Promise<boolean>
 */
export async function envoieBaseDeDonnees(
    signalements: any,
    synchroMontanteStore: SynchroMontanteStore,
): Promise<boolean> {
    const post_id = 2049;

    try {
        if (synchroMontanteStore.getSignalementsCount() > 0) {
            console.log("[SynchroMontanteService -> envoieBaseDeDonnees] Envoi des données");

            const response = await api.apisauce.post(
                "set-signalement",
                {
                    signalements: JSON.stringify(signalements),
                    post_id: post_id,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            if (response.ok) {
                console.log("[SynchroMontanteService -> envoieBaseDeDonnees] Données envoyées");
                // Supprimer les signalements
                synchroMontanteStore.removeAllSignalements();
                return true;
            } else {
                console.log(
                    "[SynchroMontanteService -> envoieBaseDeDonnees] Erreur lors de l'envoi des données : ",
                    getGeneralApiProblem(response),
                    console.log(response),
                );
                return false;
            }
        } else {
            console.log("[SynchroMontanteService -> envoieBaseDeDonnees] Aucun signalement à envoyer.");
            return false;
        }
    } catch (error) {
        console.error(
            "[SynchroMontanteService -> envoieBaseDeDonnees] Erreur lors de l'envoi des données :",
            error,
        );
        return false;
    }
}

/**
 *
 * @param uri
 * @param maxWidth par défaut 800
 * @param maxHeight par défaut 600
 * @param quality par défaut 0.1
 * @returns uri de l'image redimensionnée
 */
const resizeImageFromBlob = async (
    uri: string,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 1,
) => {
    try {
        const resizedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: maxWidth, height: maxHeight } }],
            { format: ImageManipulator.SaveFormat.JPEG, compress: quality },
        );

        // Retourne le chemin de la nouvelle image redimensionnée
        return resizedImage.uri;
    } catch (error) {
        console.error(
            "[SynchroMontanteService -> resizeImageFromBlob ] Erreur lors du redimensionnement de l'image :",
            error,
        );
        return null;
    }
};

export const alertSynchroEffectuee = (langue: string) => {
    langue === "fr"
        ? Alert.alert("Synchronisation effectuée", "Les données ont bien été envoyées au serveur.", [
            { text: "OK" },
        ])
        : Alert.alert("Sincronización realizada", "Los datos han sido enviados al servidor.", [
            { text: "OK" },
        ]);
};

function blobToBase64(blob): Promise<string> {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.toString());
        reader.readAsDataURL(blob);
    });
}
