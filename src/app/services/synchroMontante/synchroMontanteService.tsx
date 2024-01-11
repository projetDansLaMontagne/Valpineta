import NetInfo from "@react-native-community/netinfo";

export function synchroMontante(
    titreSignalement,
    descriptionSignalement,
    photoSignalement,
    synchroMontanteStore,
) {
    return new Promise(async (resolve) => {
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
                if (connexion.isConnected){
                    envoieBaseDeDonnées();
                    synchroMontanteStore.removeAllSignalements();
                    status = "envoye";
                }
                else{
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

async function envoieBaseDeDonnées(){
    console.log("Envoie de la base de données");
}