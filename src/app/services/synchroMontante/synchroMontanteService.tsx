import { Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";

//Store
import { SynchroMontanteStore } from "app/models";

//Api
import { api } from "../api";
import { getGeneralApiProblem } from "../api/apiProblem";

/* --------------------------- FONCTIONS EXPORTEES -------------------------- */

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
                image : base64data,
                lat: lat,
                lon: lon,
            };

            synchroMontanteStore.addSignalement(newSignalement);

            if (isConnected) {
                const sendStatus = await envoieBaseDeDonnees(
                    synchroMontanteStore.signalements,
                    synchroMontanteStore,
                );

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
        if (synchroMontanteStore.signalements.length > 0) {
            console.log("[SynchroMontanteService -> envoieBaseDeDonnees] Envoi des données");

            const response = await api.apisauce.post(
                "set-signalement",
                {
                    signalements: signalements,
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
                console.log(response);
                // Supprimer les signalements
                synchroMontanteStore.removeAllSignalements();
                return true;
            } else {
                console.log(
                    "[SynchroMontanteService -> envoieBaseDeDonnees] Erreur lors de l'envoi des données : ",
                    getGeneralApiProblem(response),
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
 * Affiche une alerte pour indiquer que la synchronisation a bien été effectuée
 * @param langue 
 * @returns
 */
export const alertSynchroEffectuee = (langue: string) => {
    langue === "fr"
        ? Alert.alert("Synchronisation effectuée", "Les données ont bien été envoyées au serveur.", [
            { text: "OK" },
        ])
        : Alert.alert("Sincronización realizada", "Los datos han sido enviados al servidor.", [
            { text: "OK" },
        ]);
};

/* ---------------------- FONCTIONS INTERNES AU SERVICE --------------------- */

/**
 * Recherche si un signalement existe déjà dans la liste des signalements dans le store
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
 * Transforme un blob en base64
 * @param blob 
 * @returns blob en base64
 */
async function blobToBase64(blob:Blob ): Promise<string> {
    const reader = new FileReader();
    await reader.readAsDataURL(blob);
    return reader.result.toString()
}
