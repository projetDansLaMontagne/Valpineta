import NetInfo from "@react-native-community/netinfo";
import { SynchroMontanteStore } from "app/models";
import { tr } from "date-fns/locale";
import { Alert } from "react-native";
import { useToast } from "react-native-toast-notifications";

export function synchroMontante(
    titreSignalement,
    descriptionSignalement,
    photoSignalement,
    synchroMontanteStore,
) {
    return new Promise(async resolve => {
        let status = "attente";
        const connexion = await NetInfo.fetch();
        console.log(synchroMontanteStore.signalements);

        if (
            !rechercheMemeSignalement(
                titreSignalement,
                descriptionSignalement,
                photoSignalement,
                synchroMontanteStore,
            )
        ) {
            try {
                // Convertir le chemin de l'image en blob
                const blob = await fetch(photoSignalement).then(response => response.blob());

                // Convertir le blob en base64
                const base64data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                const unSignalement = {
                    titre: titreSignalement,
                    description: descriptionSignalement,
                    photoBlob: base64data,
                    photoURL: photoSignalement,
                };
                synchroMontanteStore.addSignalement(unSignalement);
                if (connexion.isConnected) {
                    envoieBaseDeDonnées(synchroMontanteStore);
                    synchroMontanteStore.removeAllSignalements();
                    status = "envoye";
                } else {
                    status = "ajoute";
                }
            } catch (error) {
                console.error("Erreur lors de la conversion de l'image :", error);
                status = "erreur";
            }
        } else {
            status = "existe";
        }

        console.log(synchroMontanteStore.signalements);
        resolve(status);
    });
}

function rechercheMemeSignalement(
    titreSignalement: string,
    descriptionSignalement: string,
    photoSignalement: string,
    synchroMontanteStore: SynchroMontanteStore,
): boolean {
    let memeSignalement = false;

    synchroMontanteStore.signalements.forEach(signalement => {
        if (
            signalement.titre === titreSignalement &&
            signalement.description === descriptionSignalement &&
            signalement.photoURL === photoSignalement
        ) {
            memeSignalement = true;
        }
    });

    return memeSignalement;
}

export async function envoieBaseDeDonnées(synchroMontanteStore: SynchroMontanteStore) : Promise<boolean> {
    let status = false;

    if (synchroMontanteStore.getSignalementsCount() > 0) {
        console.log("Envoi des données");
        status =  true;
    }
    synchroMontanteStore.removeAllSignalements();
    return status;
}
