import NetInfo from "@react-native-community/netinfo";
import { SynchroMontanteStore } from "app/models";
import { tr } from "date-fns/locale";
import { Alert } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { api } from "../api";
import { getGeneralApiProblem } from "../api/apiProblem";
import * as ImageManipulator from 'expo-image-manipulator';


export function synchroMontante(
    titreSignalement: string,
    type: string,
    descriptionSignalement: string,
    photoSignalement: string,
    lat: number,
    lon: number,
    synchroMontanteStore: SynchroMontanteStore,
) {
    return new Promise(async resolve => {
        let status = "attente";
        const connexion = await NetInfo.fetch();
        console.log(synchroMontanteStore.signalements);

        if (
            !rechercheMemeSignalement(
                titreSignalement,
                type,
                descriptionSignalement,
                photoSignalement,
                lat,
                lon,
                synchroMontanteStore,
            )
        ) {
            try {
                // Redimensionner l'image
                const imageRedimensionnee = await resizeImageFromBlob(photoSignalement, 800, 600);
                // Convertir le chemin de l'image en blob
                const blob = await fetch(imageRedimensionnee).then(response => response.blob());

                // Convertir le blob en base64
                const base64data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                const unSignalement = {
                    nom: titreSignalement,
                    type: type,
                    description: descriptionSignalement,
                    image: base64data,
                    lienURLImage: photoSignalement,
                    lat: lat,
                    lon: lon,
                };
                synchroMontanteStore.addSignalement(unSignalement);
                if (connexion.isConnected) {
                    const signalementFormate = {
                        nom: titreSignalement,
                        type: type,
                        description: descriptionSignalement,
                        image: base64data,
                        lat: lat,
                        lon: lon,
                    };
                    const statusEnvoie = await envoieBaseDeDonnees(signalementFormate, synchroMontanteStore);
                    if (statusEnvoie) {
                        status = "envoye";
                    } else {
                        status = "erreurBDD";
                    }
                } else {
                    status = "ajoute";
                }
            } catch (error) {
                console.error("[SynchroMontanteService] Erreur lors de la conversion de l'image :", error);
                status = "erreur";
            }
        } else {
            status = "existe";
        }
        resolve(status);
    });
}

function rechercheMemeSignalement(
    titreSignalement: string,
    type: string,
    descriptionSignalement: string,
    photoSignalement: string,
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
            signalement.lienURLImage === photoSignalement &&
            signalement.lat === lat &&
            signalement.lon === lon
        ) {
            memeSignalement = true;
        }
    });

    return memeSignalement;
}

export async function envoieBaseDeDonnees(signalement: any, synchroMontanteStore: SynchroMontanteStore): Promise<boolean> {
    return new Promise(async resolve => {
        let status = false;
        const post_id = 2049;

        if (synchroMontanteStore.getSignalementsCount() > 0) {
            console.log("[SynchroMontanteService] Envoi des données");
            
            try {
                const response = await api.apisauce.post(
                    "set-signalement",
                    {
                        signalement: JSON.stringify(signalement),
                        post_id: post_id,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (response.ok) {
                    console.log("[SynchroMontanteService] Données envoyées");
                    status = true;
                } else {
                    console.log("[SynchroMontanteService] Erreur lors de l'envoi des données : ", getGeneralApiProblem(response));
                    status = false;
                }
            } catch (error) {
                console.error("[SynchroMontanteService] Erreur lors de l'envoi des données :", error);
                status = false;
            }
        }

        // Supprimer les signalements indépendamment du succès ou de l'échec de l'envoi
        synchroMontanteStore.removeAllSignalements();
        
        // Renvoyer le statut une fois tout terminé
        resolve(status);
    });
}

const resizeImageFromBlob = async (uri: string, maxWidth: number, maxHeight: number, quality: number = 0.1) => {
    console.log(uri);

    try {
        const resizedImage = await ImageManipulator.manipulateAsync(
            uri,
            [
                { resize: { width: maxWidth, height: maxHeight } },                
            ],
            { format: ImageManipulator.SaveFormat.JPEG, compress: quality }
        );

        // Retourne le chemin de la nouvelle image redimensionnée
        return resizedImage.uri;
    } catch (error) {
        console.error('Erreur lors du redimensionnement de l\'image :', error);
        return null;
    }
};